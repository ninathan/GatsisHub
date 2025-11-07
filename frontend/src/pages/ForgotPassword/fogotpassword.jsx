import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'

const fogotpassword = () => {
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
                <p className='text-[#000000] text-lg md:text-xl text-center mt-5 font-medium px-4 max-w-md'>
                    Enter your email address below.
                </p>
                <form className='flex flex-col mt-10 w-full max-w-md'>
                    <div className='relative mb-6'>
                        <label className='block text-2xl font-medium mb-2 text-center'>Company Email Address</label>
                        <img src={userav} alt='' className='absolute left-4 top-12 w-6 h-6 mt-1.5' />
                        <input
                            type='email'
                            placeholder='you@example.com'
                            className='border border-gray-300 rounded-2xl px-13 py-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]'
                            required
                        />
                    </div>
                    <button
                        type='submit'
                        className='bg-[#57DA65] text-black px-6 py-3 text-xl rounded-2xl hover:bg-[#2c347a]'
                    >
                        Submit
                    </button>
                </form>

                <button className='mt-6 bg-[#DAC325] text-black px-6 py-3 text-xl rounded-2xl hover:bg-[#c4ad1f]'>
                    <Link to='/login'>Back to Login</Link>
                </button>
            </div>
        </div>
    )
}

export default fogotpassword