import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, MoreVertical, ChevronDown } from 'lucide-react'

const AssignOrder = () => {
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [dateFilter, setDateFilter] = useState('May - June');
    const [searchQuery, setSearchQuery] = useState('');

    const orders = [
        {
            id: 1,
            orderNumber: 'ORD-20250529-8743',
            date: 'June 26, 2025',
            customer: 'Juan Dela Cruz',
            payment: 'In Production',
            total: 'PHP 100,000.00',
            delivery: 'N/A',
            quantity: 5
        },
        {
            id: 2,
            orderNumber: 'ORD-20250529-8743',
            date: 'June 26, 2025',
            customer: 'Juan Dela Cruz',
            payment: 'In Production',
            total: 'PHP 100,000.00',
            delivery: 'N/A',
            quantity: 5
        },
        {
            id: 3,
            orderNumber: 'ORD-20250529-8743',
            date: 'June 26, 2025',
            customer: 'Juan Dela Cruz',
            payment: 'In Production',
            total: 'PHP 100,000.00',
            delivery: 'N/A',
            quantity: 5
        },
        {
            id: 4,
            orderNumber: 'ORD-20250529-8743',
            date: 'June 26, 2025',
            customer: 'Juan Dela Cruz',
            payment: 'In Production',
            total: 'PHP 100,000.00',
            delivery: 'N/A',
            quantity: 5
        },
        {
            id: 5,
            orderNumber: 'ORD-20250529-8743',
            date: 'June 26, 2025',
            customer: 'Juan Dela Cruz',
            payment: 'In Production',
            total: 'PHP 100,000.00',
            delivery: 'N/A',
            quantity: 5
        },
        {
            id: 6,
            orderNumber: 'ORD-20250529-8743',
            date: 'June 26, 2025',
            customer: 'Juan Dela Cruz',
            payment: 'In Production',
            total: 'PHP 100,000.00',
            delivery: 'N/A',
            quantity: 5
        },
        {
            id: 7,
            orderNumber: 'ORD-20250529-8743',
            date: 'June 26, 2025',
            customer: 'Juan Dela Cruz',
            payment: 'In Production',
            total: 'PHP 100,000.00',
            delivery: 'N/A',
            quantity: 5
        },
        {
            id: 8,
            orderNumber: 'ORD-20250529-8743',
            date: 'June 26, 2025',
            customer: 'Juan Dela Cruz',
            payment: 'In Production',
            total: 'PHP 100,000.00',
            delivery: 'N/A',
            quantity: 5
        }
    ];
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedOrders(orders.map(order => order.id));
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

    const handleViewOrder = (orderId) => {
        console.log('Viewing order:', orderId);
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 p-6">
            {/* Page Title */}
            <h1 className="text-4xl font-bold mb-6">Orders</h1>

            {/* Filters and Controls */}
            <div className="flex justify-between items-center mb-4">
                {/*Filter buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('All')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'All'
                                ? 'bg-yellow-400 text-black'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('Assign Orders')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'Assign Orders'
                                ? 'bg-[#E6AF2E] text-[#191716] hover:bg-[#c49723]'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Assign Orders
                    </button>
                    <div className="relative">
                        <button className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2">
                            {dateFilter}
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>

                {/*Search and Filter */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#191716] text-white">
                            <th className="p-3 text-left">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selectedOrders.length === orders.length}
                                    className="w-4 h-4 cursor-pointer"
                                />
                            </th>
                            <th className="p-3 text-left font-semibold">Order Number</th>
                            <th className="p-3 text-left font-semibold">Date</th>
                            <th className="p-3 text-left font-semibold">Customer</th>
                            <th className="p-3 text-left font-semibold">Payment</th>
                            <th className="p-3 text-left font-semibold">Total</th>
                            <th className="p-3 text-left font-semibold">Delivery</th>
                            <th className="p-3 text-left font-semibold">Quantity</th>
                            <th className="p-3 text-left font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.includes(order.id)}
                                        onChange={() => handleSelectOrder(order.id)}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                </td>
                                <td className="p-3 font-medium">{order.orderNumber}</td>
                                <td className="p-3 text-gray-600">{order.date}</td>
                                <td className="p-3 text-gray-600">{order.customer}</td>
                                <td className="p-3">
                                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                                        {order.payment}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-600">{order.total}</td>
                                <td className="p-3 text-gray-600">{order.delivery}</td>
                                <td className="p-3 text-gray-600">{order.quantity}</td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            onClick={() => handleViewOrder(order.id)}
                                            className="bg-[#E6AF2E] hover:bg-[#c49723] text-[#191716] px-4 py-1 rounded transition-colors text-sm font-medium"
                                            to="/vieworder"
                                        >
                                            View
                                        </Link>
                                        <button className="text-gray-600 hover:text-gray-800 p-1">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600">Showing 1-20 of 15</span>
                <div className="flex gap-1">
                    <button className="px-3 py-1 bg-indigo-700 text-white rounded hover:bg-indigo-800 transition-colors">
                        1
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                        2
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                        3
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                        4
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                        5
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                        6
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                        7
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AssignOrder