import React from 'react'
import logo from '../../images/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { EllipsisVertical, LogOut, SquareUser, ShoppingCart } from 'lucide-react'

const SidebarPA = () => {
    return (
        <div>
            {/* Sidebar */}
            <aside className="w-64 bg-[#35408E] text-white flex flex-col border-r-5 border-[#DAC325] h-full">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-600">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="w-20 h-20" />
                    </div>
                </div>

                <nav className="flex-1 mt-6">
                    <ul className="space-y-2 px-6">
                        <li className="hover:bg-[#1D2D5F] p-2 rounded">
                            <NavLink to="/assignorder" className="block">
                                <SquareUser size={20} className='mr-2 inline' />
                                Assign Orders
                            </NavLink>
                        </li>
                        <li className='hover:bg-[#1D2D5F] p-2 rounded'>
                            <NavLink to="/authPA" onClick="" className="block w-full text-left">
                                <LogOut size={20} className='mr-2 inline' />
                                Logout
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                {/* User */}
                <div className="px-6 py-4 border-t border-gray-600 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-700">
                            {/* {employee ? getInitials(employee.employeename) : 'S'} */}
                            PA
                        </span>
                    </div>
                    <div className="flex-1">
                        {/* <p className="font-semibold">{employee?.employeename || 'System Admin'}</p>
                        <p className="text-sm text-gray-300">{employee?.role || 'System Admin'}</p> */}
                        <p>production assembly</p>
                    </div>
                    <Link to="/">
                        <EllipsisVertical className="cursor-pointer" />
                    </Link>
                </div>
            </aside>
        </div>
    )
}

export default SidebarPA