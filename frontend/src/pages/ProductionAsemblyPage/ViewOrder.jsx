import React, { useState } from "react";
import {
    Home,
    Package,
    ShoppingBag,
    Calendar,
    MessageSquare,
    ChevronDown,
    Eye
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";


const ViewOrder = () => {
    // Static mock order data (frontend only)
    const mockOrder = {
        orderid: "1234567890abcdef",
        companyname: "Sample Company",
        quantity: 120,
        datecreated: "2024-12-01",
        hangertype: "Plastic Hanger",
        orderstatus: "For Evaluation",
        totalprice: 5000,
        deadline: "2024-12-20",
        materials: {
            ABS: 60,
            Wood: 40
        }
    };

    const [order, setOrder] = useState(mockOrder);
    const [orderStatus, setOrderStatus] = useState(mockOrder.orderstatus);
    const [validatedPrice, setValidatedPrice] = useState(mockOrder.totalprice);
    const [deadline, setDeadline] = useState(mockOrder.deadline);
    const [loading] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };
    return (
        <div className="flex w-full bg-gray-50">
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-800 mb-6">Orders</h1>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center h-96">
                        <LoadingSpinner size="xl" text="Loading..." />
                    </div>
                )}

                {/* Order Card */}
                {!loading && (
                    <div className="bg-white shadow-lg rounded-lg border border-gray-200">
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b bg-[#35408E] text-white rounded-t-lg">
                            <h2 className="font-semibold text-lg">Order Details</h2>

                            {/* Status Dropdown */}
                            <div className="relative">
                                <select
                                    value={orderStatus}
                                    onChange={(e) => setOrderStatus(e.target.value)}
                                    className="px-4 py-2 pr-10 rounded bg-white text-gray-800 cursor-pointer"
                                >
                                    <option>For Evaluation</option>
                                    <option>Waiting for Payment</option>
                                    <option>Approved</option>
                                    <option>In Production</option>
                                    <option>Waiting for Shipment</option>
                                    <option>In Transit</option>
                                    <option>Completed</option>
                                    <option>Cancelled</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Company Name */}
                            <h3 className="text-2xl font-bold text-gray-800">
                                {order.companyname}
                            </h3>

                            {/* Grid Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 border rounded-lg overflow-hidden">
                                <div className="p-3 border bg-gray-50">
                                    <span className="text-sm text-gray-600">Order Number:</span>
                                    <p className="font-semibold">
                                        ORD-{order.orderid.slice(0, 8).toUpperCase()}
                                    </p>
                                </div>

                                <div className="p-3 border bg-gray-50">
                                    <span className="text-sm text-gray-600">Order Quantity:</span>
                                    <p className="font-semibold">{order.quantity}x</p>
                                </div>

                                <div className="p-3 border">
                                    <span className="text-sm text-gray-600">Order Placed:</span>
                                    <p className="font-semibold">{formatDate(order.datecreated)}</p>
                                </div>

                                <div className="p-3 border">
                                    <span className="text-sm text-gray-600">Product:</span>
                                    <p className="font-semibold">{order.hangertype}</p>
                                </div>
                            </div>

                            {/* Materials */}
                            <div>
                                <h4 className="font-semibold text-lg">Materials</h4>
                                <p className="text-gray-700">
                                    {Object.entries(order.materials)
                                        .map(([mat, val]) => `${mat} ${val}%`)
                                        .join(" | ")}
                                </p>
                            </div>

                            {/* Price */}
                            <div>
                                <h4 className="font-semibold text-lg">Total Price</h4>
                                <input
                                    type="number"
                                    className="border rounded px-3 py-2 w-40"
                                    value={validatedPrice}
                                    onChange={(e) => setValidatedPrice(e.target.value)}
                                />
                            </div>

                            {/* Deadline */}
                            <div>
                                <h4 className="font-semibold text-lg">Deadline</h4>
                                <input
                                    type="date"
                                    className="border rounded px-3 py-2"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                />
                            </div>

                            {/* PDF / XLS Buttons */}
                            <div className="flex gap-4">
                                <button className="px-4 py-2 bg-gray-200 rounded-lg flex items-center gap-2">
                                    <Eye size={18} /> View 3D Model
                                </button>

                                <button className="px-4 py-2 bg-yellow-400 rounded-lg font-semibold">
                                    Export PDF
                                </button>

                                <button className="px-4 py-2 bg-green-400 rounded-lg font-semibold">
                                    Export XLS
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default ViewOrder