import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../images/logo.png'
import PageTransition from '../../components/Transition/PageTransition'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Lock, User, Mail, Eye, EyeOff, Wrench, Users, ClipboardCheck } from 'lucide-react'

const AuthPA = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

    useEffect(() => {
        // Check if employee is already logged in
        const employee = localStorage.getItem('employee')
        if (employee) {
            const employeeData = JSON.parse(employee)
            if (employeeData.assigneddepartment === 'Production' || employeeData.assigneddepartment === 'Assembly') {
                navigate('/assignorder')
            }
        }

        // Check for remembered credentials
        const rememberedEmployee = localStorage.getItem('rememberEmployee')
        if (rememberedEmployee) {
            const employeeData = JSON.parse(rememberedEmployee)
            setEmail(employeeData.email || '')
            setRememberMe(true)
        }
    }, [navigate])

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('https://gatsis-hub.vercel.app/employees/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Login failed')
            }

            // Check if employee is from Production or Assembly department
            if (data.employee.assigneddepartment !== 'Production' && data.employee.assigneddepartment !== 'Assembly') {
                setError('Access denied. This login is only for Production & Assembly staff.')
                setLoading(false)
                return
            }

            // Check account status
            if (data.employee.accountstatus === 'Inactive') {
                setError('Your account is inactive. Please contact the administrator.')
                setLoading(false)
                return
            }

            // Store employee data
            localStorage.setItem('employee', JSON.stringify(data.employee))

            // Handle remember me
            if (rememberMe) {
                localStorage.setItem('rememberEmployee', JSON.stringify({
                    email: data.employee.email
                }))
            } else {
                localStorage.removeItem('rememberEmployee')
            }

            // Navigate to Production & Assembly dashboard
            navigate('/assignorder')
        } catch (err) {
            console.error('Login error:', err)
            setError(err.message || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <PageTransition direction='right'>
            <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full'>
                {/* Left side - Brand Section */}
                <div className='bg-gradient-to-br from-[#191716] to-[#2d2a28] w-full min-h-[400px] lg:min-h-screen order-2 lg:order-1 relative overflow-hidden'>
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-20 left-20 w-40 h-40 bg-[#E6AF2E] rounded-full blur-3xl"></div>
                        <div className="absolute bottom-20 right-20 w-60 h-60 bg-[#E6AF2E] rounded-full blur-3xl"></div>
                    </div>

                    <div className='flex flex-col items-center justify-center h-full py-8 md:py-12 lg:py-20 px-4 relative z-10'>
                        <Link to='/' className="group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#E6AF2E] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                <img 
                                    src={logo} 
                                    alt='Logo' 
                                    className='w-[100px] h-[100px] md:w-[140px] md:h-[140px] lg:w-[170px] lg:h-[170px] mx-auto relative z-10 transition-transform group-hover:scale-110 duration-300' 
                                />
                            </div>
                        </Link>
                        
                        <div className="mt-8 md:mt-10 text-center max-w-md">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Wrench className="w-8 h-8 md:w-10 md:h-10 text-[#E6AF2E]" />
                                <h1 className='text-white text-2xl md:text-3xl lg:text-4xl font-bold'>
                                    <span className="text-[#E6AF2E]">Assembly</span> Portal
                                </h1>
                            </div>
                            <p className='text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-6'>
                                Track your work, manage tasks, and monitor your performance.
                            </p>
                            
                            {/* Feature highlights */}
                            <div className="space-y-3 text-left">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <div className="w-10 h-10 bg-[#E6AF2E]/20 rounded-lg flex items-center justify-center">
                                        <ClipboardCheck className="w-5 h-5 text-[#E6AF2E]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Task Management</p>
                                        <p className="text-xs text-gray-400">View & complete assignments</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <div className="w-10 h-10 bg-[#E6AF2E]/20 rounded-lg flex items-center justify-center">
                                        <Wrench className="w-5 h-5 text-[#E6AF2E]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Work Tracking</p>
                                        <p className="text-xs text-gray-400">Log progress & updates</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <div className="w-10 h-10 bg-[#E6AF2E]/20 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-[#E6AF2E]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Team Collaboration</p>
                                        <p className="text-xs text-gray-400">Work with your team</p>
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
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                                <Wrench className="w-5 h-5" />
                                <span className="text-sm font-semibold">Production & Assembly</span>
                            </div>
                            <h1 className='text-[#191716] text-3xl md:text-4xl lg:text-5xl font-bold mb-3'>
                                Worker Sign In
                            </h1>
                            <p className="text-gray-600 text-sm md:text-base">
                                Access your work dashboard
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
                                        placeholder='worker@gatsishub.com'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-900"
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
                                        className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-900"
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
                                        className='w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer'
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
                                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <Wrench className="w-5 h-5" />
                                        Access Work Dashboard
                                    </>
                                )}
                            </button>

                            {/* Forgot Password Link */}
                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPasswordModal(true)}
                                    className='text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors'
                                    disabled={loading}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Wrench className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-orange-900 mb-1">Production & Assembly Access</p>
                                    <p className="text-xs text-orange-700">
                                        This portal provides access to work assignments, task tracking, and team collaboration tools.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPasswordModal && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <Lock className="w-5 h-5 text-orange-600" />
                                </div>
                                <h2 className="text-white text-xl md:text-2xl font-bold">Password Reset</h2>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-4">
                                    <Wrench className="w-8 h-8 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Contact System Administrator
                                </h3>
                                <p className="text-base text-gray-600 mb-4 leading-relaxed">
                                    For security reasons, password resets must be handled by your System Administrator.
                                </p>
                                
                                {/* Info Box */}
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-r-lg p-4 w-full text-left">
                                    <div className="flex gap-3">
                                        <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-semibold text-orange-900 mb-1">Important:</p>
                                            <p className="text-sm text-orange-800">
                                                Only authorized System Administrators can reset worker passwords for security purposes.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowForgotPasswordModal(false)}
                                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg cursor-pointer"
                            >
                                Got it, Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes scaleIn {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </PageTransition>
    )
}

export default AuthPA