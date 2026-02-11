import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { ChevronDown, MessageCircle, Eye } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Download, CreditCard, X, Truck, Box, ClipboardPen, Boxes } from 'lucide-react';
import logo from '../../images/logo.png'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HangerScene from '../../components/Checkout/HangerScene';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import { useRealtimePayments } from '../../hooks/useRealtimePayments';
import LoadingSpinner from '../../components/LoadingSpinner';
import StarRating from '../../components/StarRating';
import ContractModal from '../../components/ContractModal';
import styled from 'styled-components';


const Order = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('All Orders');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [show3DModal, setShow3DModal] = useState(false);
    const [selected3DDesign, setSelected3DDesign] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const ordersPerPage = 5; // Reduced for faster loading

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

    // Invoice modal state
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceOrderData, setInvoiceOrderData] = useState(null);

    // Contract modal state
    const [showContractModal, setShowContractModal] = useState(false);
    const [orderToSign, setOrderToSign] = useState(null);

    const tabs = ['All Orders', 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

    // Map tab names to their corresponding order statuses
    const getStatusesForTab = (tab) => {
        const statusMap = {
            'Pending': ['For Evaluation', 'Contract Signing', 'Waiting for Payment'],
            'Processing': ['Verifying Payment', 'In Production', 'Waiting for Shipment'],
            'Shipped': ['In Transit'],
            'Completed': ['Completed'],
            'Cancelled': ['Cancelled']
        };
        return statusMap[tab] || [];
    };

    // Real-time order update handler
    const handleOrderUpdate = useCallback((payload) => {

        if (payload.eventType === 'INSERT') {
            // New order added - refetch current page to maintain pagination
            if (currentPage === 1) {
                // Only auto-update if on first page
                window.location.reload();
            }
        } else if (payload.eventType === 'UPDATE') {
            // Order updated - update in current list if present
            setOrders(prev =>
                prev.map(order =>
                    order.orderid === payload.new.orderid ? { ...payload.new, payment: orderPayments[payload.new.orderid] } : order
                )
            );
        } else if (payload.eventType === 'DELETE') {
            // Order deleted
            setOrders(prev =>
                prev.filter(order => order.orderid !== payload.old.orderid)
            );
        }
    }, [currentPage, orderPayments]);

    // Real-time payment update handler
    const handlePaymentUpdate = useCallback((payload) => {

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Payment added or updated
            setOrderPayments(prev => ({
                ...prev,
                [payload.new.orderid]: payload.new
            }));
        } else if (payload.eventType === 'DELETE') {
            // Payment deleted (rejected) - clear payment info and refetch order to get updated status
            const deletedOrderId = payload.old.orderid;
            setOrderPayments(prev => {
                const updated = { ...prev };
                delete updated[deletedOrderId];
                return updated;
            });

            // Refetch the specific order to get the updated status (should be 'Waiting for Payment')
            if (deletedOrderId) {
                const timestamp = new Date().getTime();
                fetch(`https://gatsis-hub.vercel.app/orders/${deletedOrderId}?_t=${timestamp}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.order) {
                            setOrders(prev =>
                                prev.map(order =>
                                    order.orderid === deletedOrderId ? data.order : order
                                )
                            );
                        }
                    })
                    .catch(err => console.error('Error refetching order after payment deletion:', err));
            }
        }
    }, []);

    // Subscribe to real-time order updates
    const { isSubscribed } = useRealtimeOrders(user?.userid, handleOrderUpdate);

    // Subscribe to real-time payment updates (all payments for this user's orders)
    const { isSubscribed: isPaymentsSubscribed } = useRealtimePayments(null, handlePaymentUpdate);

    // Fetch orders when component mounts, page changes, or when returning from payment page
    useEffect(() => {
        fetchOrders();
    }, [user, currentPage, location.state?.refresh]); // Add currentPage as dependency

    // Separate fetchOrders function for reuse
    const fetchOrders = async () => {
        if (!user || !user.userid) {
            setError('User not logged in');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();

            // Try the new optimized endpoint first
            let response = await fetch(
                `https://gatsis-hub.vercel.app/orders/user/${user.userid}/full?page=${currentPage}&limit=${ordersPerPage}&_t=${timestamp}`
            );

            // If new endpoint fails, fallback to old endpoint (might not be deployed yet)
            if (!response.ok) {
                console.warn('New endpoint failed, trying fallback...');
                response = await fetch(`https://gatsis-hub.vercel.app/orders/user/${user.userid}?_t=${timestamp}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                // Handle old endpoint response (without pagination)
                const data = await response.json();
                console.log('Fetched orders (fallback):', data.orders?.length, 'orders');

                setOrders(data.orders || []);
                setTotalPages(1);
                setTotalOrders(data.orders?.length || 0);

                // Need to fetch payments separately with old endpoint
                if (data.orders && data.orders.length > 0) {
                    const paymentsMap = {};
                    await Promise.all(data.orders.map(async (order) => {
                        try {
                            const paymentRes = await fetch(`https://gatsis-hub.vercel.app/payments/order/${order.orderid}?_t=${timestamp}`);
                            if (paymentRes.ok) {
                                const payment = await paymentRes.json();
                                paymentsMap[order.orderid] = payment;
                            }
                        } catch (error) {
                            console.error(`Error fetching payment for order ${order.orderid}:`, error);
                        }
                    }));
                    setOrderPayments(paymentsMap);
                }

                setError(null);
                setLoading(false);
                return;
            }

            // Handle new optimized endpoint response
            const data = await response.json();

            console.log('Fetched orders:', data.orders?.length, 'orders');
            console.log('Pagination:', data.pagination);

            setOrders(data.orders || []);

            // Set pagination data
            if (data.pagination) {
                setTotalPages(data.pagination.totalPages);
                setTotalOrders(data.pagination.totalOrders);
            }

            // Extract payments from orders data (already included)
            if (data.orders && data.orders.length > 0) {
                const paymentsMap = {};
                data.orders.forEach(order => {
                    if (order.payment) {
                        paymentsMap[order.orderid] = order.payment;
                    }
                });
                setOrderPayments(paymentsMap);
                console.log('Payment statuses loaded:', Object.keys(paymentsMap).length, 'payments');
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get status color
    const getStatusColor = (status) => {
        const statusColors = {
            'For Evaluation': '#fbbf24',
            'Waiting for Payment': '#fb923c',
            'Verifying Payment': '#10b981',
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

                showNotification(`Failed to start conversation: ${errorMsg}`, 'error');
            }
        } catch (error) {

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

            showNotification(err.message || 'Failed to submit review. Please try again.', 'error');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Contract modal handlers
    const openContractModal = (order) => {
        setOrderToSign(order);
        setShowContractModal(true);
    };

    const closeContractModal = () => {
        setShowContractModal(false);
        setOrderToSign(null);
    };

    const handleContractSigned = async () => {
        // Refresh orders to get updated contract status
        closeContractModal();
        showNotification('Contract signed successfully! You can now proceed with payment.');
        
        // Refresh current page
        try {
            await fetchOrders();
        } catch (err) {
            console.error('Error refreshing orders:', err);
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

            showNotification('Failed to cancel order. Please try again or contact support.', 'error');
        } finally {
            setIsCancelling(false);
        }
    };

    // Download invoice/receipt as HTML file
    const handleDownloadInvoiceFromOrder = () => {
        if (!invoiceOrderData) return;

        const docType = invoiceOrderData.hasPayment ? 'Receipt' : 'Invoice';
        const invoiceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docType} - ${invoiceOrderData.orderNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #191716;
            margin-bottom: 5px;
        }
        .doc-title {
            font-size: 24px;
            color: #3b82f6;
            margin-top: 10px;
        }
        .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-block h3 {
            color: #191716;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .info-row {
            margin: 8px 0;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: #3b82f6;
            color: white;
            padding: 12px;
            text-align: left;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }
        .breakdown-section {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .breakdown-item {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 8px;
            background: white;
            border-radius: 4px;
        }
        .total-section {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #3b82f6;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 16px;
        }
        .total-amount {
            display: flex;
            justify-content: space-between;
            font-size: 24px;
            font-weight: bold;
            color: #191716;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #3b82f6;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 20px;
        }
        .status-paid {
            background-color: #10b981;
            color: white;
        }
        .status-pending {
            background-color: #f59e0b;
            color: white;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">GatsisHub</div>
        <div class="doc-title">${docType}</div>
        <div class="status-badge ${invoiceOrderData.hasPayment ? 'status-paid' : 'status-pending'}">
            ${invoiceOrderData.hasPayment ? '✓ PAID' : 'PENDING PAYMENT'}
        </div>
    </div>

    <div class="info-section">
        <div class="info-block">
            <h3>Order Information</h3>
            <div class="info-row"><span class="label">Order Number:</span> ${invoiceOrderData.orderNumber}</div>
            <div class="info-row"><span class="label">Date:</span> ${new Date(invoiceOrderData.datecreated).toLocaleDateString()}</div>
        </div>
        <div class="info-block">
            <h3>Customer Information</h3>
            <div class="info-row"><span class="label">Company:</span> ${invoiceOrderData.companyName}</div>
            <div class="info-row"><span class="label">Contact:</span> ${invoiceOrderData.contactPerson}</div>
            <div class="info-row"><span class="label">Phone:</span> ${invoiceOrderData.contactPhone}</div>
        </div>
    </div>

    <div class="info-block">
        <h3>Product Details</h3>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Specification</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Product</td>
                    <td>${invoiceOrderData.selectedHanger}</td>
                </tr>
                <tr>
                    <td>Quantity</td>
                    <td>${invoiceOrderData.quantity} units</td>
                </tr>
                ${invoiceOrderData.color ? `<tr><td>Color</td><td>${invoiceOrderData.color}</td></tr>` : ''}
                <tr>
                    <td>Materials</td>
                    <td>${Object.entries(invoiceOrderData.selectedMaterials).map(([name, pct]) => `${Math.round(pct)}% ${name}`).join(', ')}</td>
                </tr>
                ${invoiceOrderData.customtext ? `<tr><td>Custom Text</td><td>"${invoiceOrderData.customtext}"</td></tr>` : ''}
                ${invoiceOrderData.customlogo ? `<tr><td>Custom Logo</td><td>✓ Included</td></tr>` : ''}
            </tbody>
        </table>
    </div>

    ${invoiceOrderData.breakdown ? `
    <div class="breakdown-section">
        <h3>${invoiceOrderData.isPriceFinal ? '💰 Final Price Breakdown' : '📊 Estimated Price Breakdown'}</h3>
        <div class="info-row">
            <span class="label">Product Weight:</span> ${invoiceOrderData.breakdown.productWeight}g per unit
        </div>
        <div class="info-row">
            <span class="label">Total Weight:</span> ${invoiceOrderData.breakdown.totalWeight.toFixed(3)} kg
        </div>
        
        ${!invoiceOrderData.isPriceFinal && invoiceOrderData.breakdown.materials.length > 0 ? `
        <h4 style="margin-top: 20px;">Material Costs:</h4>
        ${invoiceOrderData.breakdown.materials.map(mat => `
        <div class="breakdown-item">
            <div>
                <strong>${mat.name} (${mat.percentage}%)</strong><br>
                <small>₱${mat.pricePerKg.toLocaleString('en-PH', { minimumFractionDigits: 2 })} per kg × ${mat.weight.toFixed(3)} kg</small>
            </div>
            <div>
                <strong>₱${mat.cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
            </div>
        </div>
        `).join('')}
        ` : ''}
    </div>

    <div class="total-section">
        <div class="total-row">
            <span>Total Material Cost:</span>
            <span>₱${invoiceOrderData.breakdown.totalMaterialCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="total-row" style="margin-bottom: 5px;">
            <span><strong>Delivery Fee (${invoiceOrderData.breakdown.deliveryBreakdown?.isLocal ? 'Local' : 'International'}):</strong></span>
            <span><strong>₱${invoiceOrderData.breakdown.deliveryCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></span>
        </div>
        ${invoiceOrderData.breakdown.deliveryBreakdown ? `
        <div class="total-row" style="margin-left: 20px; font-size: 0.9em; color: #666;">
            <span>• Base cost:</span>
            <span>₱${invoiceOrderData.breakdown.deliveryBreakdown.baseCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
        </div>
        ${invoiceOrderData.breakdown.deliveryBreakdown.additionalCost > 0 ? `
        <div class="total-row" style="margin-left: 20px; font-size: 0.9em; color: #666;">
            <span>• Extra weight (${Math.ceil(invoiceOrderData.breakdown.deliveryBreakdown.excessWeight)} kg over ${invoiceOrderData.breakdown.deliveryBreakdown.weightLimit} kg):</span>
            <span>₱${invoiceOrderData.breakdown.deliveryBreakdown.additionalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
        </div>` : ''}
        ` : ''}
        ${invoiceOrderData.breakdown.subtotal ? `
        <div class="total-row" style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 5px;">
            <span><strong>Subtotal:</strong></span>
            <span><strong>₱${invoiceOrderData.breakdown.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></span>
        </div>
        ` : ''}
        ${invoiceOrderData.breakdown.vatRate ? `
        <div class="total-row">
            <span>VAT (${invoiceOrderData.breakdown.vatRate}%${invoiceOrderData.breakdown.country ? ` - ${invoiceOrderData.breakdown.country}` : ''}):</span>
            <span>₱${invoiceOrderData.breakdown.vatAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
        </div>
        ` : ''}
        <div class="total-amount">
            <span>${invoiceOrderData.isPriceFinal ? 'FINAL AMOUNT:' : 'ESTIMATED AMOUNT:'}</span>
            <span>₱${invoiceOrderData.breakdown.totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
        </div>
    </div>
    ` : ''}

    ${invoiceOrderData.breakdown?.notes ? `
    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <strong>📝 Note from Sales Team:</strong><br>
        <span style="color: #666;">${invoiceOrderData.breakdown.notes}</span>
    </div>
    ` : ''}

    <div class="footer">
        <p><strong>GatsisHub</strong> - Custom Hanger Solutions</p>
        <p>Thank you for your business!</p>
        <p style="margin-top: 10px;">This is a computer-generated ${docType.toLowerCase()} and does not require a signature.</p>
    </div>
</body>
</html>
        `.trim();

        // Create blob and download
        const blob = new Blob([invoiceHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${docType}-${invoiceOrderData.orderNumber}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Function to open invoice modal
    const handleViewInvoice = async (order) => {
        try {
            // Fetch product data to get weight
            const productRes = await fetch(`https://gatsis-hub.vercel.app/products`);
            if (!productRes.ok) throw new Error('Failed to fetch product data');
            const productsData = await productRes.json();
            const product = productsData.products.find(p => p.productname === order.hangertype);

            // Fetch materials data to get price per kg
            const materialsRes = await fetch(`https://gatsis-hub.vercel.app/materials`);
            if (!materialsRes.ok) throw new Error('Failed to fetch materials data');
            const materialsData = await materialsRes.json();

            // Priority: price_breakdown (sales admin final) > estimated_breakdown (checkout) > calculated fallback
            let breakdown;
            let isPriceFinal = false;

            // Check for sales admin's final price breakdown first
            if (order.price_breakdown) {
                isPriceFinal = true;
                const finalBreakdown = typeof order.price_breakdown === 'string' 
                    ? JSON.parse(order.price_breakdown) 
                    : order.price_breakdown;
                
                breakdown = {
                    productWeight: product?.weight || 0,
                    totalWeight: parseFloat(finalBreakdown.totalWeightKg) || (((product?.weight || 0) * order.quantity) / 1000),
                    materials: [],
                    totalMaterialCost: parseFloat(finalBreakdown.materialCost) || 0,
                    deliveryCost: parseFloat(finalBreakdown.deliveryFee) || 0,
                    deliveryBreakdown: {
                        isLocal: finalBreakdown.deliveryType === 'local',
                        baseCost: parseFloat(finalBreakdown.deliveryFee) || 0, // Show full delivery as base for final price
                        excessWeight: 0,
                        additionalCost: 0,
                        weightLimit: 10
                    },
                    subtotal: parseFloat(finalBreakdown.materialCost) + parseFloat(finalBreakdown.deliveryFee),
                    vatRate: parseFloat(finalBreakdown.vatRate) || 12,
                    vatAmount: (parseFloat(finalBreakdown.materialCost) + parseFloat(finalBreakdown.deliveryFee)) * (parseFloat(finalBreakdown.vatRate) / 100),
                    totalPrice: parseFloat(order.totalprice) || 0,
                    country: 'Philippines',
                    notes: finalBreakdown.notes || null
                };

                // Calculate material breakdown if available
                if (order.materials && typeof order.materials === 'object') {
                    breakdown.materials = Object.entries(order.materials).map(([name, percentage]) => {
                        const material = materialsData.materials.find(m => m.materialname === name);
                        const pricePerKg = material?.price_per_kg || 0;
                        const weight = breakdown.totalWeight * (percentage / 100);
                        const cost = weight * pricePerKg;

                        return {
                            name,
                            percentage: Math.round(percentage),
                            pricePerKg,
                            weight,
                            cost
                        };
                    });
                }
            }
            // Check if order has estimated_breakdown saved (from checkout)
            else if (order.estimated_breakdown) {
                // Use saved estimated breakdown from checkout
                const savedBreakdown = typeof order.estimated_breakdown === 'string' 
                    ? JSON.parse(order.estimated_breakdown) 
                    : order.estimated_breakdown;
                
                breakdown = {
                    productWeight: product?.weight || 0,
                    totalWeight: savedBreakdown.totalWeight || (((product?.weight || 0) * order.quantity) / 1000),
                    materials: [],
                    totalMaterialCost: savedBreakdown.materialCost || savedBreakdown.totalMaterialCost || 0,
                    deliveryCost: savedBreakdown.deliveryFee || savedBreakdown.deliveryCost || 0,
                    deliveryBreakdown: savedBreakdown.deliveryBreakdown || {
                        isLocal: savedBreakdown.deliveryType === 'local',
                        baseCost: savedBreakdown.baseCost || 0,
                        excessWeight: savedBreakdown.excessWeight || 0,
                        additionalCost: savedBreakdown.excessWeightCost || 0,
                        weightLimit: savedBreakdown.deliveryType === 'local' ? 10 : 10
                    },
                    subtotal: savedBreakdown.subtotal || 0,
                    vatRate: savedBreakdown.vatRate || 12,
                    vatAmount: savedBreakdown.vatAmount || 0,
                    totalPrice: parseFloat(order.totalprice) || 0,
                    country: savedBreakdown.country || 'Philippines'
                };

                // Calculate material breakdown if available
                if (order.materials && typeof order.materials === 'object') {
                    breakdown.materials = Object.entries(order.materials).map(([name, percentage]) => {
                        const material = materialsData.materials.find(m => m.materialname === name);
                        const pricePerKg = material?.price_per_kg || 0;
                        const weight = breakdown.totalWeight * (percentage / 100);
                        const cost = weight * pricePerKg;

                        return {
                            name,
                            percentage: Math.round(percentage),
                            pricePerKg,
                            weight,
                            cost
                        };
                    });
                }
            } else {
                // Fallback: Calculate price breakdown dynamically
                breakdown = {
                    productWeight: product?.weight || 0,
                    totalWeight: ((product?.weight || 0) * order.quantity) / 1000, // Convert to kg
                    materials: [],
                    totalMaterialCost: 0,
                    deliveryCost: 0, // Will be calculated below
                    totalPrice: parseFloat(order.totalprice) || 0
                };

                // Calculate material costs
                if (order.materials && typeof order.materials === 'object') {
                    breakdown.materials = Object.entries(order.materials).map(([name, percentage]) => {
                        const material = materialsData.materials.find(m => m.materialname === name);
                        const pricePerKg = material?.price_per_kg || 0;
                        const weight = breakdown.totalWeight * (percentage / 100);
                        const cost = weight * pricePerKg;
                        breakdown.totalMaterialCost += cost;

                        return {
                            name,
                            percentage: Math.round(percentage),
                            pricePerKg,
                            weight,
                            cost
                        };
                    });
                }

                // Calculate delivery cost dynamically (fallback if no estimated_breakdown)
                const totalWeightKg = breakdown.totalWeight;
                const deliveryAddress = order.deliveryaddress || '';
                
                // Determine if local or international
                const isLocalDelivery = typeof deliveryAddress === 'string' 
                    ? deliveryAddress.toLowerCase().includes('philippines')
                    : true;  // Default to local

                const weightLimit = 10; // kg
                const localBaseCost = 1000;
                const internationalBaseCost = 5000;
                const localRatePerKg = 500;
                const internationalRatePerKg = 1000;

                const baseCost = isLocalDelivery ? localBaseCost : internationalBaseCost;
                const ratePerKg = isLocalDelivery ? localRatePerKg : internationalRatePerKg;

                let deliveryCost = baseCost;
                let additionalCost = 0;
                let excessWeight = 0;

                if (totalWeightKg > weightLimit) {
                    excessWeight = totalWeightKg - weightLimit;
                    additionalCost = Math.ceil(excessWeight) * ratePerKg;
                    deliveryCost = baseCost + additionalCost;
                }

                breakdown.deliveryCost = deliveryCost;
                breakdown.deliveryBreakdown = {
                    isLocal: isLocalDelivery,
                    baseCost,
                    excessWeight,
                    additionalCost,
                    weightLimit
                };
            }

            // Check if payment exists
            const hasPayment = orderPayments[order.orderid] &&
                orderPayments[order.orderid].paymentstatus === 'Verified';

            // Prepare invoice data
            const invoiceData = {
                orderNumber: `ORD-${order.orderid.slice(0, 8).toUpperCase()}`,
                datecreated: order.datecreated,
                companyName: order.companyname,
                contactPerson: order.contactperson,
                contactPhone: order.contactphone,
                selectedHanger: order.hangertype,
                quantity: order.quantity,
                color: order.selectedcolor,
                selectedMaterials: order.materials,
                breakdown,
                hasPayment,
                isPriceFinal, // Flag to indicate if sales admin set final price
                deliveryaddress: order.deliveryaddress,
                customtext: order.customtext,
                customlogo: order.customlogo,
                textcolor: order.textcolor
            };

            setInvoiceOrderData(invoiceData);
            setShowInvoiceModal(true);
        } catch (err) {
            console.error('Error fetching invoice data:', err);
            showNotification('Failed to load invoice. Please try again.', 'error');
        }
    };

    const handleDownloadInvoice = (order) => {
        // Create a simple HTML invoice for printing/saving as PDF
        const invoiceWindow = window.open('', '_blank');

        // Format materials as a readable string
        const formatMaterialsForInvoice = (materialsObj) => {
            if (!materialsObj || typeof materialsObj !== 'object') return 'N/A';
            return Object.entries(materialsObj)
                .map(([name, percentage]) => `${name} ${Math.round(percentage)}%`)
                .join(', ');
        };

        const invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ORD-${order.orderid.slice(0, 8).toUpperCase()}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px solid #E6AF2E;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .company-name {
                        font-size: 32px;
                        font-weight: bold;
                        color: #191716;
                        margin-bottom: 5px;
                    }
                    .invoice-title {
                        font-size: 24px;
                        color: #666;
                        margin-top: 10px;
                    }
                    .info-section {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                    }
                    .info-block {
                        flex: 1;
                    }
                    .info-block h3 {
                        color: #191716;
                        border-bottom: 2px solid #E6AF2E;
                        padding-bottom: 5px;
                        margin-bottom: 10px;
                    }
                    .info-row {
                        margin: 8px 0;
                    }
                    .label {
                        font-weight: bold;
                        color: #555;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th {
                        background-color: #191716;
                        color: white;
                        padding: 12px;
                        text-align: left;
                    }
                    td {
                        padding: 12px;
                        border-bottom: 1px solid #ddd;
                    }
                    .total-section {
                        margin-top: 30px;
                        text-align: right;
                    }
                    .total-row {
                        margin: 10px 0;
                        font-size: 18px;
                    }
                    .total-amount {
                        font-size: 24px;
                        font-weight: bold;
                        color: #191716;
                        margin-top: 15px;
                        padding-top: 15px;
                        border-top: 2px solid #E6AF2E;
                    }
                    .footer {
                        margin-top: 50px;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">GatsisHub</div>
                    <div class="invoice-title">INVOICE</div>
                </div>

                <div class="info-section">
                    <div class="info-block">
                        <h3>Invoice Details</h3>
                        <div class="info-row">
                            <span class="label">Invoice Number:</span> ORD-${order.orderid.slice(0, 8).toUpperCase()}
                        </div>
                        <div class="info-row">
                            <span class="label">Date:</span> ${formatDate(order.datecreated)}
                        </div>
                        <div class="info-row">
                            <span class="label">Status:</span> ${order.orderstatus}
                        </div>
                        ${order.deadline ? `
                        <div class="info-row">
                            <span class="label">Deadline:</span> ${formatDate(order.deadline)}
                        </div>
                        ` : ''}
                    </div>

                    <div class="info-block">
                        <h3>Bill To</h3>
                        <div class="info-row">
                            <strong>${order.companyname}</strong>
                        </div>
                        <div class="info-row">
                            ${order.contactperson}
                        </div>
                        <div class="info-row">
                            ${order.contactphone}
                        </div>
                        ${order.deliveryaddress ? `
                        <div class="info-row" style="margin-top: 10px;">
                            ${typeof order.deliveryaddress === 'object' ? order.deliveryaddress.address : order.deliveryaddress}
                        </div>
                        ` : ''}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: center;">Quantity</th>
                            <th style="text-align: right;">Unit Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>${order.hangertype}</strong>
                                ${order.selectedcolor ? `<br><small>Color: ${order.selectedcolor}</small>` : ''}
                                ${order.customtext ? `<br><small>Custom Text: "${order.customtext}"</small>` : ''}
                                ${order.customlogo ? `<br><small>Custom Logo: Yes</small>` : ''}
                                ${order.materials ? `<br><small>Material: ${formatMaterialsForInvoice(order.materials)}</small>` : ''}
                            </td>
                            <td style="text-align: center;">${order.quantity}</td>
                            <td style="text-align: right;">₱${order.totalprice ? (parseFloat(order.totalprice) / order.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}</td>
                            <td style="text-align: right;">₱${order.totalprice ? parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}</td>
                        </tr>
                    </tbody>
                </table>

                ${order.orderinstructions || order.deliverynotes ? `
                <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #E6AF2E;">
                    ${order.orderinstructions ? `
                    <div style="margin-bottom: 10px;">
                        <strong>Order Instructions:</strong><br>
                        ${order.orderinstructions}
                    </div>
                    ` : ''}
                    ${order.deliverynotes ? `
                    <div>
                        <strong>Delivery Notes:</strong><br>
                        ${order.deliverynotes}
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                <div class="total-section">
                    <div class="total-row">
                        Subtotal: <strong>₱${order.totalprice ? parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}</strong>
                    </div>
                    <div class="total-amount">
                        Total Amount: ₱${order.totalprice ? parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                </div>

                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>GatsisHub - Custom Hanger Solutions</p>
                    <p>For inquiries, please contact us through our support system.</p>
                </div>

                <div class="no-print" style="text-align: center; margin-top: 30px;">
                    <button onclick="window.print()" style="background: #191716; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-right: 10px;">
                        Save as PDF
                    </button>
                    <button onclick="window.close()" style="background: #666; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                        Close
                    </button>
                </div>
                <script>
                    // Instructions for saving as PDF
                    const instructionDiv = document.createElement('div');
                    instructionDiv.className = 'no-print';
                    instructionDiv.style.cssText = 'background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: left;';
                    instructionDiv.innerHTML = '<strong>💡 To save as PDF:</strong><ol style="margin: 10px 0; padding-left: 20px;"><li>Click "Save as PDF" button above</li><li>In the print dialog, select <strong>"Save as PDF"</strong> or <strong>"Microsoft Print to PDF"</strong> as the destination</li><li>Click Save and choose where to save the file</li></ol>';
                    document.querySelector('.no-print').parentNode.insertBefore(instructionDiv, document.querySelector('.no-print'));
                </script>
            </body>
            </html>
        `;

        invoiceWindow.document.write(invoiceHTML);
        invoiceWindow.document.close();
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-12">
                    {/* Title */}
                    <div className="flex items-center justify-center gap-4 mb-6 md:mb-12">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center">My Orders</h1>
                    </div>

                    {/* Tabs skeleton */}
                    <div className="flex justify-center gap-3 md:gap-6 lg:gap-8 mb-6 md:mb-8">
                        {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} className="h-8 w-20 md:w-24 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                    </div>

                    {/* Skeleton Loaders */}
                    <div className="space-y-4 md:space-y-6" style={{ minHeight: '400px' }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <div key={n} className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ minHeight: '120px' }}>
                                <div className="px-3 md:px-6 py-4">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                        {/* Image skeleton */}
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded animate-pulse flex-shrink-0" style={{ aspectRatio: '1/1' }}></div>

                                        {/* Content skeleton */}
                                        <div className="flex-1 space-y-3 w-full">
                                            <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                        </div>

                                        {/* Status skeleton */}
                                        <div className="hidden md:block">
                                            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8 text-gray-500">
                        <LoadingSpinner size="md" text="Loading your orders..." />
                    </div>
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
                <div className="flex items-center justify-center gap-4 mb-6 md:mb-12">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center">My Orders</h1>
                    <button
                        onClick={() => {
                            console.log('Manual refresh triggered');
                            fetchOrders();
                        }}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                        title="Refresh orders"
                    >
                        <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

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
                <div className="space-y-4 md:space-y-6" style={{ minHeight: '400px' }}>
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
                                                <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-gray-300 rounded flex items-center justify-center bg-white overflow-hidden flex-shrink-0" style={{ aspectRatio: '1/1' }}>
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
                                                                            width="80"
                                                                            height="80"
                                                                            loading="lazy"
                                                                        />
                                                                    );
                                                                }
                                                            }
                                                        } catch (error) {

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
                                                        className="text-white px-3 py-1 rounded font-semibold text-xs inline-block"
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
                                                <div className="w-16 h-16 border-2 border-gray-300 rounded flex items-center justify-center bg-white overflow-hidden flex-shrink-0" style={{ aspectRatio: '1/1' }}>
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
                                                                            width="64"
                                                                            height="64"
                                                                            loading="lazy"
                                                                        />
                                                                    );
                                                                }
                                                            }
                                                        } catch (error) {

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
                                                    className="text-white px-4 py-1 rounded font-semibold text-sm inline-block"
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
                                                            {order.totalprice && (
                                                                <div className="flex justify-between border-t pt-2 mt-2">
                                                                    <span className="font-semibold text-lg">Total Price:</span>
                                                                    <span className="text-lg font-bold text-green-600">₱{parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                </div>
                                                            )}
                                                            {order.deadline && (
                                                                <div className="flex justify-between border-t pt-2 mt-2">
                                                                    <span className="font-semibold text-lg">Expected Production Deadline:</span>
                                                                    <span className="text-lg font-bold text-indigo-600">{formatDate(order.deadline)}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Contact */}
                                                        <hr />
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
                                                                className="w-full bg-[#E6AF2E] text-[#191716] hover:text-white py-2 rounded flex items-center justify-center gap-2 text-xs md:text-sm font-semibold hover:bg-[#191716] mt-3 transition-all duration-300 hover:scale-105 cursor-pointer"
                                                            >
                                                                <Eye size={16} />
                                                                View 3D Design
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Right Column - Contact & Address Information */}
                                                    <div>
                                                        <div>
                                                            {/* Order Status Timeline */}
                                                            <h3 className="text-lg md:text-xl font-bold mb-3 mt-3 md:mt-3 flex items-center gap-2">
                                                                <svg className="w-5 h-5 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Order Progress
                                                            </h3>

                                                            {/* Current Status & Deadline */}
                                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-4 mb-4">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-xs font-semibold text-blue-700 mb-1">Current Status</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                            <span className="text-base font-bold text-blue-900">
                                                                                {order.orderstatus}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-blue-700 mt-1">
                                                                            Placed: {formatDate(order.datecreated)}
                                                                        </p>
                                                                    </div>
                                                                    {order.deadline && (
                                                                        <div>
                                                                            <p className="text-xs font-semibold text-blue-700 mb-1">Expected Completion</p>
                                                                            <div className="flex items-center gap-2">
                                                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                                <span className="text-base font-bold text-blue-900">
                                                                                    {formatDate(order.deadline)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Processing Timeline */}
                                                            <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
                                                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                                    <svg className="w-4 h-4 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                    </svg>
                                                                    Processing Steps
                                                                </h4>

                                                                {/* Timeline Items */}
                                                                <div className="space-y-4">
                                                                    {[
                                                                        {
                                                                            step: 'Order Received',
                                                                            completed: true,
                                                                            description: 'Your order has been received and confirmed',
                                                                            color: 'green'
                                                                        },
                                                                        {
                                                                            step: 'For Evaluation',
                                                                            completed: order.orderstatus !== 'For Evaluation',
                                                                            description: 'Order is being evaluated by our team',
                                                                            color: order.orderstatus !== 'For Evaluation' ? 'green' : (order.orderstatus === 'For Evaluation' ? 'blue' : 'gray')
                                                                        },
                                                                        {
                                                                            step: 'Contract Signing',
                                                                            completed: order.orderstatus !== 'For Evaluation' && order.orderstatus !== 'Contract Signing',
                                                                            description: 'Sales agreement must be signed before payment',
                                                                            color: order.orderstatus !== 'For Evaluation' && order.orderstatus !== 'Contract Signing' ? 'green' : (order.orderstatus === 'Contract Signing' ? 'blue' : 'gray')
                                                                        },
                                                                        {
                                                                            step: 'Waiting for Payment',
                                                                            completed: order.orderstatus !== 'For Evaluation' && order.orderstatus !== 'Contract Signing' && order.orderstatus !== 'Waiting for Payment',
                                                                            description: 'Payment submission pending',
                                                                            color: order.orderstatus !== 'For Evaluation' && order.orderstatus !== 'Contract Signing' && order.orderstatus !== 'Waiting for Payment' ? 'green' : (order.orderstatus === 'Waiting for Payment' ? 'blue' : 'gray')
                                                                        },
                                                                        {
                                                                            step: 'Payment Verification',
                                                                            completed: order.orderstatus === 'In Production' || order.orderstatus === 'Waiting for Shipment' || order.orderstatus === 'In Transit' || order.orderstatus === 'Completed',
                                                                            description: 'Payment is being verified by our team',
                                                                            color: order.orderstatus === 'In Production' || order.orderstatus === 'Waiting for Shipment' || order.orderstatus === 'In Transit' || order.orderstatus === 'Completed' ? 'green' : (order.orderstatus === 'Verifying Payment' ? 'blue' : 'gray')
                                                                        },
                                                                        {
                                                                            step: 'In Production',
                                                                            completed: order.orderstatus === 'In Production' || order.orderstatus === 'Waiting for Shipment' || order.orderstatus === 'In Transit' || order.orderstatus === 'Completed',
                                                                            description: 'Your order is being manufactured',
                                                                            color: order.orderstatus === 'In Production' || order.orderstatus === 'Waiting for Shipment' || order.orderstatus === 'In Transit' || order.orderstatus === 'Completed' ? 'green' : 'gray'
                                                                        },
                                                                
                                                                        {
                                                                            step: 'Ready for Shipment',
                                                                            completed: order.orderstatus === 'Waiting for Shipment' || order.orderstatus === 'In Transit' || order.orderstatus === 'Completed',
                                                                            description: 'Order is ready to be shipped',
                                                                            color: order.orderstatus === 'Waiting for Shipment' || order.orderstatus === 'In Transit' || order.orderstatus === 'Completed' ? (order.orderstatus === 'Waiting for Shipment' ? 'green' : 'green') : 'gray'
                                                                        },
                                                                        {
                                                                            step: 'Out for Delivery',
                                                                            completed: order.orderstatus === 'In Transit' || order.orderstatus === 'Completed',
                                                                            description: 'The delivery has been handed over to the courier and is on its way to you',
                                                                            color: order.orderstatus === 'In Transit' || order.orderstatus === 'Completed' ? (order.orderstatus === 'In Transit' ? 'green' : 'green') : 'gray'
                                                                        },
                                                                        {
                                                                            step: 'Completed Order',
                                                                            completed: order.orderstatus === 'Completed',
                                                                            description: 'Order has been completed',
                                                                            color: order.orderstatus === 'Completed' ? 'green' : 'gray'
                                                                        },
                                                                    ].map((item, index) => (
                                                                        <div key={index} className="flex gap-3 relative">
                                                                            {/* Timeline line */}
                                                                            {index !== 8 && (
                                                                                <div className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${item.completed ? 'bg-green-300' : 'bg-gray-300'
                                                                                    }`}></div>
                                                                            )}

                                                                            {/* Icon */}
                                                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${item.color === 'green' ? 'bg-green-100 border-2 border-green-500' :
                                                                                    item.color === 'blue' ? 'bg-blue-100 border-2 border-blue-500' :
                                                                                        item.color === 'yellow' ? 'bg-yellow-100 border-2 border-yellow-500' :
                                                                                            item.color === 'purple' ? 'bg-purple-100 border-2 border-purple-500' :
                                                                                                'bg-gray-100 border-2 border-gray-400'
                                                                                }`}>
                                                                                {item.completed ? (
                                                                                    <svg className={`w-5 h-5 ${item.color === 'green' ? 'text-green-600' :
                                                                                            item.color === 'blue' ? 'text-blue-600' :
                                                                                                item.color === 'yellow' ? 'text-yellow-600' :
                                                                                                    item.color === 'purple' ? 'text-purple-600' :
                                                                                                        'text-gray-600'
                                                                                        }`} fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                ) : (
                                                                                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                                                                )}
                                                                            </div>

                                                                            {/* Content */}
                                                                            <div className="flex-1 pb-4">
                                                                                <div className="flex items-start justify-between mb-1">
                                                                                    <p className={`font-bold text-sm ${item.color === 'green' ? 'text-green-900' :
                                                                                            item.color === 'blue' ? 'text-blue-900' :
                                                                                                item.color === 'yellow' ? 'text-yellow-900' :
                                                                                                    item.color === 'purple' ? 'text-purple-900' :
                                                                                                        'text-gray-900'
                                                                                        }`}>
                                                                                        {item.step}
                                                                                    </p>
                                                                                    {item.completed && (
                                                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.color === 'green' ? 'bg-green-100 text-green-700' :
                                                                                                item.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                                                                    item.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                                                                        item.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                                                                                                            'bg-gray-100 text-gray-700'
                                                                                            }`}>
                                                                                            {order.orderstatus === item.step ? 'Current' : 'Completed'}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-xs text-gray-600">
                                                                                    {item.description}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Next Steps Info */}
                                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                                    <div className="flex items-center justify-between bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                            <span className="text-sm font-semibold text-blue-900">Next Step:</span>
                                                                        </div>
                                                                        <span className="text-sm font-bold text-blue-800">
                                                                            {order.orderstatus === 'For Evaluation' ? 'Awaiting Evaluation' :
                                                                                order.orderstatus === 'Contract Signing' ? 'Sign Contract' :
                                                                                    order.orderstatus === 'Waiting for Payment' ? 'Submit Payment' :
                                                                                        order.orderstatus === 'Verifying Payment' ? 'Production Start' :
                                                                                            order.orderstatus === 'In Production' ? 'Quality Check' :
                                                                                                order.orderstatus === 'Waiting for Shipment' ? 'Shipment' :
                                                                                                    'Processing'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Info Box */}
                                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg p-4 mt-4">
                                                                <div className="flex items-start gap-3">
                                                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-blue-900 mb-1">📦 Stay Updated</p>
                                                                        <p className="text-xs text-blue-800">
                                                                            We'll keep you informed about your order progress. You'll receive tracking details once your order ships.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Design File Button */}
                                                            {order.customdesignurl && (
                                                                <button className="w-full bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2 text-xs md:text-sm font-semibold hover:bg-red-700 mt-3 transition-all duration-300 hover:scale-105">
                                                                    <FileText size={16} />
                                                                    View Design File
                                                                </button>
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
                                                <div className="flex gap-2 md:gap-3 mt-4 md:mt-6  flex-wrap">
                                                    {/* View Invoice - Show for orders with totalprice */}
                                                    {order.totalprice && (
                                                        <button
                                                            onClick={() => handleViewInvoice(order)}
                                                            className="bg-blue-600 text-white px-3 md:px-6 py-2 rounded hover:bg-blue-700 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-xs md:text-sm font-semibold cursor-pointer"
                                                        >
                                                            <FileText size={16} className="md:w-[18px] md:h-[18px]" />
                                                            <span className="hidden sm:inline">View Invoice</span>
                                                            <span className="sm:hidden">Invoice</span>
                                                        </button>
                                                    )}

                                                    {/* Download Invoice - Only show in Processing phase (Verifying Payment, In Production, Waiting for Shipment, In Transit, Completed) */}
                                                    {['Verifying Payment', 'In Production', 'Waiting for Shipment', 'In Transit', 'Completed'].includes(order.orderstatus) && (
                                                        <button
                                                            onClick={() => handleDownloadInvoice(order)}
                                                            className="bg-green-600 text-white px-3 md:px-6 py-2 rounded hover:bg-green-700 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-xs md:text-sm font-semibold cursor-pointer"
                                                        >
                                                            <Download size={16} className="md:w-[18px] md:h-[18px]" />
                                                            <span className="hidden sm:inline">Download Invoice</span>
                                                            <span className="sm:hidden">Download</span>
                                                        </button>
                                                    )}

                                                    {/* View Proof of Payment - Show if payment exists and not rejected */}
                                                    {orderPayments[order.orderid] && orderPayments[order.orderid].paymentstatus !== 'Rejected' && (
                                                        <button
                                                            onClick={() => openProofModal(orderPayments[order.orderid].proofofpayment)}
                                                            className="bg-[#191716] text-white px-3 md:px-6 py-2 rounded transition-all duration-300 hover:scale-105 flex items-center gap-2 text-xs md:text-sm font-semibold cursor-pointer"
                                                        >
                                                            <FileText size={16} className="md:w-[18px] md:h-[18px]" />
                                                            <span className="hidden sm:inline">View Proof</span>
                                                            <span className="sm:hidden">Proof</span>
                                                        </button>
                                                    )}



                                                    {/* Payment Pending Verification Notice */}
                                                    {/* Payment Status Notices */}
                                                    {orderPayments[order.orderid] && (
                                                        <>
                                                            {/* Payment Pending Verification - Only show when order is in payment verification stage */}
                                                            {orderPayments[order.orderid].paymentstatus === 'Pending Verification' &&
                                                                (order.orderstatus === 'Waiting for Payment' || order.orderstatus === 'Verifying Payment') && (
                                                                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg px-3 py-2 flex items-center gap-2">
                                                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                        </svg>
                                                                        <span className="text-blue-600 text-xs md:text-sm font-semibold">
                                                                            Payment Submitted - Awaiting Verification
                                                                        </span>
                                                                    </div>
                                                                )}

                                                            {/* Payment Verified - Show when payment is verified */}
                                                            {orderPayments[order.orderid].paymentstatus === 'Verified' &&
                                                                (order.orderstatus === 'In Production' ||
                                                                    order.orderstatus === 'Waiting for Shipment' ||
                                                                    order.orderstatus === 'In Transit' ||
                                                                    order.orderstatus === 'Completed') && (
                                                                    <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg px-3 py-2 flex items-center gap-2">
                                                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                        <span className="text-green-600 text-xs md:text-sm font-semibold">
                                                                             Payment Verified
                                                                        </span>
                                                                    </div>
                                                                )}
                                                        </>
                                                    )}



                                                    {/* Payment Rejected Notice */}
                                                    {orderPayments[order.orderid]?.paymentstatus === 'Rejected' && (
                                                        <div className="bg-red-50 border border-red-300 rounded px-3 py-2 flex items-center gap-2">
                                                            <span className="text-red-600 text-xs md:text-sm font-semibold">
                                                                ⚠️ Payment Rejected - Please Resubmit
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Contract Amendment Required Notice */}
                                                    {order.requires_contract_amendment && (
                                                        <div className="bg-amber-50 border-l-4 border-amber-500 rounded px-3 py-2.5 flex items-start gap-2">
                                                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            <div className="flex-1">
                                                                <p className="text-amber-800 text-xs md:text-sm font-semibold">
                                                                    Order Update - Signature Required
                                                                </p>
                                                                <p className="text-amber-700 text-xs mt-1">
                                                                    {order.amendment_reason || 'Order details have been updated'}. Please review and sign the amendment.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Contract Signing - Show when Contract Signing status AND contract not signed */}
                                                    {order.orderstatus === 'Contract Signing' && !order.contract_signed && (
                                                        <button
                                                            onClick={() => openContractModal(order)}
                                                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 text-sm md:text-base font-semibold cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-w-[140px] md:min-w-[200px]"
                                                            style={{ backgroundColor: '#2563eb', color: 'white' }}
                                                        >
                                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <span>Sign Contract</span>
                                                        </button>
                                                    )}

                                                    {/* Sign Amendment - Show when amendment is required */}
                                                    {order.requires_contract_amendment && order.contract_signed && (
                                                        <button
                                                            onClick={() => openContractModal(order)}
                                                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 hover:scale-105 text-sm md:text-base font-semibold cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-w-[140px] md:min-w-[200px] animate-pulse"
                                                        >
                                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            <span>Sign Amendment</span>
                                                        </button>
                                                    )}

                                                    {/* View Contract - Show when contract is signed */}
                                                    {order.contract_signed && order.orderstatus !== 'Cancelled' && !order.requires_contract_amendment && (
                                                        <button
                                                            onClick={() => openContractModal(order)}
                                                            className="bg-gray-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105 text-sm md:text-base font-semibold cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-w-[140px] md:min-w-[200px]"
                                                            style={{ backgroundColor: '#4b5563', color: 'white' }}
                                                        >
                                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <span>View Contract</span>
                                                        </button>
                                                    )}

                                                    {/* Track Delivery - Show when In Transit with tracking link */}
                                                    {order.orderstatus === 'In Transit' && order.tracking_link && (
                                                        <a
                                                            href={order.tracking_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:scale-105 text-sm md:text-base font-semibold cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-w-[140px] md:min-w-[200px]"
                                                            style={{ backgroundColor: '#16a34a', color: 'white', textDecoration: 'none' }}
                                                        >
                                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span>Track Delivery</span>
                                                        </a>
                                                    )}

                                                    {/* Payment - Show when Waiting for Payment AND contract signed AND (no payment OR payment rejected) */}
                                                    {order.orderstatus === 'Waiting for Payment' &&
                                                        order.contract_signed &&
                                                        (!orderPayments[order.orderid] || orderPayments[order.orderid]?.paymentstatus === 'Rejected') && (
                                                            <Link
                                                                to="/payment"
                                                                state={{ orderDetails: order }}
                                                                style={{ textDecoration: 'none' }}
                                                            >
                                                                <StyledWrapper>
                                                                    <div className="container">
                                                                        <div className="left-side">
                                                                            <div className="card">
                                                                                <div className="card-line" />
                                                                                <div className="buttons" />
                                                                            </div>
                                                                            <div className="post">
                                                                                <div className="post-line" />
                                                                                <div className="screen">
                                                                                    <div className="dollar">₱</div>
                                                                                </div>
                                                                                <div className="numbers" />
                                                                                <div className="numbers-line2" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="right-side">
                                                                            <div className="new">
                                                                                {orderPayments[order.orderid]?.paymentstatus === 'Rejected' ? 'Resubmit' : 'Payment'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </StyledWrapper>
                                                            </Link>
                                                        )}

                                                    {/* Contact Support - Always visible */}
                                                    <button
                                                        onClick={() => handleContactSupport(order)}
                                                        className="bg-[#191716] text-white px-3 md:px-4 py-0.5 md:py-1 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-gray-800 flex items-center justify-center gap-2 text-sm md:text-base font-semibold cursor-pointer shadow-md hover:shadow-lg min-w-[140px] md:min-w-[160px]"
                                                    >
                                                        <MessageCircle size={18} className="md:w-5 md:h-5" />
                                                        <span className="hidden sm:inline">Contact Support</span>
                                                        <span className="sm:hidden">Support</span>
                                                    </button>

                                                    {/* Cancel Order - Only show in For Evaluation or Waiting for Payment (before Processing) */}
                                                    {(order.orderstatus === 'For Evaluation' || order.orderstatus === 'Waiting for Payment') && (
                                                        <button
                                                            onClick={() => openCancelModal(order)}
                                                            className="bg-red-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg hover:bg-red-600 transition-all duration-300 hover:scale-105 text-sm md:text-base font-semibold cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-w-[140px] md:min-w-[160px]"
                                                        >
                                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            <span className="hidden sm:inline">Cancel Order</span>
                                                            <span className="sm:hidden">Cancel</span>
                                                        </button>
                                                    )}

                                                    {/* Rate - Only show when Completed */}
                                                    {order.orderstatus === 'Completed' && (
                                                        <button
                                                            onClick={() => openRatingModal(order)}
                                                            className="bg-[#191716] text-white px-3 md:px-6 py-2 rounded  transition-all duration-300 hover:scale-105 text-xs md:text-sm font-semibold cursor-pointer"
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

                {/* Pagination Controls */}
                {!loading && filteredOrders.length > 0 && totalPages > 1 && (
                    <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow-lg p-4">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{orders.length}</span> of{' '}
                            <span className="font-semibold">{totalOrders}</span> orders
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setCurrentPage(prev => Math.max(1, prev - 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={currentPage === 1}
                                className="px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_#000000] hover:shadow-[1px_1px_0_#000000] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-[2px_2px_0_#000000] disabled:translate-x-0 disabled:translate-y-0 font-semibold transition-all"
                            >
                                ← Prev
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    // Show first page, last page, current page, and pages around current
                                    if (
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => {
                                                    setCurrentPage(pageNum);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className={`px-3 py-2 font-semibold transition-all ${currentPage === pageNum
                                                    ? 'bg-yellow-400 border-2 border-black shadow-[2px_2px_0_#000000]'
                                                    : 'bg-white border-2 border-black shadow-[2px_2px_0_#000000] hover:shadow-[1px_1px_0_#000000] hover:translate-x-[1px] hover:translate-y-[1px]'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === currentPage - 2 ||
                                        pageNum === currentPage + 2
                                    ) {
                                        return <span key={pageNum} className="px-2">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => {
                                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_#000000] hover:shadow-[1px_1px_0_#000000] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-[2px_2px_0_#000000] disabled:translate-x-0 disabled:translate-y-0 font-semibold transition-all"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Proof of Payment Modal */}
            {showProofModal && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-[#E6AF2E] px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-[#191716] text-xl md:text-2xl font-bold">Proof of Payment</h2>
                                    <p className="text-[#191716]/70 text-xs md:text-sm">Payment verification document</p>
                                </div>
                            </div>
                            <button
                                onClick={closeProofModal}
                                className="text-white cursor-pointer hover:bg-white/20 p-2 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content Container - Scrollable */}
                        <div className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
                            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-2 border-gray-200">
                                {proofImage && proofImage.toLowerCase().endsWith('.pdf') ? (
                                    <div className="flex flex-col items-center gap-6 py-8">
                                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg">
                                            <FileText size={40} className="text-indigo-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-bold text-gray-900 mb-2">PDF Payment Proof</p>
                                            <p className="text-sm text-gray-600">Click below to view the document</p>
                                        </div>
                                        <a
                                            href={proofImage}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-3 rounded-lg transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
                                        >
                                            <Eye size={20} />
                                            Open PDF Document
                                        </a>
                                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 w-full max-w-md">
                                            <p className="text-sm text-blue-800">
                                                <strong>Tip:</strong> The PDF will open in a new tab. Make sure pop-ups are enabled.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">

                                        {/* Image Display */}
                                        <div className="bg-gray-900 rounded-lg p-2 flex items-center justify-center" style={{ minHeight: '400px' }}>
                                            <img
                                                src={proofImage}
                                                alt="Proof of Payment"
                                                className="max-w-full h-auto rounded max-h-[60vh] object-contain"
                                            />
                                        </div>

                                        {/* Image Controls */}
                                        <div className="flex justify-center gap-3">
                                            <a
                                                href={proofImage}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 text-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Open in New Tab
                                            </a>
                                            <button
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = proofImage;
                                                    link.download = `payment-proof-${Date.now()}.jpg`;
                                                    link.click();
                                                }}
                                                className="bg-[#E6AF2E] hover:bg-[#d4a02a] text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 text-sm cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Save Image
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer with Action Button */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                Review the payment details carefully
                            </p>
                            <button
                                onClick={closeProofModal}
                                className="bg-gradient-to-r from-[#191716] to-[#2d2a28] hover:from-[#2d2a28] hover:to-[#191716] text-white px-8 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2 cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3D Design Viewer Modal */}
            {show3DModal && selected3DDesign && (
                <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-[#E6AF2E] px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-[#191716] text-xl md:text-2xl font-bold">3D Design Preview</h2>
                                    <p className="text-[#191716]/70 text-xs md:text-sm">Interactive view of your customized hanger</p>
                                </div>
                            </div>
                            <button
                                onClick={close3DModal}
                                className="text-[#191716] hover:bg-[#191716]/20 p-2 rounded-lg transition-colors cursor-pointer bg-white"
                                title="Close"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* 3D Viewer Container */}
                        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
                            {/* 3D Canvas */}
                            <div className="bg-gradient-to-br from-[#191716] to-[#2d2a28] rounded-xl shadow-2xl overflow-hidden border-2 border-gray-300 mb-6">
                                <div className="w-full h-[300px] md:h-[400px] lg:h-[500px]">
                                    <Suspense fallback={
                                        <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-[#191716] to-[#2d2a28]'>
                                            <div className='text-center'>
                                                <LoadingSpinner size="lg" text="Loading 3D Design..." color="white" />
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

                                {/* 3D Controls Info Bar */}
                                <div className="bg-white/10 backdrop-blur-sm px-4 py-3 border-t border-white/20">
                                    <div className="flex items-center justify-center gap-6 text-white text-xs md:text-sm">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                            </svg>
                                            <span>Drag to rotate</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                            <span>Scroll to zoom</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                            </svg>
                                            <span>Right-click to pan</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Design Details */}
                            <div className="bg-white rounded-xl shadow-md p-5 md:p-6 border-2 border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-lg font-bold text-gray-900">Design Details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Hanger Type */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                                        <p className="text-xs font-semibold text-gray-500 mb-1">Hanger Model</p>
                                        <p className="text-base font-bold text-gray-900">{selected3DDesign.hangerType}</p>
                                    </div>

                                    {/* Color */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                                        <p className="text-xs font-semibold text-gray-500 mb-1">Base Color</p>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                                                style={{ backgroundColor: selected3DDesign.color }}
                                            ></div>
                                            <span className="text-sm font-mono font-bold text-gray-900">{selected3DDesign.color}</span>
                                        </div>
                                    </div>

                                    {/* Custom Text */}
                                    {selected3DDesign.customText && (
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                            <p className="text-xs font-semibold text-blue-700 mb-1">Custom Text</p>
                                            <p className="text-base font-semibold text-blue-900">"{selected3DDesign.customText}"</p>
                                        </div>
                                    )}

                                    {/* Text Color */}
                                    {selected3DDesign.customText && (
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                            <p className="text-xs font-semibold text-blue-700 mb-1">Text Color</p>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                                                    style={{ backgroundColor: selected3DDesign.textColor }}
                                                ></div>
                                                <span className="text-sm font-mono font-bold text-blue-900">{selected3DDesign.textColor}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Logo */}
                                    {selected3DDesign.logoPreview && (
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 md:col-span-2">
                                            <p className="text-xs font-semibold text-purple-700 mb-2">Custom Logo</p>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={selected3DDesign.logoPreview}
                                                    alt="Logo"
                                                    className="w-12 h-12 object-contain bg-white rounded-lg border-2 border-purple-300 shadow-sm p-1"
                                                />
                                                <span className="text-green-700 font-semibold flex items-center gap-1">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Logo Included
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-5 h-5 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:inline">Use your mouse or touch gestures to interact with the 3D model</span>
                                <span className="sm:hidden">Interact with 3D model</span>
                            </div>
                            <button
                                onClick={close3DModal}
                                className="bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] hover:from-[#d4a02a] hover:to-[#c49723] text-white rounded-lg shadow-md hover:shadow-lg px-8 py-2.5 transition-all font-semibold w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && orderToCancel && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-[#191716] text-xl md:text-2xl font-bold">Cancel Order</h2>
                                    <p className="text-[#191716]/80 text-xs md:text-sm">This action is permanent</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 md:p-6">
                            {/* Confirmation Question */}
                            <div className="mb-5">
                                <p className="text-gray-700 mb-4 text-base md:text-lg font-medium">
                                    Are you sure you want to cancel this order?
                                </p>

                                {/* Order Info Card */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900 mb-1">
                                                Order: ORD-{orderToCancel.orderid.slice(0, 8).toUpperCase()}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {orderToCancel.hangertype} - {orderToCancel.quantity}x
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reason Input */}
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Reason for cancellation (optional):
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Help us improve by telling us why you're cancelling..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all"
                                    rows="4"
                                    maxLength={500}
                                />
                                <div className="flex justify-between mt-1">
                                    <p className="text-xs text-gray-500">Your feedback helps us improve</p>
                                    <p className="text-xs text-gray-400">{cancelReason.length}/500</p>
                                </div>
                            </div>

                            {/* Warning Box */}
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-r-lg p-4">
                                <div className="flex gap-3">
                                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-bold text-yellow-900 mb-1">⚠️ Important Warning</p>
                                        <p className="text-sm text-yellow-800">
                                            This action <strong>cannot be undone</strong>. The order will be permanently deleted from our system.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-5 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={closeCancelModal}
                                disabled={isCancelling}
                                className="px-6 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full sm:w-auto order-2 sm:order-1 cursor-pointer"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto order-1 sm:order-2 cursor-pointer"
                            >
                                {isCancelling ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Yes, Cancel Order
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {/* Rating Modal */}
            {showRatingModal && orderToRate && (
                <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
                        {/* Modal Header */}
                        <div className="bg-[#E6AF2E] px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-[#E6AF2E]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-[#191716] text-xl md:text-2xl font-bold">Rate Your Order</h2>
                                    <p className="text-[#191716]/80 text-xs md:text-sm">Help us improve our service</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 md:p-6">
                            {/* Order Info */}
                            <div className="mb-6">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-[#E6AF2E] rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900 mb-1">
                                                Order: ORD-{orderToRate.orderid.slice(0, 8).toUpperCase()}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {orderToRate.hangertype} - {orderToRate.quantity} pieces
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3 text-center">
                                    How would you rate your experience?
                                </label>
                                <div className="flex justify-center py-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                                    <StarRating
                                        rating={rating}
                                        readOnly={false}
                                        size={56}
                                        onChange={setRating}
                                    />
                                </div>
                                <div className="mt-3 text-center">
                                    <div className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${rating === 5 ? 'bg-green-100 text-green-700' :
                                        rating === 4 ? 'bg-blue-100 text-blue-700' :
                                            rating === 3 ? 'bg-yellow-100 text-yellow-700' :
                                                rating === 2 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                        }`}>
                                        {rating === 1 && '😞 Poor'}
                                        {rating === 2 && '😐 Fair'}
                                        {rating === 3 && '🙂 Good'}
                                        {rating === 4 && '😊 Very Good'}
                                        {rating === 5 && '🤩 Excellent'}
                                    </div>
                                </div>
                            </div>

                            {/* Review Message */}
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Share your experience (optional):
                                </label>
                                <textarea
                                    value={reviewMessage}
                                    onChange={(e) => setReviewMessage(e.target.value)}
                                    placeholder="Tell us what you loved or how we can improve..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6AF2E] focus:border-transparent resize-none transition-all"
                                    rows="4"
                                    maxLength={500}
                                />
                                <div className="flex justify-between mt-1">
                                    <p className="text-xs text-gray-500">Your honest feedback is appreciated</p>
                                    <p className="text-xs text-gray-400">{reviewMessage.length}/500</p>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-lg p-4">
                                <div className="flex gap-3">
                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-bold text-blue-900 mb-1">💡 Why your feedback matters</p>
                                        <p className="text-xs text-blue-800">
                                            Your review helps us improve our service and assists other customers in making informed decisions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-5 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={closeRatingModal}
                                disabled={isSubmittingReview}
                                className="px-6 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full sm:w-auto order-2 sm:order-1 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview}
                                className="px-6 py-2.5 bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] hover:from-[#d4a02a] hover:to-[#c49723] text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto order-1 sm:order-2 cursor-pointer"
                            >
                                {isSubmittingReview ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Submit Review
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {showNotificationModal && (
                <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
                    <div className={`rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn ${notificationType === 'success' ? 'bg-white' : 'bg-white'
                        }`}>
                        {/* Modal Header */}
                        <div className={`px-6 py-5 ${notificationType === 'success'
                            ? 'bg-gradient-to-r from-[#4ade80] to-[#22c55e]'
                            : 'bg-gradient-to-r from-[#ff6b6b] to-[#ef4444]'
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    {notificationType === 'success' ? (
                                        <svg className="w-6 h-6 text-[#4ade80]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-[#ff6b6b]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <h2 className="text-[#191716] text-xl md:text-2xl font-bold">
                                    {notificationType === 'success' ? 'Success!' : 'Error'}
                                </h2>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8">
                            <div className={`p-4 rounded-lg border-l-4 ${notificationType === 'success'
                                ? 'bg-green-50 border-green-400'
                                : 'bg-red-50 border-red-400'
                                }`}>
                                <p className={`text-base md:text-lg leading-relaxed ${notificationType === 'success'
                                    ? 'text-green-800'
                                    : 'text-red-800'
                                    }`}>
                                    {notificationMessage}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={closeNotificationModal}
                                className={`cursor-pointer px-6 md:px-8 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm md:text-base ${notificationType === 'success'
                                    ? 'bg-gradient-to-r from-[#4ade80] to-[#22c55e] hover:from-[#22c55e] hover:to-[#16a34a] text-[#191716]'
                                    : 'bg-gradient-to-r from-[#ff6b6b] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-[#191716]'
                                    }`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice/Receipt Modal */}
            {showInvoiceModal && invoiceOrderData && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
                    {/* modal */}
                    <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-3xl max-h-[90vh] md:max-h-[80vh] overflow-y-auto w-full relative z-[10000] animate-scaleIn">
                        {/* Header */}
                        <div className="bg-[#E6AF2E] px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {invoiceOrderData.hasPayment ? 'Receipt' : 'Invoice'}
                                    </h2>
                                    <p className="text-white/90 text-sm">
                                        {invoiceOrderData.hasPayment ? 'Payment Confirmed' : 'Awaiting Payment'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowInvoiceModal(false)}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Order Number</p>
                                    <p className="font-bold text-lg">{invoiceOrderData.orderNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Date</p>
                                    <p className="font-semibold">{new Date(invoiceOrderData.datecreated).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                                    <p className="font-semibold">{invoiceOrderData.companyName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Contact</p>
                                    <p className="font-semibold">{invoiceOrderData.contactPerson}</p>
                                    <p className="text-sm text-gray-600">{invoiceOrderData.contactPhone}</p>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="mb-6 pb-6 border-b">
                                <h3 className="font-bold text-lg mb-4">Product Details</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Product:</span>
                                        <span className="font-semibold">{invoiceOrderData.selectedHanger}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Quantity:</span>
                                        <span className="font-semibold">{invoiceOrderData.quantity} units</span>
                                    </div>
                                    {invoiceOrderData.color && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Color:</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded border" style={{ backgroundColor: invoiceOrderData.color }}></div>
                                                <span className="font-mono text-xs">{invoiceOrderData.color}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-600">Materials:</span>
                                        <div className="text-right">
                                            {Object.entries(invoiceOrderData.selectedMaterials).map(([name, percentage]) => (
                                                <div key={name} className="font-semibold">{Math.round(percentage)}% {name}</div>
                                            ))}
                                        </div>
                                    </div>
                                    {invoiceOrderData.customtext && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Custom Text:</span>
                                            <span className="font-semibold italic">"{invoiceOrderData.customtext}"</span>
                                        </div>
                                    )}
                                    {invoiceOrderData.customlogo && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Custom Logo:</span>
                                            <span className="font-semibold">✓ Included</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            {invoiceOrderData.breakdown && (
                                <div className="mb-6">
                                    <h3 className="font-bold text-lg mb-4">Price Breakdown</h3>
                                    
                                    {/* Weight Info */}
                                    <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Product Weight:</span>
                                            <span className="font-medium">{invoiceOrderData.breakdown.productWeight}g per unit</span>
                                        </div>
                                        <div className="flex justify-between font-semibold border-t border-blue-200 pt-1">
                                            <span>Total Weight:</span>
                                            <span className="text-blue-700">{invoiceOrderData.breakdown.totalWeight.toFixed(3)} kg</span>
                                        </div>
                                    </div>

                                    {/* Material Costs */}
                                    <div className="space-y-3 mb-4">
                                        <h4 className="font-semibold text-sm">Material Costs:</h4>
                                        {invoiceOrderData.breakdown.materials.map((mat, idx) => (
                                            <div key={idx} className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                                                <div className="font-semibold text-gray-800 mb-1">{mat.name} ({mat.percentage}%)</div>
                                                <div className="flex justify-between text-gray-600">
                                                    <span>Price per kg:</span>
                                                    <span>₱{mat.pricePerKg.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-600">
                                                    <span>Material used:</span>
                                                    <span>{mat.weight.toFixed(3)} kg</span>
                                                </div>
                                                <div className="flex justify-between font-semibold border-t border-gray-300 pt-1">
                                                    <span>Subtotal:</span>
                                                    <span className="text-green-600">₱{mat.cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total Summary */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">Total Material Cost:</span>
                                            <span className="font-semibold">₱{invoiceOrderData.breakdown.totalMaterialCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">Delivery Fee:</span>
                                            <span className="font-semibold">₱{invoiceOrderData.breakdown.deliveryCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-xl pt-2 border-t-2 border-green-400">
                                            <span className="text-gray-900">Total Amount:</span>
                                            <span className="text-green-600">₱{invoiceOrderData.breakdown.totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Status */}
                            {invoiceOrderData.hasPayment ? (
                                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-900">Payment Received</p>
                                            <p className="text-sm text-green-700">Thank you for your payment!</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-yellow-900">Payment Pending</p>
                                            <p className="text-sm text-yellow-700">Please proceed to payment after order validation</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleDownloadInvoiceFromOrder}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Download size={20} />
                                Download {invoiceOrderData.hasPayment ? 'Receipt' : 'Invoice'}
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print {invoiceOrderData.hasPayment ? 'Receipt' : 'Invoice'}
                            </button>
                            <button
                                onClick={() => setShowInvoiceModal(false)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contract Modal */}
            {showContractModal && orderToSign && (
                <ContractModal
                    order={orderToSign}
                    onClose={closeContractModal}
                    onContractSigned={handleContractSigned}
                />
            )}

            {/* Add animation styles */}
            <style jsx>{`
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scaleIn {
                    animation: scaleIn 0.2s ease-out;
                }
            `}</style>
        </div>
    )
}

const StyledWrapper = styled.div`
  .container {
    display: flex;
    width: 270px;
    height: 120px;
    position: relative;
    border-radius: 6px;
    transition: 0.3s ease-in-out;
  }

  .container:hover {
    transform: scale(1.03);
  }

  .container:hover .left-side {
    width: 100%;
  }

  .left-side {
    background-color: #5de2a3;
    width: 130px;
    height: 120px;
    border-radius: 4px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: 0.3s;
    flex-shrink: 0;
    overflow: hidden;
  }

  .right-side {
    display: flex;
    align-items: center;
    overflow: hidden;
    cursor: pointer;
    justify-content: space-between;
    white-space: nowrap;
    transition: 0.3s;
  }

  .right-side:hover {
    background-color: #f9f7f9;
  }

  .new {
    font-size: 23px;
    font-family: "Lexend Deca", sans-serif;
    margin-left: 20px;
  }

  .card {
    width: 70px;
    height: 46px;
    background-color: #c7ffbc;
    border-radius: 6px;
    position: absolute;
    display: flex;
    z-index: 10;
    flex-direction: column;
    align-items: center;
    -webkit-box-shadow: 9px 9px 9px -2px rgba(77, 200, 143, 0.72);
    -moz-box-shadow: 9px 9px 9px -2px rgba(77, 200, 143, 0.72);
    box-shadow: 9px 9px 9px -2px rgba(77, 200, 143, 0.72);
  }

  .card-line {
    width: 65px;
    height: 13px;
    background-color: #80ea69;
    border-radius: 2px;
    margin-top: 7px;
  }

  @media only screen and (max-width: 480px) {
    .container {
      transform: scale(0.7);
    }

    .container:hover {
      transform: scale(0.74);
    }

    .new {
      font-size: 18px;
    }
  }

  .buttons {
    width: 8px;
    height: 8px;
    background-color: #379e1f;
    box-shadow: 0 -10px 0 0 #26850e, 0 10px 0 0 #56be3e;
    border-radius: 50%;
    margin-top: 5px;
    transform: rotate(90deg);
    margin: 10px 0 0 -30px;
  }

  .container:hover .card {
    animation: slide-top 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) both;
  }

  .container:hover .post {
    animation: slide-post 1s cubic-bezier(0.165, 0.84, 0.44, 1) both;
  }

  @keyframes slide-top {
    0% {
      -webkit-transform: translateY(0);
      transform: translateY(0);
    }

    50% {
      -webkit-transform: translateY(-70px) rotate(90deg);
      transform: translateY(-70px) rotate(90deg);
    }

    60% {
      -webkit-transform: translateY(-70px) rotate(90deg);
      transform: translateY(-70px) rotate(90deg);
    }

    100% {
      -webkit-transform: translateY(-8px) rotate(90deg);
      transform: translateY(-8px) rotate(90deg);
    }
  }

  .post {
    width: 63px;
    height: 75px;
    background-color: #dddde0;
    position: absolute;
    z-index: 11;
    bottom: 10px;
    top: 120px;
    border-radius: 6px;
    overflow: hidden;
  }

  .post-line {
    width: 47px;
    height: 9px;
    background-color: #545354;
    position: absolute;
    border-radius: 0px 0px 3px 3px;
    right: 8px;
    top: 8px;
  }

  .post-line:before {
    content: "";
    position: absolute;
    width: 47px;
    height: 9px;
    background-color: #757375;
    top: -8px;
  }

  .screen {
    width: 47px;
    height: 23px;
    background-color: #ffffff;
    position: absolute;
    top: 22px;
    right: 8px;
    border-radius: 3px;
  }

  .numbers {
    width: 12px;
    height: 12px;
    background-color: #838183;
    box-shadow: 0 -18px 0 0 #838183, 0 18px 0 0 #838183;
    border-radius: 2px;
    position: absolute;
    transform: rotate(90deg);
    left: 25px;
    top: 52px;
  }

  .numbers-line2 {
    width: 12px;
    height: 12px;
    background-color: #aaa9ab;
    box-shadow: 0 -18px 0 0 #aaa9ab, 0 18px 0 0 #aaa9ab;
    border-radius: 2px;
    position: absolute;
    transform: rotate(90deg);
    left: 25px;
    top: 68px;
  }

  @keyframes slide-post {
    50% {
      -webkit-transform: translateY(0);
      transform: translateY(0);
    }

    100% {
      -webkit-transform: translateY(-70px);
      transform: translateY(-70px);
    }
  }

  .dollar {
    position: absolute;
    font-size: 16px;
    font-family: "Lexend Deca", sans-serif;
    width: 100%;
    left: 0;
    top: 0;
    color: #4b953b;
    text-align: center;
  }

  .container:hover .dollar {
    animation: fade-in-fwd 0.3s 1s backwards;
  }

  @keyframes fade-in-fwd {
    0% {
      opacity: 0;
      transform: translateY(-5px);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default Order