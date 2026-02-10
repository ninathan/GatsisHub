import React, { useState } from 'react'
import styled from 'styled-components'
import logo from '../../images/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '../Transition/PageTransition'
import { useAuth } from '../../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import TwoFactorVerification from './TwoFactorVerification'
import { Eye, EyeOff, Lock, User } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('https://gatsis-hub.vercel.app/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddress, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      // Check if 2FA is required
      if (data.requiresVerification) {
        setShowTwoFactor(true)
      } else {
        // Direct login (shouldn't happen with 2FA enabled, but kept for compatibility)
        login(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/logged')
        window.dispatchEvent(new Event('user-updated'))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFactorVerified = (user) => {
    login(user)
    localStorage.setItem('user', JSON.stringify(user))
    
    // Check if there's a pending design save
    const pendingDesign = localStorage.getItem('pendingDesignSave');
    if (pendingDesign) {
      navigate('/create-design');
    } else {
      navigate('/logged');
    }
    
    window.dispatchEvent(new Event('user-updated'))
  }

  const handleBackToLogin = () => {
    setShowTwoFactor(false)
    setPassword('')
    setError('')
  }

  const handleResendCode = async () => {
    // Resend by calling login again
    const res = await fetch('https://gatsis-hub.vercel.app/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailAddress, password }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to resend code')
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential
      const decoded = jwtDecode(token)

      // Optional: send token to your backend for verification
      const res = await fetch('https://gatsis-hub.vercel.app/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Google login failed')

      // Save user locally
      localStorage.setItem('user', JSON.stringify(data.user || decoded))
      login(data.user)

      // Check if there's a pending design save
      const pendingDesign = localStorage.getItem('pendingDesignSave');
      if (pendingDesign) {
        navigate('/create-design');
      } else {
        // Check if user needs to complete profile (new Google users without addresses)
        if (!data.user.addresses || data.user.addresses.length === 0) {
          navigate('/complete-profile')
        } else {
          navigate('/logged')
        }
      }
      
      window.dispatchEvent(new Event('user-updated'))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful. Please try again.')
  }

  // If showing 2FA verification, render that component instead
  if (showTwoFactor) {
    return (
      <TwoFactorVerification
        email={emailAddress}
        onVerified={handleTwoFactorVerified}
        onBack={handleBackToLogin}
        onResend={handleResendCode}
      />
    )
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
              <h1 className='text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-4'>
                Welcome to <span className="text-[#E6AF2E]">GatsisHub</span>
              </h1>
              <p className='text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-8'>
                Premium Hanger Solutions Crafted for Quality and Style.
              </p>
              
              <div className="space-y-4">
                <Link
                  to='/signup'
                  className='inline-block bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] hover:from-[#d4a02a] hover:to-[#c49723] text-[#191716] px-8 py-3 text-base md:text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300'
                >
                  Create Account
                </Link>
                <p className='text-gray-400 text-sm md:text-base'>
                  Don't have an account yet?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className='flex flex-col items-center justify-center py-8 md:py-12 lg:py-20 px-4 md:px-8 lg:px-12 order-1 lg:order-2 bg-gray-50'>
          <div className="w-full max-w-md">
            <div className="text-center mb-8 md:mb-10">
              <h1 className='text-[#191716] text-3xl md:text-4xl lg:text-5xl font-bold mb-3'>
                Sign In
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Welcome back! Please enter your details.
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
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type='email'
                    placeholder='you@example.com'
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-6">
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
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
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
                className="w-full bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] hover:from-[#d4a02a] hover:to-[#c49723] text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center mt-4">
                <Link 
                  to='/forgotpassword'
                  className='text-[#E6AF2E] hover:text-[#d4a02a] text-sm font-medium transition-colors'
                >
                  Forgot password?
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Login */}
            <div className='flex justify-center'>
              <div className="flex justify-center items-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  shape='rectangular'
                  size='large'
                  text='continue_with'
                />
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 text-sm mt-6">
              Don't have an account?{' '}
              <Link to='/signup' className="text-[#E6AF2E] hover:text-[#d4a02a] font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default Login