import React from 'react';
import MetrobankLogo from '../../images/bank.png'; // replace with your bank logo
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const BankTransferPage = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const handleConfirm = () => {
        // Here you can add backend call or validation later
        setShowModal(true);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-[#35408E] text-white rounded-xl shadow-lg p-10 w-[600px]">
                <h2 className="text-2xl font-semibold text-center mb-6">Payment Details</h2>

                {/* Bank Logo */}
                <div className="flex justify-center mb-6">
                    <img src={MetrobankLogo} alt="Bank Logo" className="w-20 h-20 rounded-full bg-white p-2" />
                </div>

                {/* Account Info */}
                <div className="bg-white text-black rounded-lg shadow-md p-6 mb-6 text-center">
                    <h3 className="text-lg font-bold">Account Name</h3>
                    <p className="text-xl font-semibold mb-4">GT Gatsis Corporation</p>

                    <h3 className="text-lg font-bold">Account Number</h3>
                    <input
                        type="text"
                        value="xxx-xxxx-xxx-xx-xx"
                        readOnly
                        className="w-full mt-2 px-4 py-2 border rounded text-center font-mono bg-gray-100"
                    />
                </div>

                {/* Proof of Payment Upload */}
                <div className="bg-white text-black rounded-lg shadow-md p-6 mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                        Attach your proof of payment
                    </label>
                    <input
                        type="file"
                        className="w-full border rounded px-3 py-2 cursor-pointer"
                    />
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-4">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg" onClick={handleConfirm}>
                        Confirm Payment
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg"
                    >
                        Back
                    </button>
                </div>
            </div>
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50">
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
    );
};

export default BankTransferPage;
