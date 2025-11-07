import React, { useState, useEffect, Suspense } from 'react';
import { ChevronDown, MessageCircle, Eye } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Download, CreditCard } from 'lucide-react';
import logo from '../../images/logo.png'
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HangerScene from '../../components/Checkout/HangerScene';


const Order = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('All Orders');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [show3DModal, setShow3DModal] = useState(false);
    const [selected3DDesign, setSelected3DDesign] = useState(null);

    const [showProofModal, setShowProofModal] = useState(false);
    const [proofImage, setProofImage] = useState(null);

    const tabs = ['All Orders', 'Pending', 'Processing', 'Shipped', 'Completed'];

    // Fetch orders when component mounts
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || !user.userid) {
                setError('User not logged in');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`https://gatsis-hub.vercel.app/orders/user/${user.userid}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                console.log('📦 Fetched orders:', data.orders);
                console.log('📍 First order delivery address:', data.orders[0]?.deliveryaddress);
                setOrders(data.orders || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    // Helper function to get status color
    const getStatusColor = (status) => {
        const statusColors = {
            'Pending': 'bg-yellow-400',
            'Processing': 'bg-blue-400',
            'Shipped': 'bg-purple-400',
            'Completed': 'bg-green-500',
            'Cancelled': 'bg-red-500'
        };
        return statusColors[status] || 'bg-gray-400';
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Helper function to format materials
    const formatMaterials = (materialsObj) => {
        if (!materialsObj || typeof materialsObj !== 'object') return [];
        return Object.entries(materialsObj).map(([name, percentage]) => ({
            name,
            percentage: `${Math.round(percentage)}%`
        }));
    };

    // Filter orders based on active tab
    const filteredOrders = orders.filter(order => {
        if (activeTab === 'All Orders') return true;
        return order.orderstatus === activeTab;
    });

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

    const open3DModal = (designData) => {
        try {
            const design = typeof designData === 'string' ? JSON.parse(designData) : designData;
            setSelected3DDesign(design);
            setShow3DModal(true);
        } catch (error) {
            console.error('Error parsing 3D design data:', error);
        }
    };

    const close3DModal = () => {
        setShow3DModal(false);
        setSelected3DDesign(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto"></div>
                    <p className="mt-4 text-xl text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                    <p className="text-xl text-red-600 mb-4">Error loading orders</p>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

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
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                            <p className="text-2xl text-gray-600">No orders found</p>
                            <p className="text-gray-500 mt-2">
                                {activeTab === 'All Orders' 
                                    ? 'You haven\'t placed any orders yet.' 
                                    : `No orders with status "${activeTab}"`
                                }
                            </p>
                            <Link to="/checkout" className="inline-block mt-4 bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-500 font-semibold">
                                Place an Order
                            </Link>
                        </div>
                    ) : (
                        filteredOrders.map(order => {
                            const materials = formatMaterials(order.materials);
                            const statusColor = getStatusColor(order.orderstatus);
                            
                            return (
                                <div key={order.orderid} className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                                        <span className="font-medium">{order.companyname}</span>
                                    </div>

                                    {/* Order Number */}
                                    <div className="col-span-3 text-center">
                                        <span>ORD-{order.orderid.slice(0, 8).toUpperCase()}</span>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 flex justify-center">
                                        <span className={`${statusColor} text-black px-4 py-1 rounded font-semibold text-sm`}>
                                            {order.orderstatus}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-3 text-center">
                                        <span className="text-xl font-semibold">
                                            {order.totalprice ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '₱0.00'}
                                        </span>
                                    </div>

                                    {/* Expand Button */}
                                    <div className="col-span-1 flex justify-end">
                                        <button
                                            onClick={() => toggleExpand(order.orderid)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-all"
                                        >
                                            <ChevronDown
                                                size={24}
                                                className={`transition-transform ${expandedOrder === order.orderid ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrder === order.orderid && (
                                    <div className="border-t pt-6">
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* Left Column - Order Details */}
                                            <div>
                                                <h3 className="text-xl font-bold mb-4">{order.companyname}</h3>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Order Number:</span>
                                                        <span>ORD-{order.orderid.slice(0, 8).toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Order placed:</span>
                                                        <span>{formatDate(order.datecreated)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Order Quantity:</span>
                                                        <span>{order.quantity}x</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Product:</span>
                                                        <span>{order.hangertype}</span>
                                                    </div>
                                                    {order.selectedcolor && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-semibold">Color:</span>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-6 h-6 rounded border border-gray-300"
                                                                    style={{ backgroundColor: order.selectedcolor }}
                                                                ></div>
                                                                <span>{order.selectedcolor}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {materials.length > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold">Material:</span>
                                                            <div className="text-right">
                                                                {materials.map((material, idx) => (
                                                                    <div key={idx}>
                                                                        {material.name} {material.percentage}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {order.customtext && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-semibold">Custom Text:</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="italic">"{order.customtext}"</span>
                                                                {order.textcolor && (
                                                                    <div
                                                                        className="w-4 h-4 rounded border border-gray-300"
                                                                        style={{ backgroundColor: order.textcolor }}
                                                                        title={order.textcolor}
                                                                    ></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {order.customlogo && (
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold">Custom Logo:</span>
                                                            <span>✓ Included</span>
                                                        </div>
                                                    )}
                                                    {order.designoption && (
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold">Design Option:</span>
                                                            <span className="capitalize">{order.designoption}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Column - Contact & Address Information */}
                                            <div>
                                                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                                                <div className="text-sm mb-4">
                                                    <p className="font-semibold">{order.contactperson}</p>
                                                    <p>{order.contactphone}</p>
                                                    <p className="text-gray-600">{order.companyname}</p>
                                                </div>

                                                {/* Delivery Address Section */}
                                                <h3 className="text-xl font-bold mb-2 mt-6">Delivery Address</h3>
                                                <div className="text-sm mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    {order.deliveryaddress ? (
                                                        <p className="text-gray-700">
                                                            {typeof order.deliveryaddress === 'object' 
                                                                ? order.deliveryaddress.address 
                                                                : order.deliveryaddress}
                                                        </p>
                                                    ) : (
                                                        <p className="text-gray-400 italic">No address provided</p>
                                                    )}
                                                </div>

                                                {/* Notes Section */}
                                                {order.deliverynotes && (
                                                    <>
                                                        <h3 className="text-xl font-bold mb-2 mt-4">Notes and Instructions</h3>
                                                        <div className="border rounded-lg p-3 bg-gray-50 mb-3">
                                                            <p className="text-sm text-gray-700">{order.deliverynotes}</p>
                                                        </div>
                                                    </>
                                                )}

                                                {/* View 3D Design Button */}
                                                {order.threeddesigndata && (
                                                    <button 
                                                        onClick={() => open3DModal(order.threeddesigndata)}
                                                        className="w-full bg-indigo-600 text-white py-2 rounded flex items-center justify-center gap-2 text-sm font-semibold hover:bg-indigo-700 mt-3"
                                                    >
                                                        <Eye size={16} />
                                                        View 3D Design
                                                    </button>
                                                )}

                                                {/* Design File Button */}
                                                {order.customdesignurl && (
                                                    <button className="w-full bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2 text-sm font-semibold hover:bg-red-700 mt-3">
                                                        <FileText size={16} />
                                                        View Design File
                                                    </button>
                                                )}
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
                                            {order.orderstatus === 'Pending' && (
                                                <button className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors text-sm font-semibold">
                                                    Cancel Order
                                                </button>
                                            )}
                                            {order.orderstatus === 'Completed' && (
                                                <button className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition-colors text-sm font-semibold">
                                                    Rate
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                            );
                        })
                    )}
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

            {/* 3D Design Viewer Modal */}
            {show3DModal && selected3DDesign && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-white text-2xl font-semibold">3D Design Preview</h2>
                                <p className="text-indigo-200 text-sm mt-1">Interactive view of your customized hanger</p>
                            </div>
                            <button
                                onClick={close3DModal}
                                className="text-white hover:text-gray-200 transition-colors text-3xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* 3D Viewer */}
                        <div className="bg-white p-6">
                            <div className="w-full h-[500px] bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
                                <Suspense fallback={
                                    <div className='w-full h-full flex items-center justify-center'>
                                        <div className='text-center'>
                                            <div className='text-6xl mb-4'>⏳</div>
                                            <p className='text-lg text-gray-600'>Loading 3D Design...</p>
                                        </div>
                                    </div>
                                }>
                                    <HangerScene
                                        color={selected3DDesign.color || '#4F46E5'}
                                        hangerType={selected3DDesign.hangerType || 'MB7'}
                                        customText={selected3DDesign.customText || ''}
                                        textColor={selected3DDesign.textColor || '#000000'}
                                        textPosition={selected3DDesign.textPosition || { x: 0, y: 0, z: 0.49 }}
                                        textSize={selected3DDesign.textSize || 0.5}
                                        logoPreview={selected3DDesign.logoPreview || null}
                                        logoPosition={selected3DDesign.logoPosition || { x: 0, y: 0.5, z: 0.49 }}
                                        logoSize={selected3DDesign.logoSize || 0.3}
                                    />
                                </Suspense>
                            </div>

                            {/* Design Details */}
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50 p-3 rounded">
                                    <span className="font-semibold text-gray-700">Hanger Type:</span>
                                    <span className="ml-2">{selected3DDesign.hangerType}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded flex items-center">
                                    <span className="font-semibold text-gray-700">Color:</span>
                                    <div className="ml-2 flex items-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded border border-gray-300"
                                            style={{ backgroundColor: selected3DDesign.color }}
                                        ></div>
                                        <span>{selected3DDesign.color}</span>
                                    </div>
                                </div>
                                {selected3DDesign.customText && (
                                    <>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <span className="font-semibold text-gray-700">Custom Text:</span>
                                            <span className="ml-2">{selected3DDesign.customText}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded flex items-center">
                                            <span className="font-semibold text-gray-700">Text Color:</span>
                                            <div className="ml-2 flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded border border-gray-300"
                                                    style={{ backgroundColor: selected3DDesign.textColor }}
                                                ></div>
                                                <span>{selected3DDesign.textColor}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                💡 Drag to rotate • Scroll to zoom • Right-click to pan
                            </p>
                            <button
                                onClick={close3DModal}
                                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-2 rounded transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Order