import React, { useState } from 'react'
import logo from '../../images/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '../../components/Transition/PageTransition'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Lock, User, Mail, Eye, EyeOff, Shield, Settings, Database, Server } from 'lucide-react'

const AuthSystemA = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

            // Verify this is a System Admin account
            if (data.employee.role !== 'System Admin') {
                throw new Error('Access denied. This login is for System Admin only. Please use the appropriate login page.');
            }

            // Store employee data in localStorage
            localStorage.setItem('systemAdmin', JSON.stringify(data.employee));

            if (rememberMe) {
                localStorage.setItem('rememberSystemAdmin', 'true');
            }

            // Redirect to System Admin dashboard
            navigate('/systememployees');

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition direction='right'>
            <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full'>
                {/* Left side - Brand Section */}
                <div className='bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617] w-full min-h-[400px] lg:min-h-screen order-2 lg:order-1 relative overflow-hidden'>
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-20 left-20 w-40 h-40 bg-red-500 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-20 right-20 w-60 h-60 bg-red-600 rounded-full blur-3xl"></div>
                    </div>

                    <div className='flex flex-col items-center justify-center h-full py-8 md:py-12 lg:py-20 px-4 relative z-10'>
                        <Link to='/' className="group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                <img 
                                    src={logo} 
                                    alt='Logo' 
                                    className='w-[100px] h-[100px] md:w-[140px] md:h-[140px] lg:w-[170px] lg:h-[170px] mx-auto relative z-10 transition-transform group-hover:scale-110 duration-300' 
                                />
                            </div>
                        </Link>
                        
                        <div className="mt-8 md:mt-10 text-center max-w-md">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Shield className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
                                <h1 className='text-white text-2xl md:text-3xl lg:text-4xl font-bold'>
                                    <span className="text-red-500">System</span> Control
                                </h1>
                            </div>
                            <p className='text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-6'>
                                Complete system administration and management control center.
                            </p>
                            
                            {/* Feature highlights */}
                            <div className="space-y-3 text-left">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                        <Settings className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">System Configuration</p>
                                        <p className="text-xs text-gray-400">Manage all system settings</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    {/* <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                        <Database className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Data Management</p>
                                        <p className="text-xs text-gray-400">Full database access</p>
                                    </div> */}
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                        <Server className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">User Administration</p>
                                        <p className="text-xs text-gray-400">Control all user accounts</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login Form */}
                <div className='flex flex-col items-center justify-center py-8 md:py-12 lg:py-20 px-4 md:px-8 lg:px-12 order-1 lg:order-2 bg-gray-50'>
                    <div className="w-full max-w-md">
                        {/* Header with Badge */}
                        <div className="text-center mb-8 md:mb-10">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                                <Shield className="w-5 h-5" />
                                <span className="text-sm font-semibold">System Administrator</span>
                            </div>
                            <h1 className='text-[#191716] text-3xl md:text-4xl lg:text-5xl font-bold mb-3'>
                                Admin Sign In
                            </h1>
                            <p className="text-gray-600 text-sm md:text-base">
                                Access system control panel
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className='w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200'>
                            {/* Email Input */}
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type='email'
                                        placeholder='sysadmin@gatsishub.com'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-gray-900"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder='Enter your password'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-gray-900"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={loading}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me Checkbox */}
                            <div className='flex items-center justify-between mb-6'>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        className='w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer'
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <label htmlFor="rememberMe" className='ml-2 text-sm font-medium text-gray-700 cursor-pointer'>
                                        Remember me
                                    </label>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                    <p className='text-red-700 text-sm'>{error}</p>
                                </div>
                            )}

                            {/* Sign In Button */}
                            <button
                                type='submit'
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5" />
                                        Access System
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-red-900 mb-1">⚠️ Restricted Access</p>
                                    <p className="text-xs text-red-700">
                                        This portal is restricted to authorized System Administrators only. 
                                        All access attempts are logged and monitored for security purposes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Warning */}
                        <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs text-gray-600">
                                    <strong>Note:</strong> Unauthorized access attempts will be reported to security.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}

export default AuthSystemA