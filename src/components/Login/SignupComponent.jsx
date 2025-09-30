import React, { use } from 'react'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'
import key from '../../images/key.png'
import location from '../../images/location.png'
import phone from '../../images/phone.png'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Terms from '../TermsAndConditions'
import googlelogo from '../../images/googlelogo.png'
import PageTransition from '../Transition/PageTransition'

const Signup = () => {

    // password state
    const [Password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Validation states
    const hasMinlength = Password.length >= 8
    const hasLowerCase = /[a-z]/.test(Password)
    const hasUpperCase = /[A-Z]/.test(Password)
    const hasNumberOrSymbol = /[0-9!@#$%^&*]/.test(Password)
    const passwordMatch = Password === confirmPassword && confirmPassword !== ''

    // terms and conditions state
    const [showTerms, setShowTerms] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)

    // show/hide password
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const togglePasswordVisibility = () => setShowPassword(prevState => !prevState)

    return (
        <PageTransition direction='left'>

            <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full'>

                {/* left */}
                <div className='flex flex-col items-center py-5 md:py-10 px-4 order-1 lg:order-1'>
                    <h1 className='text-[#35408E] text-3xl md:text-4xl lg:text-6xl font-semibold tracking-wide flex flex-col items-center text-center'>
                        Create an Account</h1>

                    {/* Fields */}
                    <div className='flex flex-col items-center mt-5 md:mt-10 w-full max-w-4xl'>
                        <form className='flex flex-col w-full space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-10'>
                                {/* Company Name */}
                                <div className='relative'>
                                    <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Company Name</label>
                                    <img src={userav} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                                    <input type="text" className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]' placeholder='Enter your company name' />
                                </div>

                                {/* Company Email */}
                                <div className='relative'>
                                    <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Company Email</label>
                                    <img src={userav} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                                    <input type="email" className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]' placeholder='Enter your company email' />
                                </div>

                                {/* Office Address */}
                                <div className='relative'>
                                    <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Office Address</label>
                                    <img src={location} alt="" className='absolute left-3.5 top-15 md:top-15.5 w-5 h-6 md:w-6 md:h-7' />
                                    <input type="text" className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]' placeholder='Enter your Office Address' />
                                </div>

                                {/* Company Number */}
                                <div className='relative'>
                                    <label className='text-black text-lg md:text-2xl font-medium mb-3 block'>Company Number</label>
                                    <img src={phone} alt="" className='absolute left-4 top-15 md:top-15.5 w-5 h-5 md:w-6 md:h-6' />
                                    <input type="tel" className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]' placeholder='Enter your Company Number' />
                                </div>

                                {/* Password */}
                                <div className='relative'>
                                    <div className='flex items-center'>
                                        <label className='text-black text-lg md:text-2xl font-medium block'>Enter your Password</label>
                                    </div>
                                    <img src={key} alt="" className='absolute left-4 top-11 md:top-13.5 w-5 h-5 md:w-6 md:h-6' />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder='Enter your Password'
                                        value={Password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 pr-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                                    />
                                    <button
                                        onClick={togglePasswordVisibility}
                                        type='button'
                                        aria-label={showPassword ? "hide password" : "show password"}
                                        aria-pressed={showPassword}
                                        aria-controls='password'
                                    >
                                        {showPassword ? <EyeOff className='absolute right-4 top-11 md:top-13.5 w-5 h-5 md:w-6 md:h-6 text-gray-400 cursor-pointer' /> : <Eye className='absolute right-4 top-11 md:top-13.5 w-5 h-5 md:w-6 md:h-6 text-gray-400 cursor-pointer' />}
                                    </button>
                                </div>

                                {/* Re-enter Password */}
                                <div className='relative'>
                                    <div className='flex items-center gap-2 md:gap-4 flex-wrap'>
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
                                        className='border border-gray-300 rounded-2xl px-4 md:px-15 py-3 pl-10 md:pl-12 pr-12 w-full mt-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                                        placeholder='Re-enter your password'
                                    />
                                    <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} type='button'
                                        aria-label={showConfirmPassword ? "hide password" : "show password"}
                                        aria-pressed={showConfirmPassword}
                                        aria-controls='password'>
                                        {showConfirmPassword ? <EyeOff className='absolute right-4 top-11 md:top-13.5 w-5 h-5 md:w-6 md:h-6 text-gray-400 cursor-pointer' /> : <Eye className='absolute right-4 top-11 md:top-13.5 w-5 h-5 md:w-6 md:h-6 text-gray-400 cursor-pointer' />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className='bg-gray-50 p-4 md:p-6 rounded-xl'>
                                <h3 className='text-base md:text-lg font-semibold mb-3'>Password must:</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                                    <div className='flex items-center gap-2'>
                                        {hasMinlength ? (
                                            <span className='flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full'>
                                                <Check className='w-3 h-3 md:w-4 md:h-4 text-white' />
                                            </span>
                                        ) : (
                                            <span className='flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full'>
                                                <X className='w-3 h-3 md:w-4 md:h-4 text-white' />
                                            </span>
                                        )}
                                        <span className={`text-sm md:text-base ${hasMinlength ? 'text-green-700' : 'text-red-700'}`}>At least 8 characters</span>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        {hasLowerCase ? (
                                            <span className='flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full'>
                                                <Check className='w-3 h-3 md:w-4 md:h-4 text-white' />
                                            </span>
                                        ) : (
                                            <span className='flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full'>
                                                <X className='w-3 h-3 md:w-4 md:h-4 text-white' />
                                            </span>
                                        )}
                                        <span className={`text-sm md:text-base ${hasLowerCase ? 'text-green-700' : 'text-red-700'}`}>At least 1 lowercase letter</span>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        {hasUpperCase ? (
                                            <span className='flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full'>
                                                <Check className='w-3 h-3 md:w-4 md:h-4 text-white' />
                                            </span>
                                        ) : (
                                            <span className='flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full'>
                                                <X className='w-3 h-3 md:w-4 md:h-4 text-white' />
                                            </span>
                                        )}
                                        <span className={`text-sm md:text-base ${hasUpperCase ? 'text-green-700' : 'text-red-700'}`}>At least 1 uppercase letter</span>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        {hasNumberOrSymbol ? (
                                            <span className='flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full'>
                                                <Check className='w-3 h-3 md:w-4 md:h-4 text-white' />
                                            </span>
                                        ) : (
                                            <span className='flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full'>
                                                <X className='w-3 h-3 md:w-4 md:h-4 text-white' />
                                            </span>
                                        )}
                                        <span className={`text-sm md:text-base ${hasNumberOrSymbol ? 'text-green-700' : 'text-red-700'}`}>At least 1 number or symbol</span>
                                    </div>
                                </div>
                            </div>

                            {/* Terms and Conditions Modal */}
                            <div className='flex flex-col items-center'>
                                <div className='flex items-center'>
                                    <input
                                        type="checkbox"
                                        className='mr-2'
                                        checked={showTerms}
                                        onChange={() => setShowTerms(!showTerms)}
                                    />
                                    <span className='text-black text-base md:text-xl font-medium'>
                                        I agree to the{' '}
                                        <button
                                            type="button"
                                            className='text-blue-500 underline cursor-pointer'
                                            onClick={() => setModalOpen(true)}
                                        >
                                            terms and conditions
                                        </button>
                                    </span>
                                </div>
                                {modalOpen && (
                                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
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
                                                    setShowTerms(true)
                                                    setModalOpen(false)
                                                }}
                                            >
                                                Agree
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button className='bg-[#35408E] text-white w-full py-3 md:py-4 text-xl md:text-2xl lg:text-3xl rounded-2xl cursor-pointer hover:bg-[#2d3575] transition-colors'>Sign Up</button>
                        </form>
                    </div>
                    {/* Sign In with Google */}
                    <p className='text-black text-sm md:text-lg mt-5 opacity-50'>or sign up with</p>
                    <div className='mt-5 mb-8 lg:mb-0'>
                        <div className='flex justify-center'>
                            <button className='border border-red-500 rounded-lg px-6 md:px-10 py-2 flex items-center space-x-2 cursor-pointer hover:bg-red-50 transition-colors'>
                                <img src={googlelogo} alt="Google" className='w-[24px] h-[24px] md:w-[30px] md:h-[30px]' />
                                <span className='text-red-500 text-lg md:text-2xl font-medium'>Google</span>
                            </button>
                        </div>
                    </div>
                </div>



                {/* right */}
                <div className='bg-[#35408E] w-full min-h-screen lg:min-h-[964px] order-2 lg:order-2'>
                    <div className='flex flex-col items-center py-10 md:py-20 lg:mt-25 px-4'>
                        <img src={logo} alt="Logo" className='w-[120px] h-[120px] md:w-[170px] md:h-[170px] mx-auto mt-5 md:mt-10' />
                        <h1 className='text-white text-3xl md:text-4xl lg:text-5xl flex flex-col font-light items-center mt-3 md:mt-5 text-center'>
                            Welcome to</h1>
                        <h1 className='text-white text-3xl md:text-4xl lg:text-5xl font-semibold flex flex-col items-center mt-3 md:mt-5 text-center'>
                            Gatsishub</h1>
                        <p className='text-white text-lg md:text-xl lg:text-2xl text-center mt-5 md:mt-10 font-medium px-4 max-w-md'>Premium Hanger Solutions Crafted for Quality and Style.</p>

                        <Link to="/login" className='bg-[#DAC325] text-black px-6 md:px-15 lg:px-25 py-2 md:py-3 text-lg md:text-2xl lg:text-3xl rounded-2xl md:rounded-4xl mt-5 md:mt-10 cursor-pointer hover:bg-[#c4ad1f] transition-colors'>Sign In</Link>

                        <p className='text-white text-lg md:text-2xl lg:text-3xl mt-3 md:mt-5 text-center px-4'>Already have an account?</p>
                    </div>
                </div>
            </div >
        </PageTransition>
    )
}

export default Signup