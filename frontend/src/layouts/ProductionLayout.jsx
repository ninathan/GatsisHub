import React from 'react'
import { Outlet } from 'react-router-dom'
import SidebarPA from '../components/Production/SidebarPA'

const ProductionLayout = () => {
    return (
        <div className='flex min-h-screen'>
            <SidebarPA />
            <Outlet />
        </div>
    )
}

export default ProductionLayout