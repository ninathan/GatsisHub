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
                const orderResponse = await fetch(`https://gatsis-hub.vercel.app/all`);
                if (!orderResponse.ok) {
                    throw new Error('Failed to fetch order details');
                }
                const orderData = await orderResponse.json();
                setOrder(orderData);

                // Fetch order logs
                const logsResponse = await fetch(`https://gatsis-hub.vercel.app/all`);
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
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getLogIcon = (logType) => {
        switch (logType) {
            case 'status_change':
                return <Package size={20} className="text-blue-600" />;
            case 'payment':
                return <DollarSign size={20} className="text-green-600" />;
            case 'note':
                return <FileText size={20} className="text-gray-600" />;
            case 'user_action':
                return <User size={20} className="text-purple-600" />;
            case 'alert':
                return <AlertCircle size={20} className="text-red-600" />;
            default:
                return <Clock size={20} className="text-gray-400" />;
        }
    };

    const getLogColor = (logType) => {
        switch (logType) {
            case 'status_change':
                return 'border-blue-200 bg-blue-50';
            case 'payment':
                return 'border-green-200 bg-green-50';
            case 'note':
                return 'border-gray-200 bg-gray-50';
            case 'user_action':
                return 'border-purple-200 bg-purple-50';
            case 'alert':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-gray-200 bg-white';
        }
    };

    const handleBackClick = () => {
        navigate('/orderpage');
    };

    // if (loading) {
    //     return (
    //         <div className="flex w-full bg-gray-100">
    //             <main className="flex-1 p-6">
    //                 <div className="flex items-center justify-center h-96">
    //                     <LoadingSpinner size="lg" text="Loading order logs..." />
    //                 </div>
    //             </main>
    //         </div>
    //     );
    // }

    if (error) {
        return (
            <div className="flex w-full bg-gray-100">
                <main className="flex-1 p-6">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                            <p className="text-xl text-red-600 mb-4">Error loading order logs</p>
                            <p className="text-gray-600">{error}</p>
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
                                        : '₱0.00'
                                    }
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Quantity</p>
                                <p className="font-semibold">{order.quantity}x items</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Timeline */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 md:p-6 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-[#191716]">Activity Timeline</h2>
                        <p className="text-sm text-gray-600 mt-1">Complete history of all order activities</p>
                    </div>

                    <div className="p-4 md:p-6">
                        {logs.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No activity logs available</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {logs.map((log, index) => (
                                    <div 
                                        key={log.logid || index}
                                        className={`border-l-4 ${getLogColor(log.logtype)} p-4 rounded-r-lg`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getLogIcon(log.logtype)}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {log.title || 'Activity Update'}
                                                        </h3>
                                                        <p className="text-gray-700 mt-1">
                                                            {log.description}
                                                        </p>
                                                        {log.details && (
                                                            <div className="mt-2 text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                                                                {log.details}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-sm text-gray-500">
                                                            {formatDate(log.timestamp)}
                                                        </p>
                                                        {log.username && (
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                by {log.username}
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