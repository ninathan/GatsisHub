import React from 'react'
import { Outlet } from "react-router-dom"
import SidebarOM from '../components/SaleAdmin/SidebarOM'

const OperationalManLayout = () => {
    return (
        <div className="min-h-screen flex">
            <SidebarOM />
            <Outlet />
        </div>
    )
}

export default OperationalManLayout