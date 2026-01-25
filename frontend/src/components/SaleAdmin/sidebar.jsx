import React, { useState, useEffect } from 'react'
import logo from '../../images/logo.png'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { EllipsisVertical, LayoutDashboard, ShoppingCart, Package, Calendar, Mail, LogOut, ClipboardClock, Bell, User } from 'lucide-react'
import MobileBottomNav from '../MobileBottomNav'

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
                console.error('Logout error:', error);
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

    // Check if route is active
    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Desktop Sidebar - Hidden on mobile/tablet */}
            <aside className="hidden lg:flex w-64 bg-[#191716] text-white flex-col border-r-5 border-[#DAC325]">
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
                            <NavLink to="/notificationsSA" className="block">
                                <Bell size={20} className="mr-2 inline" />
                                Notifications
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
                            <button onClick={handleLogout} className="block w-full text-left cursor-pointer">
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
            {/* Mobile Bottom Navigation */}
            <MobileBottomNav
                navItems={[
                    { id: 'dashboard', path: '/dashboardSA', icon: LayoutDashboard },
                    { id: 'orders', path: '/orderpage', icon: ShoppingCart },
                    { id: 'notifications', path: '/notificationsSA', icon: Bell },
                    { id: 'products', path: '/productSA', icon: Package },
                    { id: 'calendar', path: '/calendar', icon: Calendar },
                    { id: 'messages', path: '/messageSA', icon: Mail },
                    { id: 'profile', path: '/profileSA', icon: User },
                    { id: 'logout', path: '/authsaleadmin', icon: LogOut },
                ]}
                accentColor="#E6AF2E"
            />
            
        </>
    )
}

export default Sidebar