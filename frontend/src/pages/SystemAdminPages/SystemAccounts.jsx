import React from 'react'
import { FaSearch } from 'react-icons/fa';
import { X } from 'lucide-react';

const SystemAccounts = () => {
    const [activeTab, setActiveTab] = React.useState("all");
    const [showModal, setShowModal] = React.useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = React.useState(false);
    const [showAccountStatus, setShowAccountStatus] = React.useState(false);
    const [selectedEmployee, setSelectedEmployee] = React.useState(null);
    const [formData, setFormData] = React.useState({
        name: '',
        role: 'Sale Admin',
        access: {
            dashboard: false,
            employees: false,
            orders: false,
            calendar: false,
            messages: false,
            products: false
        },
        username: '',
        password: ''
    });
    // const [searchTerm, setSearchTerm] = React.useState("");

    const employees = [
        { 
            name: "Jane Dela Cruz", 
            role: "Sales Administrator", 
            phone: "(555) 123-4567", 
            attendance: "Present", 
            target: 250, 
            finished: 158, 
            shift: "8:00 am to 5:00 pm",
            username: "JaneDC13",
            password: "N4qlvB7x$Gp2",
            access: {
                dashboard: true,
                employees: false,
                orders: true,
                calendar: true,
                messages: true,
                products: true
            }
        },
        { 
            name: "Liam Parker", 
            role: "Production", 
            phone: "(555) 123-4567", 
            attendance: "Present", 
            target: 250, 
            finished: 158, 
            shift: "8:00 am to 5:00 pm",
            username: "LiamP89",
            password: "Pass123!",
            access: {
                dashboard: true,
                employees: false,
                orders: false,
                calendar: false,
                messages: false,
                products: false
            }
        },
        { 
            name: "Isabela Cruz", 
            role: "Production", 
            phone: "(555) 123-4567", 
            attendance: "Present", 
            target: 250, 
            finished: 158, 
            shift: "8:00 am to 5:00 pm",
            username: "IsaCruz",
            password: "Pass456!",
            access: {
                dashboard: true,
                employees: false,
                orders: false,
                calendar: false,
                messages: false,
                products: false
            }
        },
        { 
            name: "Ethan Navarro", 
            role: "Production", 
            phone: "(555) 123-4567", 
            attendance: "Present", 
            target: 250, 
            finished: 158, 
            shift: "8:00 am to 5:00 pm",
            username: "EthanNav",
            password: "Pass789!",
            access: {
                dashboard: true,
                employees: false,
                orders: false,
                calendar: false,
                messages: false,
                products: false
            }
        },
        
    ];

    const handleAccessChange = (field) => {
        setFormData({
            ...formData,
            access: {
                ...formData.access,
                [field]: !formData.access[field]
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Add logic to save account
        setShowModal(false);
        // Reset form
        setFormData({
            name: '',
            role: 'Sale Admin',
            access: {
                dashboard: false,
                employees: false,
                orders: false,
                calendar: false,
                messages: false,
                products: false
            },
            username: '',
            password: ''
        });
    };

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee({...employee});
        setShowEmployeeModal(true);
    };

    const handleEmployeeAccessChange = (field) => {
        setSelectedEmployee({
            ...selectedEmployee,
            access: {
                ...selectedEmployee.access,
                [field]: !selectedEmployee.access[field]
            }
        });
    };

    const handleResetPassword = () => {
        // Generate random password or prompt for new password
        const newPassword = Math.random().toString(36).slice(-10);
        setSelectedEmployee({
            ...selectedEmployee,
            password: newPassword
        });
        alert('Password has been reset!');
    };

    const handleUpdateEmployee = (e) => {
        e.preventDefault();
        console.log('Updated employee:', selectedEmployee);
        // Add logic to update employee
        setShowEmployeeModal(false);
    };

    return (
        <div className="flex w-full bg-gray-100">
            {/* Main Content */}
            <main className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-6">Accounts</h1>

                {/* Controls */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 rounded cursor-pointer transition-colors ${activeTab === "all"
                                    ? "bg-[#ECBA0B] text-black font-semibold"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                            onClick=""
                        >
                            All Employees
                        </button>
                        <button
                            className={`px-4 py-2 rounded cursor-pointer transition-colors ${activeTab === "teams"
                                    ? "bg-[#ECBA0B] text-black font-semibold"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                            onClick=""
                        >
                            Edit
                        </button>
                        <button
                            className={`px-4 py-2 rounded cursor-pointer transition-colors ${activeTab === "teams"
                                    ? "bg-[#ECBA0B] text-black font-semibold"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                            onClick={() => setShowModal(true)}
                        >
                            Add Account
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded px-3 py-2 bg-white shadow-sm">
                            <FaSearch className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                className="outline-none w-64"
                                // value={searchTerm}
                                // onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Total Employees</h3>
                        <p className="text-3xl font-bold text-[#35408E]">{employees.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Present Today</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {employees.filter(emp => emp.attendance === "Present").length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Absent Today</h3>
                        <p className="text-3xl font-bold text-red-600">
                            {employees.filter(emp => emp.attendance === "Absent").length}
                        </p>
                    </div>
                </div>

                {/* Employees Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#35408E] text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Attendance</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Target</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Finished</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Shift</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {employees.map((employee, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-[#35408E] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="font-medium text-gray-900">{employee.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{employee.role}</td>
                                        <td className="px-6 py-4 text-gray-700">{employee.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                employee.attendance === "Present" 
                                                    ? "bg-green-100 text-green-800" 
                                                    : "bg-red-100 text-red-800"
                                            }`}>
                                                {employee.attendance}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{employee.target}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">{employee.finished}</span>
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-[#35408E] h-2 rounded-full transition-all"
                                                        style={{ width: `${(employee.finished / employee.target) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {Math.round((employee.finished / employee.target) * 100)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 text-sm">{employee.shift}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleEmployeeClick(employee)}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    onClick={() => handleEmployeeClick(employee)}
                                                    className="px-3 py-1 bg-[#ECBA0B] text-black rounded text-sm hover:bg-yellow-500 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Employee View/Edit Modal */}
                {showEmployeeModal && selectedEmployee && (
                    <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 relative">
                            {/* Modal Header */}
                            <div className="bg-[#35408E] text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Employee account</h2>
                                <button 
                                    onClick={() => setShowEmployeeModal(false)}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleUpdateEmployee} className="p-6">
                                <div className="flex gap-4 mb-6">
                                    {/* Profile Picture Placeholder */}
                                    <div className="w-16 h-16 bg-gray-400 rounded flex items-center justify-center flex-shrink-0">
                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>

                                    <div className="flex-1">
                                        {/* Name Display */}
                                        <div className="mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Name:
                                            </label>
                                            <p className="text-base font-semibold text-gray-900">{selectedEmployee.name}</p>
                                        </div>

                                        {/* Role Display */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Role:
                                            </label>
                                            <p className="text-base font-semibold text-gray-900">{selectedEmployee.role}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Access Checkboxes */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Access:
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployee.access.dashboard}
                                                onChange={() => handleEmployeeAccessChange('dashboard')}
                                                className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E]"
                                            />
                                            <span className="text-sm">Dashboard</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployee.access.employees}
                                                onChange={() => handleEmployeeAccessChange('employees')}
                                                className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E]"
                                            />
                                            <span className="text-sm">Employees tab</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployee.access.orders}
                                                onChange={() => handleEmployeeAccessChange('orders')}
                                                className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E]"
                                            />
                                            <span className="text-sm">Orders tab</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployee.access.calendar}
                                                onChange={() => handleEmployeeAccessChange('calendar')}
                                                className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E]"
                                            />
                                            <span className="text-sm">Calendar</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployee.access.messages}
                                                onChange={() => handleEmployeeAccessChange('messages')}
                                                className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E]"
                                            />
                                            <span className="text-sm">Messages</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployee.access.products}
                                                onChange={() => handleEmployeeAccessChange('products')}
                                                className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E]"
                                            />
                                            <span className="text-sm">Products</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Login Credentials Section */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Login credentials</h3>
                                    
                                    {/* Username */}
                                    <div className="mb-3">
                                        <label className="block text-sm text-gray-700 mb-1">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedEmployee.username}
                                            onChange={(e) => setSelectedEmployee({...selectedEmployee, username: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="mb-3">
                                        <label className="block text-sm text-gray-700 mb-1">
                                            Password
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedEmployee.password}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                                        />
                                    </div>

                                    {/* Reset Password Button */}
                                    <button
                                        type="button"
                                        onClick={handleResetPassword}
                                        className="w-full bg-[#ECBA0B] text-black py-2 px-4 rounded hover:bg-yellow-500 transition-colors font-semibold"
                                    >
                                        Reset
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAccountStatus(true)}
                                        className="flex-1 bg-[#35408E] text-white py-2 px-4 rounded hover:bg-[#2c3575] transition-colors font-semibold"
                                    >
                                        Account status
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-[#35408E] text-white py-2 px-4 rounded hover:bg-[#2c3575] transition-colors font-semibold"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Account Status Modal */}
                {showAccountStatus && selectedEmployee && (
                    <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 relative">
                            {/* Modal Content */}
                            <div className="p-8">
                                {/* Employee Info */}
                                <div className="flex items-start gap-4 mb-8">
                                    {/* Profile Picture */}
                                    <div className="w-20 h-20 bg-gray-400 rounded flex items-center justify-center flex-shrink-0">
                                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>

                                    <div className="flex-1">
                                        {/* Name */}
                                        <div className="mb-3">
                                            <span className="text-sm font-medium text-gray-700">Name: </span>
                                            <span className="text-lg font-semibold text-gray-900">{selectedEmployee.name}</span>
                                        </div>

                                        {/* Role */}
                                        <div className="mb-3">
                                            <span className="text-sm font-medium text-gray-700">Role: </span>
                                            <span className="text-lg font-semibold text-gray-900">{selectedEmployee.role}</span>
                                        </div>

                                        {/* Access Permissions */}
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Access: </span>
                                            <div className="inline-flex flex-wrap gap-2 mt-1">
                                                {selectedEmployee.access.dashboard && (
                                                    <span className="inline-flex items-center">
                                                        <input type="checkbox" checked readOnly className="mr-1" />
                                                        <span className="text-sm">Dashboard</span>
                                                    </span>
                                                )}
                                                {selectedEmployee.access.employees && (
                                                    <span className="inline-flex items-center ml-3">
                                                        <input type="checkbox" checked readOnly className="mr-1" />
                                                        <span className="text-sm">Employees tab</span>
                                                    </span>
                                                )}
                                                {selectedEmployee.access.orders && (
                                                    <span className="inline-flex items-center ml-3">
                                                        <input type="checkbox" checked readOnly className="mr-1" />
                                                        <span className="text-sm">Orders tab</span>
                                                    </span>
                                                )}
                                                {selectedEmployee.access.calendar && (
                                                    <span className="inline-flex items-center ml-3">
                                                        <input type="checkbox" checked readOnly className="mr-1" />
                                                        <span className="text-sm">Calendar</span>
                                                    </span>
                                                )}
                                                {selectedEmployee.access.messages && (
                                                    <span className="inline-flex items-center ml-3">
                                                        <input type="checkbox" checked readOnly className="mr-1" />
                                                        <span className="text-sm">Messages</span>
                                                    </span>
                                                )}
                                                {selectedEmployee.access.products && (
                                                    <span className="inline-flex items-center ml-3">
                                                        <input type="checkbox" checked readOnly className="mr-1" />
                                                        <span className="text-sm">Products</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Cards */}
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    {/* Suspend Card */}
                                    <div className="bg-[#35408E] rounded-lg p-6 text-center cursor-pointer hover:bg-[#2c3575] transition-colors">
                                        <div className="flex justify-center mb-3">
                                            <svg className="w-16 h-16 text-[#ECBA0B]" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                                <path d="M16 12h2c0-3.31-2.69-6-6-6v2c2.21 0 4 1.79 4 4z"/>
                                            </svg>
                                        </div>
                                        <h3 className="text-white text-xl font-bold mb-2">Suspend</h3>
                                        <p className="text-white text-sm">How many days?</p>
                                    </div>

                                    {/* Terminate Card */}
                                    <div className="bg-[#35408E] rounded-lg p-6 text-center cursor-pointer hover:bg-[#2c3575] transition-colors">
                                        <div className="flex justify-center mb-3">
                                            <svg className="w-16 h-16 text-[#ECBA0B]" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                                            </svg>
                                        </div>
                                        <h3 className="text-white text-xl font-bold mb-2">Terminate</h3>
                                        <p className="text-white text-sm">vanish from reality</p>
                                    </div>
                                </div>

                                {/* Back Button */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowAccountStatus(false)}
                                        className="bg-[#35408E] text-white py-2 px-8 rounded hover:bg-[#2c3575] transition-colors font-semibold text-lg"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Account Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 relative">
                            {/* Modal Header */}
                            <div className="bg-[#35408E] text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Add Account</h2>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="flex gap-4 mb-6">
                                    {/* Profile Picture Placeholder */}
                                    <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center flex-shrink-0">
                                        <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        {/* Name Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Name:
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                placeholder="ex. Juan Dela Cruz"
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                required
                                            />
                                        </div>

                                        {/* Role Dropdown */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Role:
                                            </label>
                                            <select
                                                value={formData.role}
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                            >
                                                <option value="Sale Admin">Sale Admin</option>
                                                <option value="Operational Manager">Operational Manager</option>
                                                <option value="Production/Assembly">Production/Assembly</option>
                                                <option value="System Admin">System Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Access Checkboxes */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Access:
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.access.dashboard}
                                                onChange={() => handleAccessChange('dashboard')}
                                                className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E]"
                                            />
                                            <span className="text-sm">Dashboard</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.access.employees}
                                                onChange={() => handleAccessChange('employees')}
                                                className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E]"
                                            />
                                            <span className="text-sm">Employees tab</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.access.orders}
                                                onChange={() => handleAccessChange('orders')}
                                                className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E]"
                                            />
                                            <span className="text-sm">Orders tab</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.access.calendar}
                                                onChange={() => handleAccessChange('calendar')}
                                                className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E]"
                                            />
                                            <span className="text-sm">Calendar</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.access.messages}
                                                onChange={() => handleAccessChange('messages')}
                                                className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E]"
                                            />
                                            <span className="text-sm">Messages</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.access.products}
                                                onChange={() => handleAccessChange('products')}
                                                className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E]"
                                            />
                                            <span className="text-sm">Products</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Login Credentials Section */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Login credentials</h3>
                                    
                                    {/* Username */}
                                    <div className="mb-3">
                                        <label className="block text-sm text-gray-700 mb-1">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-[#35408E] text-white py-2 px-4 rounded hover:bg-[#2c3575] transition-colors font-semibold"
                                >
                                    Add
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}

export default SystemAccounts