import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, MoreVertical, ChevronDown, Package, Calendar, MapPin, DollarSign, User, Eye, X } from 'lucide-react'
import { useRealtimeProductionOrders } from '../../hooks/useRealtimeProductionOrders'
import LoadingSpinner from '../../components/LoadingSpinner'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AssignOrder = () => {
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [dateFilter, setDateFilter] = useState('May - June');
    const [searchQuery, setSearchQuery] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Real-time order update handler
    const handleOrderUpdate = useCallback((payload) => {
        if (payload.eventType === 'INSERT') {
            if (employee?.employeeid) {
                fetchEmployeeOrders(employee.employeeid);
            }
        } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => 
                prev.map(order => 
                    order.orderid === payload.new.orderid ? payload.new : order
                )
            );
        } else if (payload.eventType === 'DELETE') {
            setOrders(prev => 
                prev.filter(order => order.orderid !== payload.old.orderid)
            );
        }
    }, [employee]);

    const { isSubscribed } = useRealtimeProductionOrders(employee?.employeeid, handleOrderUpdate);

    useEffect(() => {
        const employeeData = localStorage.getItem('employee');
        if (employeeData) {
            const parsedEmployee = JSON.parse(employeeData);
            setEmployee(parsedEmployee);
            fetchEmployeeOrders(parsedEmployee.employeeid);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchEmployeeOrders = async (employeeId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/employee/${employeeId}/orders`);
            const data = await response.json();
            
            if (response.ok) {
                setOrders(data.orders || []);
            } else {
                console.error('Error fetching orders:', data.error, data.details);
                alert(`Error loading orders: ${data.error || 'Unknown error'}`);
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching employee orders:', error);
            alert('Failed to connect to server. Please try again later.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'In Production': 'bg-yellow-400 text-black border-yellow-500',
            'Approved': 'bg-green-500 text-white border-green-600',
            'Waiting for Shipment': 'bg-blue-500 text-white border-blue-600',
            'Completed': 'bg-green-600 text-white border-green-700',
            'default': 'bg-gray-400 text-white border-gray-500'
        };
        return statusColors[status] || statusColors['default'];
    };

    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'Assign Orders') {
            return order.orderstatus === 'In Production' || order.orderstatus === 'Verifying Payment';
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                order.orderid.toLowerCase().includes(query) ||
                order.companyname?.toLowerCase().includes(query) ||
                order.contactperson?.toLowerCase().includes(query)
            );
        }
        
        return true;
    });

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedOrders(filteredOrders.map(order => order.orderid));
        } else {
            setSelectedOrders([]);
        }
    };

    const handleSelectOrder = (orderId) => {
        if (selectedOrders.includes(orderId)) {
            setSelectedOrders(selectedOrders.filter(id => id !== orderId));
        } else {
            setSelectedOrders([...selectedOrders, orderId]);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
                    <LoadingSpinner size="lg" />
                    <p className="text-xl text-gray-600 mt-4">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-xl font-bold text-red-600 mb-2">Not logged in</p>
                    <p className="text-gray-600">Please log in to view your assigned orders.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-6 pb-24 lg:pb-6">
            {/* Header Section */}
            <div className="mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Orders</h1>
                        <p className="text-sm md:text-base text-gray-600 mt-1">
                            Manage your assigned production orders
                        </p>
                    </div>
                    
                    {/* Stats Summary - Desktop */}
                    <div className="hidden md:flex items-center gap-4 bg-white rounded-xl p-4 shadow-md">
                        <div className="text-center border-r pr-4">
                            <p className="text-2xl font-bold text-[#E6AF2E]">{filteredOrders.length}</p>
                            <p className="text-xs text-gray-600">Total Orders</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {filteredOrders.filter(o => o.orderstatus === 'Completed').length}
                            </p>
                            <p className="text-xs text-gray-600">Completed</p>
                        </div>
                    </div>
                </div>

                {/* Stats Summary - Mobile */}
                <div className="md:hidden grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <p className="text-2xl font-bold text-[#E6AF2E]">{filteredOrders.length}</p>
                        <p className="text-xs text-gray-600">Total Orders</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <p className="text-2xl font-bold text-green-600">
                            {filteredOrders.filter(o => o.orderstatus === 'Completed').length}
                        </p>
                        <p className="text-xs text-gray-600">Completed</p>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                {/* Desktop Filters */}
                <div className="hidden md:flex justify-between items-center gap-4">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilterStatus('All')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                filterStatus === 'All'
                                    ? 'bg-[#E6AF2E] text-[#191716] shadow-md scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All Orders
                        </button>
                        <button
                            onClick={() => setFilterStatus('Assign Orders')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                filterStatus === 'Assign Orders'
                                    ? 'bg-[#E6AF2E] text-[#191716] shadow-md scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            In Production
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6AF2E] focus:border-transparent w-64"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                            <Filter size={18} />
                            <span className="hidden lg:inline">Filter</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Filters */}
                <div className="md:hidden space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6AF2E]"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus('All')}
                            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                filterStatus === 'All'
                                    ? 'bg-[#E6AF2E] text-[#191716] shadow-md'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus('Assign Orders')}
                            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                filterStatus === 'Assign Orders'
                                    ? 'bg-[#E6AF2E] text-[#191716] shadow-md'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            In Production
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#191716] to-[#2d2a28] text-white">
                                <th className="p-4 text-left">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                                        className="w-4 h-4 cursor-pointer rounded border-gray-300 text-[#E6AF2E] focus:ring-[#E6AF2E]"
                                    />
                                </th>
                                <th className="p-4 text-left font-semibold">Order Number</th>
                                <th className="p-4 text-left font-semibold">Date</th>
                                <th className="p-4 text-left font-semibold">Customer</th>
                                <th className="p-4 text-left font-semibold">Status</th>
                                <th className="p-4 text-left font-semibold">Total</th>
                                <th className="p-4 text-left font-semibold">Quantity</th>
                                <th className="p-4 text-left font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package className="w-16 h-16 text-gray-300 mb-4" />
                                            <p className="text-xl font-semibold text-gray-600 mb-2">
                                                No orders found
                                            </p>
                                            <p className="text-gray-500">
                                                {searchQuery 
                                                    ? 'Try adjusting your search criteria' 
                                                    : 'No orders have been assigned to you yet'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order, index) => (
                                    <tr 
                                        key={order.orderid} 
                                        className="border-b hover:bg-gray-50 transition-colors animate-fadeIn"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.orderid)}
                                                onChange={() => handleSelectOrder(order.orderid)}
                                                className="w-4 h-4 cursor-pointer rounded border-gray-300 text-[#E6AF2E] focus:ring-[#E6AF2E]"
                                            />
                                        </td>
                                        <td className="p-4 font-semibold text-gray-900">
                                            ORD-{order.orderid.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="p-4 text-gray-600">{formatDate(order.datecreated)}</td>
                                        <td className="p-4 text-gray-600">{order.companyname || order.contactperson}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(order.orderstatus)}`}>
                                                {order.orderstatus}
                                            </span>
                                        </td>
                                        <td className="p-4 font-semibold text-gray-900">
                                            {order.totalprice ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : 'N/A'}
                                        </td>
                                        <td className="p-4 text-gray-600">{order.quantity}</td>
                                        <td className="p-4">
                                            <Link
                                                to="/vieworder"
                                                state={{ order }}
                                                className="inline-flex items-center gap-2 bg-[#E6AF2E] hover:bg-[#c49723] text-[#191716] px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg font-medium"
                                            >
                                                <Eye size={16} />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <Package className="w-16 h-16 text-gray-300 mb-4 mx-auto" />
                        <p className="text-lg font-semibold text-gray-600 mb-2">
                            No orders found
                        </p>
                        <p className="text-sm text-gray-500">
                            {searchQuery 
                                ? 'Try adjusting your search' 
                                : 'No orders assigned yet'}
                        </p>
                    </div>
                ) : (
                    filteredOrders.map((order, index) => (
                        <div 
                            key={order.orderid} 
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 animate-fadeIn"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-[#191716] to-[#2d2a28] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.includes(order.orderid)}
                                        onChange={() => handleSelectOrder(order.orderid)}
                                        className="w-5 h-5 cursor-pointer rounded border-gray-300 text-[#E6AF2E] focus:ring-[#E6AF2E]"
                                    />
                                    <div>
                                        <p className="text-white font-bold text-sm">
                                            ORD-{order.orderid.slice(0, 8).toUpperCase()}
                                        </p>
                                        <p className="text-gray-300 text-xs flex items-center gap-1 mt-1">
                                            <Calendar size={12} />
                                            {formatDate(order.datecreated)}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.orderstatus)}`}>
                                    {order.orderstatus}
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <User size={16} className="text-gray-400" />
                                    <span className="text-sm font-medium">{order.companyname || order.contactperson}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <DollarSign size={16} className="text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Total</p>
                                            <p className="font-semibold text-sm">
                                                {order.totalprice ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Package size={16} className="text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Quantity</p>
                                            <p className="font-semibold text-sm">{order.quantity}</p>
                                        </div>
                                    </div>
                                </div>

                                {order.deliveryaddress && (
                                    <div className="flex items-start gap-2 text-gray-700">
                                        <MapPin size={16} className="text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Address</p>
                                            <p className="text-sm line-clamp-2">
                                                {typeof order.deliveryaddress === 'string' 
                                                    ? order.deliveryaddress 
                                                    : order.deliveryaddress.address}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <Link
                                    to="/vieworder"
                                    state={{ order }}
                                    className="flex items-center justify-center gap-2 w-full bg-[#E6AF2E] hover:bg-[#c49723] text-[#191716] px-4 py-2.5 rounded-lg transition-all duration-300 hover:shadow-md font-semibold mt-4"
                                >
                                    <Eye size={18} />
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {filteredOrders.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 bg-white rounded-xl shadow-md p-4">
                    <span className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{filteredOrders.length}</span> of <span className="font-semibold">{orders.length}</span> orders
                    </span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-[#E6AF2E] text-[#191716] rounded-lg hover:bg-[#c49723] transition-colors font-semibold shadow-md">
                            1
                        </button>
                    </div>
                </div>
            )}

            {/* Animation Styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    )
}

export default AssignOrder