import React, { useState, useEffect, Suspense } from "react";
import {
    Home,
    Package,
    ShoppingBag,
    Calendar,
    MessageSquare,
    ChevronDown,
    Check,
    CreditCard,
    FileSpreadsheet,
    FileText,
    Phone,
    Eye,
    Edit2
} from "lucide-react";
import logo from '../../images/logo.png'
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import HangerScene from '../../components/Checkout/HangerScene';
import LoadingSpinner from '../../components/LoadingSpinner';


const OrderDetail = () => {
    const { orderid } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderStatus, setOrderStatus] = useState("");
    const [validatedPrice, setValidatedPrice] = useState("");
    const [deadline, setDeadline] = useState("");
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const [isSavingPrice, setIsSavingPrice] = useState(false);
    const [isSavingDeadline, setIsSavingDeadline] = useState(false);
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');
    const [show3DModal, setShow3DModal] = useState(false);
    const [selected3DDesign, setSelected3DDesign] = useState(null);

    // Payment proof states
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [showProofModal, setShowProofModal] = useState(false);

    // Fetch order details
    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderid) {
                setError('No order ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`https://gatsis-hub.vercel.app/orders/${orderid}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch order');
                }

                const data = await response.json();
                console.log('📦 Fetched order:', data.order);
                setOrder(data.order);
                setOrderStatus(data.order.orderstatus);
                setValidatedPrice(data.order.totalprice || '');
                setDeadline(data.order.deadline || '');
                setError(null);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderid]);

    // Fetch payment info for this order
    useEffect(() => {
        const fetchPaymentInfo = async () => {
            if (!orderid) return;

            try {
                const response = await fetch(`https://gatsis-hub.vercel.app/payments/order/${orderid}`);
                if (response.ok) {
                    const payment = await response.json();
                    setPaymentInfo(payment);
                    console.log('💳 Payment info loaded:', payment);
                }
            } catch (error) {
                console.log('No payment found for this order');
            }
        };

        fetchPaymentInfo();
    }, [orderid]);

    // Helper functions
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatMaterials = (materialsObj) => {
        if (!materialsObj || typeof materialsObj !== 'object') return 'N/A';
        return Object.entries(materialsObj)
            .map(([name, percentage]) => `${name} ${Math.round(percentage)}%`)
            .join(' | ');
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setOrderStatus(newStatus);
        
        try {
            setIsSavingStatus(true);
            const response = await fetch(`https://gatsis-hub.vercel.app/orders/${orderid}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update order status');
            }

            showNotificationMessage('Order status updated successfully', 'success');
        } catch (err) {
            console.error('Error updating status:', err);
            showNotificationMessage(err.message || 'Failed to update order status', 'error');
            setOrderStatus(order.orderstatus); // Revert on error
        } finally {
            setIsSavingStatus(false);
        }
    };

    const handlePriceUpdate = async () => {
        if (!isEditingPrice) {
            setIsEditingPrice(true);
            return;
        }

        try {
            setIsSavingPrice(true);
            const response = await fetch(`https://gatsis-hub.vercel.app/orders/${orderid}/price`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ price: parseFloat(validatedPrice) })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update price');
            }

            setIsEditingPrice(false);
            showNotificationMessage('Price updated successfully', 'success');
        } catch (err) {
            console.error('Error updating price:', err);
            showNotificationMessage(err.message || 'Failed to update price', 'error');
        } finally {
            setIsSavingPrice(false);
        }
    };

    const handleDeadlineUpdate = async () => {
        if (!isEditingDeadline) {
            setIsEditingDeadline(true);
            return;
        }

        if (!deadline) {
            showNotificationMessage('Please select a deadline date', 'error');
            return;
        }

        setIsSavingDeadline(true);
        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/orders/${orderid}/deadline`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ deadline })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update deadline');
            }

            console.log('✅ Deadline updated:', data.order);
            setOrder(data.order);
            setIsEditingDeadline(false);
            showNotificationMessage('Deadline updated successfully', 'success');
        } catch (err) {
            console.error('Error updating deadline:', err);
            showNotificationMessage(err.message || 'Failed to update deadline', 'error');
        } finally {
            setIsSavingDeadline(false);
        }
    };

    const showNotificationMessage = (message, type = 'success') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotification(true);
    };

    const closeNotification = () => {
        setShowNotification(false);
        setNotificationMessage('');
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

    const handleApproveOrder = async () => {
        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/orders/${orderid}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Approved' })
            });

            if (!response.ok) {
                throw new Error('Failed to approve order');
            }

            setOrderStatus('Approved');
            showNotificationMessage('Order approved successfully', 'success');
        } catch (err) {
            console.error('Error approving order:', err);
            showNotificationMessage('Failed to approve order', 'error');
        }
    };

    const handlePaymentConfirm = async () => {
        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/orders/${orderid}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Approved' })
            });

            if (!response.ok) {
                throw new Error('Failed to confirm payment');
            }

            setOrderStatus('Approved');
            showNotificationMessage('Payment confirmed and order approved', 'success');
        } catch (err) {
            console.error('Error confirming payment:', err);
            showNotificationMessage('Failed to confirm payment', 'error');
        }
    };

    const handleContactCustomer = async () => {
        try {
            const employee = JSON.parse(localStorage.getItem('employee'));
            
            if (!employee || !employee.employeeid) {
                showNotificationMessage('Please log in to contact customer', 'error');
                return;
            }

            if (!order || !order.userid) {
                showNotificationMessage('Customer information not available', 'error');
                return;
            }

            // Get customer ID from userid
            const customerResponse = await fetch(`https://gatsis-hub.vercel.app/auth/customer/${order.userid}`);
            
            if (!customerResponse.ok) {
                showNotificationMessage('Failed to get customer information', 'error');
                return;
            }

            const customerData = await customerResponse.json();
            
            // The API returns customer data directly, not wrapped
            const customerid = customerData.customerid;

            if (!customerid) {
                showNotificationMessage('Customer not found', 'error');
                return;
            }

            // Create an initial message to start the conversation
            const initialMessage = `Hello, regarding your order ${order.orderid.slice(0, 8).toUpperCase()}`;

            const response = await fetch('https://gatsis-hub.vercel.app/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerid: customerid,
                    employeeid: employee.employeeid,
                    senderType: 'admin', // Sales admin is sending the message
                    message: initialMessage
                })
            });

            if (response.ok) {
                // Navigate to messages page
                navigate('/messageSA');
            } else {
                showNotificationMessage('Failed to start conversation. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
            showNotificationMessage('Failed to contact customer. Please try again.', 'error');
        }
    };

    const handleExportXLS = () => {
        console.log("Exporting to XLS");
        showNotificationMessage('XLS export feature coming soon', 'success');
    };

    const handleExportPDF = () => {
        console.log("Exporting to PDF");
        showNotificationMessage('PDF export feature coming soon', 'success');
    };

    const handleViewProof = () => {
        if (!paymentInfo || !paymentInfo.proofofpayment) {
            showNotificationMessage('No payment proof available for this order', 'error');
            return;
        }
        console.log("Viewing proof of payment:", paymentInfo.proofofpayment);
        setShowProofModal(true);
    };

    const handleRejectPayment = async () => {
        if (!paymentInfo || !paymentInfo.paymentid) {
            showNotificationMessage('No payment to reject', 'error');
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to reject this payment? The customer will need to submit a new proof of payment.'
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/payments/${paymentInfo.paymentid}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to reject payment');
            }

            showNotificationMessage('Payment rejected. Customer can now resubmit proof of payment.', 'success');
            setShowProofModal(false);
            setPaymentInfo(null);
            
            // Refresh order data
            const orderResponse = await fetch(`https://gatsis-hub.vercel.app/orders/${orderid}`);
            if (orderResponse.ok) {
                const data = await orderResponse.json();
                setOrder(data.order);
                setOrderStatus(data.order.orderstatus);
            }
        } catch (err) {
            console.error('Error rejecting payment:', err);
            showNotificationMessage('Failed to reject payment', 'error');
        }
    };

    const handleApprovePayment = async () => {
        if (!paymentInfo || !paymentInfo.paymentid) {
            showNotificationMessage('No payment to approve', 'error');
            return;
        }

        try {
            const employee = JSON.parse(localStorage.getItem('employee'));
            
            const response = await fetch(`https://gatsis-hub.vercel.app/payments/${paymentInfo.paymentid}/verify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'Verified',
                    verifiedby: employee?.employeeid
                })
            });

            if (!response.ok) {
                throw new Error('Failed to approve payment');
            }

            showNotificationMessage('Payment approved successfully', 'success');
            setShowProofModal(false);
            
            // Refresh payment and order data
            const paymentResponse = await fetch(`https://gatsis-hub.vercel.app/payments/order/${orderid}`);
            if (paymentResponse.ok) {
                const payment = await paymentResponse.json();
                setPaymentInfo(payment);
            }
            
            const orderResponse = await fetch(`https://gatsis-hub.vercel.app/orders/${orderid}`);
            if (orderResponse.ok) {
                const data = await orderResponse.json();
                setOrder(data.order);
                setOrderStatus(data.order.orderstatus);
            }
        } catch (err) {
            console.error('Error approving payment:', err);
            showNotificationMessage('Failed to approve payment', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex w-full bg-gray-50">
                <main className="flex-1 p-6">
                    <div className="flex items-center justify-center h-96">
                        <LoadingSpinner size="xl" text="Loading order..." />
                    </div>
                </main>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex w-full bg-gray-50">
                <main className="flex-1 p-6">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                            <p className="text-xl text-red-600 mb-4">Error loading order</p>
                            <p className="text-gray-600">{error || 'Order not found'}</p>
                            <button
                                onClick={() => navigate('/orderpage')}
                                className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-500 font-semibold"
                            >
                                Back to Orders
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const menuItems = [
        { name: "Dashboard", icon: Home },
        { name: "Orders", icon: Package, active: true },
        { name: "Products", icon: ShoppingBag },
        { name: "Calendar", icon: Calendar },
        { name: "Messages", icon: MessageSquare }
    ];

    return (
        <div className="flex w-full bg-gray-50">
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Page Title */}
                <h1 className="text-4xl font-bold text-gray-800 mb-6">Orders</h1>

                {/* Order Details Card */}
                <div className="bg-white shadow-lg rounded-lg border border-gray-200">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b bg-[#35408E] text-white rounded-t-lg">
                        <h2 className="font-semibold text-lg">Order Details</h2>
                        <div className="relative">
                            <select
                                value={orderStatus}
                                onChange={handleStatusChange}
                                disabled={isSavingStatus}
                                className="px-4 py-2 pr-10 rounded bg-white text-gray-800 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none disabled:opacity-50"
                            >
                                <option>For Evaluation</option>
                                <option>Waiting for Payment</option>
                                <option>Approved</option>
                                <option>In Production</option>
                                <option>Waiting for Shipment</option>
                                <option>In Transit</option>
                                <option>Completed</option>
                                <option>Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" size={16} />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Company Name */}
                        <h3 className="text-2xl font-bold text-gray-800">{order.companyname}</h3>

                        {/* Order Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 border border-gray-300 rounded-lg overflow-hidden">
                            <div className="p-3 border-b md:border-r border-gray-300 bg-gray-50">
                                <span className="text-sm text-gray-600">Order Number:</span>
                                <p className="font-semibold">ORD-{order.orderid.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div className="p-3 border-b border-gray-300 bg-gray-50">
                                <span className="text-sm text-gray-600">Order Quantity:</span>
                                <p className="font-semibold">{order.quantity}x</p>
                            </div>
                            <div className="p-3 border-b md:border-r border-gray-300">
                                <span className="text-sm text-gray-600">Order Placed:</span>
                                <p className="font-semibold">{formatDate(order.datecreated)}</p>
                            </div>
                            <div className="p-3 border-b border-gray-300">
                                <span className="text-sm text-gray-600">Product:</span>
                                <p className="font-semibold">{order.hangertype}</p>
                            </div>
                            <div className="p-3 border-b md:border-r border-gray-300 bg-gray-50">
                                <span className="text-sm text-gray-600">Contact Person:</span>
                                <p className="font-semibold">{order.contactperson}</p>
                            </div>
                            <div className="p-3 border-b border-gray-300 bg-gray-50">
                                <span className="text-sm text-gray-600">Contact Phone:</span>
                                <p className="font-semibold">{order.contactphone}</p>
                            </div>
                            {order.selectedcolor && (
                                <div className="p-3 border-b md:border-r border-gray-300">
                                    <span className="text-sm text-gray-600">Color:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div
                                            className="w-6 h-6 rounded border-2 border-gray-400"
                                            style={{ background: order.selectedcolor }}
                                        />
                                        <span className="font-semibold">{order.selectedcolor}</span>
                                    </div>
                                </div>
                            )}
                            {order.materials && (
                                <div className="p-3 border-b border-gray-300">
                                    <span className="text-sm text-gray-600">Material Selected:</span>
                                    <p className="font-semibold">{formatMaterials(order.materials)}</p>
                                </div>
                            )}
                            {order.customtext && (
                                <div className="p-3 border-b md:border-r border-gray-300 bg-gray-50">
                                    <span className="text-sm text-gray-600">Custom Text:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-semibold italic">"{order.customtext}"</span>
                                        {order.textcolor && (
                                            <div
                                                className="w-4 h-4 rounded border border-gray-300"
                                                style={{ backgroundColor: order.textcolor }}
                                            ></div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {order.customlogo && (
                                <div className="p-3 border-b border-gray-300 bg-gray-50">
                                    <span className="text-sm text-gray-600">Custom Logo:</span>
                                    <p className="font-semibold">✓ Included</p>
                                </div>
                            )}
                        </div>

                        {/* Validated Price and Deadline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Validated Price */}
                            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                <label className="font-semibold text-gray-800 block mb-2">Validated Price:</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={validatedPrice}
                                        onChange={(e) => setValidatedPrice(e.target.value)}
                                        disabled={!isEditingPrice}
                                        className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                                        placeholder="Enter validated price"
                                    />
                                    <button
                                        onClick={handlePriceUpdate}
                                        disabled={isSavingPrice}
                                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
                                    >
                                        <Edit2 size={16} />
                                        {isSavingPrice ? 'Saving...' : isEditingPrice ? "Save" : "Edit"}
                                    </button>
                                </div>
                            </div>

                            {/* Deadline */}
                            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                <label className="font-semibold text-gray-800 block mb-2">Deadline:</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        disabled={!isEditingDeadline}
                                        className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                                    />
                                    <button
                                        onClick={handleDeadlineUpdate}
                                        disabled={isSavingDeadline}
                                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
                                    >
                                        <Edit2 size={16} />
                                        {isSavingDeadline ? 'Saving...' : isEditingDeadline ? "Save" : "Edit"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="border border-gray-300 rounded-lg p-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Delivery Address</h3>
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

                        {/* Order Instructions & Delivery Notes */}
                        {(order.orderinstructions || order.deliverynotes) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {order.orderinstructions && (
                                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                        <h4 className="font-semibold text-gray-800 mb-2">Order Instructions:</h4>
                                        <p className="text-sm text-gray-700">{order.orderinstructions}</p>
                                    </div>
                                )}
                                {order.deliverynotes && (
                                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                        <h4 className="font-semibold text-gray-800 mb-2">Delivery Notes:</h4>
                                        <p className="text-sm text-gray-700">{order.deliverynotes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3D Design Preview */}
                        {order.threeddesigndata && (
                            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-gray-800">3D Design Preview:</h4>
                                    <button
                                        onClick={() => open3DModal(order.threeddesigndata)}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
                                    >
                                        <Eye size={16} />
                                        View 3D Design
                                    </button>
                                </div>
                                {(() => {
                                    try {
                                        const designData = typeof order.threeddesigndata === 'string' 
                                            ? JSON.parse(order.threeddesigndata) 
                                            : order.threeddesigndata;
                                        
                                        if (designData && designData.thumbnail) {
                                            return (
                                                <img 
                                                    src={designData.thumbnail} 
                                                    alt="Design preview"
                                                    className="w-full max-w-md h-64 object-contain mx-auto rounded border border-gray-300"
                                                />
                                            );
                                        }
                                    } catch (error) {
                                        console.error('Error parsing design data:', error);
                                    }
                                    return <p className="text-gray-500 text-center py-8">No thumbnail available</p>;
                                })()}
                            </div>
                        )}

                        {/* Attached File */}
                        {order.customdesignurl && (
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-gray-800">Attached File:</span>
                                <a 
                                    href={order.customdesignurl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
                                >
                                    <FileText size={16} />
                                    View Design File
                                </a>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={handleApproveOrder}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <Check size={18} />
                                Approve Order
                            </button>
                            <button
                                onClick={handlePaymentConfirm}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <CreditCard size={18} />
                                Payment Confirm
                            </button>
                            <button
                                onClick={handleViewProof}
                                disabled={!paymentInfo}
                                className={`px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm ${
                                    paymentInfo 
                                        ? 'bg-indigo-700 hover:bg-indigo-800 text-white' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <Eye size={18} />
                                View Proof {paymentInfo ? '' : '(Not Available)'}
                            </button>
                            <button
                                onClick={handleExportXLS}
                                className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <FileSpreadsheet size={18} />
                                Export XLS
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <FileText size={18} />
                                Export PDF
                            </button>
                            <button
                                onClick={handleContactCustomer}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <Phone size={18} />
                                Contact Customer
                            </button>
                            <button
                                onClick={() => navigate('/orderpage')}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                Back to Orders
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Proof of Payment Modal */}
            {showProofModal && paymentInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                            <div>
                                <h2 className="text-white text-2xl font-semibold">Proof of Payment</h2>
                                <p className="text-indigo-200 text-sm mt-1">
                                    Payment Method: {paymentInfo.paymentmethod} | Status: {paymentInfo.paymentstatus}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowProofModal(false)}
                                className="text-white hover:text-gray-200 transition-colors text-3xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* Proof Content - Scrollable */}
                        <div className="bg-white p-6 overflow-auto flex-1">
                            {paymentInfo.proofofpayment && paymentInfo.proofofpayment.toLowerCase().endsWith('.pdf') ? (
                                <div className="flex flex-col items-center gap-4 py-8">
                                    <FileText size={64} className="text-indigo-600" />
                                    <p className="text-gray-700 font-semibold text-lg">PDF Payment Proof</p>
                                    <a 
                                        href={paymentInfo.proofofpayment} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
                                    >
                                        <Eye size={20} />
                                        Open PDF
                                    </a>
                                </div>
                            ) : (
                                <div className="w-full bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
                                    <img
                                        src={paymentInfo.proofofpayment}
                                        alt="Proof of Payment"
                                        className="w-full h-auto max-h-[60vh] object-contain"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Payment Details */}
                        {paymentInfo.datesubmitted && (
                            <div className="bg-gray-50 px-6 py-4 border-t flex-shrink-0">
                                <p className="text-sm text-gray-600">
                                    Submitted: {formatDate(paymentInfo.datesubmitted)}
                                </p>
                                {paymentInfo.paymentstatus && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Status: <span className={`font-semibold ${
                                            paymentInfo.paymentstatus === 'Verified' ? 'text-green-600' :
                                            paymentInfo.paymentstatus === 'Rejected' ? 'text-red-600' :
                                            'text-yellow-600'
                                        }`}>{paymentInfo.paymentstatus}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Footer - Action Buttons */}
                        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center gap-3 flex-shrink-0">
                            <div className="flex gap-3">
                                {paymentInfo.paymentstatus !== 'Verified' && (
                                    <button
                                        onClick={handleApprovePayment}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                                    >
                                        <Check size={18} />
                                        Approve Payment
                                    </button>
                                )}
                                {paymentInfo.paymentstatus !== 'Rejected' && (
                                    <button
                                        onClick={handleRejectPayment}
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                                    >
                                        ✕ Reject Payment
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowProofModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3D Design Viewer Modal */}
            {show3DModal && selected3DDesign && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-white text-2xl font-semibold">3D Design Preview</h2>
                                <p className="text-indigo-200 text-sm mt-1">Interactive view of customized hanger</p>
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
                                        <LoadingSpinner size="lg" text="Loading 3D Design..." />
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

            {/* Notification Modal */}
            {showNotification && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
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
                                onClick={closeNotification}
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
    );
};

export default OrderDetail;