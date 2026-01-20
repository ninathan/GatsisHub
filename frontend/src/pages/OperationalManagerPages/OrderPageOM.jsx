import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, SearchCode } from "lucide-react";
import { Link } from 'react-router-dom'
import logo from '../../images/logo.png'
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRealtimeOrdersAdmin } from '../../hooks/useRealtimeOrdersAdmin';

const OrderPageOM = () => {
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('All')
    const [selectedOrders, setSelectedOrders] = useState([])
    const [error, setError] = useState(null)

    //pagination  state
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    // Real-time order update handler
    const handleOrderUpdate = useCallback((payload) => {
        if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new, ...prev]);
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
    }, []);

    // Subscribe to real-time order updates
    const { isSubscribed } = useRealtimeOrdersAdmin(handleOrderUpdate);

    // fetch all order on a component mount
    useEffect (() => {
        const fetchOrders = async () => {
            try {
                setLoading(true)
                const response = await fetch('https://gatsis-hub.vercel.app/orders/all')

                if (!response.ok) {
                    throw new Error('Failed to fetch orders')
                }

                const data = await response.json()

                setOrders(data.orders || [])
                setFilteredOrders(data.orders || [])
                setError(null)
            }catch (err) {

                setError(err.message)
            }finally {
                setLoading(false)
            }
        }
        fetchOrders()

    }, [])

    // apply filters and search query
    useEffect(() => {
        let filtered = [...orders]

        // apply search filter
        if (searchQuery) {
            filtered = filtered.filter(order =>
                order.orderid.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.companyname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.date?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // apply status filter
        if (selectedFilter === 'Orders') {
            // show only orders that have been evaluated and processed
            filtered  = filtered.filter(order => 
                !['For Evaluation', 'Pending'].includes(order.orderstatus)
            )
        } else if (selectedFilter === 'Order Requeset') {
            // show only order that are waiting for evaluation
            filtered = filtered.filter(order =>
                order.orderstatus === 'For Evaluation'
            )
        }
        setFilteredOrders(filtered)
        setCurrentPage(1) // reset to first page on filter change
    }, [orders, searchQuery, selectedFilter])


    // Pagination logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    //pagination handlers
    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }
    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1))
    }
    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    }


    //helper function to get payment status
    const getPaymentStatus = (orderStatus) => {
        const paidStatuses = ['Approved', 'In Production', 'Waiting for Shipment', 'In Transit', 'Delivered']
        return paidStatuses.includes(orderStatus) ? 'Paid' : 'Pending'
    }

    // Helper function to format data
    const formatDate = (dataString) => {
        const date = new Date(dataString)
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})
    }

    // toggle individual order selection
    const toggleOrderSelection = (orderId) => {
        setSelectedOrders (prev => 
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        )
    }

    // toggle select all orders
    const toggleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length) {
            setSelectedOrders([])
        } else {
            setSelectedOrders(filteredOrders.map(order => order.orderid))
        }
    }


    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push("...", totalPages)

            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...")
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }

            } else {
                pages.push(1)
                pages.push('...')
                pages.push(currentPage - 1)
                pages.push(currentPage)
                pages.push(currentPage + 1)
                pages.push('...')
                pages.push(totalPages)
            }
        
        }
        return pages
    }

    if (loading) {
        return (
            <div className='flex w-full bg-gray-100'>
                <main className='flex-1 p-6 flex items-center justify-center min-h-screen'>
                    <div className='text-center'>
                        <LoadingSpinner size="lg" text="Loading orders..." />
                    </div>
                </main>
            </div>
        )
    }

    if (error) {
        return (
            <div className='flex w-full bg-gray-100'>
                <main className='flex-1 p-6'>
                    <div className='flex item-center justify-center h-96'>
                        <div className='text-center bg-white p-8 rounded-lg shadow-lg'>
                            <p className='text-xl text-red-600'>Error loading orders</p>
                            <p className='mt-2 text-gray-600'>{error}</p>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex w-full bg-gray-100">
            {/* Main content */}
            <main className="flex-1 p-6">
                <h1 className="text-4xl font-bold mb-6">Orders</h1>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between mb-6">
                    {/* Status Filter */}
                    <div className="flex gap-3">
                        <button onClick={() => setSelectedFilter('All')}
                            className={`cursor-pointer px-3 md:px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm md:text-base ${
                                selectedFilter === 'All' ? 'bg-yellow-400' : 'bg-indigo-200'
                            }`}>
                            All
                        </button>
                        <button onClick={() => setSelectedFilter('Orders')}
                            className={`cursor-pointer px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm md:text-base ${
                                selectedFilter === 'Orders' ? 'bg-yellow-400' : 'bg-indigo-200'
                            }`}>
                            Orders
                        </button>
                        <button onClick={() => setSelectedFilter('Order Requests')}
                            className={`cursor-pointer px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm md:text-base ${
                                selectedFilter === 'Order Requests' ? 'bg-yellow-400' : 'bg-indigo-200'
                            }`}>
                            Order Request
                        </button>
                    </div>

                    {/* Date Range Filter */}
                    <div className="flex items-center gap-3">
                        <div className='flex item-center border rounded px-3 py-2 bg-white w-full md:w-auto'>
                            <Search size={18} className='text-gray-500 mr-2 flex-shrink-0' />
                            <input 
                                type="text" 
                                placeholder='Search Orders...'
                                className='outline-none text-sm w-full md:w-64'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                        <thead className="bg-[#191716] text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedOrders.length === filteredOrders.length &&
                                            filteredOrders.length > 0}
                                            onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-4 py-3 text-left">Order Number</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Customer</th>
                                <th className="px-4 py-3 text-left">Payment</th>
                                <th className="px-4 py-3 text-left">Total</th>
                                <th className="px-4 py-3 text-left">Delivery</th>
                                <th className="px-4 py-3 text-left">Quantity</th>
                                <th className="px-4 py-3 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                currentOrders.map((order) => {
                                    const paymentStatus = getPaymentStatus(order.orderstatus);
                                    const isPaid = paymentStatus === 'Paid';
                                    
                                    return (
                                        <tr key={order.orderid} className="border-t hover:bg-gray-50">
                                            <td className="px-2 md:px-4 py-3">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedOrders.includes(order.orderid)}
                                                    onChange={() => toggleOrderSelection(order.orderid)}
                                                />
                                            </td>
                                            <td className="px-2 md:px-4 py-3 font-medium text-xs md:text-sm">
                                                ORD-{order.orderid.slice(0, 8).toUpperCase()}
                                            </td>
                                            <td className="px-2 md:px-4 py-3 text-xs md:text-sm">{formatDate(order.datecreated)}</td>
                                            <td className="px-2 md:px-4 py-3">
                                                <div>
                                                    <div className="font-medium text-xs md:text-sm">{order.contactperson}</div>
                                                    <div className="text-xs text-gray-500">{order.companyname}</div>
                                                </div>
                                            </td>
                                            <td className="px-2 md:px-4 py-3">
                                                <span
                                                    className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                                                        isPaid
                                                            ? "bg-green-100 text-green-700 border border-green-500"
                                                            : "bg-yellow-100 text-yellow-700 border border-yellow-500"
                                                    }`}
                                                >
                                                    {paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-2 md:px-4 py-3 font-medium text-xs md:text-sm">
                                                {order.totalprice 
                                                    ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` 
                                                    : '₱0.00'
                                                }
                                            </td>
                                            <td className="px-2 md:px-4 py-3">
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                    {order.orderstatus}
                                                </span>
                                            </td>
                                            <td className="px-2 md:px-4 py-3 text-xs md:text-sm">{order.quantity}x</td>
                                            <td className="px-2 md:px-4 py-3">
                                                <Link 
                                                    to={`/orderdetailOM/${order.orderid}`}
                                                    className="bg-yellow-400 px-3 md:px-4 py-1 rounded hover:bg-yellow-500 font-medium inline-block text-xs md:text-sm"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            {/* {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const paymentStatus = getPaymentStatus(order.orderstatus);
                                    const isPaid = paymentStatus === 'Paid';
                                    
                                    return (
                                        <tr key={order.orderid} className="border-t hover:bg-gray-50">
                                            <td className="px-2 md:px-4 py-3">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedOrders.includes(order.orderid)}
                                                    onChange={() => toggleOrderSelection(order.orderid)}
                                                />
                                            </td>
                                            <td className="px-2 md:px-4 py-3 font-medium text-xs md:text-sm">
                                                ORD-{order.orderid.slice(0, 8).toUpperCase()}
                                            </td>
                                            <td className="px-2 md:px-4 py-3 text-xs md:text-sm">{formatDate(order.datecreated)}</td>
                                            <td className="px-2 md:px-4 py-3">
                                                <div>
                                                    <div className="font-medium text-xs md:text-sm">{order.contactperson}</div>
                                                    <div className="text-xs text-gray-500">{order.companyname}</div>
                                                </div>
                                            </td>
                                            <td className="px-2 md:px-4 py-3">
                                                <span
                                                    className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                                                        isPaid
                                                            ? "bg-green-100 text-green-700 border border-green-500"
                                                            : "bg-yellow-100 text-yellow-700 border border-yellow-500"
                                                    }`}
                                                >
                                                    {paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-2 md:px-4 py-3 font-medium text-xs md:text-sm">
                                                {order.totalprice 
                                                    ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` 
                                                    : '₱0.00'
                                                }
                                            </td>
                                            <td className="px-2 md:px-4 py-3">
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                    {order.orderstatus}
                                                </span>
                                            </td>
                                            <td className="px-2 md:px-4 py-3 text-xs md:text-sm">{order.quantity}x</td>
                                            <td className="px-2 md:px-4 py-3">
                                                <Link 
                                                    to={`/orderdetailOM/${order.orderid}`}
                                                    className="bg-yellow-400 px-3 md:px-4 py-1 rounded hover:bg-yellow-500 font-medium inline-block text-xs md:text-sm"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )} */}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                    <p className="text-xs md:text-sm text-gray-500">
                        Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                    </p>
                    
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`p-2 rounded border cursor-pointer ${
                                    currentPage === 1 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-white hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            
                            <div className="flex gap-1">
                                {getPageNumbers().map((page, index) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`px-3 py-2 rounded text-sm cursor-pointer ${
                                                currentPage === page
                                                    ? 'bg-[#E6AF2E] text-white font-medium'
                                                    : 'bg-white hover:bg-gray-50 text-gray-700 border'
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
                                className={`p-2 rounded border cursor-pointer ${
                                    currentPage === totalPages 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-white hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default OrderPageOM