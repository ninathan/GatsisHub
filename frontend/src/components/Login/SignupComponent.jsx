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
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../../context/AuthContext'

const Signup = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  // form data
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [companyNumber, setCompanyNumber] = useState('')
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [Password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Company Address fields
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('Philippines')

  // modal & visibility states
  const [showTerms, setShowTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

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

    // Build address object
    const companyAddress = {
      id: Date.now(), // Generate unique ID
      name: 'Home Address',
      phone: companyNumber || '', // Use company number as phone
      address: [
        street.trim(),
        city.trim() && `${city.trim()}${province.trim() ? ', ' + province.trim() : ''}`,
        postalCode.trim(),
        country.trim()
      ].filter(Boolean).join('\n'), // Combine into multi-line address
      isDefault: true // First address is default
    };

    // Street is now required, so always include the address
    const addresses = [companyAddress];

    try {
      setLoading(true)
      // 👇 Change this URL to your deployed backend
      const res = await fetch('https://gatsis-hub.vercel.app/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          emailAddress,
          companyNumber,
          gender,
          dateOfBirth,
          password: Password,
          addresses: addresses,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')

      // Show success modal instead of immediate redirect
      setShowSuccessModal(true)
    } catch (err) {
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

      // Send token to backend for Google signup/login
      const res = await fetch('https://gatsis-hub.vercel.app/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Google sign-up failed')

      // Save user and redirect
      localStorage.setItem('user', JSON.stringify(data.user))
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
      console.error('❌ Google sign-up error:', err.message)
      setError(err.message || 'Google Sign-Up was unsuccessful. Please try again.')
    }
  }

  const handleGoogleError = () => {
    setError('Google Sign-Up was unsuccessful. Please try again.')
  }

  const IntputField =
    'border border-gray-300 rounded-2xl pl-12 pr-4 py-3 md:py-4 w-full text-base md:text-lg lg:text-xl focus:outline-none focus:ring-2 focus:ring-[#35408E]'

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

                {/* First Name */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>First Name</label>
                  <img src={userav} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='Enter your first name'
                    required
                  />
                </div>

                {/* Last Name */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Last Name</label>
                  <img src={userav} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='Enter your last name'
                    required
                  />
                </div>

                {/* Email Address */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Email Address</label>
                  <img src={userav} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='Enter your email'
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Phone Number</label>
                  <img src={phone} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="tel"
                    value={companyNumber}
                    onChange={(e) => setCompanyNumber(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='Enter your phone number'
                  />
                </div>

                {/* Gender */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Gender</label>
                  <img src={userav} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E] appearance-none bg-white'
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Date of Birth</label>
                  <img src={userav} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    required
                  />
                </div>

                {/* Street Address */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Street Address</label>
                  <img src={location} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='Street Address'
                    required
                  />
                </div>

                {/* City */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>City</label>
                  <img src={location} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='City'
                  />
                </div>

                {/* Province/State */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Province/State</label>
                  <img src={location} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='Province/State'
                  />
                </div>

                {/* Postal Code */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Postal Code</label>
                  <img src={location} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='Postal Code'
                  />
                </div>

                {/* Country */}
                <div className='relative'>
                  <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Country</label>
                  <img src={location} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                    placeholder='Country'
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
                  <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50 p-4">
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
                <span className='mx-2 text-gray-600 text-sm md:text-base'>or</span>
                <hr className='w-1/4 border-gray-300' />
              </div>

              {/* Google sign-up */}
              <div className='flex justify-center mt-4'>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="pill"
                  width="400"
                />
              </div>
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
            className='bg-[#DAC325] text-black px-6 md:px-15 lg:px-25 py-2 md:py-3 text-lg md:text-2xl lg:text-3xl rounded-2xl md:rounded-4xl mt-5 md:mt-10 cursor-pointer transition-all hover:bg-[#c4ad1f]'>
            Sign In
          </Link>
          <p className='text-white text-lg md:text-2xl lg:text-3xl mt-3 md:mt-5 text-center px-4'>
              Don&apos;t have an account yet?
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-green-600 px-6 py-4">
              <h2 className="text-white text-2xl font-semibold">✓ Registration Successful!</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome to GatsisHub!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your account has been created successfully. A confirmation email has been sent to:
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full mb-4">
                  <p className="text-sm font-semibold text-blue-800">
                    {emailAddress}
                  </p>
                </div>
                <p className="text-gray-600 text-sm">
                  Please check your email to verify your account. You can now log in to start ordering custom hangers!
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => navigate('/login')}
                className="bg-[#35408E] hover:bg-[#2d3575] text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {showTerms && <Terms onClose={() => setShowTerms(false)} />} */}
    </PageTransition>
  )
}

export default Signup
