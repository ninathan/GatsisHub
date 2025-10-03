import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/SaleAdmin/sidebar'

const SalesAdminLayout = () => {
  return (
    <div className='flex min-h-screen'>
      <Sidebar />
      <Outlet />
    </div>
  )
}

export default SalesAdminLayout