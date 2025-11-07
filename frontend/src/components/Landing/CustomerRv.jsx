import React, { useState, useEffect } from "react";
import ReviewCard from "./Reviewcard";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CustomerRv = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [reviews, setReviews] = useState([]);
    const [userOrders, setUserOrders] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState("");
    const [reviewMessage, setReviewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });

    // Fetch all reviews
    useEffect(() => {
        fetchReviews();
    }, []);

    // Fetch user's orders if logged in
    useEffect(() => {
        if (user) {
            fetchUserOrders();
        }
    }, [user]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/feedbacks`);
            if (!response.ok) throw new Error("Failed to fetch reviews");
            
            const data = await response.json();
            setReviews(data.feedbacks || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserOrders = async () => {
        try {
            console.log('Fetching orders for user:', user.userid);
            const response = await fetch(`${API_BASE_URL}/orders/user/${user.userid}`);
            console.log('Orders response status:', response.status);
            
            if (!response.ok) throw new Error("Failed to fetch orders");
            
            const data = await response.json();
            console.log('Orders data received:', data);
            console.log('Number of orders:', data.orders?.length || 0);
            setUserOrders(data.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setUserOrders([]);
        }
    };

    const handleSubmitReview = async () => {
        // Check if user is logged in
        if (!user) {
            setNotification({
                show: true,
                message: "Please log in to submit a review",
                type: "error"
            });
            return;
        }

        // Check if user has orders
        if (userOrders.length === 0) {
            setNotification({
                show: true,
                message: "You must have at least one order to submit a review",
                type: "error"
            });
            return;
        }

        // Validate message
        if (!reviewMessage.trim()) {
            setNotification({
                show: true,
                message: "Please enter a review message",
                type: "error"
            });
            return;
        }

        console.log('User object:', user);

        setSubmitting(true);

        try {
            // If customerid is not in user object, fetch it from the customer data
            let customerid = user.customerid;
            
            if (!customerid) {
                console.log('Fetching customerid from API...');
                const customerResponse = await fetch(`${API_BASE_URL}/auth/customer/${user.userid}`);
                if (customerResponse.ok) {
                    const customerData = await customerResponse.json();
                    customerid = customerData.customerid;
                    console.log('Retrieved customerid:', customerid);
                }
            }

            if (!customerid) {
                throw new Error("Unable to retrieve customer ID. Please log out and log back in.");
            }

            console.log('Submitting review with:', {
                customerid,
                orderid: selectedOrderId || null,
                message: reviewMessage.trim()
            });

            const response = await fetch(`${API_BASE_URL}/feedbacks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customerid,
                    orderid: selectedOrderId || null,
                    message: reviewMessage.trim()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to submit review");
            }

            setNotification({
                show: true,
                message: "Review submitted successfully! Thank you for your feedback.",
                type: "success"
            });

            // Clear form
            setReviewMessage("");
            setSelectedOrderId("");

            // Refresh reviews
            fetchReviews();
        } catch (error) {
            console.error("Error submitting review:", error);
            setNotification({
                show: true,
                message: error.message || "Failed to submit review. Please try again.",
                type: "error"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const closeNotification = () => {
        setNotification({ show: false, message: "", type: "" });
    };

    const handleLoginRedirect = () => {
        navigate("/login");
    };

    return (
        <>
            {/* Notification Modal */}
            {notification.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className={`text-lg font-semibold mb-4 ${
                            notification.type === "success" ? "text-green-600" : "text-red-600"
                        }`}>
                            {notification.type === "success" ? "Success!" : "Notice"}
                        </h3>
                        <p className="text-gray-700 mb-6">{notification.message}</p>
                        <div className="flex gap-3 justify-end">
                            {!user && notification.type === "error" && notification.message.includes("log in") ? (
                                <>
                                    <button
                                        onClick={closeNotification}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleLoginRedirect}
                                        className="px-4 py-2 bg-[#353f94] text-white rounded-lg hover:bg-[#2a3270]"
                                    >
                                        Login
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={closeNotification}
                                    className="px-4 py-2 bg-[#353f94] text-white rounded-lg hover:bg-[#2a3270]"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Reviews Section */}
            <section className="px-4 md:px-20 py-20">
                <h2 className="text-4xl font-bold mb-12 -mt-37">Customer Reviews</h2>
                
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#353f94]"></div>
                        <p className="mt-4 text-gray-600">Loading reviews...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: Reviews */}
                        <div className="flex flex-col gap-8">
                            {reviews.length > 0 ? (
                                reviews.slice(0, 2).map((review) => (
                                    <ReviewCard
                                        key={review.feedbackid}
                                        name={review.customers?.companyname || "Anonymous"}
                                        date={review.created_at 
                                            ? new Date(review.created_at).toLocaleDateString("en-US", {
                                                day: "2-digit",
                                                month: "short"
                                            })
                                            : "Recently"
                                        }
                                        message={review.message}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border">
                                    <p className="text-gray-600">No reviews yet. Be the first to leave a review!</p>
                                </div>
                            )}
                        </div>
                        
                        {/* RIGHT COLUMN: Third Review + Review Form */}
                        <div className="flex flex-col gap-8">
                            {reviews.length > 2 && (
                                <ReviewCard
                                    key={reviews[2].feedbackid}
                                    name={reviews[2].customers?.companyname || "Anonymous"}
                                    date={reviews[2].created_at 
                                        ? new Date(reviews[2].created_at).toLocaleDateString("en-US", {
                                            day: "2-digit",
                                            month: "short"
                                        })
                                        : "Recently"
                                    }
                                    message={reviews[2].message}
                                />
                            )}
                            
                            {/* Review Submission Form */}
                            <div className="flex flex-col justify-between border p-6 rounded-2xl shadow-lg h-full bg-white">
                                <h3 className="text-xl font-semibold mb-4">Send a Review</h3>
                                
                                {user ? (
                                    userOrders.length > 0 ? (
                                        <div className="space-y-4 flex-1">
                                            {/* Order Selection (Optional) */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Link to Order (Optional)
                                                </label>
                                                <select
                                                    value={selectedOrderId}
                                                    onChange={(e) => setSelectedOrderId(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#353f94] focus:border-transparent"
                                                >
                                                    <option value="">No specific order</option>
                                                    {userOrders.map((order) => (
                                                        <option key={order.orderid} value={order.orderid}>
                                                            Order #{order.orderid.slice(0, 8)} - {order.hangertype}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Review Message */}
                                            <textarea
                                                value={reviewMessage}
                                                onChange={(e) => setReviewMessage(e.target.value)}
                                                className="border border-gray-300 rounded-lg p-4 text-base resize-none min-h-[150px] w-full focus:outline-none focus:ring-2 focus:ring-[#353f94]"
                                                placeholder="Write your review here..."
                                            />
                                            
                                            <button 
                                                onClick={handleSubmitReview}
                                                disabled={submitting || !reviewMessage.trim()}
                                                className="self-end bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? "Sending..." : "Send"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <p className="text-yellow-800 font-medium mb-2">Complete an order to leave a review</p>
                                            <p className="text-yellow-700 text-sm">You must have at least one order to share your experience.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center py-8 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-blue-800 font-medium mb-4">Please log in to leave a review</p>
                                        <button
                                            onClick={handleLoginRedirect}
                                            className="bg-[#353f94] text-white px-6 py-2 rounded-full hover:bg-[#2a3270] transition"
                                        >
                                            Log In
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </>
    )
}

export default CustomerRv