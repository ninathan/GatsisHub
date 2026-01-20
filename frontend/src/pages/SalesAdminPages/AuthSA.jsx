import React, { useState } from 'react'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'
import key from '../../images/key.png'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '../../components/Transition/PageTransition'
import LoadingSpinner from '../../components/LoadingSpinner'

const AuthSA = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('https://gatsis-hub.vercel.app/employees/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Verify this is a Sales Admin account
            if (data.employee.role !== 'Sales Admin' || data.employee.assigneddepartment !== 'Admin') {
                throw new Error('Access denied. This login is for Sales Admin only. Please use the appropriate login page.');
            }

            // Store employee data in localStorage
            localStorage.setItem('employee', JSON.stringify(data.employee));
            
            if (rememberMe) {
                localStorage.setItem('rememberEmployee', 'true');
            }

            // Redirect to Sales Admin dashboard
            navigate('/orderpage');

        } catch (err) {

            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const IntputField =
  'border border-gray-300 rounded-2xl pl-10 md:pl-12 pr-4 py-2 md:py-3 w-full text-sm md:text-lg lg:text-2xl focus:outline-none focus:ring-2 focus:ring-[#35408E]'
    return (
        <PageTransition direction='right'>

            <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full'>
                {/* left */}
                <div className='bg-[#191716] w-full min-h-screen lg:min-h-screen order-2 lg:order-1'>
                    <div className='flex flex-col items-center py-10 md:py-20 lg:mt-25 px-4'>
                        <Link to="/">
                            <img src={logo} alt="Logo" className='w-[120px] h-[120px] md:w-[170px] md:h-[170px] mx-auto mt-5 md:mt-10' />
                        </Link>
                        <h1 className='text-white text-xl md:text-3xl lg:text-4xl xl:text-5xl flex flex-col font-light items-center mt-2 md:mt-3 lg:mt-5 text-center'>
                            Welcome to</h1>
                        <h1 className='text-white text-xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold flex flex-col items-center mt-2 md:mt-3 lg:mt-5 text-center'>
                            Gatsishub</h1>
                        
                    </div>
                </div>

                {/* right */}
                <div className='flex flex-col items-center justify-center py-8 md:py-10 lg:py-20 px-4 order-1 lg:order-2'>
                    <h1 className='text-[#191716] text-xl md:text-3xl lg:text-4xl xl:text-6xl font-semibold tracking-wide flex flex-col items-center mt-3 md:mt-5 lg:mt-10 text-center max-w-md lg:max-w-none'>
                        Sign In as Sales Admin</h1>

                    {error && (
                        <div className='mt-4 md:mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md lg:max-w-lg w-full'>
                            <p className='text-sm md:text-base'>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className='flex flex-col mt-6 md:mt-10 lg:mt-20 w-full max-w-md lg:max-w-lg'>
                        {/* Email */}
                        <div className='relative mb-4 md:mb-6'>
                            <label htmlFor="email" className='block text-base md:text-lg lg:text-2xl font-medium mb-2'>Email</label>
                            <img src={userav} alt="" className='absolute left-3 md:left-4 top-11 md:top-12 lg:top-14.5 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6' />
                            <input 
                                type="email" 
                                placeholder='Enter your email' 
                                className={IntputField}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mb-2'>
                            <label htmlFor="password" className='text-black text-base md:text-lg lg:text-2xl font-medium'>Password</label>
                            <button 
                                type="button"
                                onClick={() => setShowForgotPasswordModal(true)}
                                className='text-[#35408E] text-xs md:text-sm lg:text-base font-medium underline hover:text-[#2d3575] text-left md:text-right'
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Password Input */}
                        <div className='relative mb-4 md:mb-6'>
                            <img src={key} alt="key" className='absolute left-3 md:left-4 top-3 md:top-4 lg:top-5 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6' />
                            <input 
                                type="password" 
                                placeholder='Enter your Password' 
                                className={IntputField}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Remember Me */}
                        <div className='flex w-full mb-4 md:mb-6'>
                            <div className='flex items-center'>
                                <input 
                                    type="checkbox" 
                                    className='mr-2 w-4 h-4 md:w-5 md:h-5'
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className='text-black text-sm md:text-base lg:text-xl font-medium'>Remember me</span>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className='bg-[#E6AF2E] text-white w-full py-2 md:py-3 lg:py-4 text-base md:text-xl lg:text-2xl xl:text-3xl rounded-2xl cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:bg-[#d99c24]'
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" color="white" />
                                    Signing In...
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPasswordModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-[#191716] px-4 md:px-6 py-3 md:py-4">
                            <h2 className="text-white text-lg md:text-2xl font-semibold">Password Reset</h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 md:p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#191716] rounded-full flex items-center justify-center mb-3 md:mb-4">
                                    <svg className="w-6 h-6 md:w-8 md:h-8 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                                    Contact System Administrator
                                </h3>
                                <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                                    For password reset requests, please contact your System Administrator directly.
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 w-full">
                                    <p className="text-xs md:text-sm text-gray-700">
                                        <strong>Note:</strong> Only the System Administrator can reset employee passwords for security purposes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowForgotPasswordModal(false)}
                                className="bg-[#E6AF2E] hover:bg-[#d99c24] text-white font-semibold px-4 md:px-6 py-2 rounded-lg transition-colors text-sm md:text-base cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageTransition>
    )
}

export default AuthSA