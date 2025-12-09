import React, { useState, useEffect, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Eye
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import HangerScene from "../../components/Checkout/HangerScene";

const ViewOrder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderFromState = location.state?.order;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [show3DModal, setShow3DModal] = useState(false);
    const [designData, setDesignData] = useState(null);

    useEffect(() => {
        if (orderFromState) {
            setOrder(orderFromState);
            
            // Parse 3D design data if available
            if (orderFromState.threeddesigndata) {
                try {
                    const parsed = typeof orderFromState.threeddesigndata === 'string' 
                        ? JSON.parse(orderFromState.threeddesigndata)
                        : orderFromState.threeddesigndata;
                    setDesignData(parsed);
                } catch (error) {
                    console.error('Error parsing 3D design data:', error);
                }
            }
            
            setLoading(false);
        } else {
            // No order data, redirect back
            navigate('/assignorder');
        }
    }, [orderFromState, navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatMaterials = (materialsObj) => {
        if (!materialsObj) return 'N/A';
        try {
            const materials = typeof materialsObj === 'string' ? JSON.parse(materialsObj) : materialsObj;
            return Object.entries(materials)
                .map(([mat, val]) => `${mat} ${val}%`)
                .join(" | ");
        } catch (error) {
            return 'N/A';
        }
    };

    const handleView3D = () => {
        if (designData) {
            setShow3DModal(true);
        } else {
            alert('No 3D design data available for this order');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <LoadingSpinner size="xl" text="Loading order..." />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-xl text-gray-600">No order data found</p>
                    <button
                        onClick={() => navigate('/assignorder')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full bg-gray-50">
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Back Button and Title */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/assignorder')}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-4xl font-bold text-gray-800">Order Details</h1>
                </div>

                {/* Order Card */}
                {!loading && (
                    <div className="bg-white shadow-lg rounded-lg border border-gray-200">
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b bg-[#35408E] text-white rounded-t-lg">
                            <h2 className="font-semibold text-lg">Order Information</h2>
                            
                            {/* Status Badge (Read-only) */}
                            <div className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold">
                                {order.orderstatus}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Company Name */}
                            <h3 className="text-2xl font-bold text-gray-800">
                                {order.companyname || order.contactperson}
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

                                <div className="p-3 border bg-gray-50">
                                    <span className="text-sm text-gray-600">Contact Person:</span>
                                    <p className="font-semibold">{order.contactperson}</p>
                                </div>

                                <div className="p-3 border bg-gray-50">
                                    <span className="text-sm text-gray-600">Contact Phone:</span>
                                    <p className="font-semibold">{order.contactphone}</p>
                                </div>
                            </div>

                            {/* Materials */}
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Materials</h4>
                                <p className="text-gray-700">
                                    {formatMaterials(order.materials)}
                                </p>
                            </div>

                            {/* Color */}
                            {order.selectedcolor && (
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Color</h4>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded border-2 border-gray-300"
                                            style={{ backgroundColor: order.selectedcolor }}
                                        />
                                        <span className="text-gray-700">{order.selectedcolor}</span>
                                    </div>
                                </div>
                            )}

                            {/* Custom Text */}
                            {order.customtext && (
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Custom Text</h4>
                                    <p className="text-gray-700 italic">"{order.customtext}"</p>
                                    {order.textcolor && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-sm text-gray-600">Text Color:</span>
                                            <div
                                                className="w-8 h-8 rounded border border-gray-300"
                                                style={{ backgroundColor: order.textcolor }}
                                            />
                                            <span className="text-sm">{order.textcolor}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Price */}
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Total Price</h4>
                                <p className="text-2xl font-bold text-green-600">
                                    {order.totalprice ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : 'N/A'}
                                </p>
                            </div>

                            {/* Deadline */}
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Expected Deadline</h4>
                                <p className="text-xl font-semibold text-indigo-600">
                                    {formatDate(order.deadline)}
                                </p>
                            </div>

                            {/* Delivery Address */}
                            {order.deliveryaddress && (
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Delivery Address</h4>
                                    <p className="text-gray-700">
                                        {typeof order.deliveryaddress === 'string' 
                                            ? order.deliveryaddress 
                                            : order.deliveryaddress.address}
                                    </p>
                                </div>
                            )}

                            {/* Order Instructions */}
                            {order.orderinstructions && (
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Order Instructions</h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-gray-700">{order.orderinstructions}</p>
                                    </div>
                                </div>
                            )}

                            {/* Delivery Notes */}
                            {order.deliverynotes && (
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Delivery Notes</h4>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <p className="text-gray-700">{order.deliverynotes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 border-t">
                                <button 
                                    onClick={handleView3D}
                                    disabled={!designData}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <Eye size={18} /> View 3D Model
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3D Modal */}
                {show3DModal && designData && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-[#007BFF] px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-white text-2xl font-semibold">3D Design Preview</h2>
                                    <p className="text-white text-sm mt-1">Order: ORD-{order.orderid.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <button
                                    onClick={() => setShow3DModal(false)}
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
                                            color={designData.color || '#4F46E5'}
                                            hangerType={designData.hangerType || 'MB3'}
                                            customText={designData.customText || ''}
                                            textColor={designData.textColor || '#000000'}
                                            textPosition={designData.textPosition || { x: 0, y: 0, z: 0.49 }}
                                            textSize={designData.textSize || 0.5}
                                            logoPreview={designData.logoPreview || null}
                                            logoPosition={designData.logoPosition || { x: 0, y: 0.5, z: 0.49 }}
                                            logoSize={designData.logoSize || 0.3}
                                        />
                                    </Suspense>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-100 px-6 py-4 flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    💡 Drag to rotate • Scroll to zoom • Right-click to pan
                                </p>
                                <button
                                    onClick={() => setShow3DModal(false)}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-2 rounded transition-all duration-300 hover:scale-105"
                                >
                                    Close
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