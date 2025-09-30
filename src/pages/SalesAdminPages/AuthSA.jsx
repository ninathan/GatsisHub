import React from 'react'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'
import googlelogo from '../../images/googlelogo.png'
import key from '../../images/key.png'
import { Link } from 'react-router-dom'
import PageTransition from '../../components/Transition/PageTransition'

const AuthSA = () => {
    const IntputField =
  'border border-gray-300 rounded-2xl px-4 md:px-12 py-3 w-full max-w-[460px] text-lg md:text-2xl focus:outline-none focus:ring-2 focus:ring-[#35408E]'
    return (
        <PageTransition direction='right'>

            <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full'>
                {/* left */}
                <div className='bg-[#35408E] w-full min-h-screen lg:min-h-[964px] order-2 lg:order-1'>
                    <div className='flex flex-col items-center py-10 md:py-20 lg:mt-25 px-4'>
                        <Link to="/">
                            <img src={logo} alt="Logo" className='w-[120px] h-[120px] md:w-[170px] md:h-[170px] mx-auto mt-5 md:mt-10' />
                        </Link>
                        <h1 className='text-white text-3xl md:text-4xl lg:text-5xl flex flex-col font-light items-center mt-3 md:mt-5 text-center'>
                            Welcome to</h1>
                        <h1 className='text-white text-3xl md:text-4xl lg:text-5xl font-semibold flex flex-col items-center mt-3 md:mt-5 text-center'>
                            Gatsishub</h1>
                        
                    </div>
                </div>

                {/* right */}
                <div className='flex flex-col items-center justify-center py-10 md:py-20 lg:mt-35 px-4 order-1 lg:order-2'>
                    <h1 className='text-[#35408E] text-3xl md:text-4xl lg:text-6xl font-semibold tracking-wide flex flex-col items-center mt-5 md:mt-10 text-center max-w-md lg:max-w-none'>
                        Sign In as Gatsishub</h1>

                    <form className='flex flex-col mt-10 md:mt-20 lg:mt-25 w-full max-w-md lg:max-w-lg'>
                        {/* username */}
                        <div className='relative mb-6'>
                            <label htmlFor="username" className='block text-lg md:text-2xl font-medium mb-2'>Username</label>
                            <img src={userav} alt="" className='absolute left-4 top-12 md:top-14.5 w-5 h-5 md:w-6 md:h-6' />
                            <input type="text" placeholder='Enter your username' className={IntputField} />
                        </div>

                        {/* Password */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mb-2'>
                            <label htmlFor="password" className='text-black text-lg md:text-2xl font-medium'>Password</label>
                            <p className='text-[#35408E] text-sm md:text-1xl font-medium underline'>
                                <Link to="">Forgot password?</Link>
                            </p>
                        </div>

                        {/* Password Input */}
                        <div className='relative mb-6'>
                            <img src={key} alt="key" className='absolute left-4 top-4 md:top-5 w-5 h-5 md:w-6 md:h-6' />
                            <input type="password" placeholder='Enter your Password' className={IntputField} />
                        </div>

                        {/* Remember Me */}
                        <div className='flex w-full mb-6'>
                            <div className='flex items-center'>
                                <input type="checkbox" className='mr-2' />
                                <span className='text-black text-base md:text-xl font-medium'>Remember me</span>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <Link to="/orderpage">
                            <button type="submit" className='bg-[#35408E] text-white w-full py-3 md:py-4 text-xl md:text-2xl lg:text-3xl rounded-2xl cursor-pointer transition-all hover:bg-[#2d3575]'>Sign In</button>
                        </Link>
                    </form>
                </div>
            </div>
        </PageTransition>
    )
}

export default AuthSA