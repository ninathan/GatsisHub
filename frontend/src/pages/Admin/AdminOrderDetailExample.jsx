import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrderDesignViewer from '../../components/Admin/OrderDesignViewer';

/**
 * EXAMPLE: Admin Order Detail Page with 3D Design Viewer
 * 
 * This is a complete example showing how to integrate the OrderDesignViewer
 * component into your admin order management pages.
 */

const AdminOrderDetailExample = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

    const showNotification = (message, type = 'success') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotificationModal(true);
    };

    const closeNotificationModal = () => {
        setShowNotificationModal(false);
        setNotificationMessage('');
    };

    // Fetch order data from backend
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`https://gatsis-hub.vercel.app/orders/${orderId}`);
                const data = await response.json();
                setOrder(data.order);
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-lg">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-red-600">Order not found</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Order Details</h1>
                <p className="text-gray-600">Order ID: {order.orderid}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Order Information */}
                <div className="space-y-6">
                    {/* Company Information */}
                    <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
                        <h2 className="text-xl font-semibold mb-4">Company Information</h2>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-600">Company Name:</span>
                                <p className="font-medium">{order.companyname}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Contact Person:</span>
                                <p className="font-medium">{order.contactperson}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Phone:</span>
                                <p className="font-medium">{order.contactphone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
                        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    order.orderstatus === 'For Evaluation' ? 'bg-yellow-100 text-yellow-800' :
                                    order.orderstatus === 'Waiting for Payment' ? 'bg-orange-100 text-orange-800' :
                                    order.orderstatus === 'Approved' ? 'bg-green-100 text-green-800' :
                                    order.orderstatus === 'In Production' ? 'bg-blue-100 text-blue-800' :
                                    order.orderstatus === 'Waiting for Shipment' ? 'bg-indigo-100 text-indigo-800' :
                                    order.orderstatus === 'In Transit' ? 'bg-purple-100 text-purple-800' :
                                    order.orderstatus === 'Completed' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {order.orderstatus}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Hanger Type:</span>
                                <span className="font-medium">{order.hangertype}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-medium">{order.quantity} pieces</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date Created:</span>
                                <span className="font-medium">
                                    {new Date(order.datecreated).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Materials */}
                    {order.materials && Object.keys(order.materials).length > 0 && (
                        <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
                            <h2 className="text-xl font-semibold mb-4">Materials</h2>
                            <div className="space-y-2">
                                {Object.entries(order.materials).map(([material, percentage]) => (
                                    <div key={material} className="flex justify-between items-center">
                                        <span className="text-gray-700">{material}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-indigo-600 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="font-medium">{percentage}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Delivery Notes */}
                    {order.deliverynotes && (
                        <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
                            <h2 className="text-xl font-semibold mb-4">Delivery Notes</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{order.deliverynotes}</p>
                        </div>
                    )}

                    {/* Status Update (Admin Action) */}
                    <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
                        <h2 className="text-xl font-semibold mb-4">Update Status</h2>
                        <select 
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                            value={order.orderstatus}
                            onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                    const response = await fetch(
                                        `https://gatsis-hub.vercel.app/orders/${order.orderid}/status`,
                                        {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: newStatus })
                                        }
                                    );
                                    if (response.ok) {
                                        setOrder({ ...order, orderstatus: newStatus });
                                        showNotification('Status updated successfully!');
                                    }
                                } catch (error) {
                                    console.error('Error updating status:', error);
                                    showNotification('Failed to update status', 'error');
                                }
                            }}
                        >
                            <option value="For Evaluation">For Evaluation</option>
                            <option value="Waiting for Payment">Waiting for Payment</option>
                            <option value="Approved">Approved</option>
                            <option value="In Production">In Production</option>
                            <option value="Waiting for Shipment">Waiting for Shipment</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Right Column: 3D Design Viewer */}
                <div>
                    {order.threeddesigndata ? (
                        <OrderDesignViewer designData={order.threeddesigndata} />
                    ) : (
                        <div className="bg-gray-100 rounded-lg border-2 border-gray-300 p-12 text-center">
                            <div className="text-6xl mb-4">📦</div>
                            <h3 className="text-xl font-semibold mb-2">No 3D Design</h3>
                            <p className="text-gray-600">
                                This order does not have a custom 3D design.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Notification Modal */}
            {showNotificationModal && (
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
    );
};

export default AdminOrderDetailExample;
