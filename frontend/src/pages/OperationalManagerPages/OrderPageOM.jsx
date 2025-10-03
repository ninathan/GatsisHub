import React from 'react'
import { Search, Filter } from "lucide-react";
import { Link } from 'react-router-dom'
import logo from '../../images/logo.png'

const OrderPageOM = () => {
    const orders = [
        {
            id: "ORD-20250529-8743",
            date: "June 26, 2025",
            customer: "Juan Dela Cruz",
            payment: "Paid",
            total: "PHP 100,000.00",
            delivery: "N/A",
            qty: 5,
            status: "paid",
        },
        {
            id: "ORD-20250529-8743",
            date: "June 26, 2025",
            customer: "Juan Dela Cruz",
            payment: "Pending",
            total: "PHP 100,000.00",
            delivery: "For Evaluation",
            qty: 5,
            status: "pending",
        },
    ];
    return (
        <div className="flex w-full bg-gray-100">
            {/* Main content */}
            <main className="flex-1 p-6">
                <h1 className="text-4xl font-bold mb-6">Orders</h1>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between mb-6">
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-yellow-400 rounded-lg font-medium">
                            All
                        </button>
                        <button className="px-4 py-2 bg-gray-200 rounded-lg">
                            Orders
                        </button>
                        <button className="px-4 py-2 bg-gray-200 rounded-lg">
                            Order Request
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <select className="border px-3 py-2 rounded">
                            <option>May - June</option>
                            <option>July - Aug</option>
                        </select>

                        <div className="flex items-center border rounded px-3 py-2">
                            <Search size={18} className="text-gray-500 mr-2" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="outline-none text-sm"
                            />
                        </div>

                        <button className="flex items-center gap-1 border px-3 py-2 rounded hover:bg-gray-100">
                            <Filter size={18} />
                            Filter
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#35408E] text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input type="checkbox" />
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
                            {orders.map((order, idx) => (
                                <tr key={idx} className="border-t">
                                    <td className="px-4 py-3">
                                        <input type="checkbox" />
                                    </td>
                                    <td className="px-4 py-3">{order.id}</td>
                                    <td className="px-4 py-3">{order.date}</td>
                                    <td className="px-4 py-3">{order.customer}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === "paid"
                                                    ? "bg-green-100 text-green-700 border border-green-500"
                                                    : "bg-yellow-100 text-yellow-700 border border-yellow-500"
                                                }`}
                                        >
                                            {order.payment}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{order.total}</td>
                                    <td className="px-4 py-3">{order.delivery}</td>
                                    <td className="px-4 py-3">{order.qty}</td>
                                    <td className="px-4 py-3">
                                        <Link to='/orderdetail' className="bg-yellow-400 px-4 py-1 rounded hover:bg-yellow-500 font-medium">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-500">Showing 1–20 of 15</p>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                className="w-8 h-8 flex items-center justify-center border rounded hover:bg-indigo-100"
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default OrderPageOM