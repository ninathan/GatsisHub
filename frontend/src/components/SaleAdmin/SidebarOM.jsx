import React, { useState, useEffect } from 'react'
import logo from '../../images/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { EllipsisVertical, LogOut, Calendar, SquareUser, ShoppingCart, LayoutDashboard, ClipboardClock, Bell, UserCheck, User} from 'lucide-react'
import MobileBottomNav from '../MobileBottomNav'


const SidebarOM = () => {
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
    navigate('/authOM');
  };

  // Get initials from employee name
  const getInitials = (name) => {
    if (!name) return 'OM';
    const names = name.split(' ');
    if (names.length === 1) return name.substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <div>
         {/* Sidebar */}
            <aside className="hidden lg:flex w-64 bg-[#191716] text-white flex-col border-r-5 border-[#DAC325] h-full">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-600">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="w-20 h-20" />
                    </div>
                </div>

                <nav className="flex-1 mt-6">
                    <ul className="space-y-2 px-6">
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded">
                            <NavLink to="/dashboardOM" className="block">
                              <LayoutDashboard size={20} className='mr-2 inline' />
                              Dashboard
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded">
                            <NavLink to="/employees" className="block">
                              <SquareUser size={20} className='mr-2 inline' />
                              Employee
                            </NavLink>
                        </li> 
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded">
                            <NavLink to="/verification" className="block">
                              <UserCheck size={20} className='mr-2 inline' />
                              Verification
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded">
                            <NavLink to="/orderpageOM" className="block">
                              <ShoppingCart size={20} className='mr-2 inline' />
                              Orders
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded">
                            <NavLink to="/notificationsOM" className="block">
                              <Bell size={20} className='mr-2 inline' />
                              Notifications
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded">
                            <NavLink to="/calendarOM" className="block">
                                <Calendar size={20} className='mr-2 inline' />
                                Calendar
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
                            {employee ? getInitials(employee.employeename) : 'OM'}
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{employee?.employeename || 'Operational Manager'}</p>
                        <p className="text-sm text-gray-300">{employee?.role || 'Operational Manager'}</p>
                    </div>
                    <Link to="/profileOM">
                        <EllipsisVertical className="cursor-pointer" />
                    </Link>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav
                navItems={[
                    { id: 'dashboardOM', path: '/dashboardOM', icon: LayoutDashboard },
                    { id: 'employees', path: '/employees', icon: SquareUser },
                    { id: 'verification', path: '/verification', icon: UserCheck },
                    { id: 'ordersOM', path: '/orderpageOM', icon: ShoppingCart },
                    { id: 'notificationsOM', path: '/notificationsOM', icon: Bell },
                    { id: 'calendarOM', path: '/calendarOM', icon: Calendar },
                    { id: 'profileOM', path: '/profileOM', icon: User },
                    { id: 'logout', path: '/authom', icon: LogOut },
                ]}
                accentColor="#E6AF2E"
            />


    </div>
  )
}

export default SidebarOM