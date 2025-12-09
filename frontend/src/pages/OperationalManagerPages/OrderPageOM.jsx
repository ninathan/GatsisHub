import React from 'react'
import { useState, useEffect } from 'react'
import { Search, Filter, SearchCode } from "lucide-react";
import { Link } from 'react-router-dom'
import logo from '../../images/logo.png'
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

const OrderPageOM = () => {
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('All')
    const [selectedOrders, setSelectedOrders] = useState([])
    const [error, setError] = useState(null)

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
    }, [orders, searchQuery, selectedFilter])

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
                            {filteredOrders.length === 0 ? (
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
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <p className="text-xs md:text-sm text-gray-500">Showing {filteredOrders.length} of {orders.length} orders.</p>
                </div>
            </main>
        </div>
    )
}

export default OrderPageOM