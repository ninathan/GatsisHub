import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Search, Filter, Package, Calendar, User, DollarSign, Eye, CheckCircle, Clock, X } from "lucide-react";
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner';
import { useRealtimeOrdersAdmin } from '../../hooks/useRealtimeOrdersAdmin';

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [selectedOrders, setSelectedOrders] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 6;

    // Real-time order update handler
    const handleOrderUpdate = useCallback((payload) => {
        console.log('Realtime update:', payload);
        
        if (payload.eventType === 'INSERT') {
            setOrders(prev => {
                const newOrders = [payload.new, ...prev];
                return newOrders.sort((a, b) => new Date(a.datecreated) - new Date(b.datecreated));
            });
        } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(order => 
                order.orderid === payload.new.orderid ? payload.new : order
            ));
        } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(order => order.orderid !== payload.old.orderid));
        }
    }, []);

    const { isSubscribed } = useRealtimeOrdersAdmin(handleOrderUpdate);

    // Fetch all orders on component mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://gatsis-hub.vercel.app/orders/all');

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                const sortedOrders = (data.orders || []).sort((a, b) => 
                    new Date(a.datecreated) - new Date(b.datecreated)
                );

                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders);
                setError(null);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Filter orders based on search and status
    useEffect(() => {
        let filtered = [...orders];

        if (searchQuery) {
            filtered = filtered.filter(order =>
                order.orderid.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.companyname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.contactperson?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedFilter === 'New Orders') {
            filtered = filtered.filter(order => order.orderstatus === 'For Evaluation');
        } else if (selectedFilter === 'Ongoing Orders') {
            filtered = filtered.filter(order =>
                order.orderstatus !== 'For Evaluation' && order.orderstatus !== 'Completed'
            );
        } else if (selectedFilter === 'Completed Orders') {
            filtered = filtered.filter(order => order.orderstatus === 'Completed');
        }

        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [searchQuery, selectedFilter, orders]);

    // Pagination logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const goToPage = (pageNumber) => setCurrentPage(pageNumber);

    const getPaymentStatus = (orderStatus) => {
        const paidStatuses = ['Verifying Payment', 'In Production', 'Waiting for Shipment', 'In Transit', 'Completed'];
        return paidStatuses.includes(orderStatus) ? 'Paid' : 'Pending';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const toggleOrderSelection = (orderId) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrders.length === currentOrders.length && currentOrders.length > 0) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(currentOrders.map(order => order.orderid));
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push("...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...");
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }
        return pages;
    };

    const getOrderStats = () => {
        return {
            total: orders.length,
            new: orders.filter(o => o.orderstatus === 'For Evaluation').length,
            ongoing: orders.filter(o => o.orderstatus !== 'For Evaluation' && o.orderstatus !== 'Completed').length,
            completed: orders.filter(o => o.orderstatus === 'Completed').length,
        };
    };

    const stats = getOrderStats();

    if (loading) {
        return (
            <div className="flex w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
                        <LoadingSpinner size="lg" />
                        <p className="text-xl text-gray-600 mt-4">Loading orders...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="w-8 h-8 text-red-600" />
                        </div>
                        <p className="text-xl font-bold text-red-600 mb-2">Error loading orders</p>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <main className="flex-1 p-3 md:p-6 pb-24 lg:pb-6">
                {/* Header Section */}
                <div className="mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Orders</h1>
                            <p className="text-sm md:text-base text-gray-600 mt-1">
                                Manage and track all customer orders
                            </p>
                        </div>
                        
                        {/* Stats Summary - Desktop */}
                        <div className="hidden md:grid grid-cols-4 gap-3 bg-white rounded-xl p-4 shadow-md">
                            <div className="text-center border-r pr-3">
                                <p className="text-2xl font-bold text-[#E6AF2E]">{stats.total}</p>
                                <p className="text-xs text-gray-600">Total</p>
                            </div>
                            <div className="text-center border-r pr-3">
                                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                                <p className="text-xs text-gray-600">New</p>
                            </div>
                            <div className="text-center border-r pr-3">
                                <p className="text-2xl font-bold text-orange-600">{stats.ongoing}</p>
                                <p className="text-xs text-gray-600">Ongoing</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                                <p className="text-xs text-gray-600">Completed</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary - Mobile */}
                    <div className="md:hidden grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-white rounded-xl p-4 shadow-md">
                            <p className="text-2xl font-bold text-[#E6AF2E]">{stats.total}</p>
                            <p className="text-xs text-gray-600">Total Orders</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-md">
                            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                            <p className="text-xs text-gray-600">New Orders</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-md">
                            <p className="text-2xl font-bold text-orange-600">{stats.ongoing}</p>
                            <p className="text-xs text-gray-600">Ongoing</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-md">
                            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
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
                                onClick={() => setSelectedFilter('All')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    selectedFilter === 'All'
                                        ? 'bg-[#E6AF2E] text-white shadow-md scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All Orders
                            </button>
                            <button
                                onClick={() => setSelectedFilter('New Orders')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    selectedFilter === 'New Orders'
                                        ? 'bg-blue-600 text-white shadow-md scale-105'
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                            >
                                New Orders
                            </button>
                            <button
                                onClick={() => setSelectedFilter('Ongoing Orders')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    selectedFilter === 'Ongoing Orders'
                                        ? 'bg-orange-600 text-white shadow-md scale-105'
                                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                }`}
                            >
                                Ongoing
                            </button>
                            <button
                                onClick={() => setSelectedFilter('Completed Orders')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    selectedFilter === 'Completed Orders'
                                        ? 'bg-green-600 text-white shadow-md scale-105'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                            >
                                Completed
                            </button>
                        </div>

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
                        
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setSelectedFilter('All')}
                                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                    selectedFilter === 'All'
                                        ? 'bg-[#E6AF2E] text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setSelectedFilter('New Orders')}
                                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                    selectedFilter === 'New Orders'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-blue-100 text-blue-700'
                                }`}
                            >
                                New
                            </button>
                            <button
                                onClick={() => setSelectedFilter('Ongoing Orders')}
                                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                    selectedFilter === 'Ongoing Orders'
                                        ? 'bg-orange-600 text-white shadow-md'
                                        : 'bg-orange-100 text-orange-700'
                                }`}
                            >
                                Ongoing
                            </button>
                            <button
                                onClick={() => setSelectedFilter('Completed Orders')}
                                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                    selectedFilter === 'Completed Orders'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-green-100 text-green-700'
                                }`}
                            >
                                Completed
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
                                            checked={selectedOrders.length === currentOrders.length && currentOrders.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 cursor-pointer rounded border-gray-300 text-[#E6AF2E] focus:ring-[#E6AF2E]"
                                        />
                                    </th>
                                    <th className="p-4 text-left font-semibold">Order Number</th>
                                    <th className="p-4 text-left font-semibold">Date</th>
                                    <th className="p-4 text-left font-semibold">Customer</th>
                                    <th className="p-4 text-left font-semibold">Payment</th>
                                    <th className="p-4 text-left font-semibold">Total</th>
                                    <th className="p-4 text-left font-semibold">Status</th>
                                    <th className="p-4 text-left font-semibold">Quantity</th>
                                    <th className="p-4 text-left font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <Package className="w-16 h-16 text-gray-300 mb-4" />
                                                <p className="text-xl font-semibold text-gray-600 mb-2">
                                                    No orders found
                                                </p>
                                                <p className="text-gray-500">
                                                    {searchQuery 
                                                        ? 'Try adjusting your search criteria' 
                                                        : 'No orders match the selected filter'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentOrders.map((order, index) => {
                                        const paymentStatus = getPaymentStatus(order.orderstatus);
                                        const isPaid = paymentStatus === 'Paid';

                                        return (
                                            <tr 
                                                key={order.orderid} 
                                                className="border-b hover:bg-gray-50 transition-colors animate-fadeIn"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedOrders.includes(order.orderid)}
                                                        onChange={() => toggleOrderSelection(order.orderid)}
                                                        className="w-4 h-4 cursor-pointer rounded border-gray-300 text-[#E6AF2E] focus:ring-[#E6AF2E]"
                                                    />
                                                </td>
                                                <td className="p-4 font-semibold text-gray-900">
                                                    ORD-{order.orderid.slice(0, 8).toUpperCase()}
                                                </td>
                                                <td className="p-4 text-gray-600">{formatDate(order.datecreated)}</td>
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900">{order.contactperson}</div>
                                                    <div className="text-sm text-gray-500">{order.companyname}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${
                                                            isPaid
                                                                ? "bg-green-100 text-green-700 border-green-500"
                                                                : "bg-yellow-100 text-yellow-700 border-yellow-500"
                                                        }`}
                                                    >
                                                        {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                        {paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-semibold text-gray-900">
                                                    {order.totalprice 
                                                        ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` 
                                                        : '₱0.00'}
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-500">
                                                        {order.orderstatus}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-600">{order.quantity}x</td>
                                                <td className="p-4">
                                                    <Link
                                                        to={`/orderdetail/${order.orderid}`}
                                                        className="inline-flex items-center gap-2 bg-[#E6AF2E] hover:bg-[#c49723] text-[#191716] px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg font-medium"
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-4">
                    {currentOrders.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-8 text-center">
                            <Package className="w-16 h-16 text-gray-300 mb-4 mx-auto" />
                            <p className="text-lg font-semibold text-gray-600 mb-2">
                                No orders found
                            </p>
                            <p className="text-sm text-gray-500">
                                {searchQuery 
                                    ? 'Try adjusting your search' 
                                    : 'No orders match the filter'}
                            </p>
                        </div>
                    ) : (
                        currentOrders.map((order, index) => {
                            const paymentStatus = getPaymentStatus(order.orderstatus);
                            const isPaid = paymentStatus === 'Paid';

                            return (
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
                                                onChange={() => toggleOrderSelection(order.orderid)}
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
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-500">
                                            {order.orderstatus}
                                        </span>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <User size={16} className="text-gray-400" />
                                            <div>
                                                <span className="text-sm font-medium">{order.contactperson}</span>
                                                <p className="text-xs text-gray-500">{order.companyname}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                {isPaid ? <CheckCircle size={16} className="text-green-500" /> : <Clock size={16} className="text-yellow-500" />}
                                                <div>
                                                    <p className="text-xs text-gray-500">Payment</p>
                                                    <p className={`font-semibold text-sm ${isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                                                        {paymentStatus}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-700">
                                                <DollarSign size={16} className="text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Total</p>
                                                    <p className="font-semibold text-sm">
                                                        {order.totalprice ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '₱0.00'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Package size={16} className="text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Quantity</p>
                                                <p className="font-semibold text-sm">{order.quantity}x</p>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/orderdetail/${order.orderid}`}
                                            className="flex items-center justify-center gap-2 w-full bg-[#E6AF2E] hover:bg-[#c49723] text-[#191716] px-4 py-2.5 rounded-lg transition-all duration-300 hover:shadow-md font-semibold mt-4"
                                        >
                                            <Eye size={18} />
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {filteredOrders.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 bg-white rounded-xl shadow-md p-4">
                        <span className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{indexOfFirstOrder + 1}</span> to{' '}
                            <span className="font-semibold">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> of{' '}
                            <span className="font-semibold">{filteredOrders.length}</span> orders
                        </span>
                        
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg border transition-all ${
                                        currentPage === 1 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-white hover:bg-gray-50 text-gray-700 cursor-pointer hover:shadow-md'
                                    }`}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                
                                <div className="flex gap-1">
                                    {getPageNumbers().map((page, index) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">...</span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                className={`px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                                                    currentPage === page
                                                        ? 'bg-[#E6AF2E] text-white font-semibold shadow-md scale-105'
                                                        : 'bg-white hover:bg-gray-50 text-gray-700 border hover:shadow-md'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}
                                </div>
                                
                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg border transition-all ${
                                        currentPage === totalPages 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-white hover:bg-gray-50 text-gray-700 cursor-pointer hover:shadow-md'
                                    }`}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
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
            </main>
        </div>
    )
}

export default OrderPage