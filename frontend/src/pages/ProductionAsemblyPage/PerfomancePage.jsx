import React, { useState, useEffect } from 'react';
import { Users, Package, TrendingUp, Award, AlertCircle, Send, X, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const PerformancePage = () => {
    const [selectedQuota, setSelectedQuota] = useState('All');
    const [quotas, setQuotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [submitValues, setSubmitValues] = useState({
        reported_completed: '',
        submission_notes: '',
        priority: 'Medium'
    });
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [employeeId, setEmployeeId] = useState(null);
    const [teamId, setTeamId] = useState(null);

    useEffect(() => {
        // Get employee data from localStorage
        const employee = JSON.parse(localStorage.getItem('employee') || '{}');
        
        if (employee && employee.employeeid) {
            setEmployeeId(employee.employeeid);
            setTeamId(employee.teamid || null);
        } else {
            setErrorMessage('Please log in as an employee to access this page');
        }
        
        fetchQuotas();
    }, []);

    const fetchQuotas = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://gatsis-hub.vercel.app/quotas?status=Active');
            if (!response.ok) throw new Error('Failed to fetch quotas');
            
            const data = await response.json();
            const quotasData = data.quotas || [];

            // Fetch assigned orders for each quota
            const quotasWithOrders = await Promise.all(
                quotasData.map(async (quota) => {
                    if (quota.assignedorders && quota.assignedorders.length > 0) {
                        const ordersResponse = await fetch(`https://gatsis-hub.vercel.app/orders/all`);
                        const ordersData = await ordersResponse.json();
                        const allOrders = ordersData.orders || [];
                        
                        const assignedOrdersList = allOrders.filter(order => 
                            quota.assignedorders.includes(order.orderid)
                        );

                        return {
                            ...quota,
                            orders: assignedOrdersList
                        };
                    }
                    return { ...quota, orders: [] };
                })
            );

            setQuotas(quotasWithOrders);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching quotas:', error);
            setErrorMessage('Failed to load quotas');
            setLoading(false);
        }
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 70) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getStatusBadge = (orderstatus) => {
        const statusStyles = {
            'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-500',
            'Confirmed': 'bg-blue-100 text-blue-700 border-blue-500',
            'In Progress': 'bg-purple-100 text-purple-700 border-purple-500',
            'Completed': 'bg-green-100 text-green-700 border-green-500',
            'Cancelled': 'bg-red-100 text-red-700 border-red-500'
        };
        return statusStyles[orderstatus] || 'bg-gray-100 text-gray-700 border-gray-500';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const handleSubmitClick = (quota, order) => {
        setSelectedOrder({ quota, order });
        setSubmitValues({
            reported_completed: '',
            submission_notes: '',
            priority: 'Medium'
        });
        setShowSubmitModal(true);
    };

    const handleCancelSubmit = () => {
        setShowSubmitModal(false);
        setSelectedOrder(null);
        setSubmitValues({
            reported_completed: '',
            submission_notes: '',
            priority: 'Medium'
        });
    };

    const handleSubmitProduction = async () => {
        if (!employeeId) {
            setErrorMessage('Employee ID not found. Please log in again.');
            return;
        }

        if (!submitValues.reported_completed || parseInt(submitValues.reported_completed) <= 0) {
            setErrorMessage('Please enter a valid number of completed units');
            return;
        }

        try {
            const submissionData = {
                quotaid: selectedOrder.quota.quotaid,
                orderid: selectedOrder.order.orderid,
                employeeid: employeeId,
                teamid: teamId,
                reported_completed: parseInt(submitValues.reported_completed),
                submission_notes: submitValues.submission_notes || null,
                priority: submitValues.priority
            };

            const response = await fetch('https://gatsis-hub.vercel.app/submissions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to submit production');
            }

            setSuccessMessage('Production submitted successfully! Awaiting verification.');
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
            handleCancelSubmit();
            fetchQuotas(); // Refresh data
        } catch (error) {
            console.error('Error submitting production:', error);
            setErrorMessage(error.message || 'Failed to submit production');
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handleInputChange = (field, value) => {
        setSubmitValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const filteredQuotas = selectedQuota === 'All' 
        ? quotas 
        : quotas.filter(quota => quota.quotaid === parseInt(selectedQuota));

    const uniqueQuotaOptions = ['All', ...quotas.map(q => ({ id: q.quotaid, name: q.quotaname }))];

    const totalOrders = quotas.reduce((sum, quota) => sum + (quota.orders?.length || 0), 0);
    const totalTarget = quotas.reduce((sum, quota) => sum + (quota.targetquota || 0), 0);
    const totalFinished = quotas.reduce((sum, quota) => sum + (quota.finishedquota || 0), 0);
    const avgCompletion = totalTarget > 0 ? Math.round((totalFinished / totalTarget) * 100) : 0;

    return (
        <div className="flex w-full bg-gray-100">
            <main className="flex-1 p-3 md:p-6">
                {/* Success Message */}
                {showSuccessMessage && (
                    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in">
                        <CheckCircle size={20} />
                        <span className="font-medium">{successMessage}</span>
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in">
                        <AlertCircle size={20} />
                        <span className="font-medium">{errorMessage}</span>
                    </div>
                )}

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-4xl font-bold text-[#191716] mb-2">
                        Production Performance
                    </h1>
                    <p className="text-gray-600">Submit your production and track quota progress</p>
                </div>

                {loading ? (
                    <div className="min-h-screen w-full flex flex-col items-center justify-center">
                        <LoadingSpinner size='md' />
                        <p className="mt-4 text-gray-600">Loading performance data...</p>
                    </div>
                ) : (
                    <>
                        {/* Quota Filter */}
                        <div className="mb-6">
                            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
                                {uniqueQuotaOptions.map((option) => (
                                    <button
                                        key={typeof option === 'string' ? option : option.id}
                                        onClick={() => setSelectedQuota(typeof option === 'string' ? option : option.id)}
                                        className={`cursor-pointer px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm md:text-base ${
                                            selectedQuota === (typeof option === 'string' ? option : option.id)
                                                ? 'bg-[#E6AF2E] text-white' 
                                                : 'bg-white hover:bg-gray-50 border border-gray-300'
                                        }`}
                                    >
                                        {typeof option === 'string' ? option : option.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Performance Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Active Quotas</p>
                                        <p className="text-2xl md:text-3xl font-bold text-[#191716] mt-1">
                                            {quotas.length}
                                        </p>
                                    </div>
                                    <Users size={40} className="text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Orders</p>
                                        <p className="text-2xl md:text-3xl font-bold text-[#191716] mt-1">
                                            {totalOrders}
                                        </p>
                                    </div>
                                    <Package size={40} className="text-green-500" />
                                </div>
                            </div>

                            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Target Units</p>
                                        <p className="text-2xl md:text-3xl font-bold text-[#191716] mt-1">
                                            {totalTarget.toLocaleString()}
                                        </p>
                                    </div>
                                    <TrendingUp size={40} className="text-purple-500" />
                                </div>
                            </div>

                            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Completion</p>
                                        <p className="text-2xl md:text-3xl font-bold text-[#191716] mt-1">
                                            {avgCompletion}%
                                        </p>
                                    </div>
                                    <Award size={40} className="text-yellow-500" />
                                </div>
                            </div>
                        </div>

                        {/* Quota Cards */}
                        <div className="space-y-6">
                            {filteredQuotas.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-8 text-center">
                                    <p className="text-gray-500">No quotas available</p>
                                </div>
                            ) : (
                                filteredQuotas.map((quota) => {
                                    const quotaPercentage = quota.targetquota > 0 
                                        ? Math.round((quota.finishedquota / quota.targetquota) * 100) 
                                        : 0;

                                    return (
                                        <div key={quota.quotaid} className="bg-white rounded-lg shadow">
                                            {/* Quota Header */}
                                            <div className="p-4 md:p-6 border-b border-gray-200">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                    <div>
                                                        <h2 className="text-xl font-bold text-[#191716]">{quota.quotaname}</h2>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {formatDate(quota.startdate)} - {formatDate(quota.enddate)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-600">Progress</p>
                                                            <p className="text-lg font-bold text-green-600">
                                                                {quota.finishedquota?.toLocaleString() || 0} / {quota.targetquota?.toLocaleString() || 0}
                                                            </p>
                                                            <p className="text-sm text-gray-500">{quotaPercentage}% Complete</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Assigned Orders */}
                                            <div className="p-4 md:p-6">
                                                <h3 className="text-lg font-semibold mb-4 text-[#191716]">
                                                    Assigned Orders ({quota.orders?.length || 0})
                                                </h3>

                                                {loading ? (
                                                    <LoadingSpinner />
                                                ) : (!quota.orders || quota.orders.length === 0) ? (
                                                    <div className="text-center py-8 text-gray-500">
                                                        No orders assigned to this quota
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {quota.orders.map((order) => {
                                                            const orderProgress = order.quantity > 0 
                                                                ? Math.round(((order.quantity - (order.quantity || 0)) / order.quantity) * 100)
                                                                : 0;

                                                            return (
                                                                <div 
                                                                    key={order.orderid}
                                                                    className="border rounded-lg p-4 hover:shadow-md transition-all"
                                                                >
                                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <h4 className="font-semibold text-gray-900">
                                                                                    {'ORD-' + order.orderid.slice(0, 8).toUpperCase() || `Order #${order.orderid.slice(0, 8)}`}
                                                                                </h4>
                                                                                <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${getStatusBadge(order.orderstatus)}`}>
                                                                                    {order.orderstatus}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-600">
                                                                                Customer: {order.companyname || 'N/A'}
                                                                            </p>
                                                                        </div>

                                                                        {/* Submit Button */}
                                                                        <button
                                                                            onClick={() => handleSubmitClick(quota, order)}
                                                                            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#E6AF2E] text-white rounded-lg hover:bg-[#d19d1f] transition-colors"
                                                                        >
                                                                            <Send size={16} />
                                                                            <span className="text-sm font-medium">Submit Production</span>
                                                                        </button>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                                                        <div>
                                                                            <p className="text-gray-600">Quantity</p>
                                                                            <p className="font-semibold">{order.quantity?.toLocaleString() || 0} units</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-600">Deadline</p>
                                                                            <p className="font-semibold">{formatDate(order.deadline)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-600">Total Price</p>
                                                                            <p className="font-semibold">₱{order.totalprice?.toLocaleString() || 0}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-600">Order Status</p>
                                                                            <p className="font-semibold">{order.orderstatus}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}

                {/* Submit Production Modal */}
                {showSubmitModal && selectedOrder && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-[#191716]">Submit Production</h2>
                                    <button
                                        onClick={handleCancelSubmit}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-600">Order Name</p>
                                                <p className="font-medium">{selectedOrder.order.ordername || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Quota</p>
                                                <p className="font-medium">{selectedOrder.quota.quotaname}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Target Quantity</p>
                                                <p className="font-medium">{selectedOrder.order.quantity?.toLocaleString() || 0} units</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Deadline</p>
                                                <p className="font-medium">{formatDate(selectedOrder.order.deadline)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Completed Units <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={submitValues.reported_completed}
                                            onChange={(e) => handleInputChange('reported_completed', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6AF2E] focus:border-transparent"
                                            min="1"
                                            placeholder="Enter number of units completed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Priority
                                        </label>
                                        <select
                                            value={submitValues.priority}
                                            onChange={(e) => handleInputChange('priority', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6AF2E] focus:border-transparent"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            value={submitValues.submission_notes}
                                            onChange={(e) => handleInputChange('submission_notes', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6AF2E] focus:border-transparent"
                                            rows="3"
                                            placeholder="Add any additional notes about this submission..."
                                        />
                                    </div>

                                    <div className="flex gap-3 justify-end pt-4">
                                        <button
                                            onClick={handleCancelSubmit}
                                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmitProduction}
                                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                                        >
                                            <Send size={16} />
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );


};

export default PerformancePage;