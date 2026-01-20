import React, { useState, useEffect } from 'react'
import logo from '../../images/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { EllipsisVertical, LogOut, SquareUser, ShoppingCart } from 'lucide-react'


const sidebarSytemA = () => {
    const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    // Get employee data from localStorage
    const storedEmployee = localStorage.getItem('systemAdmin');
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    }
  }, []);

  const handleLogout = async () => {
    const employee = JSON.parse(localStorage.getItem('systemAdmin'));
    
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
    localStorage.removeItem('systemAdmin');
    localStorage.removeItem('rememberEmployee');
    // Redirect to login
    navigate('/authSystemA');
  };

  // Get initials from employee name
  const getInitials = (name) => {
    if (!name) return 'S';
    const names = name.split(' ');
    if (names.length === 1) return name.substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };
    return (
        <div>
            {/* Sidebar */}
            <aside className="w-64 bg-[#191916] text-white flex flex-col border-r-5 border-[#DAC325] h-full">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-600">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="w-20 h-20" />
                    </div>
                </div>

                <nav className="flex-1 mt-6">
                    <ul className="space-y-2 px-6">
                        <li className="hover:bg-[#E6AF2E] text-white hover:text-[#191916]  p-2 rounded">
                            <NavLink to="/systememployees" className="block">
                                <SquareUser size={20} className='mr-2 inline' />
                                Employee
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#E6AF2E] text-white hover:text-[#191916]  p-2 rounded">
                            <NavLink to="/systemaccounts" className="block">
                                <ShoppingCart size={20} className='mr-2 inline' />
                                Accounts
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#E6AF2E] text-white hover:text-[#191916]  p-2 rounded">
                            <NavLink to="/archivedaccounts" className="block">
                                <ShoppingCart size={20} className='mr-2 inline' />
                                Archived Accounts
                            </NavLink>
                        </li>
                        <li className='hover:bg-[#E6AF2E] text-white hover:text-[#191916] p-2 rounded'>
                            <NavLink to="/authSystemA" onClick="" className="block w-full text-left">
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
                            {employee ? getInitials(employee.employeename) : 'S'}
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{employee?.employeename || 'System Admin'}</p>
                        <p className="text-sm text-gray-300">{employee?.role || 'System Admin'}</p>
                    </div>
                    <Link to="/systemprofile">
                        <EllipsisVertical className="cursor-pointer" />
                    </Link>
                </div>
            </aside>
        </div>
    )
}

export default sidebarSytemA