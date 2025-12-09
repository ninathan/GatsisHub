import React, { useState } from 'react'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'
import key from '../../images/key.png'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '../../components/Transition/PageTransition'

const AuthOM = () => {
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
            // Validate inputs
            if (!email || !password) {
                throw new Error('Please enter both email and password');
            }

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

            // Verify role is Operational Manager and department matches
            if (data.employee.role !== 'Operational Manager' || data.employee.assigneddepartment !== 'Operational Manager') {
                throw new Error('Access denied. This login is for Operational Managers only.');
            }

            // Store employee data in localStorage
            localStorage.setItem('employee', JSON.stringify(data.employee));
            
            if (rememberMe) {
                localStorage.setItem('rememberEmployee', 'true');
            }

            // Redirect to OM dashboard
            navigate('/orderpageOM');

        } catch (err) {

            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const IntputField =
    'border border-gray-300 rounded-2xl pl-10 md:pl-12 pr-4 py-2 md:py-3 w-full text-sm md:text-lg lg:text-2xl focus:outline-none focus:ring-2 focus:ring-[#E6AF2E]'
    return (
        <PageTransition direction='right'>

            <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full'>
                {/* left */}
                <div className='bg-[#191716] w-full min-h-screen lg:min-h-[964px] order-2 lg:order-1'>
                    <div className='flex flex-col items-center py-10 md:py-20 lg:mt-25 px-4'>
                        <Link to="/">
                            <img src={logo} alt="Logo" className='w-[120px] h-[120px] md:w-[170px] md:h-[170px] mx-auto mt-5 md:mt-10' />
                        </Link>
                        <h1 className='text-white text-3xl md:text-4xl lg:text-5xl flex flex-col font-light items-center mt-3 md:mt-5 text-center'>
                            Welcome to</h1>
                        <h1 className='text-white text-3xl md:text-4xl lg:text-5xl font-semibold flex flex-col items-center mt-3 md:mt-5 text-center'>
                            Gatsishub</h1>
                        
                    </div>
                </div>

                {/* right */}
                <div className='flex flex-col items-center justify-center py-10 md:py-20 lg:mt-35 px-4 order-1 lg:order-2'>
                    <h1 className='text-[#191716] text-3xl md:text-4xl lg:text-6xl font-semibold tracking-wide flex flex-col items-center mt-5 md:mt-10 text-center max-w-md lg:max-w-none'>
                        Sign In as Operational Manager</h1>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
                            <p className="text-base md:text-lg">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className='flex flex-col mt-6 md:mt-10 lg:mt-20 w-full max-w-md lg:max-w-lg'>
                        {/* email */}
                        <div className='relative mb-4 md:mb-6'>
                            <label htmlFor="email" className='block text-lg md:text-2xl font-medium mb-2'>Email</label>
                            <img src={userav} alt="" className='absolute left-4 top-12 md:top-14.5 w-5 h-5 md:w-6 md:h-6' />
                            <input 
                                type="email" 
                                id="email"
                                placeholder='Enter your email' 
                                className={IntputField}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mb-2'>
                            <label htmlFor="password" className='text-black text-lg md:text-2xl font-medium'>Password</label>
                            <button 
                                type="button"
                                onClick={() => setShowForgotPasswordModal(true)}
                                className='text-[#35408E] text-sm md:text-1xl font-medium underline hover:text-[#2d3575] text-left md:text-right'
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Password Input */}
                        <div className='relative mb-6'>
                            <img src={key} alt="key" className='absolute left-4 top-4 md:top-5 w-5 h-5 md:w-6 md:h-6' />
                            <input 
                                type="password" 
                                id="password"
                                placeholder='Enter your Password' 
                                className={IntputField}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Remember Me */}
                        <div className='flex w-full mb-6'>
                            <div className='flex items-center'>
                                <input 
                                    type="checkbox" 
                                    className='mr-2'
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={loading}
                                />
                                <span className='text-black text-base md:text-xl font-medium'>Remember me</span>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button 
                            type="submit" 
                            className='bg-[#E6AF2E] text-white w-full py-3 md:py-4 text-xl md:text-2xl lg:text-3xl rounded-2xl cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPasswordModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-[#191716] px-6 py-4">
                            <h2 className="text-white text-2xl font-semibold">Password Reset</h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-[#191716] rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-[#e6af2e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    Contact System Administrator
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    For password reset requests, please contact your System Administrator directly.
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                                    <p className="text-sm text-gray-700">
                                        <strong>Note:</strong> Only the System Administrator can reset employee passwords for security purposes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowForgotPasswordModal(false)}
                                className="bg-[#e6af2e] hover:bg-[#c49723] text-white font-semibold px-6 py-2 rounded-lg transition-colors"
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

export default AuthOM