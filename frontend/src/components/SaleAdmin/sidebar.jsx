import React from 'react'
import logo from '../../images/logo.png'
import { Link } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { EllipsisVertical, LayoutDashboard, ShoppingCart, Package, Calendar, Mail, LogOut } from 'lucide-react'


const Sidebar = () => {
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
                            <NavLink to="/dashboardSA" className="block">
                                <LayoutDashboard size={20} className="mr-2 inline" />
                                Dashboard
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#1D2D5F] p-2 rounded">
                            <NavLink to="/orderpage" className="block">
                                <ShoppingCart size={20} className="mr-2 inline" />
                                Orders
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#1D2D5F] p-2 rounded">
                            <NavLink to="/productSA" className="block">
                                <Package size={20} className="mr-2 inline" />
                                Products
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#1D2D5F] p-2 rounded">
                            <NavLink to="/calendar" className="block">
                                <Calendar size={20} className="mr-2 inline" />
                                Calendar
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#1D2D5F] p-2 rounded">

                            <NavLink to="/messageSA" className="block">
                                <Mail size={20} className='mr-2 inline' />
                                Messages
                            </NavLink>
                        </li>
                        <li className='hover:bg-[#1D2D5F] p-2 rounded'>
                            <NavLink to="/authSaleAdmin" className="block">
                                <LogOut size={20} className='mr-2 inline' />
                                Logout
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                {/* User */}
                <div className="px-6 py-4 border-t border-gray-600 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-bold">JD</span>
                    </div>
                    <div>
                        <p className="font-semibold">Jane Dela Cruz</p>
                        <p className="text-sm text-gray-300">Sales Admin</p>
                        
                    </div>

                    <Link to="/profileSA">
                        <EllipsisVertical className="ml-auto cursor-pointer" />
                    </Link>
                </div>
            </aside>
        </div>
    )
}

export default Sidebar