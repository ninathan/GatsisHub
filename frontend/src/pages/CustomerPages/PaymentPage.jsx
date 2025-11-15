import React from 'react'
import Bank from '../../images/bank.png'
import Cheque from '../../images/cheque.png'
import { Link } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import { FaTimes, FaUpload, FaCheckCircle } from 'react-icons/fa';

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
  const chequeAnim = useScrollAnimation({ threshold: 0.2 });
  const bankInfoAnim = useScrollAnimation({ threshold: 0.2 });
  const chequeInfoAnim = useScrollAnimation({ threshold: 0.2 });

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
            
            // Add order details if available
            if (orderDetails?.orderid) {
                formData.append('orderid', orderDetails.orderid);
            }

            // Get customer info from localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.customerid) {
                formData.append('customerid', user.customerid);
            }

            const response = await fetch('https://gatsis-hub.vercel.app/api/payments/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit payment');
            }

            setUploadSuccess(true);
            setTimeout(() => {
                setShowUploadModal(false);
                setShowModal(true);
            }, 1500);
        } catch (error) {
            console.error('Payment submission error:', error);
            setUploadError(error.message || 'Failed to submit payment. Please try again.');
        } finally {
            setUploading(false);
        }
    };

  const bankInfo = [
    "The bank transfer payment method allows customers to transfer funds directly from their bank account to the merchant's bank account. This method is typically initiated through the customer's online banking platform or mobile app."
  ]
  const chequeInfo = [
    "A cheque payment allows customers to pay by writing a cheque to the merchant. The merchant then deposits the cheque into their bank account, and the funds are transferred once the cheque clears."
  ]
  return (
    <div className='p-5'>
        <div>
            <h1 
                ref={titleAnim.ref}
                className={`text-4xl font-medium flex flex-col items-center mt-5 ${
                    titleAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
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
                className={`h-75 w-75 bg-[#35408E] m-10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl ${
                    bankAnim.isVisible ? 'scroll-slide-up' : 'scroll-hidden'
                }`}
                onClick={() => handleConfirm('Bank Transfer')}
            >
                <div className='flex flex-col items-center p-6'>
                    <img src={Bank} alt="Bank" className='w-20 h-20 mb-5 transition-transform duration-300 hover:scale-110' />
                    <h2 className='text-2xl font-semibold text-white'>Bank Transfer</h2>
                </div>
            </div>
            {/* Cheque Payment */}
            <div 
                ref={chequeAnim.ref}
                className={`h-75 w-75 bg-[#35408E] m-10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl ${
                    chequeAnim.isVisible ? 'scroll-slide-up' : 'scroll-hidden'
                }`}
                onClick={() => handleConfirm('Cheque Payment')}
            >
                <div className='flex flex-col items-center p-6'>
                    <img src={Cheque} alt="Cheque" className='w-20 h-20 mb-5 transition-transform duration-300 hover:scale-110' />
                    <h2 className='text-2xl font-semibold text-white'>Cheque Payment</h2>
                </div>
            </div>
        </div>

        {/* Payment Info */}
        <div className='flex flex-col md:flex-row items-center justify-center gap-20'>
            <div 
                ref={bankInfoAnim.ref}
                className={`h-60 w-75 border border-gray-300 rounded-lg hover:shadow-lg transition-shadow duration-300 ${
                    bankInfoAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                }`}
            >
              <h3 className='font-semibold text-2xl flex flex-col items-center mt-2'>Bank Transfer</h3>
              <p className='p-5'>{bankInfo[0]}</p>
            </div>
            <div 
                ref={chequeInfoAnim.ref}
                className={`h-60 w-75 border border-gray-300 rounded-lg hover:shadow-lg transition-shadow duration-300 ${
                    chequeInfoAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                }`}
            >
              <h3 className='font-semibold text-2xl flex flex-col items-center mt-2'>Cheque Payment</h3>
              <p className='p-5'>{chequeInfo[0]}</p>
            </div>
        </div>


        {/* Upload Payment Proof Modal */}
        {showUploadModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
                <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full mx-4">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-[#35408E]">
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
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
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

                    {/* File Upload Area */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Receipt/Proof of Payment <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#35408E] transition-colors">
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
                            className="px-6 py-2 bg-[#35408E] text-white rounded-lg hover:bg-[#2d3575] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
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
                <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50 animate-fadeIn">
                    <div className="bg-[#35408E] rounded-lg shadow-lg p-8 max-w-sm w-full text-center animate-scaleIn">
                        <div className="mb-4">
                            <FaCheckCircle className="text-6xl text-green-400 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4 text-white">Payment Submitted Successfully!</h3>
                        <p className="mb-6 text-white">Thank you for submitting your payment proof. We'll verify and update your order status shortly.</p>
                        <button
                            onClick={() => {
                                setShowModal(false);
                                navigate('/order'); // redirect to orders page
                            }}
                            className="bg-[#FFD41C] text-black px-6 py-2 rounded font-semibold transition-all duration-300 hover:scale-105 hover:bg-[#e6c41a]"
                        >
                            View My Orders
                        </button>
                    </div>
                </div>
            )}
    </div>
  )
}

export default PaymentPage