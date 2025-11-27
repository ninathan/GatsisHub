import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'

const fogotpassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

    const showNotificationModal = (message, type = 'success') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotification(true);
    };

    const closeNotification = () => {
        setShowNotification(false);
        setNotificationMessage('');
    };

    const handleSubmitEmail = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            showNotificationModal('Please enter your email address', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('https://gatsis-hub.vercel.app/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ emailAddress: email })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.details || data.error || 'Failed to send verification code';
                throw new Error(errorMessage);
            }

            showNotificationModal('Verification code sent to your email!');
            setShowCodeModal(true);
        } catch (err) {


            showNotificationModal(err.message || 'Failed to send verification code', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();

        if (!verificationCode.trim()) {
            showNotificationModal('Please enter the verification code', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('https://gatsis-hub.vercel.app/auth/verify-reset-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    emailAddress: email,
                    code: verificationCode 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid verification code');
            }

            // Navigate to change password page with email
            navigate('/changepassword', { state: { email: email, verified: true } });
        } catch (err) {

            showNotificationModal(err.message || 'Invalid verification code', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setVerificationCode('');
        await handleSubmitEmail({ preventDefault: () => {} });
    };

    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full'>
            {/* Left side */}
            <div className='bg-[#35408E] w-full min-h-screen lg:min-h-[964px] order-2 lg:order-1'>
                <div className='flex flex-col items-center py-10 md:py-20 lg:mt-25 px-4'>
                    <Link to='/'>
                        <img src={logo} alt='Logo' className='w-[120px] h-[120px] md:w-[170px] md:h-[170px] mx-auto mt-5 md:mt-10' />
                    </Link>
                    <h1 className='text-white text-4xl font-semibold mt-5 text-center'>Welcome to GatsisHub</h1>
                    <p className='text-white text-lg md:text-xl text-center mt-5 font-medium px-4 max-w-md'>
                        Premium Hanger Solutions Crafted for Quality and Style.
                    </p>
                    <Link
                        to='/signup'
                        className='bg-[#DAC325] text-black px-6 py-3 text-xl rounded-2xl mt-5 hover:bg-[#c4ad1f]'
                    >
                        Sign Up
                    </Link>
                    <p className='text-white text-lg mt-3 text-center'>Don’t have an account yet?</p>
                </div>
            </div>

            {/* Right side */}
            <div className='flex flex-col items-center justify-center py-10 md:py-20 px-4 order-1 lg:order-2'>
                <h1 className='text-[#35408E] text-4xl md:text-6xl font-bold text-center'>
                    Change Password
                </h1>
                <p className='text-[#000000] text-lg md:text-xl text-center mt-5 font-medium px-4 max-w-md'>
                    Enter your email address below.
                </p>
                <form onSubmit={handleSubmitEmail} className='flex flex-col mt-10 w-full max-w-md'>
                    <div className='relative mb-6'>
                        <label className='block text-2xl font-medium mb-2 text-center'>Company Email Address</label>
                        <img src={userav} alt='' className='absolute left-4 top-12 w-6 h-6 mt-1.5' />
                        <input
                            type='email'
                            placeholder='you@example.com'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='border border-gray-300 rounded-2xl px-13 py-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type='submit'
                        disabled={isLoading}
                        className='bg-[#57DA65] text-black px-6 py-3 text-xl rounded-2xl hover:bg-[#37e148] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                Sending...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </button>
                </form>

                <button className='mt-6 bg-[#DAC325] text-black px-6 py-3 text-xl rounded-2xl hover:bg-[#c4ad1f] cursor-pointer'>
                    <Link to='/login'>Back to Login</Link>
                </button>
            </div>

            {/* Verification Code Modal */}
            {showCodeModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-[#35408E] px-6 py-4">
                            <h2 className="text-white text-2xl font-semibold">Enter Verification Code</h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                We've sent a 6-digit verification code to:
                            </p>
                            <p className="text-center font-semibold text-lg text-[#35408E] mb-6">
                                {email}
                            </p>

                            <form onSubmit={handleVerifyCode}>
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="Enter 6-digit code"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-semibold tracking-widest focus:ring-2 focus:ring-[#35408E] focus:border-transparent"
                                        maxLength="6"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-yellow-800">
                                        💡 The code will expire in 15 minutes. Check your spam folder if you don't see the email.
                                    </p>
                                </div>

                                {/* Resend Code Link */}
                                <div className="text-center mb-4">
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={isLoading}
                                        className="text-[#35408E] text-sm font-semibold hover:underline disabled:opacity-50"
                                    >
                                        Didn't receive the code? Resend
                                    </button>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCodeModal(false);
                                            setVerificationCode('');
                                        }}
                                        disabled={isLoading}
                                        className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || verificationCode.length !== 6}
                                        className="flex-1 px-6 py-2 bg-[#57DA65] text-black rounded-lg font-semibold hover:bg-[#37e148] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {showNotification && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className={`px-6 py-4 ${notificationType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                            <h2 className="text-white text-xl font-semibold">
                                {notificationType === 'success' ? '✓ Success' : '✕ Error'}
                            </h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-gray-700 text-lg">{notificationMessage}</p>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <button
                                onClick={closeNotification}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                                    notificationType === 'success'
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default fogotpassword