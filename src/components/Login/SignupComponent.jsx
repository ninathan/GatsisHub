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

            <div className='grid grid-cols-2 h-screen w-full'>

                {/* left */}
                <div className='flex flex-col items-center mt-5'>
                    <h1 className='text-[#35408E] text-6xl font-semibold tracking-wide flex flex-col items-center'>
                        Create an Account</h1>

                    {/* Fields */}
                    <div className='flex flex-col items-center mt-2'>
                        <form className='flex flex-col mt-15 ml-15 space-y-6'>
                            <div className='grid grid-cols-2 gap-10'>
                                {/* Company Name */}
                                <div className='relative'>
                                    <label className='text-black text-2xl font-medium mb-3'>Company Name</label>
                                    <img src={userav} alt="" className='absolute left-4 top-13 w-6 h-6' />
                                    <input type="text" className='border border-gray-300 rounded-2xl px-15 py-3 pl-12 w-full mt-2' placeholder='Enter your company name' />
                                </div>

                                {/* Company Email */}
                                <div className='relative'>
                                    <label className='text-black text-2xl font-medium mb-3'>Company Email</label>
                                    <img src={userav} alt="" className='absolute left-4 top-13 w-6 h-6' />
                                    <input type="text" className='border border-gray-300 rounded-2xl px-15 py-3 pl-12 w-full mt-2' placeholder='Enter your company email' />
                                </div>

                                {/* Office Address */}
                                <div className='relative'>
                                    <label className='text-black text-2xl font-medium mb-3'>Office Address</label>
                                    <img src={location} alt="" className='absolute left-3.5 top-13 w-6 h-7' />
                                    <input type="text" className='border border-gray-300 rounded-2xl px-15 py-3 pl-12 w-full mt-2' placeholder='Enter your Office Address' />
                                </div>

                                {/* Company Number */}
                                <div className='relative'>
                                    <label className='text-black text-2xl font-medium mb-3'>Company Number</label>
                                    <img src={phone} alt="" className='absolute left-4 top-13 w-6 h-6' />
                                    <input type="text" className='border border-gray-300 rounded-2xl px-15 py-3 pl-12 w-full mt-2' placeholder='Enter your Company Number' />
                                </div>

                                {/* Password */}
                                <div className='relative'>
                                    <div className='flex items-center'>
                                        <label className='text-black text-2xl font-medium block'>Enter your Password</label>
                                    </div>
                                    <img src={key} alt="" className='absolute left-4 top-13.5 w-6 h-6' />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder='Enter your Company Number'
                                        value={Password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className='border border-gray-300 rounded-2xl px-15 py-3 pl-12 w-full mt-2'

                                    />


                                    <button
                                        onClick={togglePasswordVisibility}
                                        type='button'
                                        aria-label={showPassword ? "hide password" : "show password"}
                                        aria-pressed={showPassword}
                                        aria-controls='password'
                                    >
                                        {showPassword ? <EyeOff className='absolute right-4 top-13.5 w-6 h-6 text-gray-400 cursor-pointer' /> : <Eye className='absolute right-4 top-13.5 w-6 h-6 text-gray-400 cursor-pointer' />}
                                    </button>
                                </div>

                                {/* Re-enter Password */}
                                <div className='relative'>
                                    <div className='flex items-center gap-4'>
                                        <label className='text-black text-2xl font-medium block'>Re-enter your password</label>
                                        {passwordMatch ? (
                                            <span className='flex items-center justify-center w-6 h-6 bg-green-500 rounded-full'>
                                                <Check className='right-4 top-3.5 w-6 h-6 text-white' />
                                            </span>
                                        ) : confirmPassword && (
                                            <span className='flex items-center justify-center w-6 h-6 bg-red-500 rounded-full'>
                                                <X className='right-4 top-3.5 w-6 h-6 text-white' />
                                            </span>
                                        )}
                                    </div>
                                    <img src={key} alt="" className='absolute left-4 top-13.5 w-6 h-6' />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className='border border-gray-300 rounded-2xl px-15 py-3 pl-12 w-full mt-2'
                                        placeholder='Re-enter your password'
                                    />
                                    <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} type='button'
                                        aria-label={showConfirmPassword ? "hide password" : "show password"}
                                        aria-pressed={showConfirmPassword}
                                        aria-controls='password'>
                                        {showConfirmPassword ? <EyeOff className='absolute right-4 top-13.5 w-6 h-6 text-gray-400 cursor-pointer' /> : <Eye className='absolute right-4 top-13.5 w-6 h-6 text-gray-400 cursor-pointer' />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div>
                                <h3 className='text-lg font-semibold mb-3'>Password must:</h3>
                                <div className='space-t-2'>
                                    <div className='flex items-center gap-2 mt-2'>
                                        {hasMinlength ? (
                                            <span className='flex items-center justify-center w-6 h-6 bg-green-500 rounded-full'>
                                                <Check className='w-5 h-5 text-white' />
                                            </span>
                                        ) : (
                                            <span className='flex items-center justify-center w-6 h-6 bg-red-500 rounded-full'>
                                                <X className='w-5 h-5 text-white' />
                                            </span>
                                        )}
                                        <span className={hasMinlength ? 'text-green-700' : 'text-red-700'}>At least 8 characters</span>
                                    </div>

                                    <div className='flex items-center gap-2 mt-2'>
                                        {hasLowerCase ? (
                                            <span className='flex items-center justify-center w-6 h-6 bg-green-500 rounded-full'>
                                                <Check className='w-5 h-5 text-white' />
                                            </span>
                                        ) : (
                                            <span className='flex items-center justify-center w-6 h-6 bg-red-500 rounded-full'>
                                                <X className='w-5 h-5 text-white' />
                                            </span>
                                        )}
                                        <span className={hasLowerCase ? 'text-green-700' : 'text-red-700'}>At least 1 lowercase letter</span>
                                    </div>

                                    <div className='flex items-center gap-2 mt-2'>
                                        {hasUpperCase ? (
                                            <span className='flex items-center justify-center w-6 h-6 bg-green-500 rounded-full'>
                                                <Check className='w-5 h-5 text-white' />
                                            </span>
                                        ) : (
                                            <span className='flex items-center justify-center w-6 h-6 bg-red-500 rounded-full'>
                                                <X className='w-5 h-5 text-white' />
                                            </span>
                                        )}
                                        <span className={hasUpperCase ? 'text-green-700' : 'text-red-700'}>At least 1 uppercase letter</span>
                                    </div>

                                    <div className='flex items-center gap-2 mt-2'>
                                        {hasNumberOrSymbol ? (
                                            <span className='flex items-center justify-center w-6 h-6 bg-green-500 rounded-full'>
                                                <Check className='w-5 h-5 text-white' />
                                            </span>
                                        ) : (
                                            <span className='flex items-center justify-center w-6 h-6 bg-red-500 rounded-full'>
                                                <X className='w-5 h-5 text-white' />
                                            </span>
                                        )}
                                        <span className={hasNumberOrSymbol ? 'text-green-700' : 'text-red-700'}>At least 1 number or symbol</span>
                                    </div>
                                </div>
                            </div>

                            {/* Terms and Conditions Modal */}
                            <div className='flex flex-col items-center'>
                                <div className='flex'>
                                    <input
                                        type="checkbox"
                                        className='mr-2'
                                        checked={showTerms}
                                        onChange={() => setShowTerms(!showTerms)}
                                    />
                                    <span className='text-black text-xl font-medium'>
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
                                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-40 z-50">
                                        <div className="bg-[#35408E] rounded-2xl p-8 max-w-lg w-full h-auto shadow-xl/30 relative">
                                            <button
                                                className="absolute top-3 right-3 text-gray-500"
                                                onClick={() => setModalOpen(false)}
                                                aria-label="Close"
                                            >
                                                <span className='flex items-center justify-center w-6 h-6 bg-white'>
                                                    <X className="w-6 h-6 text-[#35408E]" />
                                                </span>
                                            </button>
                                            <h2 className="text-4xl text-white font-bold mb-4 flex flex-col items-center">Terms and Conditions</h2>
                                            <div className="overflow-y-auto max-h-120 mb-4">
                                                {/* Replace below with your actual terms */}
                                                <p className="text-white text-lg leading-7">
                                                    <Terms

                                                    />
                                                </p>
                                            </div>
                                            <button
                                                className="bg-[#DAC325] text-black font-semibold px-8 py-1 rounded-xl flex items-end ml-auto mt-5"
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
                            <button className='bg-[#35408E] text-white px-50 py-3 text-3xl rounded-2xl cursor-pointer'>Sign Up</button>
                        </form>
                    </div>
                    {/* Sign In with Google */}
                    <p className='text-black text-lg mt-5 opacity-50'>or sign in with</p>
                    <div>
                        <div className='flex justify-center mt-5 space-x-10 border-red-400 '>
                            <button className='border-solid border-1 border-red-500 rounded-lg px-10 py-2 flex items-center space-x-2 cursor-pointer'>
                                <img src={googlelogo} alt="Google" className='w-[30px] h-[30px]' />
                                <span className='text-red-500 text-2xl font-medium'>Google</span>
                            </button>
                        </div>
                    </div>
                </div>



                {/* right */}
                <div className='bg-[#35408E] w-[850px] h-[964px] ml-auto' >
                    <div className='flex flex-col items-center mt-25'>
                        <img src={logo} alt="Logo" className='w-[170px] h-[170px] mx-auto mt-10' />
                        <h1 className='text-white text-5xl flex flex-col font-light items-center mt-5'>
                            Welcome to</h1>
                        <h1 className='text-white text-5xl font-semibold flex flex-col items-center mt-5'>
                            Gatsishub</h1>
                        <p className='text-white text-2xl text-center mt-10 font-medium'>Premium Hanger Solutions Crafted for Quality and Style.</p>

                        <Link to="/login" className='bg-[#DAC325] text-black px-25 py-3 text-3xl rounded-4xl mt-10 cursor-pointer'>Sign In</Link>

                        <p className='text-white text-3xl mt-5'>Already have an account?</p>
                    </div>
                </div>
            </div >
        </PageTransition>
    )
}

export default Signup