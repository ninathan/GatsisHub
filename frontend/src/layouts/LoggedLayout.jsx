import React from 'react'
import { Outlet } from 'react-router-dom'
import LoggedLanding from '../components/Landing/LoggedLanding'
import Footer from '../components/Landing/Footer'

const LoggedLayout = () => {
    return (
        <div className='min-h-screen flex flex-col'>
            <LoggedLanding />
            <div className='flex-grow'>
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}

export default LoggedLayout