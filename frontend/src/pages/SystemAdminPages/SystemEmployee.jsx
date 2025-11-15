import React, { useState, useEffect } from 'react'
import { FaSearch, FaTimes, FaEye, FaEdit } from 'react-icons/fa';


const SystemEmployee = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Modal states
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    
    // Form states for Add/Edit
    const [formData, setFormData] = useState({
        employeename: '',
        email: '',
        password: '',
        assigneddepartment: '',
        role: '',
        accountstatus: 'Active',
        contactdetails: '',
        shifthours: ''
    });

    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Fetch employees on component mount
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('https://gatsis-hub.vercel.app/employees');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch employees');
            }

            setEmployees(data.employees || []);
        } catch (err) {
            console.error('❌ Error fetching employees:', err);
            setError(err.message || 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    // Handle View Employee
    const handleViewEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowViewModal(true);
    };

    // Handle Edit Employee
    const handleEditEmployee = (employee) => {
        setSelectedEmployee(employee);
        setFormData({
            employeename: employee.employeename,
            email: employee.email,
            password: '', // Leave empty, will only update if filled
            assigneddepartment: employee.assigneddepartment,
            role: employee.role,
            accountstatus: employee.accountstatus,
            contactdetails: employee.contactdetails || '',
            shifthours: employee.shifthours || ''
        });
        setShowEditModal(true);
    };

    // Handle Add Employee Button
    const handleAddEmployeeClick = () => {
        setFormData({
            employeename: '',
            email: '',
            password: '',
            assigneddepartment: '',
            role: '',
            accountstatus: 'Active',
            contactdetails: '',
            shifthours: ''
        });
        setFormError('');
        setFormSuccess('');
        setShowAddModal(true);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Add Employee Submit
    const handleAddEmployeeSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Validate required fields
        if (!formData.employeename || !formData.email || !formData.password || 
            !formData.assigneddepartment || !formData.role) {
            setFormError('Please fill in all required fields');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFormError('Please enter a valid email address');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setFormError('Password must be at least 6 characters long');
            return;
        }

        try {
            const response = await fetch('https://gatsis-hub.vercel.app/employees/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create employee');
            }

            setFormSuccess('Employee created successfully!');
            setTimeout(() => {
                setShowAddModal(false);
                fetchEmployees(); // Refresh the list
            }, 1500);

        } catch (err) {
            console.error('❌ Error creating employee:', err);
            setFormError(err.message || 'Failed to create employee');
        }
    };

    // Handle Edit Employee Submit
    const handleEditEmployeeSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Validate required fields
        if (!formData.employeename || !formData.email || 
            !formData.assigneddepartment || !formData.role) {
            setFormError('Please fill in all required fields');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFormError('Please enter a valid email address');
            return;
        }

        // If password is provided, validate it
        if (formData.password && formData.password.length < 6) {
            setFormError('Password must be at least 6 characters long');
            return;
        }

        try {
            // Prepare update data (only include password if it's provided)
            const updateData = { ...formData };
            if (!updateData.password) {
                delete updateData.password;
            }

            const response = await fetch(`https://gatsis-hub.vercel.app/employees/${selectedEmployee.employeeid}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update employee');
            }

            setFormSuccess('Employee updated successfully!');
            setTimeout(() => {
                setShowEditModal(false);
                fetchEmployees(); // Refresh the list
            }, 1500);

        } catch (err) {
            console.error('❌ Error updating employee:', err);
            setFormError(err.message || 'Failed to update employee');
        }
    };

    // Handle Delete Employee
    const handleDeleteEmployee = async (employeeid) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/employees/${employeeid}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete employee');
            }

            alert('Employee deleted successfully');
            fetchEmployees(); // Refresh the list
            setShowViewModal(false);
            setShowEditModal(false);

        } catch (err) {
            console.error('❌ Error deleting employee:', err);
            alert(err.message || 'Failed to delete employee');
        }
    };

    // Filter employees based on search term
    const filteredEmployees = employees.filter(employee =>
        employee.employeename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.assigneddepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex w-full bg-gray-100">
            {/* Main Content */}
            <main className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-6">Employees</h1>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Controls */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex gap-2">
                        <button
                            className="px-6 py-2 bg-[#35408E] text-white font-semibold rounded cursor-pointer transition-colors hover:bg-[#2d3575]"
                            onClick={handleAddEmployeeClick}
                        >
                            + Add Employee
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded px-3 py-2 bg-white shadow-sm">
                            <FaSearch className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                className="outline-none w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                            {employees.filter(emp => emp.ispresent === true).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Active Accounts</h3>
                        <p className="text-3xl font-bold text-blue-600">
                            {employees.filter(emp => emp.accountstatus === 'Active').length}
                        </p>
                    </div>
                </div>

                {/* Employees Table */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-600">Loading employees...</p>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-600">No employees found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#35408E] text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Presence</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredEmployees.map((employee) => (
                                        <tr key={employee.employeeid} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-[#35408E] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                                        {employee.employeename.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{employee.employeename}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{employee.email}</td>
                                            <td className="px-6 py-4 text-gray-700">{employee.assigneddepartment}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                    {employee.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    employee.accountstatus === "Active" 
                                                        ? "bg-green-100 text-green-800" 
                                                        : "bg-red-100 text-red-800"
                                                }`}>
                                                    {employee.accountstatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    employee.ispresent 
                                                        ? "bg-green-100 text-green-800" 
                                                        : "bg-gray-100 text-gray-800"
                                                }`}>
                                                    {employee.ispresent ? "Present" : "Absent"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleViewEmployee(employee)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                                                    >
                                                        <FaEye /> View
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditEmployee(employee)}
                                                        className="px-3 py-1 bg-[#ECBA0B] text-black rounded text-sm hover:bg-yellow-500 transition-colors flex items-center gap-1"
                                                    >
                                                        <FaEdit /> Edit
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </main>

            {/* View Employee Modal */}
            {showViewModal && selectedEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-[#35408E] px-6 py-4 flex justify-between items-center sticky top-0">
                            <h2 className="text-white text-2xl font-semibold">Employee Details</h2>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-white hover:text-gray-200 text-2xl"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <div className="w-20 h-20 bg-[#35408E] rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4">
                                    {selectedEmployee.employeename.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{selectedEmployee.employeename}</h3>
                                    <p className="text-gray-600">{selectedEmployee.role}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Email</p>
                                    <p className="font-semibold text-gray-900">{selectedEmployee.email}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Employee ID</p>
                                    <p className="font-semibold text-gray-900">#{selectedEmployee.employeeid}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Department</p>
                                    <p className="font-semibold text-gray-900">{selectedEmployee.assigneddepartment}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Role</p>
                                    <p className="font-semibold text-gray-900">{selectedEmployee.role}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Account Status</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        selectedEmployee.accountstatus === "Active" 
                                            ? "bg-green-100 text-green-800" 
                                            : "bg-red-100 text-red-800"
                                    }`}>
                                        {selectedEmployee.accountstatus}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Presence</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        selectedEmployee.ispresent 
                                            ? "bg-green-100 text-green-800" 
                                            : "bg-gray-100 text-gray-800"
                                    }`}>
                                        {selectedEmployee.ispresent ? "Present" : "Absent"}
                                    </span>
                                </div>
                                {selectedEmployee.contactdetails && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Contact Details</p>
                                        <p className="font-semibold text-gray-900">{selectedEmployee.contactdetails}</p>
                                    </div>
                                )}
                                {selectedEmployee.shifthours && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Shift Hours</p>
                                        <p className="font-semibold text-gray-900">{selectedEmployee.shifthours}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-between">
                            <button
                                onClick={() => handleDeleteEmployee(selectedEmployee.employeeid)}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                            >
                                Delete Employee
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        handleEditEmployee(selectedEmployee);
                                    }}
                                    className="bg-[#ECBA0B] hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Employee Modal */}
            {showEditModal && selectedEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-[#35408E] px-6 py-4 flex justify-between items-center sticky top-0">
                            <h2 className="text-white text-2xl font-semibold">Edit Employee</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-white hover:text-gray-200 text-2xl"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleEditEmployeeSubmit} className="p-6">
                            {formError && (
                                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                    {formSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Employee Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="employeename"
                                        value={formData.employeename}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password (leave empty to keep current)
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        placeholder="Enter new password (min 6 characters)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="assigneddepartment"
                                        value={formData.assigneddepartment}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Production">Production</option>
                                        <option value="Assembly">Assembly</option>
                                        <option value="Operational Manager">Operational Manager</option>
                                        <option value="System Administration">System Administration</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        <option value="System Admin">System Admin</option>
                                        <option value="Sales Admin">Sales Admin</option>
                                        <option value="Operational Manager">Operational Manager</option>
                                        <option value="Production">Production</option>
                                        <option value="Assembly">Assembly</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="accountstatus"
                                        value={formData.accountstatus}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        required
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Details
                                    </label>
                                    <input
                                        type="text"
                                        name="contactdetails"
                                        value={formData.contactdetails}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        placeholder="Phone number or contact info"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shift Hours
                                    </label>
                                    <input
                                        type="text"
                                        name="shifthours"
                                        value={formData.shifthours}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        placeholder="e.g., 9:00 AM - 6:00 PM"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#35408E] hover:bg-[#2d3575] text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                                >
                                    Update Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-[#35408E] px-6 py-4 flex justify-between items-center sticky top-0">
                            <h2 className="text-white text-2xl font-semibold">Add New Employee</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-white hover:text-gray-200 text-2xl"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleAddEmployeeSubmit} className="p-6">
                            {formError && (
                                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                    {formSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Employee Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="employeename"
                                        value={formData.employeename}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        placeholder="Min 6 characters"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="assigneddepartment"
                                        value={formData.assigneddepartment}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Production">Production</option>
                                        <option value="Assembly">Assembly</option>
                                        <option value="Quality Control">Quality Control</option>
                                        <option value="Packaging">Packaging</option>
                                        <option value="Logistics">Logistics</option>
                                        <option value="Operational Manager">Operational Manager</option>
                                        <option value="System Administration">System Administration</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        <option value="System Admin">System Admin</option>
                                        <option value="Sales Admin">Sales Admin</option>
                                        <option value="Operational Manager">Operational Manager</option>
                                        <option value="Employee">Employee</option>
                                        <option value="Team Leader">Team Leader</option>
                                        <option value="Supervisor">Supervisor</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="accountstatus"
                                        value={formData.accountstatus}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        required
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Details
                                    </label>
                                    <input
                                        type="text"
                                        name="contactdetails"
                                        value={formData.contactdetails}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        placeholder="Phone number or contact info"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shift Hours
                                    </label>
                                    <input
                                        type="text"
                                        name="shifthours"
                                        value={formData.shifthours}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        placeholder="e.g., 9:00 AM - 6:00 PM"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#35408E] hover:bg-[#2d3575] text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                                >
                                    Create Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SystemEmployee