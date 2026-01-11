import React, { useState } from 'react'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'
import key from '../../images/key.png'
import location from '../../images/location.png'
import phone from '../../images/phone.png'
import googlelogo from '../../images/googlelogo.png'
import { Eye, EyeOff, Check, X, Mail, Phone, Calendar, MapPin, Lock, User, Building, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Terms from '../TermsAndConditions'
import PageTransition from '../Transition/PageTransition'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../../context/AuthContext'

const Signup = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  // steps
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // form data
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [companyName, setCompanyName] = useState('')
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
  const allPasswordRulesMet = hasMinlength && hasLowerCase && hasUpperCase && hasNumberOrSymbol

  // validation for each step
  const isStep1Valid = () => {
    return firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      emailAddress.trim() !== '' &&
      gender.trim() !== '' &&
      dateOfBirth.trim() !== ''
  }
  const isStep2Valid = () => {
    return street.trim() !== '' &&
      country.trim() !== '' &&
      postalCode.trim() !== '' &&
      city.trim() !== '' &&
      province.trim() !== ''
  }
  const isStep3Valid = () => {
    return Password !== '' &&
      confirmPassword !== '' &&
      allPasswordRulesMet &&
      agreeTerms
  }
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      setError(null)
    }
  }
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }
  const handleStepClick = (step) => {
    if (step < currentStep) {
      setCurrentStep(step)
      setError(null)
    }
  }

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

        navigate('/complete-profile')
      } else {
        navigate('/logged')
      }

      window.dispatchEvent(new Event('user-updated'))
    } catch (err) {

      setError(err.message || 'Google Sign-Up was unsuccessful. Please try again.')
    }
  }

  const handleGoogleError = () => {
    setError('Google Sign-Up was unsuccessful. Please try again.')
  }

  const IntputField =
    'border border-gray-300 rounded-2xl pl-12 pr-4 py-3 md:py-4 w-full text-base md:text-lg lg:text-xl focus:outline-none focus:ring-2 focus:ring-[#35408E]'

  const steps = [
    { number: 1, label: 'Personal Info', icon: User },
    { number: 2, label: 'Address Info', icon: MapPin },
    { number: 3, label: 'Security', icon: Lock },
  ]

  return (
    <PageTransition direction='left'>
      <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full'>

        {/* LEFT SIDE */}
        <div className='flex flex-col items-center py-8 md:py-12 px-4 md:px-8 order-1 lg:order-1 overflow-y-auto'>
          <div className='w-full max-w-4xl'>
            <div className='text-center mb-8'>
              <h1 className='text-[#191716] text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3'>
                Create Your Account
              </h1>
              <p className='text-gray-600 text-base md:text-lg'>Join us and start your journey today</p>
            </div>

            {/* Step indicator */}
            <div className='mb-8'>
              <div className='flex items-center justify-between relative'>
                {/* Progress Line */}
                <div className='absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10'>
                  <div
                    className='h-full bg-gradient-to-r from-[#E6AF2E] to-[#d19b1a] transition-all duration-500'
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                  />
                </div>


                {steps.map((step) => {
                  const StepIcon = step.icon
                  const isCompleted = currentStep > step.number
                  const isCurrent = currentStep === step.number
                  const isAccessible = step.number < currentStep

                  return (
                    <div key={step.number} className='flex flex-col items-center flex-1'>
                      <button
                        type='button'
                        onClick={() => handleStepClick(step.number)}
                        disabled={!isAccessible}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                            ? 'bg-gradient-to-r from-[#E6AF2E] to-[#d19b1a] text-white scale-110'
                            : 'bg-gray-200 text-gray-400'
                          } ${isAccessible ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                      >
                        {isCompleted ? (
                          <Check className='w-5 h-5 md:w-6 md:h-6' />
                        ) : (
                          <StepIcon className='w-5 h-5 md:w-6 md:h-6' />
                        )}
                      </button>
                      <span className={`text-xs md:text-sm mt-2 font-medium transition-colors ${isCurrent ? 'text-[#E6AF2E]' : isCompleted ? 'text-green-600' : 'text-gray-400'
                        }`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Step 1: Personal Information Section */}
              {currentStep === 1 && (
                <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200'>
                  <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2'>
                    <User className='w-6 h-6 text-[#E6AF2E]' />
                    Personal Information
                  </h2>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
                    {/* First Name */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        First Name <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative'>
                        <User className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          placeholder='John'
                          required
                        />
                      </div>
                    </div>

                    {/* Middle Name */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        Middle Name
                      </label>
                      <div className='relative'>
                        <User className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <input
                          type="text"
                          value={middleName}
                          onChange={(e) => setMiddleName(e.target.value)}
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          placeholder='Michael'
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        Last Name <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative'>
                        <User className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          placeholder='Doe'
                          required
                        />
                      </div>
                    </div>

                    {/* Company name */}
                    {/* <div className='relative group'>
                    <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                      Company Name
                    </label>
                    <div className='relative'>
                      <Building className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className='border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                        placeholder='Company Inc.'
                      />
                    </div>
                  </div> */}
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4'>
                    {/* Email */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        Email Address <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative'>
                        <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <input
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          placeholder='john.doe@example.com'
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        Phone Number
                      </label>
                      <div className='relative'>
                        <Phone className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <input
                          type="tel"
                          value={companyNumber}
                          onChange={(e) => setCompanyNumber(e.target.value)}
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          placeholder='+63 912 345 6789'
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        Gender <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative'>
                        <User className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-10 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all appearance-none bg-white cursor-pointer'
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        Date of Birth <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative'>
                        <Calendar className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors cursor-pointer' />
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className='border-2 border-gray-300 cursor-pointer rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className='mt-8'>
                    <div className='flex items-center justify-center mb-6'>
                      <hr className='w-full border-gray-300' />
                      <span className='mx-4 text-gray-500 text-sm font-medium whitespace-nowrap'>or continue with</span>
                      <hr className='w-full border-gray-300' />
                    </div>

                    <div className='flex justify-center'>
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        text="signup_with"
                        shape="pill"
                        width="100%"
                      />
                    </div>
                  </div>
                </div>
              )}


              {/* Step2: Address Section */}
              {currentStep === 2 && (
                <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200'>
                  <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2'>
                    <MapPin className='w-6 h-6 text-[#E6AF2E]' />
                    Address Information
                  </h2>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
                    {/* Street */}
                    <div className='relative group md:col-span-2'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        Street Address <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative'>
                        <MapPin className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          placeholder='123 Main Street, Barangay Example'
                          required
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        City
                      </label>
                      <div className='relative'>
                        <MapPin className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          placeholder='Quezon City'
                        />
                      </div>
                    </div>

                    {/* Province */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        Province/State
                      </label>
                      <div className='relative'>
                        <MapPin className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <input
                          type="text"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          placeholder='Metro Manila'
                        />
                      </div>
                    </div>

                    {/* Postal Code */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        Postal Code
                      </label>
                      <div className='relative'>
                        <MapPin className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          placeholder='1100'
                        />
                      </div>
                    </div>

                    {/* Country */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        Country
                      </label>
                      <div className='relative'>
                        <MapPin className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          placeholder='Philippines'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Security */}
              {currentStep === 3 && (
                <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 animate-fadeIn'>
                  <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2'>
                    <Lock className='w-6 h-6 text-[#E6AF2E]' />
                    Security
                  </h2>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
                    {/* Password */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 block'>
                        Password <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative'>
                        <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={Password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder='Create a strong password'
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-12 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E6AF2E] transition-colors'
                        >
                          {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className='relative group'>
                      <label className='text-gray-700 text-sm md:text-base font-medium mb-2 flex items-center gap-2'>
                        Confirm Password <span className='text-red-500'>*</span>
                        {passwordMatch && (
                          <span className='flex items-center justify-center w-5 h-5 bg-green-500 rounded-full'>
                            <Check className='w-3 h-3 text-white' />
                          </span>
                        )}
                        {confirmPassword && !passwordMatch && (
                          <span className='flex items-center justify-center w-5 h-5 bg-red-500 rounded-full'>
                            <X className='w-3 h-3 text-white' />
                          </span>
                        )}
                      </label>
                      <div className='relative'>
                        <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E6AF2E] transition-colors' />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder='Re-enter your password'
                          className='border-2 border-gray-300 rounded-xl pl-12 pr-12 py-3 w-full text-base focus:outline-none focus:border-[#E6AF2E] focus:ring-2 focus:ring-[#E6AF2E]/20 transition-all'
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E6AF2E] transition-colors'
                        >
                          {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl mt-6 border border-blue-200'>
                    <h3 className='text-base md:text-lg font-semibold mb-4 text-gray-800'>Password Requirements:</h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      {[
                        { valid: hasMinlength, text: "At least 8 characters" },
                        { valid: hasLowerCase, text: "One lowercase letter" },
                        { valid: hasUpperCase, text: "One uppercase letter" },
                        { valid: hasNumberOrSymbol, text: "One number or symbol" },
                      ].map((rule, i) => (
                        <div key={i} className='flex items-center gap-3'>
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full transition-all ${
                            rule.valid ? 'bg-green-500 scale-100' : 'bg-gray-300 scale-90'
                          }`}>
                            {rule.valid ? <Check className='w-4 h-4 text-white' /> : <X className='w-3 h-3 text-gray-500' />}
                          </span>
                          <span className={`text-sm font-medium transition-colors ${
                            rule.valid ? 'text-green-700' : 'text-gray-600'
                          }`}>{rule.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className='mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        checked={agreeTerms}
                        onChange={() => setAgreeTerms(!agreeTerms)}
                        onClick={() => setModalOpen(true)}
                        className='mt-1 w-5 h-5 accent-[#E6AF2E] cursor-pointer'
                      />
                      <span className='text-sm md:text-base text-gray-700'>
                        I agree to the{' '}
                        <button
                          type='button'
                          onClick={() => setModalOpen(true)}
                          className='text-[#E6AF2E] underline font-semibold hover:text-[#d19b1a] transition-colors'>
                          Terms and Conditions
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {modalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] shadow-xl relative overflow-hidden">
                      <button
                        className="absolute top-3 right-3 text-gray-500"
                        onClick={() => setModalOpen(false)}
                        aria-label="Close"
                      >
                        <span className='flex items-center justify-center w-6 h-6'>
                          <X className="w-5 h-5 text-[#191716]" />
                        </span>
                      </button>
                      <h2 className="text-2xl md:text-4xl text-[#191716] font-bold mb-4 text-center">Terms and Conditions</h2>
                      <div className="overflow-y-auto max-h-80 md:max-h-96 mb-4">
                        <p className="text-[#191716] text-sm md:text-lg leading-6 md:leading-7">
                          <Terms />
                        </p>
                      </div>
                      <button
                        className="bg-[#E6AF2E] text-black font-semibold px-6 md:px-8 py-2 rounded-xl block ml-auto mt-5 hover:bg-[#c49e1a] transition-colors cursor-pointer"
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

              {/* Navigation Buttons */}
              <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200'>
                {error && (
                  <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg'>
                    <p className='text-red-700 text-sm font-medium'>{error}</p>
                  </div>
                )}

                {success && (
                  <div className='bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg'>
                    <p className='text-green-700 text-sm font-medium'>{success}</p>
                  </div>
                )}

                <div className='flex gap-4'>
                  {currentStep > 1 && (
                    <button
                      type='button'
                      onClick={prevStep}
                      className='flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-4 text-lg font-semibold rounded-xl hover:bg-gray-300 transition-all transform hover:scale-[1.02] active:scale-[0.98]'>
                      <ChevronLeft className='w-5 h-5' />
                      Previous
                    </button>
                  )}

                  {currentStep < totalSteps ? (
                    <button
                      type='button'
                      onClick={() => {
                        if (currentStep === 1 && !isStep1Valid()) {
                          setError('Please fill in all required fields')
                          return
                        }
                        if (currentStep === 2 && !isStep2Valid()) {
                          setError('Please fill in all required fields')
                          return
                        }
                        nextStep()
                      }}
                      className='flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#E6AF2E] to-[#d19b1a] text-white py-4 text-lg md:text-xl font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]'>
                      Next
                      <ChevronRight className='w-5 h-5' />
                    </button>
                  ) : (
                    <button
                      type='submit'
                      disabled={loading || !isStep3Valid()}
                      className='flex-1 bg-gradient-to-r from-[#E6AF2E] to-[#d19b1a] text-white py-4 text-lg md:text-xl font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]'>
                      {loading ? (
                        <span className='flex items-center justify-center gap-2'>
                          <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                          </svg>
                          Creating Account...
                        </span>
                      ) : 'Create Account'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className='bg-[#191716] lg:min-h-screen order-2 lg:order-1 flex flex-col items-center justify-center text-center text-white py-8 px-4 md:px-8'>
          <img src={logo} alt='Logo' className='w-[120px] h-[120px] md:w-[170px] md:h-[170px]' />
          <h1 className='text-4xl font-semibold mt-5'>Welcome to Gatsishub</h1>
          <p className='mt-4 text-lg max-w-md'>Premium Hanger Solutions Crafted for Quality and Style.</p>
          <Link
            to='/login'
            className='bg-[#E6AF2E] text-black px-6 md:px-15 lg:px-25 py-2 md:py-3 text-lg md:text-2xl lg:text-3xl rounded-2xl md:rounded-4xl mt-5 md:mt-10 cursor-pointer transition-all hover:bg-[#c4ad1f]'>
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
