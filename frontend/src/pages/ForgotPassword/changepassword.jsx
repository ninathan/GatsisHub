import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'
import key from '../../images/key.png'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import check from '../../images/Check.png'

const changepassword = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showmodal, setShowmodal] = useState(false);


    return (
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
                <h1 className='text-[#35408E] text-4xl md:text-6xl font-bold text-center'>
                    Change Password
                </h1>

                <div className='flex flex-col mt-10 w-full max-w-md'>
                    <div className='relative mb-6'>

                        <label className='block text-2xl font-medium mb-2'>Set New Password</label>
                        <img src={key} alt='' className='absolute left-4 top-12 w-6 h-6 mt-1.5' />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder='Enter new password'
                            className='border border-gray-300 rounded-2xl px-13 py-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                            required
                        />
                        <button type='button' onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <EyeOff className='absolute right-4 top-12 w-6 h-6 mt-1.5 cursor-pointer' />
                            ) : (
                                <Eye className='absolute right-4 top-12 w-6 h-6 mt-1.5 cursor-pointer' />
                            )}
                        </button>

                        <label className='block text-2xl font-medium mb-2'>Confirm New Password</label>
                        <img src={key} alt='' className='absolute left-4 top-12 w-6 h-6 mt-25' />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder='Re-enter your Password'
                            className='border border-gray-300 rounded-2xl px-13 py-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                            required
                        />
                        <button type='button' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? (
                                <EyeOff className='absolute right-4 top-12 w-6 h-6 mt-25 cursor-pointer' />
                            ) : (
                                <Eye className='absolute right-4 top-12 w-6 h-6 mt-25 cursor-pointer' />
                            )}
                        </button>
                    </div>
                    <button
                        type='submit'
                        className='bg-[#57DA65] text-black px-6 py-3 text-xl rounded-2xl hover:bg-[#37e148] cursor-pointer'
                        onClick={() => setShowmodal(true)}
                    >
                        Update
                    </button>
                </div>

                <button className='mt-6 bg-[#DAC325] text-black px-6 py-3 text-xl rounded-2xl hover:bg-[#c4ad1f]'>
                    <Link to='/login'>Back to Login</Link>
                </button>
            </div>
            {showmodal && (
                <div className="fixed inset-0 flex items-center justify-center bg-[rgba(143,143,143,0.65)] z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] shadow-xl relative overflow-hidden">
                        <h2 className="text-2xl md:text-4xl text-[#35408E] font-bold mb-4 text-center">Password Updated</h2>
                        <div className="overflow-y-auto max-h-80 md:max-h-96 mb-4">
                            <img src={check} alt="Success" className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4" />
                            <p className="text-black text-sm text-center md:text-lg leading-6 md:leading-7">
                                Your password has been updated
                            </p>
                        </div>
                        <button
                            className="bg-[#DAC325] text-black font-semibold px-6 py-3 rounded-2xl hover:bg-[#c4ad1f] mx-auto block"
                            Link to='/login'
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default changepassword