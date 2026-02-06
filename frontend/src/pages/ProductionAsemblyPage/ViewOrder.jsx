import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Eye
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import HangerScene from "../../components/Checkout/HangerScene";
import { useRealtimeSingleOrder } from "../../hooks/useRealtimeSingleOrder";

const ViewOrder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderFromState = location.state?.order;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [show3DModal, setShow3DModal] = useState(false);
    const [designData, setDesignData] = useState(null);

    // Real-time order update handler
    const handleOrderUpdate = useCallback((payload) => {
        if (payload.eventType === 'UPDATE' && payload.new) {
            setOrder(payload.new);

            // Parse 3D design data if available
            if (payload.new.threeddesigndata) {
                try {
                    const parsed = typeof payload.new.threeddesigndata === 'string'
                        ? JSON.parse(payload.new.threeddesigndata)
                        : payload.new.threeddesigndata;
                    setDesignData(parsed);
                } catch (error) {
                    console.error('Error parsing 3D design data:', error);
                }
            }
        }
    }, []);

    // Subscribe to real-time order updates
    useRealtimeSingleOrder(order?.orderid, handleOrderUpdate);

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
                        <div className="flex justify-between items-center px-6 py-4 border-b bg-[#191716] text-white rounded-t-lg">
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
                    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] px-6 py-4 flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-6 h-6 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-white text-xl md:text-2xl font-bold">3D Design Preview</h2>
                                        <p className="text-white/90 text-sm mt-0.5">Order: ORD-{order.orderid.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShow3DModal(false)}
                                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* 3D Viewer Container */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 flex-1 overflow-auto">
                                <div className="bg-gradient-to-br from-[#191716] to-[#2d2a28] rounded-xl shadow-2xl overflow-hidden border-2 border-gray-300">
                                    <div className="w-full h-[300px] md:h-[500px] lg:h-[600px]">
                                        <Suspense fallback={
                                            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-[#191716] to-[#2d2a28]'>
                                                <div className='text-center'>
                                                    <div className="relative">
                                                        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
                                                            <svg className="animate-spin w-full h-full text-[#E6AF2E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <p className='text-base md:text-lg text-white font-semibold'>Loading 3D Design...</p>
                                                    <p className='text-sm text-gray-400 mt-2'>Please wait while we prepare the preview</p>
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

                                    {/* 3D Controls Info Bar */}
                                    <div className="bg-white/10 backdrop-blur-sm px-4 py-3 border-t border-white/20">
                                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-white text-xs md:text-sm">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                </svg>
                                                <span>Drag to rotate</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                                <span>Scroll to zoom</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                                </svg>
                                                <span>Right-click to pan</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Design Details Card */}
                                <div className="mt-6 bg-white rounded-xl shadow-md p-5 md:p-6 border-2 border-gray-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg className="w-5 h-5 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h3 className="text-lg font-bold text-gray-900">Design Specifications</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Hanger Type */}
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Hanger Model</p>
                                            <p className="text-base font-bold text-gray-900">{designData.hangerType}</p>
                                        </div>

                                        {/* Base Color */}
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Base Color</p>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                                                    style={{ backgroundColor: designData.color }}
                                                ></div>
                                                <span className="text-sm font-mono font-bold text-gray-900">{designData.color}</span>
                                            </div>
                                        </div>

                                        {/* Custom Text */}
                                        {designData.customText && (
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                                <p className="text-xs font-semibold text-blue-700 mb-1">Custom Text</p>
                                                <p className="text-base font-semibold text-blue-900">"{designData.customText}"</p>
                                            </div>
                                        )}

                                        {/* Text Color */}
                                        {designData.customText && (
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                                <p className="text-xs font-semibold text-blue-700 mb-1">Text Color</p>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                                                        style={{ backgroundColor: designData.textColor }}
                                                    ></div>
                                                    <span className="text-sm font-mono font-bold text-blue-900">{designData.textColor}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Logo */}
                                        {designData.logoPreview && (
                                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 md:col-span-2">
                                                <p className="text-xs font-semibold text-purple-700 mb-2">Custom Logo</p>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={designData.logoPreview}
                                                        alt="Logo"
                                                        className="w-12 h-12 object-contain bg-white rounded-lg border-2 border-purple-300 shadow-sm p-1"
                                                    />
                                                    <span className="text-green-700 font-semibold flex items-center gap-1">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Logo Included
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Quantity */}
                                        {designData.quantity && (
                                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                                <p className="text-xs font-semibold text-green-700 mb-1">Order Quantity</p>
                                                <p className="text-base font-bold text-green-900">{designData.quantity} pieces</p>
                                            </div>
                                        )}

                                        {/* Materials */}
                                        {designData.materials && Object.keys(designData.materials).length > 0 && (
                                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200 md:col-span-2">
                                                <p className="text-xs font-semibold text-amber-700 mb-2">Materials Composition</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(designData.materials).map(([name, percentage]) => (
                                                        <span
                                                            key={name}
                                                            className="text-xs bg-amber-200 text-amber-900 px-3 py-1 rounded-full font-semibold border border-amber-300"
                                                        >
                                                            {name}: {Math.round(percentage)}%
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer - Action Buttons */}
                            <div className="bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 flex-shrink-0">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <svg className="w-5 h-5 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="hidden sm:inline">Use your mouse or touch gestures to interact with the 3D model</span>
                                    <span className="sm:hidden">Interact with the 3D model</span>
                                </div>
                                <button
                                    onClick={() => setShow3DModal(false)}
                                    className="w-full sm:w-auto bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] hover:from-[#d4a02a] hover:to-[#c49723] text-white font-semibold px-8 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Close Preview
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