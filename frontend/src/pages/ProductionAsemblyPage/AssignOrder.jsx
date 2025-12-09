import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, MoreVertical, ChevronDown } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AssignOrder = () => {
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [dateFilter, setDateFilter] = useState('May - June');
    const [searchQuery, setSearchQuery] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        // Get employee data from localStorage
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
                console.error('Error fetching orders:', data.error);
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching employee orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Production':
                return 'bg-yellow-400 text-black';
            case 'Approved':
                return 'bg-green-500 text-white';
            case 'Waiting for Shipment':
                return 'bg-blue-500 text-white';
            case 'Completed':
                return 'bg-green-600 text-white';
            default:
                return 'bg-gray-400 text-white';
        }
    };

    const filteredOrders = orders.filter(order => {
        // Filter by status
        if (filterStatus === 'Assign Orders') {
            return order.orderstatus === 'In Production' || order.orderstatus === 'Approved';
        }
        
        // Search filter
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

    const handleViewOrder = (orderId) => {
        console.log('Viewing order:', orderId);
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-xl text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                    <p className="text-xl text-red-600 mb-4">Not logged in</p>
                    <p className="text-gray-600">Please log in to view your assigned orders.</p>
                </div>
            </div>
        );
    }

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
                                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                                    className="w-4 h-4 cursor-pointer"
                                />
                            </th>
                            <th className="p-3 text-left font-semibold">Order Number</th>
                            <th className="p-3 text-left font-semibold">Date</th>
                            <th className="p-3 text-left font-semibold">Customer</th>
                            <th className="p-3 text-left font-semibold">Status</th>
                            <th className="p-3 text-left font-semibold">Total</th>
                            <th className="p-3 text-left font-semibold">Address</th>
                            <th className="p-3 text-left font-semibold">Quantity</th>
                            <th className="p-3 text-left font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="p-8 text-center text-gray-500">
                                    {searchQuery ? 'No orders found matching your search.' : 'No orders assigned to you yet.'}
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.orderid} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.includes(order.orderid)}
                                            onChange={() => handleSelectOrder(order.orderid)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-3 font-medium">ORD-{order.orderid.slice(0, 8).toUpperCase()}</td>
                                    <td className="p-3 text-gray-600">{formatDate(order.datecreated)}</td>
                                    <td className="p-3 text-gray-600">{order.companyname || order.contactperson}</td>
                                    <td className="p-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderstatus)}`}>
                                            {order.orderstatus}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-600">
                                        {order.totalprice ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : 'N/A'}
                                    </td>
                                    <td className="p-3 text-gray-600">
                                        {order.deliveryaddress ? 
                                            (typeof order.deliveryaddress === 'string' ? order.deliveryaddress.substring(0, 30) + '...' : order.deliveryaddress.address?.substring(0, 30) + '...') 
                                            : 'N/A'
                                        }
                                    </td>
                                    <td className="p-3 text-gray-600">{order.quantity}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to="/vieworder"
                                                state={{ order }}
                                                className="bg-[#E6AF2E] hover:bg-[#c49723] text-[#191716] px-4 py-1 rounded transition-colors text-sm font-medium"
                                            >
                                                View
                                            </Link>
                                            <button className="text-gray-600 hover:text-gray-800 p-1">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600">
                    Showing {filteredOrders.length > 0 ? '1' : '0'}-{filteredOrders.length} of {filteredOrders.length}
                </span>
                <div className="flex gap-1">
                    <button className="px-3 py-1 bg-indigo-700 text-white rounded hover:bg-indigo-800 transition-colors">
                        1
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AssignOrder