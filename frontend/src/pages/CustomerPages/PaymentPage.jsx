import React from 'react'
import Bank from '../../images/bank.png'
import GCashIcon from '../../images/cheque.png' // Temporary: reusing cheque image until GCash icon is added
import { Link } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import { FaTimes, FaUpload, FaCheckCircle } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';


const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Get order details from location state if available
    const orderDetails = location.state?.orderDetails || null;

  // Scroll animations
  const titleAnim = useScrollAnimation({ threshold: 0.3 });
  const bankAnim = useScrollAnimation({ threshold: 0.2 });
  const gcashAnim = useScrollAnimation({ threshold: 0.2 });
  const bankInfoAnim = useScrollAnimation({ threshold: 0.2 });
  const gcashInfoAnim = useScrollAnimation({ threshold: 0.2 });

    const handleConfirm = (method) => {
        setPaymentMethod(method);
        setShowUploadModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type (images and PDFs)
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                setUploadError('Please upload a valid image (JPEG, PNG, GIF) or PDF file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setUploadError('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            setUploadError('');
        }
    };

    const handleSubmitPayment = async () => {
        if (!selectedFile) {
            setUploadError('Please select a file to upload');
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const formData = new FormData();
            formData.append('proofOfPayment', selectedFile);
            formData.append('paymentMethod', paymentMethod);
            
            // Get customer info from localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            // Add order details if available
            if (orderDetails?.orderid) {
                formData.append('orderid', orderDetails.orderid);
                console.log('Submitting payment for order:', orderDetails.orderid);
            } else {
                console.warn('No orderid provided - order status may not update');
            }

            if (user.customerid) {
                formData.append('customerid', user.customerid);
            } else {
                console.warn('No customerid found in localStorage');
            }

            const response = await fetch('https://gatsis-hub.vercel.app/payments/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit payment');
            }

            console.log('Payment submitted successfully:', data);
            setUploadSuccess(true);
            setTimeout(() => {
                setShowUploadModal(false);
                setShowModal(true);
                // Navigate back to orders page after 2 seconds
                setTimeout(() => {
                    navigate('/orders', { replace: true, state: { refresh: true } });
                }, 2000);
            }, 1500);
        } catch (error) {

            if (error.message === 'Failed to fetch') {
                setUploadError('Cannot connect to server. Please check your internet connection or try again later.');
            } else {
                setUploadError(error.message || 'Failed to submit payment. Please try again.');
            }
        } finally {
            setUploading(false);
        }
    };

    const bankInfo = [
        "The bank transfer payment method allows customers to transfer funds directly from their bank account to the merchant's bank account. This method is typically initiated through the customer's online banking platform or mobile app."
    ]
    const gcashInfo = [
        "GCash is a mobile wallet that allows you to make instant payments using your smartphone. Simply scan the QR code provided, enter the payment amount, and upload your proof of payment."
    ]
    return (
        <div className='p-5'>
            <div>
                <h1
                    ref={titleAnim.ref}
                    className={`text-4xl font-medium flex flex-col items-center mt-5 ${titleAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                        }`}
                >
                    Select Mode of Payment
                </h1>
            </div>

            {/* Payment Options */}
            <div className='flex flex-col md:flex-row items-center justify-center'>
                {/* Bank Transfer */}
                <div
                    ref={bankAnim.ref}
                    className={`h-75 w-75 bg-[#191716] m-10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl ${bankAnim.isVisible ? 'scroll-slide-up' : 'scroll-hidden'
                        }`}
                    onClick={() => handleConfirm('Bank Transfer')}
                >
                    <div className='flex flex-col items-center p-6'>
                        <img src={Bank} alt="Bank" className='w-20 h-20 mb-5 transition-transform duration-300 hover:scale-110' />
                        <h2 className='text-2xl font-semibold text-white'>Bank Transfer</h2>
                    </div>
                </div>
                {/* GCash Payment */}
                <div
                    ref={gcashAnim.ref}
                    className={`h-75 w-75 bg-[#191716] m-10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl ${gcashAnim.isVisible ? 'scroll-slide-up' : 'scroll-hidden'
                        }`}
                    onClick={() => handleConfirm('GCash')}
                >
                    <div className='flex flex-col items-center p-6'>
                        <img src={GCashIcon} alt="GCash" className='w-20 h-20 mb-5 transition-transform duration-300 hover:scale-110' />
                        <h2 className='text-2xl font-semibold text-white'>GCash</h2>
                    </div>
                </div>
            </div>

            {/* Payment Info */}
            <div className='flex flex-col md:flex-row items-center justify-center gap-20'>
                <div
                    ref={bankInfoAnim.ref}
                    className={`h-60 w-75 border border-gray-300 rounded-lg hover:shadow-lg transition-shadow duration-300 ${bankInfoAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                        }`}
                >
                    <h3 className='font-semibold text-2xl flex flex-col items-center mt-2'>Bank Transfer</h3>
                    <p className='p-5'>{bankInfo[0]}</p>
                </div>
                <div
                    ref={gcashInfoAnim.ref}
                    className={`h-60 w-75 border border-gray-300 rounded-lg hover:shadow-lg transition-shadow duration-300 ${gcashInfoAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                        }`}
                >
                    <h3 className='font-semibold text-2xl flex flex-col items-center mt-2'>GCash</h3>
                    <p className='p-5'>{gcashInfo[0]}</p>
                </div>
            </div>


            {/* Upload Payment Proof Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 backdrop-blur-sm z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full mx-4">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-[#191716]">
                                Upload Proof of Payment
                            </h3>
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setSelectedFile(null);
                                    setUploadError('');
                                    setUploadSuccess(false);
                                }}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Payment Method Info */}
                        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700">
                                <strong>Payment Method:</strong> {paymentMethod}
                            </p>
                            {orderDetails?.orderid && (
                                <p className="text-sm text-gray-700 mt-2">
                                    <strong>Order ID:</strong> #{orderDetails.orderid}
                                </p>
                            )}
                        </div>

                        {/* Bank Details (if Bank Transfer) */}
                        {paymentMethod === 'Bank Transfer' && (
                            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Bank Account Details:</h4>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <p><strong>Bank Name:</strong> BDO Unibank</p>
                                    <p><strong>Account Name:</strong> GatsisHub Corporation</p>
                                    <p><strong>Account Number:</strong> 1234-5678-9012</p>
                                    <p><strong>Branch:</strong> Makati City</p>
                                </div>
                            </div>
                        )}

                    {/* GCash QR Code (if GCash) */}
                    {paymentMethod === 'GCash' && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-3 text-center">Scan QR Code to Pay</h4>
                            <div className="flex flex-col items-center">
                                <div className="bg-white p-4 rounded-lg shadow-md mb-3">
                                    <img 
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=09123456789" 
                                        alt="GCash QR Code" 
                                        className="w-48 h-48"
                                    />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-sm text-gray-700"><strong>GCash Name:</strong> GatsisHub Corporation</p>
                                    <p className="text-sm text-gray-700"><strong>Mobile Number:</strong> 0912-345-6789</p>
                                    <p className="text-xs text-gray-500 mt-2">After payment, take a screenshot and upload as proof</p>
                                </div>
                            </div>
                        </div>
                    )}

                        {/* File Upload Area */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Receipt/Proof of Payment <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#007BFF] transition-colors">
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="payment-file"
                                    disabled={uploading || uploadSuccess}
                                />
                                <label
                                    htmlFor="payment-file"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <FaUpload className="text-4xl text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-600 mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF or PDF (max 5MB)
                                    </p>
                                </label>
                            </div>
                            {selectedFile && (
                                <div className="mt-3 bg-green-50 border border-green-200 rounded p-3 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FaCheckCircle className="text-green-500 mr-2" />
                                        <span className="text-sm text-gray-700">{selectedFile.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {uploadError && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {uploadError}
                            </div>
                        )}

                        {/* Success Message */}
                        {uploadSuccess && (
                            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
                                <FaCheckCircle className="mr-2" />
                                Payment proof uploaded successfully!
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setSelectedFile(null);
                                    setUploadError('');
                                    setUploadSuccess(false);
                                }}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitPayment}
                                disabled={!selectedFile || uploading || uploadSuccess}
                                className="px-6 py-2 bg-[#e6af2e] text-white rounded-lg hover:bg-[#c9a72a] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <LoadingSpinner size="sm" color="white" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <FaUpload />
                                        Submit Payment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-30 z-50 p-3 md:p-4 animate-fadeIn">
                    <div className="bg-[#4ade80] border-[3px] border-black shadow-[12px_12px_0_#000000] max-w-md w-full overflow-hidden animate-scaleIn">
                        {/* Modal Header */}
                        <div className="bg-white border-b-[3px] border-black px-4 md:px-6 py-3 md:py-4">
                            <h3 className="text-black text-xl md:text-2xl font-black">✓ Payment Submitted!</h3>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 md:p-6 text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="w-16 h-16 bg-white border-[3px] border-black flex items-center justify-center">
                                    <FaCheckCircle className="text-4xl text-[#4ade80]" />
                                </div>
                            </div>
                            <p className="text-gray-700 text-base md:text-lg">Thank you for submitting your payment proof. We'll verify and update your order status shortly.</p>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-white border-t-[3px] border-black px-4 md:px-6 py-3 md:py-4 flex justify-center">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    navigate('/orders');
                                }}
                                className="bg-[#ffd93d] border-[3px] border-black shadow-[3px_3px_0_#000000] hover:shadow-[1.5px_1.5px_0_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] text-black font-black px-8 py-2 transition-all text-sm md:text-base cursor-pointer"
                            >
                                View My Orders
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PaymentPage