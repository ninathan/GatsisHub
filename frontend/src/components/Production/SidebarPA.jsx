import React, { useState, useEffect } from 'react'
import logo from '../../images/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { EllipsisVertical, LogOut, SquareUser, ShoppingCart, Target } from 'lucide-react'

const SidebarPA = () => {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        // Fetch employee data from localStorage
        const employeeData = localStorage.getItem('employee');
        if (employeeData) {
            setEmployee(JSON.parse(employeeData));
        }
    }, []);

    const handleLogout = () => {
        // Clear employee data from localStorage
        localStorage.removeItem('employee');
        // Redirect to login page
        navigate('/authPA');
    };

    const getInitials = (name) => {
        if (!name) return 'PA';
        const names = name.split(' ');
        if (names.length >= 2) {
            return names[0][0] + names[1][0];
        }
        return names[0][0];
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
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded">
                            <NavLink to="/assignorder" className="block">
                                <SquareUser size={20} className='mr-2 inline' />
                                Assign Orders
                            </NavLink>
                        </li>
                        <li className="hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded">
                            <NavLink to="/performance" className="block">
                                <Target size={20} className='mr-2 inline' />
                                Performance
                            </NavLink>
                        </li>
                        <li className='hover:bg-[#E6AF2E] hover:text-[#191716] p-2 rounded'>
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
                            {employee ? getInitials(employee.employeename) : 'PA'}
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{employee?.employeename || 'Production Assembly'}</p>
                        <p className="text-sm text-gray-300">{employee?.assigneddepartment || 'Employee'}</p>
                    </div>
                    <Link to="/profilePA">
                        <EllipsisVertical className="cursor-pointer" />
                    </Link>
                </div>
            </aside>
        </div>
    )
}

export default SidebarPA