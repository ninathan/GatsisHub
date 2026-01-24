import React, { useState } from 'react'
import styled from 'styled-components'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'
import googlelogo from '../../images/googlelogo.png'
import key from '../../images/key.png'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '../Transition/PageTransition'
import { useAuth } from '../../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode' // ✅ FIXED import
import TwoFactorVerification from './TwoFactorVerification'
import { Eye, EyeOff, Check, X, Mail, Phone, Calendar, MapPin, Lock, User, Building, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const IntputField =
    'border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'

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
        {/* Left side */}
        <div className='bg-[#191716] w-full min-h-[400px] lg:min-h-screen order-2 lg:order-1'>
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
              className='bg-[#E6AF2E] text-black px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg lg:text-xl rounded-2xl mt-4 md:mt-6 hover:bg-[#c4ad1f] transition-colors'
            >
              Sign Up
            </Link>
            <p className='text-white text-sm md:text-base lg:text-lg mt-3 text-center'>Don't have an account yet?</p>
          </div>
        </div>

        {/* Right side */}
        <div className='flex flex-col items-center justify-center py-8 md:py-12 lg:py-20 px-4 md:px-8 lg:px-12 order-1 lg:order-2'>
          <h1 className='text-[#191716] text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-center'>
            Sign In to GatsisHub
          </h1>

          <form onSubmit={handleLogin} className='flex flex-col mt-6 md:mt-8 lg:mt-10 w-full max-w-md bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200'>

            <StyledInputWrapper className="mb-4 md:mb-5">
              <div className="input__container email-input">
                <div className="shadow__input" />
                <button type="button" className="input__button__shadow">
                  <User size={18} />
                </button>
                <input
                  type='email'
                  placeholder='you@example.com'
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="input__search"
                  required
                />
              </div>
            </StyledInputWrapper>
            <StyledInputWrapper className="mb-5 md:mb-6">
              <div className="input__container password-input">
                <div className="shadow__input" />
                <button type="button" className="input__button__shadow">
                  <Lock size={18} />
                </button>
                <input
                  type='password'
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input__search"
                  required
                />
              </div>
            </StyledInputWrapper>

            {error && <p className='text-red-600 text-sm md:text-base text-center mb-4'>{error}</p>}

            <StyledButton
              type='submit'
              disabled={loading}
              className="sign-in-btn"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </StyledButton>

            <p className='text-[#35408E] text-xs md:text-sm underline text-center mt-3'>
              <Link to='/forgotpassword'>Forgot password?</Link>
            </p>
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

const StyledButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  font-weight: 700;
  font-size: 1.25rem;
  background: #e9b50b;
  color: #f0f0f0;
  cursor: pointer;
  border-radius: 0.5rem;
  border-bottom: 2px solid #e9b50b;
  border-right: 2px solid #e9b50b;
  border-top: 2px solid white;
  border-left: 2px solid white;
  transition-duration: 1s;
  transition-property: border-top, border-left, border-bottom, border-right, box-shadow;

  &:hover {
    border-top: 2px solid #e9b50b;
    border-left: 2px solid #e9b50b;
    border-bottom: 5px solid #000;
    border-right: 5px solid #000;
    box-shadow: rgba(233, 181, 11, 0.4) 8px 8px, 
                rgba(233, 181, 11, 0.3) 12px 12px,
                rgba(233, 181, 11, 0.2) 17px 17px;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    font-size: 1.5rem;
    padding: 1rem 2rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.75rem;
  }
`;

const StyledInputWrapper = styled.div`
  .input__container {
    position: relative;
    background: #f0f0f0;
    padding: 12px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    border: 3px solid #000;
    width: 100%;
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    transform-style: preserve-3d;
    transform: rotateX(10deg) rotateY(-10deg);
    perspective: 1000px;
    box-shadow: 8px 8px 0 #000;
  }

  .input__container:hover {
    transform: rotateX(5deg) rotateY(-5deg) scale(1.05);
    box-shadow: 18px 18px 0 -3px #e9b50b, 18px 18px 0 0 #000;
  }

  .shadow__input {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    bottom: 0;
    z-index: -1;
    transform: translateZ(-50px);
    background: linear-gradient(
      45deg,
      rgba(255, 107, 107, 0.4) 0%,
      rgba(255, 107, 107, 0.1) 100%
    );
    filter: blur(20px);
  }

  .input__button__shadow {
    cursor: pointer;
    border: 2px solid #000;
    background: #e9b50b;
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    transform: translateZ(20px);
    position: relative;
    z-index: 3;
    font-weight: bold;
    text-transform: uppercase;
  }

  .input__button__shadow:hover {
    background: #e9b50b;
    transform: translateZ(10px) translateX(-5px) translateY(-5px);
    box-shadow: 5px 5px 0 0 #000;
  }

  .input__button__shadow svg {
    fill: #000;
    width: 20px;
    height: 20px;
  }

  .input__search {
    width: 100%;
    outline: none;
    border: 2px solid #000;
    padding: 10px 12px;
    font-size: 15px;
    background: #fff;
    color: #000;
    transform: translateZ(10px);
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    position: relative;
    z-index: 3;
    font-family: "Roboto", Arial, sans-serif;
    letter-spacing: -0.5px;
  }

  .input__search::placeholder {
    color: #666;
    font-weight: bold;
    text-transform: uppercase;
  }

  .input__search:hover,
  .input__search:focus {
    background: #f0f0f0;
    transform: translateZ(20px) translateX(-5px) translateY(-5px);
    box-shadow: 5px 5px 0 0 #000;
  }

  .email-input::before {
    content: "EMAIL ADDRESS";
    position: absolute;
    top: -12px;
    left: 15px;
    background: #e9b50b;
    color: #000;
    font-weight: bold;
    padding: 4px 8px;
    font-size: 12px;
    transform: translateZ(50px);
    z-index: 4;
    border: 2px solid #000;
  }

  .password-input::before {
    content: "PASSWORD";
    position: absolute;
    top: -12px;
    left: 15px;
    background: #e9b50b;
    color: #000;
    font-weight: bold;
    padding: 4px 8px;
    font-size: 12px;
    transform: translateZ(50px);
    z-index: 4;
    border: 2px solid #000;
  }
`;

export default Login
