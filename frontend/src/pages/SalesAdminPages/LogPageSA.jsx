import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, User, FileText, Package, DollarSign, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useParams, useNavigate } from 'react-router-dom';


const LogPageSA = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderAndLogs = async () => {
            try {
                setLoading(true);
                
                // Fetch order details
                const orderResponse = await fetch(`https://gatsis-hub.vercel.app/orders/${orderId}`);
                if (!orderResponse.ok) {
                    throw new Error('Failed to fetch order details');
                }
                const orderData = await orderResponse.json();
                setOrder(orderData.order);

                // Fetch order logs
                const logsResponse = await fetch(`https://gatsis-hub.vercel.app/order-logs/${orderId}`);
                if (!logsResponse.ok) {
                    throw new Error('Failed to fetch order logs');
                }
                const logsData = await logsResponse.json();
                setLogs(logsData.logs || []);
                
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderAndLogs();
        }
    }, [orderId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        // Add 8 hours for UTC+8 (Philippine Time)
        const phTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        return phTime.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getLogIcon = (action) => {
        if (action?.includes('Status')) {
            return <Package size={20} className="text-blue-600" />;
        } else if (action?.includes('Price')) {
            return <DollarSign size={20} className="text-green-600" />;
        } else if (action?.includes('Deadline')) {
            return <Clock size={20} className="text-orange-600" />;
        } else if (action?.includes('Created')) {
            return <FileText size={20} className="text-purple-600" />;
        } else {
            return <User size={20} className="text-gray-600" />;
        }
    };

    const getLogColor = (action) => {
        if (action?.includes('Status')) {
            return 'border-blue-400 bg-blue-50';
        } else if (action?.includes('Price')) {
            return 'border-green-400 bg-green-50';
        } else if (action?.includes('Deadline')) {
            return 'border-orange-400 bg-orange-50';
        } else if (action?.includes('Created')) {
            return 'border-purple-400 bg-purple-50';
        } else {
            return 'border-gray-400 bg-gray-50';
        }
    };

    const handleBackClick = () => {
        navigate('/salesadmin/orderpage');
    };

    if (loading) {
        return (
            <div className="flex w-full bg-gray-100">
                <main className="flex-1 p-6">
                    <div className="flex items-center justify-center h-96">
                        <LoadingSpinner size="lg" text="Loading order logs..." />
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex w-full bg-gray-100">
                <main className="flex-1 p-6">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                            <p className="text-xl text-red-600 mb-4">Error loading order logs</p>
                            <p className="text-gray-600">{error}</p>
                            <button 
                                onClick={handleBackClick}
                                className="mt-4 px-4 py-2 bg-[#191716] text-white rounded hover:bg-gray-800"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

  return (
    <div className="flex w-full bg-gray-100">
            <main className="flex-1 p-3 md:p-6">
                {/* Header */}
                <div className="mb-6">
                    <button 
                        onClick={handleBackClick}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ChevronLeft size={20} />
                        <span>Back to Orders</span>
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold text-[#191716]">
                                Order Activity Log
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {order && `ORD-${order.orderid?.slice(0, 8).toUpperCase()}`}
                            </p>
                        </div>
                        
                        {order && (
                            <div className="bg-white px-6 py-4 rounded-lg shadow">
                                <div className="text-sm text-gray-600">Current Status</div>
                                <div className="text-lg font-semibold text-blue-700 mt-1">
                                    {order.orderstatus}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary Card */}
                {order && (
                    <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
                        <h2 className="text-lg font-bold mb-4 text-[#191716]">Order Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Customer</p>
                                <p className="font-semibold">{order.contactperson}</p>
                                <p className="text-sm text-gray-500">{order.companyname}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Order Date</p>
                                <p className="font-semibold">
                                    {new Date(order.datecreated).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="font-semibold text-lg text-green-700">
                                    {order.totalprice 
                                        ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` 
                                        : 'Pending'
                                    }
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Quantity</p>
                                <p className="font-semibold">{order.quantity} items</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Timeline */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 md:p-6 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-[#191716]">Activity Timeline</h2>
                        <p className="text-sm text-gray-600 mt-1">Complete history of all order modifications</p>
                    </div>

                    <div className="p-4 md:p-6">
                        {logs.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No activity logs available for this order</p>
                                <p className="text-sm text-gray-400 mt-2">Changes made to this order will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {logs.map((log, index) => (
                                    <div 
                                        key={log.logid || index}
                                        className={`border-l-4 ${getLogColor(log.action)} p-4 rounded-r-lg transition-all hover:shadow-md`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getLogIcon(log.action)}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {log.action}
                                                        </h3>
                                                        <p className="text-gray-700 mt-1">
                                                            {log.description}
                                                        </p>
                                                        
                                                        {(log.old_value || log.new_value) && (
                                                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {log.old_value && (
                                                                    <div className="text-sm bg-red-50 p-3 rounded border border-red-200">
                                                                        <span className="font-medium text-red-700">Previous:</span>
                                                                        <p className="text-gray-700 mt-1">{log.old_value}</p>
                                                                    </div>
                                                                )}
                                                                {log.new_value && (
                                                                    <div className="text-sm bg-green-50 p-3 rounded border border-green-200">
                                                                        <span className="font-medium text-green-700">Updated:</span>
                                                                        <p className="text-gray-700 mt-1">{log.new_value}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {log.field_changed && (
                                                            <div className="mt-2 text-xs text-gray-500">
                                                                Field: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{log.field_changed}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-sm text-gray-500">
                                                            {formatDate(log.timestamp)}
                                                        </p>
                                                        {log.employeename && (
                                                            <p className="text-xs text-gray-600 mt-1 font-medium">
                                                                by {log.employeename}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
 )
}

export default LogPageSA