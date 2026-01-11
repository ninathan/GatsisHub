import React, { useState, useEffect } from 'react'
import logo from '../../images/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { EllipsisVertical, LayoutDashboard, ShoppingCart, Package, Calendar, Mail, LogOut, ClipboardClock } from 'lucide-react'


const Sidebar = () => {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        // Get employee data from localStorage
        const storedEmployee = localStorage.getItem('employee');
        if (storedEmployee) {
            setEmployee(JSON.parse(storedEmployee));
        }
    }, []);

    const handleLogout = async () => {
        const employee = JSON.parse(localStorage.getItem('employee'));
        
        // Call backend to set ispresent to false
        if (employee && employee.employeeid) {
            try {
                await fetch('https://gatsis-hub.vercel.app/employees/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        employeeid: employee.employeeid
                    })
                });

            } catch (error) {

                // Continue with logout even if presence update fails
            }
        }
        
        // Clear employee data from localStorage
        localStorage.removeItem('employee');
        localStorage.removeItem('rememberEmployee');
        // Redirect to login
        navigate('/authsaleadmin');
    };

    // Get initials from employee name
    const getInitials = (name) => {
        if (!name) return 'SA';
        const names = name.split(' ');
        if (names.length === 1) return name.substring(0, 2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    return (
        <div>
            {/* Sidebar */}
            <aside className="w-64 bg-[#191716] text-white flex flex-col border-r-5 border-[#DAC325] h-full">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-600">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="w-20 h-20" />
                    </div>
                </div>

                <nav className="flex-1 mt-6">
                    <ul className="space-y-2 px-6">
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded cursor-pointer">
                            <NavLink to="/dashboardSA" className="block">
                                <LayoutDashboard size={20} className="mr-2 inline" />
                                Dashboard
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded cursor-pointer">
                            <NavLink to="/orderpage" className="block">
                                <ShoppingCart size={20} className="mr-2 inline" />
                                Orders
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded cursor-pointer">
                            <NavLink to="/logpageSA" className="block">
                                <ClipboardClock size={20} className="mr-2 inline" />
                                Orders Log
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded cursor-pointer">
                            <NavLink to="/productSA" className="block">
                                <Package size={20} className="mr-2 inline" />
                                Products
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded cursor-pointer">
                            <NavLink to="/calendar" className="block">
                                <Calendar size={20} className="mr-2 inline" />
                                Calendar
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded cursor-pointer">

                            <NavLink to="/messageSA" className="block">
                                <Mail size={20} className='mr-2 inline' />
                                Messages
                            </NavLink>
                        </li>
                        <li className='hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded cursor-pointer'>
                            <button onClick={handleLogout} className="block w-full text-left">
                                <LogOut size={20} className='mr-2 inline' />
                                Logout
                            </button>
                        </li>
                    </ul>
                </nav>

                {/* User */}
                <div className="px-6 py-4 border-t border-gray-600 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-700">
                            {employee ? getInitials(employee.employeename) : 'SA'}
                        </span>
                    </div>
                    <div>
                        <p className="font-semibold">{employee?.employeename || 'Sales Admin'}</p>
                        <p className="text-sm text-gray-300">{employee?.role || 'Sales Admin'}</p>
                        
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