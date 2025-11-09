import React, { useState } from 'react'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'
import googlelogo from '../../images/googlelogo.png'
import key from '../../images/key.png'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '../Transition/PageTransition'
import { useAuth } from '../../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode' // ✅ FIXED import

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const IntputField =
    'border border-gray-300 rounded-2xl pl-12 pr-4 py-3 md:py-4 w-full text-base md:text-lg lg:text-xl focus:outline-none focus:ring-2 focus:ring-[#35408E]'

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

      login(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/logged')
      window.dispatchEvent(new Event('user-updated'))
    } catch (err) {
      console.error('❌ Login error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential
      const decoded = jwtDecode(token)
      console.log('✅ Google user info:', decoded)

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

      // Check if user needs to complete profile (new Google users without addresses)
      if (!data.user.addresses || data.user.addresses.length === 0) {
        console.log('🔄 New Google user - redirecting to complete profile')
        navigate('/complete-profile')
      } else {
        navigate('/logged')
      }
      
      window.dispatchEvent(new Event('user-updated'))
    } catch (err) {
      console.error('❌ Google login error:', err.message)
      setError(err.message)
    }
  }

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful. Please try again.')
  }

  return (
    <PageTransition direction='right'>
      <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full'>
        {/* Left side */}
        <div className='bg-[#35408E] w-full min-h-[400px] lg:min-h-screen order-2 lg:order-1'>
          <div className='flex flex-col items-center justify-center h-full py-8 md:py-12 lg:py-20 px-4'>
            <Link to='/'>
              <img src={logo} alt='Logo' className='w-[100px] h-[100px] md:w-[140px] md:h-[140px] lg:w-[170px] lg:h-[170px] mx-auto' />
            </Link>
            <h1 className='text-white text-2xl md:text-3xl lg:text-4xl font-semibold mt-4 md:mt-6 text-center'>Welcome to GatsisHub</h1>
            <p className='text-white text-sm md:text-base lg:text-xl text-center mt-3 md:mt-5 font-medium px-4 max-w-md'>
              Premium Hanger Solutions Crafted for Quality and Style.
            </p>
            <Link
              to='/signup'
              className='bg-[#DAC325] text-black px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg lg:text-xl rounded-2xl mt-4 md:mt-6 hover:bg-[#c4ad1f] transition-colors'
            >
              Sign Up
            </Link>
            <p className='text-white text-sm md:text-base lg:text-lg mt-3 text-center'>Don't have an account yet?</p>
          </div>
        </div>

        {/* Right side */}
        <div className='flex flex-col items-center justify-center py-8 md:py-12 lg:py-20 px-4 md:px-8 lg:px-12 order-1 lg:order-2'>
          <h1 className='text-[#35408E] text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-center'>
            Sign In to GatsisHub
          </h1>

          <form onSubmit={handleLogin} className='flex flex-col mt-6 md:mt-8 lg:mt-10 w-full max-w-md'>
            <div className='relative mb-5 md:mb-6'>
              <label className='block text-base md:text-lg font-medium mb-2'>Email Address</label>
              <img src={userav} alt='' className='absolute left-4 top-11 md:top-12 w-5 h-5 md:w-6 md:h-6' />
              <input
                type='email'
                placeholder='you@example.com'
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className={IntputField}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-2 mb-2'>
              <label className='text-base md:text-lg font-medium'>Password</label>
              <p className='text-[#35408E] text-xs md:text-sm underline text-right'>
                <Link to='/forgotpassword'>Forgot password?</Link>
              </p>
            </div>

            <div className='relative mb-5 md:mb-6'>
              <img src={key} alt='key' className='absolute left-4 top-3.5 md:top-4 w-5 h-5 md:w-6 md:h-6' />
              <input
                type='password'
                placeholder='Enter your Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={IntputField}
                required
              />
            </div>

            {error && <p className='text-red-600 text-sm md:text-base text-center mb-4'>{error}</p>}

            <button
              type='submit'
              disabled={loading}
              className={`bg-[#35408E] text-white w-full py-3 md:py-3.5 text-lg md:text-xl lg:text-2xl rounded-2xl hover:bg-[#2d3575] transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className='text-black text-sm md:text-base lg:text-lg mt-4 md:mt-5 opacity-50'>or</p>

          {/* ✅ GOOGLE LOGIN BUTTON */}
          <div className='flex justify-center mt-4 md:mt-5'>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              shape='pill'
              size='large'
              text='continue_with'
            />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default Login
