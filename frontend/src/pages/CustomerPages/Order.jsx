import React, { useState, useEffect, Suspense } from 'react';
import { ChevronDown, MessageCircle, Eye } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Download, CreditCard } from 'lucide-react';
import logo from '../../images/logo.png'
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HangerScene from '../../components/Checkout/HangerScene';


const Order = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('All Orders');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [show3DModal, setShow3DModal] = useState(false);
    const [selected3DDesign, setSelected3DDesign] = useState(null);

    const [showProofModal, setShowProofModal] = useState(false);
    const [proofImage, setProofImage] = useState(null);

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
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Title */}
                <h1 className="text-5xl font-bold text-center mb-12">My Orders</h1>

                {/* Tabs */}
                <div className="flex justify-center gap-8 mb-8">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-xl pb-2 transition-all ${activeTab === tab
                                    ? 'border-b-4 border-yellow-400 font-semibold'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                            <p className="text-2xl text-gray-600">No orders found</p>
                            <p className="text-gray-500 mt-2">
                                {activeTab === 'All Orders' 
                                    ? 'You haven\'t placed any orders yet.' 
                                    : `No orders with status "${activeTab}"`
                                }
                            </p>
                            <Link to="/checkout" className="inline-block mt-4 bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-500 font-semibold">
                                Place an Order
                            </Link>
                        </div>
                    ) : (
                        filteredOrders.map(order => {
                            const materials = formatMaterials(order.materials);
                            const statusColor = getStatusColor(order.orderstatus);
                            
                            return (
                                <div key={order.orderid} className="bg-white rounded-lg shadow-lg overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-4 flex items-center font-semibold border-b">
                                <div className="flex-1">Order details</div>
                                <div className="flex-1 text-center">Order Number</div>
                                <div className="flex-1 text-center">Status</div>
                                <div className="flex-1 text-center">Price</div>
                                <div className="w-12"></div>
                            </div>

                            <div className="px-6 py-4">
                                <div className="flex items-center">
                                    {/* Product Image & Name */}
                                    <div className="flex-1 flex items-center gap-4">
                                        <div className="w-16 h-16 border-2 border-gray-300 rounded flex items-center justify-center bg-white overflow-hidden">
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
                                    <div className="w-12 flex justify-center">
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
                                    <div className="border-t pt-6">
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* Left Column - Order Details */}
                                            <div>
                                                <h3 className="text-xl font-bold mb-4">{getOrderDescription(order)}</h3>
                                                <div className="space-y-2 text-sm">
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
                                                </div>
                                            </div>

                                            {/* Right Column - Contact & Address Information */}
                                            <div>
                                                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                                                <div className="text-sm mb-4">
                                                    <p className="font-semibold">{order.contactperson}</p>
                                                    <p>{order.contactphone}</p>
                                                    <p className="text-gray-600">{order.companyname}</p>
                                                </div>

                                                {/* Delivery Address Section */}
                                                <h3 className="text-xl font-bold mb-2 mt-6">Delivery Address</h3>
                                                <div className="text-sm mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
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
                                                        <h3 className="text-xl font-bold mb-2 mt-4">Order Instructions</h3>
                                                        <div className="border rounded-lg p-3 bg-blue-50 border-blue-200 mb-3">
                                                            <p className="text-sm text-gray-700">{order.orderinstructions}</p>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Delivery Notes Section */}
                                                {order.deliverynotes && (
                                                    <>
                                                        <h3 className="text-xl font-bold mb-2 mt-4">Delivery Notes</h3>
                                                        <div className="border rounded-lg p-3 bg-gray-50 mb-3">
                                                            <p className="text-sm text-gray-700">{order.deliverynotes}</p>
                                                        </div>
                                                    </>
                                                )}

                                                {/* View 3D Design Button */}
                                                {order.threeddesigndata && (
                                                    <button 
                                                        onClick={() => open3DModal(order.threeddesigndata)}
                                                        className="w-full bg-indigo-600 text-white py-2 rounded flex items-center justify-center gap-2 text-sm font-semibold hover:bg-indigo-700 mt-3"
                                                    >
                                                        <Eye size={16} />
                                                        View 3D Design
                                                    </button>
                                                )}

                                                {/* Design File Button */}
                                                {order.customdesignurl && (
                                                    <button className="w-full bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2 text-sm font-semibold hover:bg-red-700 mt-3">
                                                        <FileText size={16} />
                                                        View Design File
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 mt-6 flex-wrap">
                                            {/* Download Invoice - Only show in Processing phase (Approved, In Production, Waiting for Shipment, In Transit, Completed) */}
                                            {['Approved', 'In Production', 'Waiting for Shipment', 'In Transit', 'Completed'].includes(order.orderstatus) && (
                                                <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-semibold">
                                                    <Download size={18} />
                                                    Download Invoice
                                                </button>
                                            )}

                                            {/* View Proof of Payment - Only show in Processing phase */}
                                            {['Approved', 'In Production', 'Waiting for Shipment', 'In Transit', 'Completed'].includes(order.orderstatus) && (
                                                <button
                                                    onClick={() => openProofModal('https://images.unsplash.com/photo-1554224311-beee460c201f?w=400')}
                                                    className="bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-800 transition-colors flex items-center gap-2 text-sm font-semibold"
                                                >
                                                    <FileText size={18} />
                                                    View Proof of Payment
                                                </button>
                                            )}

                                            {/* Payment - Only show when Waiting for Payment */}
                                            {order.orderstatus === 'Waiting for Payment' && (
                                                <Link to="/payment" className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition-colors flex items-center gap-2 text-sm font-semibold">
                                                    <CreditCard size={18} />
                                                    Payment
                                                </Link>
                                            )}

                                            {/* Contact Support - Always visible */}
                                            <button className="bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-800 transition-colors flex items-center gap-2 text-sm font-semibold">
                                                <MessageCircle size={18} />
                                                Contact Support
                                            </button>

                                            {/* Cancel Order - Only show in For Evaluation or Waiting for Payment (before Processing) */}
                                            {(order.orderstatus === 'For Evaluation' || order.orderstatus === 'Waiting for Payment') && (
                                                <button 
                                                    onClick={() => openCancelModal(order)}
                                                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors text-sm font-semibold"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}

                                            {/* Rate - Only show when Completed */}
                                            {order.orderstatus === 'Completed' && (
                                                <button 
                                                    onClick={() => openRatingModal(order)}
                                                    className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition-colors text-sm font-semibold"
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
                <div className="fixed inset-0 bg-[rgba(143,143,143,0.65)] flex items-center justify-center z-50 p-4">
                    <div className="bg-[#35408E] rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-center py-4 relative">
                            <div className="w-12 h-12  rounded-full flex items-center justify-center">
                                <div className="flex items-center justify-center">
                                    <img src={logo} alt="Logo" className="w-20 h-12" />
                                </div>
                            </div>
                        </div>

                        {/* Modal Title */}
                        <div className="text-center pb-6">
                            <h2 className="text-white text-2xl font-semibold">Proof of payment</h2>
                        </div>

                        {/* Image Container */}
                        <div className="bg-white mx-8 rounded-lg p-4 mb-6">
                            <img
                                src={proofImage}
                                alt="Proof of Payment"
                                className="w-full h-auto rounded"
                            />
                        </div>

                        {/* Back Button */}
                        <div className="flex justify-center pb-8">
                            <button
                                onClick={closeProofModal}
                                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-12 py-2 rounded transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3D Design Viewer Modal */}
            {show3DModal && selected3DDesign && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-white text-2xl font-semibold">3D Design Preview</h2>
                                <p className="text-indigo-200 text-sm mt-1">Interactive view of your customized hanger</p>
                            </div>
                            <button
                                onClick={close3DModal}
                                className="text-white hover:text-gray-200 transition-colors text-3xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* 3D Viewer */}
                        <div className="bg-white p-6">
                            <div className="w-full h-[500px] bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
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
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
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
                        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                💡 Drag to rotate • Scroll to zoom • Right-click to pan
                            </p>
                            <button
                                onClick={close3DModal}
                                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-2 rounded transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && orderToCancel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-red-600 px-6 py-4">
                            <h2 className="text-white text-2xl font-semibold">Cancel Order</h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-gray-700 mb-2">
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
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={closeCancelModal}
                                disabled={isCancelling}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-indigo-600 px-6 py-4">
                            <h2 className="text-white text-2xl font-semibold">Rate Your Order</h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Order Info */}
                            <div className="mb-6">
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
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    How would you rate your experience?
                                </label>
                                <div className="flex gap-2 justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <svg
                                                className={`w-12 h-12 ${
                                                    star <= rating
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
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={closeRatingModal}
                                disabled={isSubmittingReview}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className={`px-6 py-4 ${notificationType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                            <h2 className="text-white text-xl font-semibold">
                                {notificationType === 'success' ? '✓ Success' : '✕ Error'}
                            </h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-gray-700 text-lg">{notificationMessage}</p>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <button
                                onClick={closeNotificationModal}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                                    notificationType === 'success'
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