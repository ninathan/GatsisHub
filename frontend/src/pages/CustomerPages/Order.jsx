import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Download, CreditCard } from 'lucide-react';
import logo from '../../images/logo.png'
import { Link } from 'react-router-dom';


const Order = () => {
    const [activeTab, setActiveTab] = useState('All Orders');
    const [expandedOrder, setExpandedOrder] = useState(null);

    const [showProofModal, setShowProofModal] = useState(false);
    const [proofImage, setProofImage] = useState(null);

    const tabs = ['All Orders', 'Pending', 'Processing', 'Shipped', 'Completed'];

    const orders = [
        {
            id: 1,
            orderNumber: 'ORD-20250529-8743',
            customerName: 'Custom Order',
            status: 'For Evaluation',
            statusColor: 'bg-yellow-400',
            price: '₱0',
            details: {
                company: 'Juan Corporation',
                orderPlaced: 'May 26, 2025',
                quantity: '130x',
                product: 'MB7',
                color: '#4F46E5',
                materials: [
                    { name: 'Polypropylene (PP)', percentage: '50%' },
                    { name: 'Polycarbonate (PC)', percentage: '50%' }
                ],
                deliveryAddress: {
                    name: 'Juan Corporation',
                    phone: '(+63) 9060069683',
                    address: 'San Juan City #551 Barangay SJ, Metro Manila,Quezon City,'
                },
                notesAndInstruction: '',
                designFile: 'Design.pdf'
            }
        },
        {
            id: 2,
            orderNumber: 'ORD-20250529-8743',
            customerName: 'Custom Order',
            status: 'Complete',
            statusColor: 'bg-green-500',
            price: '₱100,000.00',
            details: {
                company: 'Juan Corporation',
                orderPlaced: 'May 26, 2025',
                quantity: '130x',
                product: 'MB7',
                color: '#4F46E5',
                materials: [
                    { name: 'Polypropylene (PP)', percentage: '50%' },
                    { name: 'Polycarbonate (PC)', percentage: '50%' }
                ],
                deliveryAddress: {
                    name: 'Juan Corporation',
                    phone: '(+63) 9060069683',
                    address: 'San Juan City #551 Barangay SJ, Metro Manila,Quezon City,'
                },
                notesAndInstruction: '',
                designFile: 'Design.pdf'
            }
        }
    ];

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const openProofModal = (imageUrl) => {
        setProofImage(imageUrl);
        setShowProofModal(true);
    };

    const closeProofModal = () => {
        setShowProofModal(false);
        setProofImage(null);
    };
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Title */}
                <h1 className="text-5xl font-bold text-center mb-12">My Orders</h1>

                {/* Tabs */}
                <div className="flex justify-center gap-8 mb-8">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-xl pb-2 transition-all ${activeTab === tab
                                    ? 'border-b-4 border-yellow-400 font-semibold'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-3 grid grid-cols-12 gap-4 items-center font-semibold border-b">
                                <div className="col-span-3">Order details</div>
                                <div className="col-span-3 text-center">Order Number</div>
                                <div className="col-span-2 text-center">Status</div>
                                <div className="col-span-3 text-center">Price</div>
                                <div className="col-span-1"></div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-12 gap-4 items-center mb-4">
                                    {/* Product Image & Name */}
                                    <div className="col-span-3 flex items-center gap-4">
                                        <div className="w-16 h-16 border-2 border-gray-300 rounded flex items-center justify-center bg-white">
                                            <span className="text-3xl">🪝</span>
                                        </div>
                                        <span className="font-medium">{order.customerName}</span>
                                    </div>

                                    {/* Order Number */}
                                    <div className="col-span-3 text-center">
                                        <span>{order.orderNumber}</span>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 flex justify-center">
                                        <span className={`${order.statusColor} text-black px-4 py-1 rounded font-semibold text-sm`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-3 text-center">
                                        <span className="text-xl font-semibold">{order.price}</span>
                                    </div>

                                    {/* Expand Button */}
                                    <div className="col-span-1 flex justify-end">
                                        <button
                                            onClick={() => toggleExpand(order.id)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-all"
                                        >
                                            <ChevronDown
                                                size={24}
                                                className={`transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrder === order.id && (
                                    <div className="border-t pt-6">
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* Left Column - Order Details */}
                                            <div>
                                                <h3 className="text-xl font-bold mb-4">{order.details.company}</h3>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Order Number:</span>
                                                        <span>{order.orderNumber}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Order placed:</span>
                                                        <span>{order.details.orderPlaced}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Order Quantity:</span>
                                                        <span>{order.details.quantity}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Product:</span>
                                                        <span>{order.details.product}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-semibold">Color:</span>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-6 h-6 rounded border border-gray-300"
                                                                style={{ backgroundColor: order.details.color }}
                                                            ></div>
                                                            <span>{order.details.color}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Material:</span>
                                                        <div className="text-right">
                                                            {order.details.materials.map((material, idx) => (
                                                                <div key={idx}>
                                                                    {material.name} {material.percentage}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column - Delivery Address */}
                                            <div>
                                                <h3 className="text-xl font-bold mb-4">Delivery Address</h3>
                                                <div className="text-sm mb-4">
                                                    <p className="font-semibold">{order.details.deliveryAddress.name}</p>
                                                    <p>{order.details.deliveryAddress.phone}</p>
                                                    <p className="text-gray-600">{order.details.deliveryAddress.address}</p>
                                                </div>

                                                <div className="border rounded-lg p-4 bg-gray-50 mb-3">
                                                    <p className="text-xs text-gray-500 text-center">Notes and Instruction</p>
                                                </div>

                                                <button className="w-full bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2 text-sm font-semibold hover:bg-red-700">
                                                    <FileText size={16} />
                                                    {order.details.designFile}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 mt-6">
                                            <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-semibold">
                                                <Download size={18} />
                                                Download Invoice
                                            </button>
                                            <button
                                                onClick={() => openProofModal('https://images.unsplash.com/photo-1554224311-beee460c201f?w=400')}
                                                className="bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-800 transition-colors flex items-center gap-2 text-sm font-semibold"
                                            >
                                                <FileText size={18} />
                                                Proof of Payment
                                            </button>
                                            <Link to="/payment" className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition-colors flex items-center gap-2 text-sm font-semibold">
                                                <CreditCard size={18} />
                                                Payment
                                            </Link>
                                            <button className="bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-800 transition-colors flex items-center gap-2 text-sm font-semibold">
                                                <MessageCircle size={18} />
                                                Contact Support
                                            </button>
                                            {order.status === 'For Evaluation' && (
                                                <button className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors text-sm font-semibold">
                                                    Cancel Order
                                                </button>
                                            )}
                                            {order.status === 'Complete' && (
                                                <button className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition-colors text-sm font-semibold">
                                                    Rate
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Proof of Payment Modal */}
            {showProofModal && (
                <div className="fixed inset-0 bg-[rgba(143,143,143,0.65)] flex items-center justify-center z-50 p-4">
                    <div className="bg-[#35408E] rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-center py-4 relative">
                            <div className="w-12 h-12  rounded-full flex items-center justify-center">
                                <div className="flex items-center justify-center">
                                    <img src={logo} alt="Logo" className="w-20 h-12" />
                                </div>
                            </div>
                        </div>

                        {/* Modal Title */}
                        <div className="text-center pb-6">
                            <h2 className="text-white text-2xl font-semibold">Proof of payment</h2>
                        </div>

                        {/* Image Container */}
                        <div className="bg-white mx-8 rounded-lg p-4 mb-6">
                            <img
                                src={proofImage}
                                alt="Proof of Payment"
                                className="w-full h-auto rounded"
                            />
                        </div>

                        {/* Back Button */}
                        <div className="flex justify-center pb-8">
                            <button
                                onClick={closeProofModal}
                                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-12 py-2 rounded transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Order