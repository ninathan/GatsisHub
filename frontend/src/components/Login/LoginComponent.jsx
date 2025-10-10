import React, { useState } from 'react'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'
import googlelogo from '../../images/googlelogo.png'
import key from '../../images/key.png'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '../Transition/PageTransition'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const IntputField =
    'border border-gray-300 rounded-2xl px-4 md:px-12 py-3 w-full max-w-[460px] text-lg md:text-2xl focus:outline-none focus:ring-2 focus:ring-[#35408E]'

  // ✅ Handle form submit
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
      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      console.log('✅ Logged in user:', data)

      login(data.user)

      // Store token or user info in localStorage if needed
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect to dashboard or logged-in page
      navigate('/logged')
    } catch (err) {
      console.error('❌ Login error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition direction='right'>
      <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full'>
        {/* left */}
        <div className='bg-[#35408E] w-full min-h-screen lg:min-h-[964px] order-2 lg:order-1'>
          <div className='flex flex-col items-center py-10 md:py-20 lg:mt-25 px-4'>
            <Link to='/'>
              <img
                src={logo}
                alt='Logo'
                className='w-[120px] h-[120px] md:w-[170px] md:h-[170px] mx-auto mt-5 md:mt-10'
              />
            </Link>
            <h1 className='text-white text-3xl md:text-4xl lg:text-5xl flex flex-col font-light items-center mt-3 md:mt-5 text-center'>
              Welcome to
            </h1>
            <h1 className='text-white text-3xl md:text-4xl lg:text-5xl font-semibold flex flex-col items-center mt-3 md:mt-5 text-center'>
              Gatsishub
            </h1>
            <p className='text-white text-lg md:text-xl lg:text-2xl text-center mt-5 md:mt-10 font-medium px-4 max-w-md'>
              Premium Hanger Solutions Crafted for Quality and Style.
            </p>

            <Link
              to='/signup'
              className='bg-[#DAC325] text-black px-6 md:px-15 lg:px-25 py-2 md:py-3 text-lg md:text-2xl lg:text-3xl rounded-2xl md:rounded-4xl mt-5 md:mt-10 cursor-pointer transition-all hover:bg-[#c4ad1f]'
            >
              Sign Up
            </Link>

            <p className='text-white text-lg md:text-2xl lg:text-3xl mt-3 md:mt-5 text-center px-4'>
              Don&apos;t have an account yet?
            </p>
          </div>
        </div>

        {/* right */}
        <div className='flex flex-col items-center justify-center py-10 md:py-20 lg:mt-35 px-4 order-1 lg:order-2'>
          <h1 className='text-[#35408E] text-3xl md:text-4xl lg:text-6xl font-semibold tracking-wide flex flex-col items-center mt-5 md:mt-10 text-center max-w-md lg:max-w-none'>
            Sign In to Gatsishub
          </h1>

          <form
            className='flex flex-col mt-10 md:mt-20 lg:mt-25 w-full max-w-md lg:max-w-lg'
            onSubmit={handleLogin}
          >
            {/* Email */}
            <div className='relative mb-6'>
              <label htmlFor='email' className='block text-lg md:text-2xl font-medium mb-2'>
                Email Address
              </label>
              <img
                src={userav}
                alt=''
                className='absolute left-4 top-12 md:top-14.5 w-5 h-5 md:w-6 md:h-6'
              />
              <input
                type='email'
                placeholder='you@example.com'
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className={IntputField}
                required
              />
            </div>

            {/* Password */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mb-2'>
              <label htmlFor='password' className='text-black text-lg md:text-2xl font-medium'>
                Password
              </label>
              <p className='text-[#35408E] text-sm md:text-1xl font-medium underline'>
                <Link to=''>Forgot password?</Link>
              </p>
            </div>

            <div className='relative mb-6'>
              <img
                src={key}
                alt='key'
                className='absolute left-4 top-4 md:top-5 w-5 h-5 md:w-6 md:h-6'
              />
              <input
                type='password'
                placeholder='Enter your Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={IntputField}
                required
              />
            </div>

            {/* Remember Me */}
            <div className='flex w-full mb-6'>
              <div className='flex items-center'>
                <input type='checkbox' className='mr-2' />
                <span className='text-black text-base md:text-xl font-medium'>Remember me</span>
              </div>
            </div>

            {/* Error message */}
            {error && <p className='text-red-600 text-center mb-4'>{error}</p>}

            {/* Sign In Button */}
            <button
              type='submit'
              disabled={loading}
              className={`bg-[#35408E] text-white w-full py-3 md:py-4 text-xl md:text-2xl lg:text-3xl rounded-2xl cursor-pointer transition-all hover:bg-[#2d3575] ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Sign In with Google */}
          <p className='text-black text-sm md:text-lg mt-5 opacity-50'>or sign in with</p>
          <div className='mt-5'>
            <div className='flex justify-center'>
              <button className='border border-red-500 rounded-lg px-6 md:px-10 py-2 flex items-center space-x-2 cursor-pointer transition-all hover:bg-red-50'>
                <img
                  src={googlelogo}
                  alt='Google'
                  className='w-[24px] h-[24px] md:w-[30px] md:h-[30px]'
                />
                <span className='text-red-500 text-lg md:text-2xl font-medium'>Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default Login
