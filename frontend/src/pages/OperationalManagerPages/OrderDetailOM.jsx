import React, { useState, useEffect, Suspense, useCallback } from "react";
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
    Edit2,
    ClipboardClock
} from "lucide-react";
import logo from '../../images/logo.png'
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import HangerScene from '../../components/Checkout/HangerScene';
import LoadingSpinner from "../../components/LoadingSpinner";
import { useRealtimeSingleOrder } from '../../hooks/useRealtimeSingleOrder';

const OrderDetailOM = () => {
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
    
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [showProofModal, setShowProofModal] = useState(false);
    const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('Unable to verify payment details. Please resubmit with clearer information.');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isApprovingOrder, setIsApprovingOrder] = useState(false);
    const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

    // Tracking link states
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [trackingLink, setTrackingLink] = useState('');
    const [pendingStatus, setPendingStatus] = useState(null);


    const handleDownloadInvoice = () => {
        if (!order) {
            showNotificationMessage('Order data not available', 'error');
            return;
        }

        // Calculate price breakdown before template literal
        // Priority: price_breakdown (sales admin manual) > estimated_breakdown (from checkout) > totalprice only
        let breakdown = null;
        let breakdownLabel = isPaid ? 'Price Breakdown' : 'Estimated Price Breakdown';
        
        if (order.price_breakdown) {
            breakdown = typeof order.price_breakdown === 'string' 
                ? JSON.parse(order.price_breakdown) 
                : order.price_breakdown;
            breakdownLabel = 'Final Price Breakdown';
        } else if (order.estimated_breakdown) {
            breakdown = typeof order.estimated_breakdown === 'string'
                ? JSON.parse(order.estimated_breakdown)
                : order.estimated_breakdown;
            if (!isPaid) {
                breakdownLabel = 'Estimated Price Breakdown';
            }
        }
        
        let breakdownHTML = '';
        if (breakdown) {
            // Handle different possible property names from estimated_breakdown vs price_breakdown
            const materialCost = parseFloat(breakdown.materialCost || breakdown.totalMaterialCost) || 0;
            const deliveryFee = parseFloat(breakdown.deliveryFee || breakdown.deliveryCost) || 0;
            const vatRate = parseFloat(breakdown.vatRate) || 12;
            const subtotal = materialCost + deliveryFee;
            const vat = subtotal * (vatRate / 100);
            const total = subtotal + vat;
            
            // Determine delivery type label
            let deliveryTypeLabel = 'Delivery';
            if (breakdown.deliveryType === 'local' || breakdown.isLocal === true) {
                deliveryTypeLabel = 'Local';
            } else if (breakdown.deliveryType === 'international' || breakdown.isLocal === false) {
                deliveryTypeLabel = 'International';
            }
            
            breakdownHTML = `
                <h3 style="color: #191716; margin: 20px 0 15px 0;">${breakdownLabel}</h3>
                <div class="total-row">
                    Material Cost: <strong>₱${materialCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div class="total-row">
                    Delivery Fee (${deliveryTypeLabel}): <strong>₱${deliveryFee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div class="total-row" style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
                    Subtotal: <strong>₱${subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div class="total-row">
                    VAT (${vatRate}%): <strong>₱${vat.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div class="total-amount">
                    Total Amount: ₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
                ${breakdown.notes ? `<div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-left: 3px solid #E6AF2E;"><strong>Notes:</strong><br><span style="color: #666;">${breakdown.notes}</span></div>` : ''}
            `;
        } else {
            console.log('No breakdown available, using totalprice only');
            breakdownHTML = `
                <div class="total-row">
                    Subtotal: <strong>₱${order.totalprice ? parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}</strong>
                </div>
                <div class="total-amount">
                    Total Amount: ₱${order.totalprice ? parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
            `;
        }

        // Create a simple HTML invoice for printing/saving as PDF
        const invoiceWindow = window.open('', '_blank');

        // Check if payment is verified
        const isPaid = order.orderstatus === 'Paid' || order.orderstatus === 'In Production' || order.orderstatus === 'Waiting for Shipment' || order.orderstatus === 'In Transit' || order.orderstatus === 'Completed';
        const docType = isPaid ? 'Official Receipt' : 'Invoice';
        const docNumber = isPaid ? 'Receipt Number' : 'Invoice Number';

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
                <title>${docType} - ORD-${order.orderid.slice(0, 8).toUpperCase()}</title>
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
                        position: relative;
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
                    .paid-stamp {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: #10b981;
                        color: white;
                        padding: 8px 16px;
                        border-radius: 5px;
                        font-weight: bold;
                        font-size: 14px;
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
                    <div class="invoice-title">${docType.toUpperCase()}</div>
                    ${isPaid ? '<div class="paid-stamp">✓ PAID</div>' : ''}
                </div>

                <div class="info-section">
                    <div class="info-block">
                        <h3>${docType} Details</h3>
                        <div class="info-row">
                            <span class="label">${docNumber}:</span> ORD-${order.orderid.slice(0, 8).toUpperCase()}
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
                    ${breakdownHTML}
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

    // Real-time payment update handler
    const handlePaymentUpdate = useCallback(async (payload) => {
        console.log('Payment realtime update:', payload);

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Payment added or updated - refresh payment info
            try {
                const response = await fetch(`https://gatsis-hub.vercel.app/payments/order/${orderid}`);
                if (response.ok) {
                    const payment = await response.json();
                    setPaymentInfo(payment);
                }
            } catch (error) {
                console.error('Error fetching updated payment:', error);
            }

            // Also refresh payment history
            try {
                const historyResponse = await fetch(`https://gatsis-hub.vercel.app/payments/history/${orderid}`);
                if (historyResponse.ok) {
                    const data = await historyResponse.json();
                    setPaymentHistory(data.history || []);
                }
            } catch (error) {
                console.error('Error fetching payment history:', error);
            }
        } else if (payload.eventType === 'DELETE') {
            // Payment deleted (rejected) - clear payment info
            setPaymentInfo(null);

            // Refresh payment history to show the rejection
            try {
                const historyResponse = await fetch(`https://gatsis-hub.vercel.app/payments/history/${orderid}`);
                if (historyResponse.ok) {
                    const data = await historyResponse.json();
                    setPaymentHistory(data.history || []);
                }
            } catch (error) {
                console.error('Error fetching payment history:', error);
            }
        }
    }, [orderid]);

    const handleApprovePayment = async () => {
        if (!paymentInfo || !paymentInfo.paymentid) {
            showNotificationMessage('No payment to approve', 'error');
            return;
        }

        setIsProcessingPayment(true);
        try {
            const employee = JSON.parse(localStorage.getItem('employee'));

            // Approve payment
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

            // Payment verification already updates order status to 'In Production' in backend
            // No need to manually update order status here anymore

            showNotificationMessage('Payment approved and order moved to production', 'success');
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

            showNotificationMessage('Failed to approve payment', 'error');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleRejectPayment = async () => {
        if (!paymentInfo || !paymentInfo.paymentid) {
            showNotificationMessage('No payment to reject', 'error');
            return;
        }

        setShowRejectModal(true);
    };

    const confirmRejectPayment = async () => {
        if (!rejectionReason.trim()) {
            showNotificationMessage('Please provide a reason for rejection', 'error');
            return;
        }

        setIsProcessingPayment(true);
        try {
            const employee = JSON.parse(localStorage.getItem('employee'));

            const response = await fetch(`https://gatsis-hub.vercel.app/payments/${paymentInfo.paymentid}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verifiedby: employee?.employeeid,
                    notes: rejectionReason
                })
            });

            if (!response.ok) {
                throw new Error('Failed to reject payment');
            }

            showNotificationMessage('Payment rejected and archived. Customer has been notified via email.', 'success');
            setShowProofModal(false);
            setShowRejectModal(false);
            setPaymentInfo(null);
            setRejectionReason('Unable to verify payment details. Please resubmit with clearer information.');

            // Refresh order data
            const orderResponse = await fetch(`https://gatsis-hub.vercel.app/orders/${orderid}`);
            if (orderResponse.ok) {
                const data = await orderResponse.json();
                setOrder(data.order);
                setOrderStatus(data.order.orderstatus);
            }
        } catch (err) {

            showNotificationMessage('Failed to reject payment', 'error');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Real-time order update handler
    const handleOrderUpdate = useCallback((payload) => {
        if (payload.eventType === 'UPDATE' && payload.new) {
            setOrder(payload.new);
            setOrderStatus(payload.new.orderstatus);
            setValidatedPrice(payload.new.totalprice || '');
            setDeadline(payload.new.deadline || '');
        }
    }, []);

    // Subscribe to real-time order updates
    useRealtimeSingleOrder(orderid, handleOrderUpdate);

    // Fetch payment info for this order
    useEffect(() => {
        const fetchPaymentInfo = async () => {
            if (!orderid) return;

            try {
                const response = await fetch(`https://gatsis-hub.vercel.app/payments/order/${orderid}`);
                if (response.ok) {
                    const payment = await response.json();
                    setPaymentInfo(payment);

                }
            } catch (error) {

            }
        };

        fetchPaymentInfo();
    }, [orderid]);

    // Fetch payment history for this order
    useEffect(() => {
        const fetchPaymentHistory = async () => {
            if (!orderid) return;

            try {
                const response = await fetch(`https://gatsis-hub.vercel.app/payments/history/${orderid}`);
                if (response.ok) {
                    const data = await response.json();
                    setPaymentHistory(data.history || []);
                }
            } catch (error) {
                console.error('Error fetching payment history:', error);
            }
        };

        fetchPaymentHistory();
    }, [orderid, showProofModal]); // Refetch when modal closes

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

                setOrder(data.order);
                setOrderStatus(data.order.orderstatus);
                setValidatedPrice(data.order.totalprice || '');
                setDeadline(data.order.deadline || '');
                setError(null);
            } catch (err) {

                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
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
        
        // If changing to "In Transit", prompt for tracking link
        if (newStatus === 'In Transit') {
            setPendingStatus(newStatus);
            setTrackingLink(order.tracking_link || ''); // Pre-fill if exists
            setShowTrackingModal(true);
            return;
        }
        
        // For other statuses, update directly
        await updateOrderStatus(newStatus, null);
    };

    const handleTrackingSubmit = async () => {
        if (!trackingLink.trim()) {
            showNotificationMessage('Please enter a tracking link', 'error');
            return;
        }
        
        await updateOrderStatus(pendingStatus, trackingLink);
        setShowTrackingModal(false);
        setPendingStatus(null);
    };

    const updateOrderStatus = async (newStatus, trackingUrl) => {
        setOrderStatus(newStatus);
        
        try {
            setIsSavingStatus(true);

            // Get employee info from localStorage
            const employee = JSON.parse(localStorage.getItem('employee'));

            const requestBody = {
                status: newStatus,
                employeeid: employee?.employeeid,
                employeename: employee?.employeename
            };

            // Add tracking link if provided
            if (trackingUrl) {
                requestBody.tracking_link = trackingUrl;
            }

            const response = await fetch(`https://gatsis-hub.vercel.app/orders/${orderid}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update order status');
            }

            showNotificationMessage('Order status updated successfully', 'success');
        } catch (err) {

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

            setOrder(data.order);
            setIsEditingDeadline(false);
            showNotificationMessage('Deadline updated successfully', 'success');
        } catch (err) {

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

        }
    };

    const close3DModal = () => {
        setShow3DModal(false);
        setSelected3DDesign(null);
    };

    const handleApproveOrder = async () => {
        setIsApprovingOrder(true);
        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/orders/${orderid}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'In Production' })
            });

            if (!response.ok) {
                throw new Error('Failed to approve order');
            }

            setOrderStatus('In Production');
            showNotificationMessage('Order approved and moved to production', 'success');
        } catch (err) {

            showNotificationMessage('Failed to approve order', 'error');
        } finally {
            setIsApprovingOrder(false);
        }
    };

    const handlePaymentConfirm = async () => {
        setIsConfirmingPayment(true);
        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/orders/${orderid}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'In Production' })
            });

            if (!response.ok) {
                throw new Error('Failed to confirm payment');
            }

            setOrderStatus('In Production');
            showNotificationMessage('Payment confirmed and order moved to production', 'success');
        } catch (err) {

            showNotificationMessage('Failed to confirm payment', 'error');
        } finally {
            setIsConfirmingPayment(false);
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

            showNotificationMessage('Failed to contact customer. Please try again.', 'error');
        }
    };

    const handleExportXLS = () => {

        showNotificationMessage('XLS export feature coming soon', 'success');
    };

    const handleExportPDF = () => {

        showNotificationMessage('PDF export feature coming soon', 'success');
    };

    const handleViewProof = () => {
        if (!paymentInfo || !paymentInfo.proofofpayment) {
            showNotificationMessage('No payment proof available for this order', 'error');
            return;
        }

        setShowProofModal(true);

        // showNotificationMessage('Proof of payment viewer coming soon', 'success');
    };

    if (loading) {
        return (
            <div className="flex w-full bg-gray-50">
                <main className="flex-1 p-6">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <LoadingSpinner size="lg" text="Loading order..." />  
                        </div>
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
                                onClick={() => navigate('/orderpageOM')}
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

    // Define status order and filter logic for OM
    const allStatuses = [
        'For Evaluation',
        'Contract Signing',
        'Waiting for Payment',
        'Verifying Payment',
        'In Production',
        'Waiting for Shipment',
        'In Transit',
        'Completed',
        'Cancelled'
    ];

    // OM can only access statuses from "In Production" onwards
    const getAvailableStatuses = () => {
        const currentStatusIndex = allStatuses.indexOf(order?.orderstatus);
        const inProductionIndex = allStatuses.indexOf('In Production');
        
        // If current status is "In Production" or later, only show from "In Production" onwards
        if (currentStatusIndex >= inProductionIndex) {
            return allStatuses.slice(inProductionIndex);
        }
        // If current status is before "In Production", show all statuses
        return allStatuses;
    };

    const availableStatuses = order ? getAvailableStatuses() : allStatuses;

    return (
        <div className="flex w-full bg-gray-50">
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Page Title */}
                <h1 className="text-4xl font-bold text-gray-800 mb-6">Orders</h1>

                {/* Order Details Card */}
                <div className="bg-white shadow-lg rounded-lg border border-gray-200">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b bg-[#191716] text-white rounded-t-lg">
                        <h2 className="font-semibold text-lg">Order Details</h2>
                        <div className="relative">
                            <select
                                value={orderStatus}
                                onChange={handleStatusChange}
                                disabled={isSavingStatus}
                                className="px-4 py-2 pr-10 rounded bg-white text-gray-800 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none disabled:opacity-50"
                            >
                                {availableStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
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

                        {/* Contract Status Display (View Only for OM) */}
                        {(order.orderstatus === 'Contract Signing' || order.orderstatus === 'Waiting for Payment' || order.contract_signed || order.sales_admin_signed) && (
                            <div className={`border rounded-lg p-4 ${order.contract_signed && order.sales_admin_signed ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50'}`}>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Contract Status
                                </h3>
                                
                                {/* Sales Admin Signature Status */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        {order.sales_admin_signed ? (
                                            <>
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold text-green-700">Sales Admin Signed</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold text-amber-700">Sales Admin Signature Required</span>
                                            </>
                                        )}
                                    </div>
                                    {order.sales_admin_signed && (
                                        <div className="text-sm text-gray-700 ml-10">
                                            <span className="font-medium">Signed on: </span>
                                            {new Date(order.sales_admin_signed_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Customer Signature Status */}
                                <div className="pt-3 border-t border-gray-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        {order.contract_signed ? (
                                            <>
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold text-green-700">Customer Signed</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold text-gray-700">Awaiting Customer Signature</span>
                                            </>
                                        )}
                                    </div>
                                    {order.contract_signed && (
                                        <>
                                            <div className="text-sm text-gray-700 ml-10 mb-2">
                                                <span className="font-medium">Signed on: </span>
                                                {new Date(order.contract_signed_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    // Open contract in new window
                                                    const contractData = order.contract_data;
                                                    if (contractData) {
                                                        const newWindow = window.open('', '_blank');
                                                        if (newWindow) {
                                                            newWindow.document.write(contractData.contractHTML || '<p>Contract data not available</p>');
                                                            newWindow.document.close();
                                                        }
                                                    }
                                                }}
                                                className="mt-2 ml-10 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 cursor-pointer transition-colors font-medium"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View Signed Contract
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

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
                                        className="bg-[#ECBA0B] text-[#191716] px-4 py-2 rounded hover:bg-[#191716] hover:text-white cursor-pointer flex items-center gap-2"
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
                                onClick={handleViewProof}
                                disabled={!paymentInfo}
                                className={`cursor-pointer px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm ${paymentInfo
                                        ? 'bg-[#191817] hover:bg-[#333333] text-white'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Eye size={18} />
                                View Proof {paymentInfo ? '' : '(Not Available)'}
                            </button>
                            {/* <button
                                onClick={handleExportXLS}
                                className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <FileSpreadsheet size={18} />
                                Export XLS
                            </button> */}
                            <button
                                onClick={handleDownloadInvoice}
                                className="bg-[#191817] text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm cursor-pointer"
                            >
                                <FileText size={18} />
                                {['Paid', 'In Production', 'Waiting for Shipment', 'In Transit', 'Completed'].includes(order?.orderstatus) ? 'Download Receipt' : 'Download Invoice'}
                            </button>
                            
                            <button
                                onClick={() => navigate(`/logpageOM/${orderid}`)}
                                className="bg-[#191817] text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm cursor-pointer"
                            >
                                <ClipboardClock size={18} />
                                View Activity Log
                            </button>
                            <button
                                onClick={() => navigate('/orderpageOM')}
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
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] px-6 py-4 flex items-center justify-between flex-shrink-0">
                            <div>
                                <h2 className="text-white text-xl md:text-2xl font-bold flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Payment Information
                                </h2>
                                <p className="text-white/90 text-sm mt-1 flex items-center gap-2">
                                    <span className="font-semibold">Method: {paymentInfo.paymentmethod}</span>
                                    <span className="mx-1">•</span>
                                    <span className="flex items-center gap-1">
                                        Status:
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${paymentInfo.paymentstatus === 'Verified' ? 'bg-green-500 text-white' :
                                                paymentInfo.paymentstatus === 'Rejected' ? 'bg-red-500 text-white' :
                                                    paymentInfo.paymentstatus === 'Pending Verification' ? 'bg-yellow-400 text-gray-900' :
                                                        'bg-gray-400 text-white'
                                            }`}>
                                            {paymentInfo.paymentstatus}
                                        </span>
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowProofModal(false);
                                    setActiveTab('current');
                                }}
                                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="bg-gray-100 border-b border-gray-200 flex-shrink-0">
                            <div className="flex px-6">
                                <button
                                    onClick={() => setActiveTab('current')}
                                    className={`px-6 py-3 font-semibold text-sm transition-all relative ${activeTab === 'current'
                                            ? 'text-[#E6AF2E] bg-white'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                >
                                    Current Payment
                                    {activeTab === 'current' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E6AF2E]"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`px-6 py-3 font-semibold text-sm transition-all relative ${activeTab === 'history'
                                            ? 'text-[#E6AF2E] bg-white'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                >
                                    Transaction History ({paymentHistory.length})
                                    {activeTab === 'history' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E6AF2E]"></div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Tab Content - Scrollable */}
                        <div className="bg-gray-50 p-6 overflow-auto flex-1">
                            {activeTab === 'current' ? (
                                // Current Payment Tab
                                <>
                                    {/* Payment Proof Display */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                                        {paymentInfo.proofofpayment && paymentInfo.proofofpayment.toLowerCase().endsWith('.pdf') ? (
                                            <div className="flex flex-col items-center gap-4 py-12">
                                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                                                    <FileText size={40} className="text-indigo-600" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-gray-900 font-bold text-xl mb-2">PDF Payment Proof</p>
                                                    <p className="text-gray-600 text-sm">Click below to view the document</p>
                                                </div>
                                                <a
                                                    href={paymentInfo.proofofpayment}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-3 rounded-lg transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
                                                >
                                                    <Eye size={20} />
                                                    Open PDF Document
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="p-4">
                                                <img
                                                    src={paymentInfo.proofofpayment}
                                                    alt="Proof of Payment"
                                                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Current Payment Details */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                            <svg className="w-5 h-5 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Payment Details
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-gray-600 font-medium">Submitted:</span>
                                                <span className="font-semibold text-gray-900">{formatDate(paymentInfo.datesubmitted)}</span>
                                            </div>
                                            {paymentInfo.amountpaid && (
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <span className="text-gray-600 font-medium">Amount:</span>
                                                    <span className="font-semibold text-gray-900">₱{parseFloat(paymentInfo.amountpaid).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                            {paymentInfo.transactionreference && (
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <span className="text-gray-600 font-medium">Reference:</span>
                                                    <span className="font-mono text-sm font-semibold text-gray-900">{paymentInfo.transactionreference}</span>
                                                </div>
                                            )}
                                            {paymentInfo.notes && (
                                                <div className="pt-3 border-t border-gray-200">
                                                    <span className="text-gray-600 font-medium block mb-2">Notes:</span>
                                                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg text-sm">{paymentInfo.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Transaction History Tab
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg className="w-6 h-6 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h3 className="font-bold text-gray-900 text-xl">Payment Transaction History</h3>
                                    </div>

                                    {paymentHistory.length === 0 ? (
                                        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                                            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                                            <p className="text-gray-600 font-medium">No transaction history available</p>
                                            <p className="text-gray-400 text-sm mt-1">Past payment actions will appear here</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {paymentHistory.map((transaction, index) => (
                                                <div
                                                    key={transaction.historyid || index}
                                                    className={`bg-white rounded-xl shadow-sm border-2 p-5 transition-all hover:shadow-md ${transaction.action === 'approved' ? 'border-green-200' :
                                                            transaction.action === 'rejected' ? 'border-red-200' :
                                                                'border-gray-200'
                                                        }`}
                                                >
                                                    {/* Transaction Header */}
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${transaction.action === 'approved' ? 'bg-green-100 text-green-700' :
                                                                        transaction.action === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {transaction.action}
                                                                </span>
                                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${transaction.paymentstatus === 'Verified' ? 'bg-green-500 text-white' :
                                                                        transaction.paymentstatus === 'Rejected' ? 'bg-red-500 text-white' :
                                                                            'bg-yellow-400 text-gray-900'
                                                                    }`}>
                                                                    {transaction.paymentstatus}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                {formatDate(transaction.datesubmitted)}
                                                            </p>
                                                        </div>
                                                        {transaction.proofofpayment && (
                                                            <a
                                                                href={transaction.proofofpayment}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1 transition-colors"
                                                            >
                                                                <Eye size={16} />
                                                                View Proof
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Transaction Details */}
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-gray-500 text-xs uppercase tracking-wide">Method</span>
                                                                <p className="font-semibold text-gray-900">{transaction.paymentmethod}</p>
                                                            </div>
                                                            {transaction.amountpaid && (
                                                                <div>
                                                                    <span className="text-gray-500 text-xs uppercase tracking-wide">Amount</span>
                                                                    <p className="font-semibold text-gray-900">₱{parseFloat(transaction.amountpaid).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {transaction.transactionreference && (
                                                            <div>
                                                                <span className="text-gray-500 text-xs uppercase tracking-wide">Reference</span>
                                                                <p className="font-mono text-sm font-semibold text-gray-900">{transaction.transactionreference}</p>
                                                            </div>
                                                        )}
                                                        {transaction.notes && (
                                                            <div className="pt-3 border-t border-gray-200">
                                                                <span className="text-gray-500 text-xs uppercase tracking-wide">Notes</span>
                                                                <p className="text-gray-800 mt-1 bg-gray-50 p-3 rounded-lg text-sm">{transaction.notes}</p>
                                                            </div>
                                                        )}
                                                        {transaction.dateverified && (
                                                            <div className="pt-3 border-t border-gray-200 bg-blue-50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl">
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span className="text-blue-900 font-medium">
                                                                        Verified: {formatDate(transaction.dateverified)}
                                                                    </span>
                                                                    {transaction.employees && (
                                                                        <span className="text-blue-700">
                                                                            by {transaction.employees.employeename}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer - Action Buttons */}
                        {activeTab === 'current' && (
                            <div className="bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 flex-shrink-0">
                                <div className="flex gap-3 w-full sm:w-auto">
                                    {paymentInfo.paymentstatus !== 'Verified' && (
                                        <button
                                            onClick={handleApprovePayment}
                                            disabled={isProcessingPayment}
                                            className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isProcessingPayment ? (
                                                <>
                                                    <LoadingSpinner size="sm" color="white" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={18} />
                                                    Approve Payment
                                                </>
                                            )}
                                        </button>
                                    )}
                                    {paymentInfo.paymentstatus !== 'Rejected' && (
                                        <button
                                            onClick={handleRejectPayment}
                                            disabled={isProcessingPayment}
                                            className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Reject Payment
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setShowProofModal(false);
                                        setActiveTab('current');
                                    }}
                                    className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-lg transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                        {activeTab === 'history' && (
                            <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end flex-shrink-0">
                                <button
                                    onClick={() => {
                                        setShowProofModal(false);
                                        setActiveTab('current');
                                    }}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-lg transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 3D Design Viewer Modal */}
            {show3DModal && selected3DDesign && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-[#191716] px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-white text-2xl font-semibold">3D Design Preview</h2>
                                <p className="text-indigo-200 text-sm mt-1">Interactive view of customized hanger</p>
                            </div>
                            <button
                                onClick={close3DModal}
                                className="text-white hover:text-gray-200 transition-colors text-3xl font-bold cursor-pointer"
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
                                        hangerType={selected3DDesign.hangerType || '97-12'}
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
                                 Drag to rotate • Scroll to zoom • Right-click to pan
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

            {/* Tracking Link Modal */}
            {showTrackingModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-[#E6AF2E] px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-white text-xl font-semibold">Delivery Tracking Link</h2>
                                <p className="text-white/90 text-sm mt-1">Enter the tracking URL for this shipment</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowTrackingModal(false);
                                    setPendingStatus(null);
                                    setOrderStatus(order.orderstatus); // Revert status
                                }}
                                className="text-white hover:text-gray-200 transition-colors text-3xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tracking URL <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                value={trackingLink}
                                onChange={(e) => setTrackingLink(e.target.value)}
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                placeholder="https://tracking.example.com/track?id=123456"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                💡 This link will be displayed to the customer so they can track their delivery in real-time.
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowTrackingModal(false);
                                    setPendingStatus(null);
                                    setOrderStatus(order.orderstatus); // Revert status
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTrackingSubmit}
                                disabled={isSavingStatus || !trackingLink.trim()}
                                className="px-6 py-2 bg-[#E6AF2E] text-white rounded-lg hover:bg-[#191716] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavingStatus ? 'Saving...' : 'Confirm & Update Status'}
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
    )
}

export default OrderDetailOM