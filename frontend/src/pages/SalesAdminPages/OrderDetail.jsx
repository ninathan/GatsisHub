import React, { useState, useEffect } from "react";
import {
    Home,
    Package,
    ShoppingBag,
    Calendar,
    MessageSquare,
    ChevronDown,
    Check,
    CreditCard,
    FileSpreadsheet,
    FileText,
    Phone,
    Eye,
    Edit2
} from "lucide-react";
import logo from '../../images/logo.png'
import { Link, useNavigate, useLocation } from "react-router-dom";


const OrderDetail = () => {
    const [orderStatus, setOrderStatus] = useState("For Evaluation");
    const [validatedPrice, setValidatedPrice] = useState("");
    const [isEditingPrice, setIsEditingPrice] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Get orderId from navigation state if available
    useEffect(() => {
        if (location.state?.orderId) {
            console.log('Viewing order from calendar:', location.state.orderId);
            // You can fetch order details here based on orderId if needed
        }
    }, [location.state]);


    const menuItems = [
        { name: "Dashboard", icon: Home },
        { name: "Orders", icon: Package, active: true },
        { name: "Products", icon: ShoppingBag },
        { name: "Calendar", icon: Calendar },
        { name: "Messages", icon: MessageSquare }
    ];

    const orderDetails = {
        orderNumber: "ORD-20250529-8743",
        orderQuantity: "130x",
        orderPlaced: "May 26, 2025",
        product: "MB7",
        color: "#4F46E5",
        materials: "Polypropylene (PP) 50% | Polycarbonate (PC) 50%"
    };

    const deliveryAddress = {
        name: "Juan Corporation",
        phone: "(+63) 9060069683",
        address: "San Juan City #551 Barangay SJ, Metro Manila, Quezon City"
    };

    const handleStatusChange = (e) => {
        setOrderStatus(e.target.value);
    };

    const handleApproveOrder = () => {
        console.log("Order approved");
    };

    const handlePaymentConfirm = () => {
        console.log("Payment confirmed");
    };

    const handleContactCustomer = () => {
        console.log("Contacting customer");
    };

    const handleExportXLS = () => {
        console.log("Exporting to XLS");
    };

    const handleExportPDF = () => {
        console.log("Exporting to PDF");
    };

    const handleViewProof = () => {
        console.log("Viewing proof of payment");
    };

    return (
        <div className="flex w-full bg-gray-50">
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Page Title */}
                <h1 className="text-4xl font-bold text-gray-800 mb-6">Orders</h1>

                {/* Order Details Card */}
                <div className="bg-white shadow-lg rounded-lg border border-gray-200">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b bg-[#35408E] text-white rounded-t-lg">
                        <h2 className="font-semibold text-lg">Order Details</h2>
                        <div className="relative">
                            <select
                                value={orderStatus}
                                onChange={handleStatusChange}
                                className="px-4 py-2 pr-10 rounded bg-white text-gray-800 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
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
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" size={16} />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Company Name */}
                        <h3 className="text-2xl font-bold text-gray-800">Juan Corporation</h3>

                        {/* Order Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 border border-gray-300 rounded-lg overflow-hidden">
                            <div className="p-3 border-b md:border-r border-gray-300 bg-gray-50">
                                <span className="text-sm text-gray-600">Order Number:</span>
                                <p className="font-semibold">{orderDetails.orderNumber}</p>
                            </div>
                            <div className="p-3 border-b border-gray-300 bg-gray-50">
                                <span className="text-sm text-gray-600">Order Quantity:</span>
                                <p className="font-semibold">{orderDetails.orderQuantity}</p>
                            </div>
                            <div className="p-3 border-b md:border-r border-gray-300">
                                <span className="text-sm text-gray-600">Order Placed:</span>
                                <p className="font-semibold">{orderDetails.orderPlaced}</p>
                            </div>
                            <div className="p-3 border-b border-gray-300">
                                <span className="text-sm text-gray-600">Product:</span>
                                <p className="font-semibold">{orderDetails.product}</p>
                            </div>
                            <div className="p-3 border-b md:border-r border-gray-300 bg-gray-50">
                                <span className="text-sm text-gray-600">Proof of Payment:</span>
                                <button
                                    onClick={handleViewProof}
                                    className="text-blue-600 hover:text-blue-800 underline font-medium flex items-center gap-1 mt-1"
                                >
                                    <Eye size={16} />
                                    View proof of payment
                                </button>
                            </div>
                            <div className="p-3 border-b border-gray-300 bg-gray-50">
                                <span className="text-sm text-gray-600">Color:</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div
                                        className="w-6 h-6 rounded border-2 border-gray-400"
                                        style={{ background: orderDetails.color }}
                                    />
                                    <span className="font-semibold">{orderDetails.color}</span>
                                </div>
                            </div>
                            <div className="p-3 md:col-span-2">
                                <span className="text-sm text-gray-600">Material Selected:</span>
                                <p className="font-semibold">{orderDetails.materials}</p>
                            </div>
                        </div>

                        {/* Validated Price */}
                        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                            <label className="font-semibold text-gray-800 block mb-2">Validated Price:</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={validatedPrice}
                                    onChange={(e) => setValidatedPrice(e.target.value)}
                                    disabled={!isEditingPrice}
                                    className="border border-gray-300 rounded px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                                    placeholder="Enter validated price"
                                />
                                <button
                                    onClick={() => setIsEditingPrice(!isEditingPrice)}
                                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                >
                                    <Edit2 size={16} />
                                    {isEditingPrice ? "Save" : "Edit"}
                                </button>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="border border-gray-300 rounded-lg p-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Delivery Address</h3>
                            <p className="font-semibold text-gray-800">
                                {deliveryAddress.name} | {deliveryAddress.phone}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                {deliveryAddress.address}
                            </p>
                        </div>

                        {/* Images & Notes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border-2 border-gray-300 rounded-lg p-4 flex items-center justify-center bg-gray-50 min-h-[200px]">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/4/42/Clothes_hanger_black.jpg"
                                    alt="Product Preview"
                                    className="max-h-48 object-contain"
                                />
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center text-gray-400 bg-gray-50 min-h-[200px]">
                                <p className="text-center">Note or Instruction</p>
                            </div>
                        </div>

                        {/* Attached File */}
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-800">Attached File:</span>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2">
                                <FileText size={16} />
                                Design.pdf
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={handleApproveOrder}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <Check size={18} />
                                Approve Order
                            </button>
                            <button
                                onClick={handlePaymentConfirm}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <CreditCard size={18} />
                                Payment Confirm
                            </button>
                            <button
                                onClick={handleExportXLS}
                                className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <FileSpreadsheet size={18} />
                                Export XLS
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <FileText size={18} />
                                Export PDF
                            </button>
                            <button
                                onClick={handleContactCustomer}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <Phone size={18} />
                                Contact Customer
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                back
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderDetail;