import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Download, FileText, CheckCircle } from 'lucide-react';

const ContractModal = ({ order, onClose, onContractSigned }) => {
    const sigPadRef = useRef(null);
    const [agreed, setAgreed] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [employee, setEmployee] = useState(null);

    // Fetch employee data for contract
    useEffect(() => {
        const fetchEmployee = async () => {
            if (order.salesadminid) {
                try {
                    const response = await fetch(`https://gatsis-hub.vercel.app/employees/${order.salesadminid}`);
                    if (response.ok) {
                        const data = await response.json();
                        setEmployee(data);
                    }
                } catch (error) {
                    console.error('Error fetching employee:', error);
                }
            }
        };
        fetchEmployee();
    }, [order.salesadminid]);

    // Format date for contract
    const formatContractDate = (date) => {
        const d = new Date(date);
        return {
            day: d.getDate(),
            month: d.toLocaleDateString('en-US', { month: 'long' }),
            year: d.getFullYear()
        };
    };

    const today = formatContractDate(new Date());
    const deliveryDate = order.deadline ? new Date(order.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'To be determined';
    const compensation = (parseFloat(order.totalprice || 0) * 0.1).toFixed(2);

    // Format materials
    const formatMaterials = (materialsObj) => {
        if (!materialsObj || typeof materialsObj !== 'object') return 'Standard materials';
        return Object.entries(materialsObj)
            .map(([name, percentage]) => `${name} ${Math.round(percentage)}%`)
            .join(', ');
    };

    const clearSignature = () => {
        sigPadRef.current?.clear();
    };

    const handleSign = async () => {
        if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
            alert('Please provide your signature');
            return;
        }

        if (!agreed) {
            alert('Please check the agreement box to proceed');
            return;
        }

        setIsSigning(true);

        try {
            const signatureDataURL = sigPadRef.current.toDataURL();
            
            const contractHTML = generateContractHTML();
            
            const contractData = {
                signature: signatureDataURL,
                contractHTML: contractHTML,
                signedDate: new Date().toISOString(),
                terms: {
                    companyName: 'GT Gatsis Corporation',
                    companyAddress: 'Victoria Wave Special Economic Zone, Siera Madre Building, Brgy. 186 North Caloocan City, Metro Manila Philippines 1427',
                    customerName: order.companyname,
                    customerAddress: order.deliveryaddress || 'Address on file',
                    contactPerson: order.contactperson,
                    productDescription: order.hangertype,
                    quantity: order.quantity,
                    materials: formatMaterials(order.materials),
                    deliveryDate: deliveryDate,
                    delayDays: 7,
                    compensation: `₱${parseFloat(compensation).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
                    inspectionDays: 7,
                    governingLaw: 'Metro Manila, Philippines',
                    companyRepresentative: employee?.employeename || 'Sales Administrator',
                    totalPrice: order.totalprice
                }
            };

            // Call API to sign contract
            const response = await fetch(`https://gatsis-hub.vercel.app/orders/${order.orderid}/sign-contract`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contract_data: contractData })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to sign contract');
            }

            // Call parent callback on success
            if (onContractSigned) {
                await onContractSigned();
            }
        } catch (error) {
            console.error('Error signing contract:', error);
            alert(error.message || 'Failed to sign contract. Please try again.');
        } finally {
            setIsSigning(false);
        }
    };

    const handleDownloadContract = () => {
        const contractHTML = generateContractHTML();
        const blob = new Blob([contractHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Contract-ORD-${order.orderid.slice(0, 8).toUpperCase()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const generateContractHTML = () => {
        return `
<!DOCTYPE html>
<html><head><meta content="text/html; charset=UTF-8" http-equiv="content-type">
<style type="text/css">
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; }
    .bold { font-weight: bold; }
    .italic { font-style: italic; }
    .section { margin: 20px 0; }
    .signature-box { border: 1px solid #ccc; padding: 10px; margin: 10px 0; display: inline-block; min-width: 200px; }
    .signature-img { max-width: 200px; height: auto; }
</style>
</head>
<body>
    <div class="header">
        <h1>SALES AGREEMENT</h1>
    </div>
    
    <p>THIS AGREEMENT is made on this <strong>${today.day}</strong> day of <strong>${today.month}</strong>, year of <strong>${today.year}</strong>, by and between:</p>
    
    <p><span class="bold">GT Gatsis Corporation</span>, located at <span class="bold">Victoria Wave Special Economic Zone, Siera Madre Building, Brgy. 186 North Caloocan City, Metro Manila Philippines 1427</span>, and Name/Company Name: <span class="bold">${order.companyname}</span>.<br>
    Located at: <span class="bold">${order.deliveryaddress || 'Address on file'}</span>.</p>
    
    <div class="section">
        <p class="bold">1. SCOPE OF GOODS</p>
        <p>The Company agrees to sell, and the Customer agrees to purchase, the following products:</p>
        <p>Description: <strong>${order.hangertype}</strong></p>
        <p>Quantity: <strong>${order.quantity} units</strong></p>
        <p>Specifications/Materials: <strong>${formatMaterials(order.materials)}</strong></p>
    </div>
    
    <div class="section">
        <p class="bold">2. DELIVERY & TIMING</p>
        <p class="bold">2.1. Delivery Date:</p>
        <p>The Company shall deliver the Goods to the Customer's specified location on or before <strong>${deliveryDate}</strong>.</p>
        <p class="bold">2.2. Delay Breach:</p>
        <p>Time is of the essence. If the Goods are not delivered within <strong>7</strong> days of the Delivery Date, the Company is in contract breach. The Customer shall be entitled to a full refund of all monies paid and a one-time compensation credit of <strong>₱${parseFloat(compensation).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>.</p>
    </div>
    
    <div class="section">
        <p class="bold">3. QUALITY & MATERIAL GUARANTEE</p>
        <p class="bold">3.1. Quality Standards:</p>
        <p>The Company warrants that the Goods shall be free from defects in material and workmanship and shall conform to the descriptions provided in Section 1.</p>
        <p class="bold">3.2. Material Authenticity:</p>
        <p>The use of substituted or "equivalent" materials without written consent from the Customer is strictly prohibited.</p>
        <p class="bold">3.3. Right of Inspection:</p>
        <p>The Customer has <strong>7</strong> days after delivery to inspect the Goods. If the Goods are found to be of the wrong material, inferior quality, or incorrect quantity, the Customer may reject the shipment.</p>
    </div>
    
    <div class="section">
        <p class="bold">4. REMEDIES FOR BREACH</p>
        <p>In the event of a breach regarding Delivery Time, Quality, Quantity, or Material Integrity, the following shall apply:</p>
        <p><span class="bold">Full Refund:</span> The Company shall issue a 100% refund of the purchase price, including any shipping fees and taxes, within 7 business days.</p>
        <p><span class="bold">Compensation:</span> In addition to the refund, the Company shall pay the Customer <strong>₱${parseFloat(compensation).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong> as liquidated damages for the breach of contract.</p>
        <p><span class="bold">Return Costs:</span> The Company shall be responsible for all costs associated with the return or disposal of non-conforming Goods.</p>
    </div>
    
    <div class="section">
        <p class="bold">5. LIMITATION OF LIABILITY</p>
        <p>Except for the specific compensation outlined in Section 4, the Company's total liability shall not exceed the total value of the purchase order. The Company is not responsible for delays caused by Natural Disasters provided the Company notifies the Customer immediately.</p>
    </div>
    
    <div class="section">
        <p class="bold">6. GOVERNING LAW</p>
        <p>This Agreement shall be governed by the laws of <strong>Metro Manila, Philippines</strong>.</p>
    </div>
    
    <div class="section">
        <p class="bold">SIGNATURES:</p>
        <p>Company Representative: <strong>${employee?.employeename || 'Sales Administrator'}</strong> &nbsp;&nbsp; Date: <strong>${today.month} ${today.day}, ${today.year}</strong></p>
        <p>Customer: <strong>${order.contactperson}</strong> &nbsp;&nbsp; Date: <strong>${order.contract_signed ? new Date(order.contract_signed_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : `${today.month} ${today.day}, ${today.year}`}</strong></p>
        ${order.contract_signed && order.contract_data?.signature ? `
        <div class="signature-box">
            <p>Customer Digital Signature:</p>
            <img src="${order.contract_data.signature}" class="signature-img" alt="Customer Signature" />
        </div>` : (sigPadRef.current && !sigPadRef.current.isEmpty() ? `
        <div class="signature-box">
            <p>Customer Digital Signature:</p>
            <img src="${sigPadRef.current.toDataURL()}" class="signature-img" alt="Customer Signature" />
        </div>` : '')}
    </div>
    
    <p style="margin-top: 40px; font-size: 10px; color: #666;">
        This is a legally binding digital contract${order.contract_signed ? ' signed on ' + new Date(order.contract_signed_date).toLocaleString() : ''}.
    </p>
</body>
</html>
        `;
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto relative z-[10000] animate-scaleIn">
                {/* Header */}
                <div className="bg-[#E6AF2E] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Sales Agreement</h2>
                            <p className="text-white/90 text-sm">Please review and sign the contract to proceed</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Contract Content */}
                <div className="p-6 bg-gray-50">
                    <div className="bg-white p-8 rounded-lg shadow">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">SALES AGREEMENT</h1>
                        </div>

                        <p className="mb-4">
                            THIS AGREEMENT is made on this <strong>{today.day}</strong> day of <strong>{today.month}</strong>, year of <strong>{today.year}</strong>, by and between:
                        </p>

                        <p className="mb-4">
                            <span className="font-bold">GT Gatsis Corporation</span>, located at <span className="font-bold">Victoria Wave Special Economic Zone, Siera Madre Building, Brgy. 186 North Caloocan City, Metro Manila Philippines 1427</span>, and Name/Company Name: <span className="font-bold">{order.companyname}</span>.<br />
                            Located at: <span className="font-bold">{order.deliveryaddress || 'Address on file'}</span>.
                        </p>

                        {/* Section 1 */}
                        <div className="mb-4">
                            <p className="font-bold mb-2">1. SCOPE OF GOODS</p>
                            <p className="ml-4">The Company agrees to sell, and the Customer agrees to purchase, the following products:</p>
                            <p className="ml-4">Description: <strong>{order.hangertype}</strong></p>
                            <p className="ml-4">Quantity: <strong>{order.quantity} units</strong></p>
                            <p className="ml-4">Specifications/Materials: <strong>{formatMaterials(order.materials)}</strong></p>
                        </div>

                        {/* Section 2 */}
                        <div className="mb-4">
                            <p className="font-bold mb-2">2. DELIVERY & TIMING</p>
                            <p className="font-bold ml-4">2.1. Delivery Date:</p>
                            <p className="ml-4">The Company shall deliver the Goods to the Customer's specified location on or before <strong>{deliveryDate}</strong>.</p>
                            <p className="font-bold ml-4 mt-2">2.2. Delay Breach:</p>
                            <p className="ml-4">Time is of the essence. If the Goods are not delivered within <strong>7</strong> days of the Delivery Date, the Company is in contract breach. The Customer shall be entitled to a full refund of all monies paid and a one-time compensation credit of <strong>₱{parseFloat(compensation).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>.</p>
                        </div>

                        {/* Section 3 */}
                        <div className="mb-4">
                            <p className="font-bold mb-2">3. QUALITY & MATERIAL GUARANTEE</p>
                            <p className="font-bold ml-4">3.1. Quality Standards:</p>
                            <p className="ml-4">The Company warrants that the Goods shall be free from defects in material and workmanship and shall conform to the descriptions provided in Section 1.</p>
                            <p className="font-bold ml-4 mt-2">3.2. Material Authenticity:</p>
                            <p className="ml-4">The use of substituted or "equivalent" materials without written consent from the Customer is strictly prohibited.</p>
                            <p className="font-bold ml-4 mt-2">3.3. Right of Inspection:</p>
                            <p className="ml-4">The Customer has <strong>7</strong> days after delivery to inspect the Goods. If the Goods are found to be of the wrong material, inferior quality, or incorrect quantity, the Customer may reject the shipment.</p>
                        </div>

                        {/* Section 4 */}
                        <div className="mb-4">
                            <p className="font-bold mb-2">4. REMEDIES FOR BREACH</p>
                            <p className="ml-4">In the event of a breach regarding Delivery Time, Quality, Quantity, or Material Integrity, the following shall apply:</p>
                            <p className="ml-4 mt-2"><span className="font-bold">Full Refund:</span> The Company shall issue a 100% refund of the purchase price, including any shipping fees and taxes, within 7 business days.</p>
                            <p className="ml-4"><span className="font-bold">Compensation:</span> In addition to the refund, the Company shall pay the Customer <strong>₱{parseFloat(compensation).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong> as liquidated damages for the breach of contract.</p>
                            <p className="ml-4"><span className="font-bold">Return Costs:</span> The Company shall be responsible for all costs associated with the return or disposal of non-conforming Goods.</p>
                        </div>

                        {/* Section 5 */}
                        <div className="mb-4">
                            <p className="font-bold mb-2">5. LIMITATION OF LIABILITY</p>
                            <p className="ml-4">Except for the specific compensation outlined in Section 4, the Company's total liability shall not exceed the total value of the purchase order. The Company is not responsible for delays caused by Natural Disasters provided the Company notifies the Customer immediately.</p>
                        </div>

                        {/* Section 6 */}
                        <div className="mb-4">
                            <p className="font-bold mb-2">6. GOVERNING LAW</p>
                            <p className="ml-4">This Agreement shall be governed by the laws of <strong>Metro Manila, Philippines</strong>.</p>
                        </div>

                        {/* Signatures Section */}
                        <div className="mb-4 mt-8 bg-blue-50 p-4 rounded">
                            <p className="font-bold mb-3">SIGNATURES:</p>
                            <p className="ml-4">Company Representative: <strong>{employee?.employeename || 'Sales Administrator'}</strong></p>
                            <p className="ml-4">Date: <strong>{today.month} {today.day}, {today.year}</strong></p>
                            <p className="ml-4 mt-2">Customer: <strong>{order.contactperson}</strong></p>
                            <p className="ml-4">Date: <strong>{today.month} {today.day}, {today.year}</strong></p>
                        </div>

                        {/* Show signed signature if contract is already signed */}
                        {order.contract_signed && order.contract_data?.signature && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm font-semibold text-green-800 mb-2">Customer Digital Signature:</p>
                                <img 
                                    src={order.contract_data.signature} 
                                    alt="Customer Signature" 
                                    className="border border-gray-300 rounded bg-white p-2"
                                    style={{ maxWidth: '300px', height: 'auto' }}
                                />
                                <p className="text-xs text-gray-600 mt-2">Signed on: {new Date(order.contract_signed_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Signature Section - Only show if not already signed */}
                {!order.contract_signed && (
                    !showSignaturePad ? (
                        <div className="p-6 border-t bg-white">
                            <button
                                onClick={() => setShowSignaturePad(true)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                style={{ backgroundColor: '#2563eb', color: 'white' }}
                            >
                                <FileText size={20} />
                                <span>Proceed to Sign Contract</span>
                            </button>
                        </div>
                    ) : (
                        <div className="p-6 border-t bg-gray-50">
                            <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-blue-600" />
                                Digital Signature Required
                            </h3>
                            
                            <p className="text-sm text-gray-600 mb-4">
                                Please sign below using your mouse or touchscreen. Your signature will be legally binding.
                            </p>

                            <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-4">
                                <SignatureCanvas
                                    ref={sigPadRef}
                                    canvasProps={{
                                        className: 'w-full h-40 bg-white cursor-crosshair',
                                        width: 600,
                                        height: 160
                                    }}
                                    backgroundColor="white"
                                />
                            </div>

                            <button
                                onClick={clearSignature}
                                className="text-sm text-blue-600 hover:text-blue-800 mb-4"
                            >
                                Clear Signature
                            </button>

                            <label className="flex items-start gap-3 mb-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">
                                    I, <strong>{order.contactperson}</strong>, have read and agree to the terms and conditions outlined in this Sales Agreement. I understand that this digital signature is legally binding and equivalent to a handwritten signature.
                                </span>
                            </label>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSignaturePad(false)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Back to Review
                                </button>
                                <button
                                    onClick={handleSign}
                                    disabled={isSigning || !agreed}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSigning ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} />
                                            Sign & Submit Contract
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        </div>
                    )
                )}

                {/* Download Option */}
                <div className="px-6 pb-6">
                    <button
                        onClick={handleDownloadContract}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mb-3"
                    >
                        <Download size={18} />
                        {order.contract_signed ? 'Download Signed Contract' : 'Download Contract (Preview)'}
                    </button>

                    {/* Close button for already signed contracts */}
                    {order.contract_signed && (
                        <button
                            onClick={onClose}
                            className="w-full bg-[#E6AF2E] hover:bg-[#191716] text-white py-2 rounded-lg font-semibold transition-colors"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>

            {/* Add animation styles */}
            <style jsx>{`
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scaleIn {
                    animation: scaleIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ContractModal;
