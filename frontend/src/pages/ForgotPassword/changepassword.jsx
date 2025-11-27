import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'
import key from '../../images/key.png'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import check from '../../images/Check.png'

const changepassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showmodal, setShowmodal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

    const email = location.state?.email;
    const verified = location.state?.verified;

    useEffect(() => {
        // Redirect if not coming from forgot password flow
        if (!email || !verified) {
            navigate('/login');
        }
    }, [email, verified, navigate]);

    const showNotificationModal = (message, type = 'success') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotification(true);
    };

    const closeNotification = () => {
        setShowNotification(false);
        setNotificationMessage('');
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        // Validation
        if (!newPassword || !confirmPassword) {
            showNotificationModal('Please fill in all fields', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showNotificationModal('Password must be at least 6 characters long', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotificationModal('Passwords do not match', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('https://gatsis-hub.vercel.app/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    emailAddress: email,
                    newPassword: newPassword 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setShowmodal(true);
        } catch (err) {

            showNotificationModal(err.message || 'Failed to reset password', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
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

                <form onSubmit={handleUpdatePassword} className='flex flex-col mt-10 w-full max-w-md'>
                    <div className='relative mb-6'>

                        <label className='block text-2xl font-medium mb-2'>Set New Password</label>
                        <img src={key} alt='' className='absolute left-4 top-12 w-6 h-6 mt-1.5' />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder='Enter new password'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className='border border-gray-300 rounded-2xl px-13 py-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                            required
                            disabled={isLoading}
                        />
                        <button type='button' onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <EyeOff className='absolute right-4 top-12 w-6 h-6 mt-1.5 cursor-pointer' />
                            ) : (
                                <Eye className='absolute right-4 top-12 w-6 h-6 mt-1.5 cursor-pointer' />
                            )}
                        </button>
                    </div>

                    <div className='relative mb-6'>
                        <label className='block text-2xl font-medium mb-2'>Confirm New Password</label>
                        <img src={key} alt='' className='absolute left-4 top-12 w-6 h-6 mt-1.5' />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder='Re-enter your Password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className='border border-gray-300 rounded-2xl px-13 py-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                            required
                            disabled={isLoading}
                        />
                        <button type='button' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? (
                                <EyeOff className='absolute right-4 top-12 w-6 h-6 mt-1.5 cursor-pointer' />
                            ) : (
                                <Eye className='absolute right-4 top-12 w-6 h-6 mt-1.5 cursor-pointer' />
                            )}
                        </button>
                    </div>
                    
                    <button
                        type='submit'
                        disabled={isLoading}
                        className='bg-[#57DA65] text-black px-6 py-3 text-xl rounded-2xl hover:bg-[#37e148] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                Updating...
                            </>
                        ) : (
                            'Update'
                        )}
                    </button>
                </form>

                <button className='mt-6 bg-[#DAC325] text-black px-6 py-3 text-xl rounded-2xl hover:bg-[#c4ad1f]'>
                    <Link to='/login'>Back to Login</Link>
                </button>
            </div>
            
            {/* Success Modal */}
            {showmodal && (
                <div className="fixed inset-0 flex items-center justify-center bg-[rgba(143,143,143,0.65)] z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] shadow-xl relative overflow-hidden">
                        <h2 className="text-2xl md:text-4xl text-[#35408E] font-bold mb-4 text-center">Password Updated</h2>
                        <div className="overflow-y-auto max-h-80 md:max-h-96 mb-4">
                            <img src={check} alt="Success" className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4" />
                            <p className="text-black text-sm text-center md:text-lg leading-6 md:leading-7">
                                Your password has been updated successfully
                            </p>
                        </div>
                        <button
                            className="bg-[#DAC325] text-black font-semibold px-6 py-3 rounded-2xl hover:bg-[#c4ad1f] mx-auto block"
                            Link to='/login'
                        >
                            <Link to='/login'>Back to Login</Link>
                        </button>
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

export default changepassword