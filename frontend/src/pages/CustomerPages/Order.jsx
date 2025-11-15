import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { ChevronDown, MessageCircle, Eye } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Download, CreditCard } from 'lucide-react';
import logo from '../../images/logo.png'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HangerScene from '../../components/Checkout/HangerScene';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';


const Order = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All Orders');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [show3DModal, setShow3DModal] = useState(false);
    const [selected3DDesign, setSelected3DDesign] = useState(null);

    const [showProofModal, setShowProofModal] = useState(false);
    const [proofImage, setProofImage] = useState(null);

    // Track payment info for each order
    const [orderPayments, setOrderPayments] = useState({});

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success'); // 'success' or 'error'

    const [showRatingModal, setShowRatingModal] = useState(false);
    const [orderToRate, setOrderToRate] = useState(null);
    const [rating, setRating] = useState(5);
    const [reviewMessage, setReviewMessage] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const tabs = ['All Orders', 'Pending', 'Processing', 'Shipped', 'Completed'];

    // Map tab names to their corresponding order statuses
    const getStatusesForTab = (tab) => {
        const statusMap = {
            'Pending': ['For Evaluation', 'Waiting for Payment'],
            'Processing': ['Approved', 'In Production', 'Waiting for Shipment'],
            'Shipped': ['In Transit'],
            'Completed': ['Completed']
        };
        return statusMap[tab] || [];
    };

    // Real-time order update handler
    const handleOrderUpdate = useCallback((payload) => {
        console.log('📦 Order update:', payload);
        
        if (payload.eventType === 'INSERT') {
            // New order added
            setOrders(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
            // Order updated
            setOrders(prev => 
                prev.map(order => 
                    order.orderid === payload.new.orderid ? payload.new : order
                )
            );
        } else if (payload.eventType === 'DELETE') {
            // Order deleted
            setOrders(prev => 
                prev.filter(order => order.orderid !== payload.old.orderid)
            );
        }
    }, []);

    // Subscribe to real-time order updates
    const { isSubscribed } = useRealtimeOrders(user?.userid, handleOrderUpdate);

    // Fetch orders when component mounts
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || !user.userid) {
                setError('User not logged in');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`https://gatsis-hub.vercel.app/orders/user/${user.userid}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                console.log('📦 Fetched orders:', data.orders);
                console.log('📍 First order delivery address:', data.orders[0]?.deliveryaddress);
                console.log('🎨 First order 3D design data:', data.orders[0]?.threeddesigndata);
                setOrders(data.orders || []);
                
                // Fetch payment info for each order
                if (data.orders && data.orders.length > 0) {
                    fetchPaymentInfo(data.orders);
                }
                
                setError(null);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    // Fetch payment information for orders
    const fetchPaymentInfo = async (orders) => {
        const paymentPromises = orders.map(async (order) => {
            try {
                const response = await fetch(`https://gatsis-hub.vercel.app/payments/order/${order.orderid}`);
                if (response.ok) {
                    const payment = await response.json();
                    return { orderid: order.orderid, payment };
                }
            } catch (error) {
                console.log(`No payment found for order ${order.orderid}`);
            }
            return { orderid: order.orderid, payment: null };
        });

        const results = await Promise.all(paymentPromises);
        const paymentsMap = {};
        results.forEach(({ orderid, payment }) => {
            paymentsMap[orderid] = payment;
        });
        setOrderPayments(paymentsMap);
        console.log('💳 Payment info loaded:', paymentsMap);
    };

    // Helper function to get status color
    const getStatusColor = (status) => {
        const statusColors = {
            'For Evaluation': '#fbbf24',
            'Waiting for Payment': '#fb923c',
            'Approved': '#22c55e',
            'In Production': '#60a5fa',
            'Waiting for Shipment': '#818cf8',
            'In Transit': '#a78bfa',
            'Completed': '#16a34a',
            'Cancelled': '#ef4444'
        };
        return statusColors[status] || '#9ca3af';
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Helper function to format materials
    const formatMaterials = (materialsObj) => {
        if (!materialsObj || typeof materialsObj !== 'object') return [];
        return Object.entries(materialsObj).map(([name, percentage]) => ({
            name,
            percentage: `${Math.round(percentage)}%`
        }));
    };

    // Filter orders based on active tab
    const filteredOrders = orders.filter(order => {
        if (activeTab === 'All Orders') return true;

        // Get the statuses for the current tab
        const tabStatuses = getStatusesForTab(activeTab);

        // Check if the order's status is in the current tab's statuses
        return tabStatuses.includes(order.orderstatus);
    });

    // Helper function to determine if order is customized
    const getOrderDescription = (order) => {
        const hasCustomization = order.customtext || order.customlogo;
        return hasCustomization
            ? `Customized ${order.hangertype}`
            : `Plain ${order.hangertype}`;
    };

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const openProofModal = (imageUrl) => {
        setProofImage(imageUrl);
        setShowProofModal(true);
    };

    const closeProofModal = () => {
        setShowProofModal(false);
        setProofImage(null);
    };

    const open3DModal = (designData) => {
        try {
            const design = typeof designData === 'string' ? JSON.parse(designData) : designData;
            setSelected3DDesign(design);
            setShow3DModal(true);
        } catch (error) {
            console.error('Error parsing 3D design data:', error);
        }
    };

    const close3DModal = () => {
        setShow3DModal(false);
        setSelected3DDesign(null);
    };

    const handleContactSupport = async (order) => {
        try {
            // Get customer data from localStorage (stored as 'user')
            const customer = JSON.parse(localStorage.getItem('user'));
            
            if (!customer || !customer.customerid) {
                showNotification('Please log in to contact support', 'error');
                return;
            }

            // Try to fetch an active and present Sales Admin first (priority: online)
            let employeesResponse = await fetch('https://gatsis-hub.vercel.app/employees?role=Sales Admin&status=Active&ispresent=true&limit=1');
            
            if (!employeesResponse.ok) {
                showNotification('Failed to load support team. Please try again.', 'error');
                return;
            }

            let employeesData = await employeesResponse.json();
            let salesAdmins = employeesData.employees || [];

            // If no online Sales Admin found, fetch any active Sales Admin (online or offline)
            if (salesAdmins.length === 0) {
                console.log('No online Sales Admin found, fetching any available Sales Admin...');
                employeesResponse = await fetch('https://gatsis-hub.vercel.app/employees?role=Sales Admin&status=Active&limit=1');
                
                if (!employeesResponse.ok) {
                    showNotification('Failed to load support team. Please try again.', 'error');
                    return;
                }

                employeesData = await employeesResponse.json();
                salesAdmins = employeesData.employees || [];
            }

            if (salesAdmins.length === 0) {
                showNotification('No support agents available. Please try again later.', 'error');
                return;
            }

            // Use the first (and only) available Sales Admin
            const supportAgent = salesAdmins[0];
            const isOnline = supportAgent.ispresent;

            // Create an initial message to start the conversation
            const initialMessage = `Hi, I have a question about my order ${order.orderid.slice(0, 8).toUpperCase()}`;

            console.log('Sending contact support message to available Sales Admin:', {
                customerid: customer.customerid,
                employeeid: supportAgent.employeeid,
                employeename: supportAgent.employeename,
                message: initialMessage
            });

            // Send message to the available Sales Admin
            const response = await fetch('https://gatsis-hub.vercel.app/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerid: customer.customerid,
                    employeeid: supportAgent.employeeid,
                    senderType: 'customer',
                    message: initialMessage
                })
            });

            if (response.ok) {
                const statusMessage = isOnline 
                    ? `Message sent to ${supportAgent.employeename} (Online)! Redirecting...` 
                    : `Message sent to ${supportAgent.employeename}! They will respond when available. Redirecting...`;
                showNotification(statusMessage, 'success');
                // Navigate to messages page after a short delay
                setTimeout(() => {
                    navigate('/messages');
                }, 1500);
            } else {
                const responseData = await response.json();
                const errorMsg = responseData.error || 'Failed to start conversation';
                console.error('Error response:', errorMsg);
                showNotification(`Failed to start conversation: ${errorMsg}`, 'error');
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
            showNotification('Failed to contact support. Please try again.', 'error');
        }
    };

    const openCancelModal = (order) => {
        setOrderToCancel(order);
        setShowCancelModal(true);
        setCancelReason('');
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
        setOrderToCancel(null);
        setCancelReason('');
    };

    const showNotification = (message, type = 'success') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotificationModal(true);
    };

    const closeNotificationModal = () => {
        setShowNotificationModal(false);
        setNotificationMessage('');
    };

    const openRatingModal = (order) => {
        setOrderToRate(order);
        setShowRatingModal(true);
        setRating(5);
        setReviewMessage('');
    };

    const closeRatingModal = () => {
        setShowRatingModal(false);
        setOrderToRate(null);
        setRating(5);
        setReviewMessage('');
    };

    const handleSubmitReview = async () => {
        if (!orderToRate || !user) return;

        setIsSubmittingReview(true);
        try {
            const response = await fetch('https://gatsis-hub.vercel.app/feedbacks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerid: user.customerid,
                    orderid: orderToRate.orderid,
                    message: reviewMessage.trim() || 'Great service!',
                    rating: rating
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit review');
            }

            closeRatingModal();
            showNotification('Thank you for your review! Your feedback has been submitted successfully.');
        } catch (err) {
            console.error('Error submitting review:', err);
            showNotification(err.message || 'Failed to submit review. Please try again.', 'error');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!orderToCancel) return;

        setIsCancelling(true);
        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/orders/${orderToCancel.orderid}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reason: cancelReason || 'No reason provided'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to cancel order');
            }

            // Remove the cancelled order from the local state
            setOrders(orders.filter(order => order.orderid !== orderToCancel.orderid));

            closeCancelModal();

            // Show success notification
            showNotification('Order cancelled successfully');
        } catch (err) {
            console.error('Error cancelling order:', err);
            showNotification('Failed to cancel order. Please try again or contact support.', 'error');
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto"></div>
                    <p className="mt-4 text-xl text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                    <p className="text-xl text-red-600 mb-4">Error loading orders</p>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-12">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 md:mb-12">My Orders</h1>

                {/* Tabs */}
                <div className="flex justify-center gap-3 md:gap-6 lg:gap-8 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-thin">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-sm md:text-lg lg:text-xl pb-2 transition-all duration-300 whitespace-nowrap ${activeTab === tab
                                ? 'border-b-2 border-yellow-400 font-semibold scale-105'
                                : 'text-gray-600 hover:border-b border-gray-900 cursor-pointer hover:scale-105'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-4 md:space-y-6">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-lg p-6 md:p-12 text-center">
                            <p className="text-xl md:text-2xl text-gray-600">No orders found</p>
                            <p className="text-sm md:text-base text-gray-500 mt-2">
                                {activeTab === 'All Orders'
                                    ? 'You haven\'t placed any orders yet.'
                                    : `No orders with status "${activeTab}"`
                                }
                            </p>
                            <Link to="/checkout" className="inline-block mt-4 mb-4 bg-yellow-400 text-black px-4 md:px-6 py-2 rounded hover:bg-yellow-500 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm md:text-base">
                                Place an Order
                            </Link>
                        </div>
                    ) : (
                        filteredOrders.map((order, index) => {
                            const materials = formatMaterials(order.materials);
                            const statusColor = getStatusColor(order.orderstatus);

                            return (
                                <div 
                                    key={order.orderid}
                                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 animate-fadeIn"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Order Header - Desktop Only */}
                                    <div className="hidden lg:flex bg-gray-50 px-6 py-4 items-center font-semibold border-b">
                                        <div className="flex-1">Product</div>
                                        <div className="flex-1 text-center">Order Number</div>
                                        <div className="flex-1 text-center">Status</div>
                                        <div className="flex-1 text-center">Price</div>
                                        <div className="flex-1"></div>
                                    </div>

                                    <div className='px-3 md:px-6 py-4'>
                                        {/* Mobile/Tablet Layout */}
                                        <div className="lg:hidden space-y-4">
                                            {/* Product Image & Name */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-gray-300 rounded flex items-center justify-center bg-white overflow-hidden flex-shrink-0">
                                                    {(() => {
                                                        try {
                                                            if (order.threeddesigndata) {
                                                                const designData = typeof order.threeddesigndata === 'string'
                                                                    ? JSON.parse(order.threeddesigndata)
                                                                    : order.threeddesigndata;

                                                                if (designData && designData.thumbnail) {
                                                                    return (
                                                                        <img
                                                                            src={designData.thumbnail}
                                                                            alt="Design preview"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    );
                                                                }
                                                            }
                                                        } catch (error) {
                                                            console.error('Error parsing design data:', error);
                                                        }
                                                        return <span className="text-2xl md:text-3xl">🪝</span>;
                                                    })()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm md:text-base truncate">{getOrderDescription(order)}</p>
                                                    <p className="text-xs md:text-sm text-gray-600">ORD-{order.orderid.slice(0, 8).toUpperCase()}</p>
                                                </div>
                                                <button
                                                    onClick={() => toggleExpand(order.orderid)}
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-all flex-shrink-0"
                                                >
                                                    <ChevronDown
                                                        size={20}
                                                        className={`transition-transform ${expandedOrder === order.orderid ? 'rotate-180' : ''}`}
                                                    />
                                                </button>
                                            </div>

                                            {/* Status & Price */}
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Status</p>
                                                    <span 
                                                        className="text-black px-3 py-1 rounded font-semibold text-xs inline-block"
                                                        style={{ backgroundColor: statusColor }}
                                                    >
                                                        {order.orderstatus}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 mb-1">Total Price</p>
                                                    <span className="text-lg md:text-xl font-semibold">
                                                        {order.totalprice ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '₱0.00'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden lg:flex items-center">
                                            {/* Product Image & Name */}
                                            <div className="flex-1 flex items-center gap-4">
                                                <div className="w-16 h-16 border-2 border-gray-300 rounded flex items-center justify-center bg-white overflow-hidden flex-shrink-0">
                                                    {(() => {
                                                        try {
                                                            if (order.threeddesigndata) {
                                                                const designData = typeof order.threeddesigndata === 'string'
                                                                    ? JSON.parse(order.threeddesigndata)
                                                                    : order.threeddesigndata;

                                                                if (designData && designData.thumbnail) {
                                                                    return (
                                                                        <img
                                                                            src={designData.thumbnail}
                                                                            alt="Design preview"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    );
                                                                }
                                                            }
                                                        } catch (error) {
                                                            console.error('Error parsing design data:', error);
                                                        }
                                                        return <span className="text-3xl">🪝</span>;
                                                    })()}
                                                </div>
                                                <span className="font-medium">{getOrderDescription(order)}</span>
                                            </div>

                                            {/* Order Number */}
                                            <div className="flex-1 text-center">
                                                <span>ORD-{order.orderid.slice(0, 8).toUpperCase()}</span>
                                            </div>

                                             
                                    {/* Status */}
                                    <div className="flex-1 text-center">
                                        <span 
                                            className="text-black px-4 py-1 rounded font-semibold text-sm inline-block"
                                            style={{ backgroundColor: statusColor }}
                                        >
                                            {order.orderstatus}
                                        </span>
                                    </div>

                                            {/* Price */}
                                            <div className="flex-1 text-center">
                                                <span className="text-xl font-semibold">
                                                    {order.totalprice ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '₱0.00'}
                                                </span>
                                            </div>

                                            {/* Expand Button */}
                                            <div className="flex-1 flex justify-end">
                                                <button
                                                    onClick={() => toggleExpand(order.orderid)}
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-all"
                                                >
                                                    <ChevronDown
                                                        size={24}
                                                        className={`transition-transform ${expandedOrder === order.orderid ? 'rotate-180' : ''
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedOrder === order.orderid && (
                                            <div className="border-t pt-4 md:pt-6 px-3 md:px-6 pb-4 md:pb-6 animate-fadeIn">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                                                    {/* Left Column - Order Details */}
                                                    <div>
                                                        <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">{order.companyname}</h3>
                                                        <div className="space-y-2 text-xs md:text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="font-semibold">Order Number:</span>
                                                                <span>ORD-{order.orderid.slice(0, 8).toUpperCase()}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-semibold">Order placed:</span>
                                                                <span>{formatDate(order.datecreated)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-semibold">Order Quantity:</span>
                                                                <span>{order.quantity}x</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-semibold">Product:</span>
                                                                <span>{order.hangertype}</span>
                                                            </div>
                                                            {order.selectedcolor && (
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-semibold">Color:</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className="w-6 h-6 rounded border border-gray-300"
                                                                            style={{ backgroundColor: order.selectedcolor }}
                                                                        ></div>
                                                                        <span>{order.selectedcolor}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {materials.length > 0 && (
                                                                <div className="flex justify-between">
                                                                    <span className="font-semibold">Material:</span>
                                                                    <div className="text-right">
                                                                        {materials.map((material, idx) => (
                                                                            <div key={idx}>
                                                                                {material.name} {material.percentage}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {order.customtext && (
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-semibold">Custom Text:</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="italic">"{order.customtext}"</span>
                                                                        {order.textcolor && (
                                                                            <div
                                                                                className="w-4 h-4 rounded border border-gray-300"
                                                                                style={{ backgroundColor: order.textcolor }}
                                                                                title={order.textcolor}
                                                                            ></div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {order.customlogo && (
                                                                <div className="flex justify-between">
                                                                    <span className="font-semibold">Custom Logo:</span>
                                                                    <span>✓ Included</span>
                                                                </div>
                                                            )}
                                                            {order.designoption && (
                                                                <div className="flex justify-between">
                                                                    <span className="font-semibold">Design Option:</span>
                                                                    <span className="capitalize">{order.designoption}</span>
                                                                </div>
                                                            )}
                                                            {order.totalprice && (
                                                                <div className="flex justify-between border-t pt-2 mt-2">
                                                                    <span className="font-semibold text-lg">Total Price:</span>
                                                                    <span className="text-lg font-bold text-green-600">₱{parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                </div>
                                                            )}
                                                            {order.deadline && (
                                                                <div className="flex justify-between border-t pt-2 mt-2">
                                                                    <span className="font-semibold text-lg">Expected Deadline:</span>
                                                                    <span className="text-lg font-bold text-indigo-600">{formatDate(order.deadline)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Right Column - Contact & Address Information */}
                                                    <div>
                                                        <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Contact Information</h3>
                                                        <div className="text-xs md:text-sm mb-4">
                                                            <p className="font-semibold">{order.contactperson}</p>
                                                            <p>{order.contactphone}</p>
                                                            <p className="text-gray-600">{order.companyname}</p>
                                                        </div>

                                                        {/* Delivery Address Section */}
                                                        <h3 className="text-lg md:text-xl font-bold mb-2 mt-4 md:mt-6">Delivery Address</h3>
                                                        <div className="text-xs md:text-sm mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {order.deliveryaddress ? (
                                                                <p className="text-gray-700">
                                                                    {typeof order.deliveryaddress === 'object'
                                                                        ? order.deliveryaddress.address
                                                                        : order.deliveryaddress}
                                                                </p>
                                                            ) : (
                                                                <p className="text-gray-400 italic">No address provided</p>
                                                            )}
                                                        </div>

                                                        {/* Order Instructions Section */}
                                                        {order.orderinstructions && (
                                                            <>
                                                                <h3 className="text-lg md:text-xl font-bold mb-2 mt-4">Order Instructions</h3>
                                                                <div className="border rounded-lg p-3 bg-blue-50 border-blue-200 mb-3">
                                                                    <p className="text-xs md:text-sm text-gray-700">{order.orderinstructions}</p>
                                                                </div>
                                                            </>
                                                        )}

                                                        {/* Delivery Notes Section */}
                                                        {order.deliverynotes && (
                                                            <>
                                                                <h3 className="text-lg md:text-xl font-bold mb-2 mt-4">Delivery Notes</h3>
                                                                <div className="border rounded-lg p-3 bg-gray-50 mb-3">
                                                                    <p className="text-xs md:text-sm text-gray-700">{order.deliverynotes}</p>
                                                                </div>
                                                            </>
                                                        )}

                                                        {/* View 3D Design Button */}
                                                        {order.threeddesigndata && (
                                                            <button
                                                                onClick={() => open3DModal(order.threeddesigndata)}
                                                                className="w-full bg-[#35408E] text-white py-2 rounded flex items-center justify-center gap-2 text-xs md:text-sm font-semibold hover:bg-[#2c3e50] mt-3 transition-all duration-300 hover:scale-105"
                                                            >
                                                                <Eye size={16} />
                                                                View 3D Design
                                                            </button>
                                                        )}

                                                        {/* Design File Button */}
                                                        {order.customdesignurl && (
                                                            <button className="w-full bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2 text-xs md:text-sm font-semibold hover:bg-red-700 mt-3 transition-all duration-300 hover:scale-105">
                                                                <FileText size={16} />
                                                                View Design File
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 md:gap-3 mt-4 md:mt-6 flex-wrap">
                                                    {/* Download Invoice - Only show in Processing phase (Approved, In Production, Waiting for Shipment, In Transit, Completed) */}
                                                    {['Approved', 'In Production', 'Waiting for Shipment', 'In Transit', 'Completed'].includes(order.orderstatus) && (
                                                        <button className="bg-green-600 text-white px-3 md:px-6 py-2 rounded hover:bg-green-700 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-xs md:text-sm font-semibold">
                                                            <Download size={16} className="md:w-[18px] md:h-[18px]" />
                                                            <span className="hidden sm:inline">Download Invoice</span>
                                                            <span className="sm:hidden">Invoice</span>
                                                        </button>
                                                    )}

                                                    {/* View Proof of Payment - Show if payment exists and not rejected */}
                                                    {orderPayments[order.orderid] && orderPayments[order.orderid].paymentstatus !== 'Rejected' && (
                                                        <button
                                                            onClick={() => openProofModal(orderPayments[order.orderid].proofofpayment)}
                                                            className="bg-indigo-700 text-white px-3 md:px-6 py-2 rounded hover:bg-indigo-800 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-xs md:text-sm font-semibold"
                                                        >
                                                            <FileText size={16} className="md:w-[18px] md:h-[18px]" />
                                                            <span className="hidden sm:inline">View Proof</span>
                                                            <span className="sm:hidden">Proof</span>
                                                        </button>
                                                    )}

                                                    {/* Payment Rejected Notice */}
                                                    {orderPayments[order.orderid]?.paymentstatus === 'Rejected' && (
                                                        <div className="bg-red-50 border border-red-300 rounded px-3 py-2 flex items-center gap-2">
                                                            <span className="text-red-600 text-xs md:text-sm font-semibold">
                                                                ⚠️ Payment Rejected - Please Resubmit
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Payment - Show when Waiting for Payment AND (no payment OR payment rejected) */}
                                                    {order.orderstatus === 'Waiting for Payment' && 
                                                     (!orderPayments[order.orderid] || orderPayments[order.orderid]?.paymentstatus === 'Rejected') && (
                                                        <Link 
                                                            to="/payment" 
                                                            state={{ orderDetails: order }}
                                                            className="bg-yellow-500 text-white px-3 md:px-6 py-2 rounded hover:bg-yellow-600 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 text-xs md:text-sm font-semibold"
                                                        >
                                                            <CreditCard size={16} className="md:w-[18px] md:h-[18px]" />
                                                            {orderPayments[order.orderid]?.paymentstatus === 'Rejected' ? 'Resubmit Payment' : 'Payment'}
                                                        </Link>
                                                    )}

                                                    {/* Contact Support - Always visible */}
                                                    <button 
                                                        onClick={() => handleContactSupport(order)}
                                                        className="bg-[#35408E] text-white px-6 py-2 rounded hover:bg-[#2c3e50] transition-colors flex items-center gap-2 text-sm font-semibold"
                                                    >
                                                        <MessageCircle size={18} />
                                                        Contact Support
                                                    </button>

                                                    {/* Cancel Order - Only show in For Evaluation or Waiting for Payment (before Processing) */}
                                                    {(order.orderstatus === 'For Evaluation' || order.orderstatus === 'Waiting for Payment') && (
                                                        <button
                                                            onClick={() => openCancelModal(order)}
                                                            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors text-sm font-semibold"
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    )}

                                                    {/* Rate - Only show when Completed */}
                                                    {order.orderstatus === 'Completed' && (
                                                        <button
                                                            onClick={() => openRatingModal(order)}
                                                            className="bg-indigo-600 text-white px-3 md:px-6 py-2 rounded hover:bg-indigo-700 transition-all duration-300 hover:scale-105 text-xs md:text-sm font-semibold"
                                                        >
                                                            Rate
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Proof of Payment Modal */}
            {showProofModal && (
                <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4 animate-fadeIn">
                    <div className="bg-[#35408E] rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-center py-4 relative">
                            <div className="w-12 h-12  rounded-full flex items-center justify-center">
                                <div className="flex items-center justify-center">
                                    <img src={logo} alt="Logo" className="w-20 h-12" />
                                </div>
                            </div>
                        </div>

                        {/* Modal Title */}
                        <div className="text-center pb-4 md:pb-6">
                            <h2 className="text-white text-xl md:text-2xl font-semibold">Proof of Payment</h2>
                        </div>

                        {/* Content Container - Scrollable */}
                        <div className="bg-white mx-4 md:mx-8 rounded-lg p-3 md:p-4 mb-4 md:mb-6 overflow-auto max-h-[60vh]">
                            {proofImage && proofImage.toLowerCase().endsWith('.pdf') ? (
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <FileText size={48} className="text-indigo-600" />
                                    <p className="text-gray-700 font-semibold">PDF Payment Proof</p>
                                    <a 
                                        href={proofImage} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded transition-colors font-semibold flex items-center gap-2"
                                    >
                                        <Eye size={18} />
                                        Open PDF
                                    </a>
                                </div>
                            ) : (
                                <img
                                    src={proofImage}
                                    alt="Proof of Payment"
                                    className="w-full h-auto rounded max-h-[55vh] object-contain"
                                />
                            )}
                        </div>

                        {/* Back Button */}
                        <div className="flex justify-center pb-6 md:pb-8">
                            <button
                                onClick={closeProofModal}
                                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 md:px-12 py-2 rounded transition-all duration-300 hover:scale-105 text-sm md:text-base"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3D Design Viewer Modal */}
            {show3DModal && selected3DDesign && (
                <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4 animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
                        {/* Modal Header */}
                        <div className="bg-[#35408E] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-white text-lg md:text-2xl font-semibold">3D Design Preview</h2>
                                <p className="text-white text-xs md:text-sm mt-1">Interactive view of your customized hanger</p>
                            </div>
                            <button
                                onClick={close3DModal}
                                className="text-white hover:text-gray-200 transition-colors text-3xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* 3D Viewer */}
                        <div className="bg-white p-3 md:p-6">
                            <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
                                <Suspense fallback={
                                    <div className='w-full h-full flex items-center justify-center'>
                                        <div className='text-center'>
                                            <div className='text-6xl mb-4'>⏳</div>
                                            <p className='text-lg text-gray-600'>Loading 3D Design...</p>
                                        </div>
                                    </div>
                                }>
                                    <HangerScene
                                        color={selected3DDesign.color || '#4F46E5'}
                                        hangerType={selected3DDesign.hangerType || 'MB7'}
                                        customText={selected3DDesign.customText || ''}
                                        textColor={selected3DDesign.textColor || '#000000'}
                                        textPosition={selected3DDesign.textPosition || { x: 0, y: 0, z: 0.49 }}
                                        textSize={selected3DDesign.textSize || 0.5}
                                        logoPreview={selected3DDesign.logoPreview || null}
                                        logoPosition={selected3DDesign.logoPosition || { x: 0, y: 0.5, z: 0.49 }}
                                        logoSize={selected3DDesign.logoSize || 0.3}
                                    />
                                </Suspense>
                            </div>

                            {/* Design Details */}
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                                <div className="bg-gray-50 p-3 rounded">
                                    <span className="font-semibold text-gray-700">Hanger Type:</span>
                                    <span className="ml-2">{selected3DDesign.hangerType}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded flex items-center">
                                    <span className="font-semibold text-gray-700">Color:</span>
                                    <div className="ml-2 flex items-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded border border-gray-300"
                                            style={{ backgroundColor: selected3DDesign.color }}
                                        ></div>
                                        <span>{selected3DDesign.color}</span>
                                    </div>
                                </div>
                                {selected3DDesign.customText && (
                                    <>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <span className="font-semibold text-gray-700">Custom Text:</span>
                                            <span className="ml-2">{selected3DDesign.customText}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded flex items-center">
                                            <span className="font-semibold text-gray-700">Text Color:</span>
                                            <div className="ml-2 flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded border border-gray-300"
                                                    style={{ backgroundColor: selected3DDesign.textColor }}
                                                ></div>
                                                <span>{selected3DDesign.textColor}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-100 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <p className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
                                💡 Drag to rotate • Scroll to zoom • Right-click to pan
                            </p>
                            <button
                                onClick={close3DModal}
                                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 md:px-8 py-2 rounded transition-all duration-300 hover:scale-105 text-sm md:text-base w-full sm:w-auto"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && orderToCancel && (
                <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4 animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
                        {/* Modal Header */}
                        <div className="bg-red-600 px-4 md:px-6 py-3 md:py-4">
                            <h2 className="text-white text-xl md:text-2xl font-semibold">Cancel Order</h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 md:p-6">
                            <div className="mb-4">
                                <p className="text-gray-700 mb-2 text-sm md:text-base">
                                    Are you sure you want to cancel this order?
                                </p>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <p className="text-sm font-semibold text-gray-800">
                                        Order: ORD-{orderToCancel.orderid.slice(0, 8).toUpperCase()}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {orderToCancel.hangertype} - {orderToCancel.quantity}x
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason for cancellation (optional):
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Tell us why you're cancelling this order..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    rows="4"
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ <strong>Warning:</strong> This action cannot be undone. The order will be permanently deleted from our system.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
                            <button
                                onClick={closeCancelModal}
                                disabled={isCancelling}
                                className="px-4 md:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full sm:w-auto order-2 sm:order-1"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                className="px-4 md:px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto order-1 sm:order-2"
                            >
                                {isCancelling ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Cancelling...
                                    </>
                                ) : (
                                    'Yes, Cancel Order'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && orderToRate && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-3 md:p-4 animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
                        {/* Modal Header */}
                        <div className="bg-[#35408E] px-4 md:px-6 py-3 md:py-4">
                            <h2 className="text-white text-xl md:text-2xl font-semibold">Rate Your Order</h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 md:p-6">
                            {/* Order Info */}
                            <div className="mb-4 md:mb-6">
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <p className="text-sm font-semibold text-gray-800">
                                        Order: ORD-{orderToRate.orderid.slice(0, 8).toUpperCase()}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {orderToRate.hangertype} - {orderToRate.quantity}x
                                    </p>
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="mb-4 md:mb-6">
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
                                    How would you rate your experience?
                                </label>
                                <div className="flex gap-1 md:gap-2 justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <svg
                                                className={`w-10 h-10 md:w-12 md:h-12 ${star <= rating
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                    }`}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="1"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                                />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center text-sm text-gray-600 mt-2">
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 5 && 'Excellent'}
                                </p>
                            </div>

                            {/* Review Message */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Share your experience (optional):
                                </label>
                                <textarea
                                    value={reviewMessage}
                                    onChange={(e) => setReviewMessage(e.target.value)}
                                    placeholder="Tell us about your experience with this order..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                    rows="4"
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    💡 Your feedback helps us improve our service and assists other customers in making informed decisions.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
                            <button
                                onClick={closeRatingModal}
                                disabled={isSubmittingReview}
                                className="px-4 md:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full sm:w-auto order-2 sm:order-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview}
                                className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto order-1 sm:order-2"
                            >
                                {isSubmittingReview ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {showNotificationModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-3 md:p-4 animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
                        {/* Modal Header */}
                        <div className={`px-4 md:px-6 py-3 md:py-4 ${notificationType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                            <h2 className="text-white text-lg md:text-xl font-semibold">
                                {notificationType === 'success' ? '✓ Success' : '✕ Error'}
                            </h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 md:p-6">
                            <p className="text-gray-700 text-base md:text-lg">{notificationMessage}</p>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 flex justify-end">
                            <button
                                onClick={closeNotificationModal}
                                className={`px-4 md:px-6 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base ${notificationType === 'success'
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                    }`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Order