import React from 'react'
import Bank from '../../images/bank.png'
import Cheque from '../../images/cheque.png'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

    const handleConfirm = () => {
        // Here you can add backend call or validation later
        setShowModal(true);
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
            <h1 className='text-4xl font-medium flex flex-col items-center mt-5'>Select Mode of Payment</h1>
        </div>

        {/* Payment Options */}
        <div className='flex flex-col md:flex-row items-center justify-center'>
            {/* Bank Transfer */}
            <div className='h-75 w-75 bg-[#35408E] m-10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform'>
                <Link to="/banktransfer" className='flex flex-col items-center'>
                    <img src={Bank} alt="Bank" className='w-20 h-20 mb-5' />
                    <h2 className='text-2xl font-semibold text-white'>Bank Transfer</h2>
                </Link>
            </div>
            {/* Cheque Payment */}
            <div className='h-75 w-75 bg-[#35408E] m-10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform'>
                <button className='flex flex-col items-center' onClick={handleConfirm}>
                    <img src={Cheque} alt="Cheque" className='w-20 h-20 mb-5' />
                    <h2 className='text-2xl font-semibold text-white'>Cheque Payment</h2>
                </button>
            </div>
        </div>

        {/* Payment Info */}
        <div className='flex flex-col md:flex-row items-center justify-center gap-20'>
            <div className=' h-60 w-75 border border-gray-300 rounded-lg'>
              <h3 className='font-semibold text-2xl flex flex-col items-center mt-2'>Bank Transfer</h3>
              <p className='p-5'>{bankInfo[0]}</p>
            </div>
            <div className=' h-60 w-75 border border-gray-300 rounded-lg'>
              <h3 className='font-semibold text-2xl flex flex-col items-center mt-2'>Cheque Payment</h3>
              <p className='p-5'>{chequeInfo[0]}</p>
            </div>
        </div>


        {/* Cheque Modal */}
        {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-[rgba(143,143,143,0.65)] z-50">
                    <div className="bg-[#35408E] rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
                        <h3 className="text-xl font-semibold mb-4 text-white">Thank you for Ordering</h3>
                        <p className="mb-6 text-white">We'll update you once your order has been confirmed.</p>
                        <button
                            onClick={() => {
                                setShowModal(false);
                                navigate('/'); // redirect to home or orders page
                            }}
                            className="bg-[#FFD41C] text-black px-6 py-2 rounded font-semibold"
                            
                        >
                            <a href="/">Go to Homepage</a>
                        </button>
                    </div>
                </div>
            )}
    </div>
  )
}

export default PaymentPage