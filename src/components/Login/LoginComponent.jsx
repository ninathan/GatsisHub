import React from 'react'
import logo from '../../images/logo.png'
import userav from '../../images/user-alt.png'
import googlelogo from '../../images/googlelogo.png'
import key from '../../images/key.png'
import { Link } from 'react-router-dom'
import PageTransition from '../Transition/PageTransition'


const Login = () => {

  const IntputField =
  'border border-gray-300 rounded-2xl px-12 py-3 w-[460px] text-2xl focus:outline-none focus:ring-2 focus:ring-[#35408E]'


  return (
    <PageTransition direction='right'>

    <div className='grid grid-cols-2 h-screen w-full'>
      {/* left */}
      <div className='bg-[#35408E] w-[850px] h-[964px]'>
        <div className='flex flex-col items-center mt-25'>
          <Link to="/">
            <img src={logo} alt="Logo" className='w-[170px] h-[170px] mx-auto mt-10' />
          </Link>
          <h1 className='text-white text-5xl flex flex-col font-light items-center mt-5'>
            Welcome to</h1>
          <h1 className='text-white text-5xl font-semibold flex flex-col items-center mt-5'>
            Gatsishub</h1>
          <p className='text-white text-2xl text-center mt-10 font-medium'>Premium Hanger Solutions Crafted for Quality and Style.</p>

          <Link to="/signup" className='bg-[#DAC325] text-black px-25 py-3 text-3xl rounded-4xl mt-10 cursor-pointer'>Sign Up</Link>

          <p className='text-white text-3xl mt-5'>Don't have an account yet?</p>
        </div>
      </div>

      {/* right */}
      <div className='flex flex-col items-center mt-35'>
        <h1 className='text-[#35408E] text-6xl font-semibold tracking-wide flex flex-col items-center mt-10'>
          Sign In to Gatsishub</h1>

        <form className='flex flex-col mt-25'>
          {/* Email */}
          <div className='relative'>
            <label htmlFor="email" className='block text-2xl font-medium mb-2'>Email Address</label>
            <img src={userav} alt="" className='absolute left-4 top-14.5 w-6 h-6' />
            <input type="email" placeholder='you@example.com' className={IntputField} />
          </div>

          {/* Password */}
          <div className='grid grid-cols-2'>
            <label htmlFor="password" className='text-black text-2xl font-medium mb-2'>Password</label>
            <p className='text-[#35408E] text-1xl py-1 px-15 font-medium mb-2 underline'> <Link href="">Forgot password?</Link></p>
          </div>

          {/* Password Input */}
          <div className='relative'>
            <img src={key} alt="google" className='absolute left-4 top-5 w-6 h-6' />
            <input type="password" placeholder='Enter your Password' className={IntputField} />
          </div>

          {/* Remember Me */}
          <div className='flex  w-[470px]'>
            <div className='flex'>
              <input type="checkbox" className='mr-2' />
              <span className='text-black text-xl font-medium'>Remember me</span>
            </div>
          </div>

          {/* Sign In Button */}
          <button type="submit" className='bg-[#35408E] text-white px-50 py-3 text-3xl rounded-2xl mt-19 cursor-pointer '>Sign In</button>
        </form>


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
    </div>
    </PageTransition>
  )
}

export default Login