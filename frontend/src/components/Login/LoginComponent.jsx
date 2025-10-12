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
    'border border-gray-300 rounded-2xl px-4 md:px-12 py-3 w-full max-w-[460px] text-lg md:text-2xl focus:outline-none focus:ring-2 focus:ring-[#35408E]'

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
      navigate('/logged')
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
          <h1 className='text-[#35408E] text-4xl md:text-6xl font-semibold text-center mt-10'>
            Sign In to GatsisHub
          </h1>

          <form onSubmit={handleLogin} className='flex flex-col mt-10 w-full max-w-md'>
            <div className='relative mb-6'>
              <label className='block text-lg font-medium mb-2'>Email Address</label>
              <img src={userav} alt='' className='absolute left-4 top-12 w-6 h-6' />
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
              <label className='text-lg font-medium'>Password</label>
              <p className='text-[#35408E] text-sm underline text-right'>
                <Link to=''>Forgot password?</Link>
              </p>
            </div>

            <div className='relative mb-6'>
              <img src={key} alt='key' className='absolute left-4 top-4 w-6 h-6' />
              <input
                type='password'
                placeholder='Enter your Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={IntputField}
                required
              />
            </div>

            {error && <p className='text-red-600 text-center mb-4'>{error}</p>}

            <button
              type='submit'
              disabled={loading}
              className={`bg-[#35408E] text-white w-full py-3 text-2xl rounded-2xl hover:bg-[#2d3575] ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className='text-black text-sm md:text-lg mt-5 opacity-50'>or</p>

          {/* ✅ GOOGLE LOGIN BUTTON */}
          <div className='flex justify-center mt-5'>
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
