import React, { useState } from 'react'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'
import key from '../../images/key.png'
import location from '../../images/location.png'
import phone from '../../images/phone.png'
import googlelogo from '../../images/googlelogo.png'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Terms from '../TermsAndConditions'
import PageTransition from '../Transition/PageTransition'

const Signup = () => {
  const navigate = useNavigate()

  // form data
  const [companyName, setCompanyName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyNumber, setCompanyNumber] = useState('')
  const [Password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // modal & visibility states
  const [showTerms, setShowTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // feedback
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // password rules
  const hasMinlength = Password.length >= 8
  const hasLowerCase = /[a-z]/.test(Password)
  const hasUpperCase = /[A-Z]/.test(Password)
  const hasNumberOrSymbol = /[0-9!@#$%^&*]/.test(Password)
  const passwordMatch = Password === confirmPassword && confirmPassword !== ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!agreeTerms) {
      setError('You must agree to the Terms and Conditions')
      return
    }

    if (!passwordMatch) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      // 👇 Change this URL to your deployed backend
      const res = await fetch('https://gatsis-hub.vercel.app/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          emailAddress,
          companyAddress,
          companyNumber,
          password: Password,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')

      setSuccess('Signup successful! Redirecting...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition direction='left'>
      <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full'>

        {/* LEFT SIDE */}
        <div className='flex flex-col items-center py-5 md:py-10 px-4 order-1 lg:order-1'>
          <h1 className='text-[#35408E] text-3xl md:text-4xl lg:text-6xl font-semibold tracking-wide flex flex-col items-center text-center'>
            Create an Account
          </h1>

          <div className='flex flex-col items-center mt-5 md:mt-10 w-full max-w-4xl'>
            <form onSubmit={handleSubmit} className='flex flex-col w-full space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-10'>

                {/* Company Name */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Company Name</label>
                  <img src={userav} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='Enter your company name'
                  />
                </div>

                {/* Company Email */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Company Email</label>
                  <img src={userav} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='Enter your company email'
                  />
                </div>

                {/* Office Address */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Office Address</label>
                  <img src={location} alt="" className='absolute left-3.5 top-15 md:top-15.5 w-5 h-6 md:w-6 md:h-7' />
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='Enter your Office Address'
                  />
                </div>

                {/* Company Number */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Company Number</label>
                  <img src={phone} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="tel"
                    value={companyNumber}
                    onChange={(e) => setCompanyNumber(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='Enter your Company Number'
                  />
                </div>

                {/* Password */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium block'>Enter your Password</label>
                  <img src={key} alt="" className='absolute left-4 top-11 md:top-13.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Enter your Password'
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 pr-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword
                      ? <EyeOff className='absolute right-4 top-11 md:top-13.5 text-gray-400 cursor-pointer' />
                      : <Eye className='absolute right-4 top-11 md:top-13.5 text-gray-400 cursor-pointer' />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className='relative'>
                  <div className='flex items-center gap-2 md:gap-4 flex-wrap'>
                    {/* add ux */}
                    <label className='text-black text-lg md:text-2xl font-medium block'>Re-enter your password</label>
                    {passwordMatch ? (
                      <span className='flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full'>
                        <Check className='w-3 h-3 md:w-4 md:h-4 text-white' />
                      </span>
                    ) : confirmPassword && (
                      <span className='flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full'>
                        <X className='w-3 h-3 md:w-4 md:h-4 text-white' />
                      </span>
                    )}
                  </div>
                  <img src={key} alt="" className='absolute left-4 top-11 md:top-13.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Re-enter your Password'
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 pr-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword
                      ? <EyeOff className='absolute right-4 top-11 md:top-13.5 text-gray-400 cursor-pointer' />
                      : <Eye className='absolute right-4 top-11 md:top-13.5 text-gray-400 cursor-pointer' />}
                  </button>
                </div>
              </div>

              {/* Password validation UI */}
              <div className='bg-gray-50 p-4 md:p-6 rounded-xl'>
                <h3 className='text-base md:text-lg font-semibold mb-3'>Password must:</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                  {[
                    { valid: hasMinlength, text: "At least 8 characters" },
                    { valid: hasLowerCase, text: "At least 1 lowercase letter" },
                    { valid: hasUpperCase, text: "At least 1 uppercase letter" },
                    { valid: hasNumberOrSymbol, text: "At least 1 number or symbol" },
                  ].map((rule, i) => (
                    <div key={i} className='flex items-center gap-2'>
                      <span className={`flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full ${rule.valid ? 'bg-green-500' : 'bg-red-500'}`}>
                        {rule.valid ? <Check className='w-3 h-3 md:w-4 md:h-4 text-white' /> : <X className='w-3 h-3 md:w-4 md:h-4 text-white' />}
                      </span>
                      <span className={`text-sm md:text-base ${rule.valid ? 'text-green-700' : 'text-red-700'}`}>{rule.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms checkbox */}
              <div className='flex flex-col items-center'>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={agreeTerms}
                    onChange={() => setAgreeTerms(!agreeTerms)}
                    className='mr-2 accent-[#35408E]'
                  />
                  <span className='text-sm md:text-base'>
                    I agree to the{' '}
                    <button
                      type='button'
                      onClick={() => setModalOpen(true)}
                      className='text-[#35408E] underline font-semibold cursor-pointer'>
                      Terms and Conditions
                    </button>
                  </span>
                </div>
                {modalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-[rgba(143,143,143,0.65)] z-50 p-4">
                    <div className="bg-[#35408E] rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] shadow-xl relative overflow-hidden">
                      <button
                        className="absolute top-3 right-3 text-gray-500"
                        onClick={() => setModalOpen(false)}
                        aria-label="Close"
                      >
                        <span className='flex items-center justify-center w-6 h-6 bg-white rounded'>
                          <X className="w-5 h-5 text-[#35408E]" />
                        </span>
                      </button>
                      <h2 className="text-2xl md:text-4xl text-white font-bold mb-4 text-center">Terms and Conditions</h2>
                      <div className="overflow-y-auto max-h-80 md:max-h-96 mb-4">
                        <p className="text-white text-sm md:text-lg leading-6 md:leading-7">
                          <Terms />
                        </p>
                      </div>
                      <button
                        className="bg-[#DAC325] text-black font-semibold px-6 md:px-8 py-2 rounded-xl block ml-auto mt-5 hover:bg-[#c4ad1f] transition-colors"
                        onClick={() => {
                          setAgreeTerms(true)
                          setModalOpen(false)
                        }}
                      >
                        Agree
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback */}
              {error && <p className='text-red-500 text-center'>{error}</p>}
              {success && <p className='text-green-600 text-center'>{success}</p>}

              {/* Sign up button */}
              <button
                type='submit'
                disabled={loading}
                className='bg-[#35408E] text-white w-full py-3 md:py-4 text-xl md:text-2xl lg:text-3xl rounded-2xl cursor-pointer hover:bg-[#2d3575] transition-colors'>
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>

              {/* OR divider */}
              <div className='flex items-center justify-center mt-4'>
                <hr className='w-1/4 border-gray-300' />
                <span className='mx-2 text-gray-600 text-sm md:text-base'>or sign up with</span>
                <hr className='w-1/4 border-gray-300' />
              </div>

              {/* Google sign-up */}
              <button
                type='button'
                className='flex items-center justify-center gap-3 border border-gray-300 rounded-2xl py-3 hover:bg-gray-100 transition-colors'>
                <img src={googlelogo} alt='Google logo' className='w-6 h-6' />
                <span className='text-gray-700 text-lg md:text-xl'>Sign up with Google</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className='bg-[#35408E] w-full min-h-screen order-2 lg:order-2 flex flex-col items-center justify-center text-center text-white px-4'>
          <img src={logo} alt='Logo' className='w-[120px] h-[120px] md:w-[170px] md:h-[170px]' />
          <h1 className='text-4xl font-semibold mt-5'>Welcome to Gatsishub</h1>
          <p className='mt-4 text-lg max-w-md'>Premium Hanger Solutions Crafted for Quality and Style.</p>
          <Link
            to='/login'
            className='bg-[#DAC325] text-black px-8 py-3 text-xl rounded-2xl mt-6 hover:bg-[#c4ad1f] transition-colors'>
            Sign In
          </Link>
        </div>
      </div>

      {/* {showTerms && <Terms onClose={() => setShowTerms(false)} />} */}
    </PageTransition>
  )
}

export default Signup
