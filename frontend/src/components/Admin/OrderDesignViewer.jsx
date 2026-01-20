import React, { Suspense } from 'react';
import HangerScene from '../Checkout/HangerScene';
import LoadingSpinner from '../LoadingSpinner';

/**
 * OrderDesignViewer Component
 * 
 * This component displays the customer's 3D customized design for admins to view.
 * It reconstructs the exact 3D scene from the saved design data in the database.
 * 
 * Usage:
 * <OrderDesignViewer designData={order.threeddesigndata} />
 */

const OrderDesignViewer = ({ designData }) => {
    // Parse the design data if it's a JSON string
    const design = typeof designData === 'string' ? JSON.parse(designData) : designData;

    if (!design) {
        return (
            <div className='bg-gray-100 rounded-lg p-8 text-center'>
                <p className='text-gray-500'>No 3D design data available</p>
            </div>
        );
    }

    return (
        <div className='bg-white rounded-lg border-2 border-gray-300 p-6'>
            <div className='mb-4'>
                <h3 className='text-xl font-semibold mb-2'>3D Design Preview</h3>
                <p className='text-sm text-gray-600'>Customer's customized hanger design</p>
            </div>

            {/* 3D Viewer */}
            <div className='bg-white rounded-lg border-2 border-gray-200 overflow-hidden'>
                <div className='w-full h-[500px]'>
                    <Suspense fallback={
                        <div className='w-full h-full flex items-center justify-center bg-gray-50'>
                            <div className='text-center'>
                                <LoadingSpinner> </LoadingSpinner>
                                <p className='text-lg text-gray-600'>Loading 3D Design...</p>
                            </div>
                        </div>
                    }>
                        <HangerScene
                            color={design.color || '#4F46E5'}
                            hangerType={design.hangerType || '97-12'}
                            customText={design.customText || ''}
                            textColor={design.textColor || '#000000'}
                            textPosition={design.textPosition || { x: 0, y: 0, z: 0.49 }}
                            textSize={design.textSize || 0.5}
                            logoPreview={design.logoPreview || null}
                            logoPosition={design.logoPosition || { x: 0, y: 0, z: 0 }}
                            logoSize={design.logoSize || 1}
                        />
                    </Suspense>
                </div>
                <div className='bg-gray-50 px-4 py-2 text-center text-xs text-gray-500'>
                    Drag to rotate • Scroll to zoom • Right-click to pan
                </div>
            </div>

            {/* Design Details */}
            <div className='mt-6 grid grid-cols-2 gap-4 text-sm'>
                <div className='bg-gray-50 p-3 rounded'>
                    <span className='font-semibold text-gray-700'>Hanger Type:</span>
                    <p className='text-gray-900 mt-1'>{design.hangerType}</p>
                </div>
                <div className='bg-gray-50 p-3 rounded'>
                    <span className='font-semibold text-gray-700'>Color:</span>
                    <div className='flex items-center gap-2 mt-1'>
                        <div 
                            className='w-6 h-6 rounded border border-gray-300' 
                            style={{ backgroundColor: design.color }}
                        />
                        <span className='font-mono text-gray-900'>{design.color}</span>
                    </div>
                </div>
                <div className='bg-gray-50 p-3 rounded'>
                    <span className='font-semibold text-gray-700'>Quantity:</span>
                    <p className='text-gray-900 mt-1'>{design.quantity} pieces</p>
                </div>
                <div className='bg-gray-50 p-3 rounded'>
                    <span className='font-semibold text-gray-700'>Materials:</span>
                    <div className='mt-1'>
                        {design.materials && Object.entries(design.materials).map(([name, percentage]) => (
                            <div key={name} className='text-gray-900 text-xs'>
                                {percentage}% {name.split('(')[0].trim()}
                            </div>
                        ))}
                    </div>
                </div>
                {design.customText && (
                    <div className='bg-gray-50 p-3 rounded col-span-2'>
                        <span className='font-semibold text-gray-700'>Custom Text:</span>
                        <p className='text-gray-900 mt-1'>"{design.customText}"</p>
                        <p className='text-xs text-gray-600 mt-1'>
                            Color: {design.textColor} | Size: {design.textSize}x
                        </p>
                    </div>
                )}
                {design.logoFileName && (
                    <div className='bg-gray-50 p-3 rounded col-span-2'>
                        <span className='font-semibold text-gray-700'>Logo:</span>
                        <p className='text-gray-900 mt-1'>{design.logoFileName}</p>
                        <p className='text-xs text-gray-600 mt-1'>Size: {design.logoSize}x</p>
                    </div>
                )}
                <div className='bg-gray-50 p-3 rounded col-span-2'>
                    <span className='font-semibold text-gray-700'>Created:</span>
                    <p className='text-gray-900 mt-1'>
                        {design.timestamp ? new Date(design.timestamp).toLocaleString() : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Download Design Data Button */}
            <div className='mt-4 flex gap-3'>
                <button
                    onClick={() => {
                        const dataStr = JSON.stringify(design, null, 2);
                        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                        const exportFileDefaultName = `design_${design.hangerType}_${Date.now()}.json`;
                        const linkElement = document.createElement('a');
                        linkElement.setAttribute('href', dataUri);
                        linkElement.setAttribute('download', exportFileDefaultName);
                        linkElement.click();
                    }}
                    className='flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                >
                    Download Design Data (JSON)
                </button>
            </div>
        </div>
    );
};

export default OrderDesignViewer;
