import React from 'react'
import { Outlet } from 'react-router-dom'
import SidebarSystemA from '../components/SaleAdmin/sidebarSytemA'

const SystemAdminLayout = () => {
    return (
        <div className='flex min-h-screen'>
            <SidebarSystemA />
            <Outlet />
        </div>
    )
}

export default SystemAdminLayout