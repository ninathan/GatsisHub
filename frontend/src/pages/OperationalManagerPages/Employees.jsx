import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaEllipsisV, FaTrash, FaEdit } from "react-icons/fa";

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        employeename: "",
        contactdetails: "",
        shifthours: "",
        assigneddepartment: "",
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        // Filter employees based on search term
        if (searchTerm.trim() === "") {
            setFilteredEmployees(employees);
        } else {
            const filtered = employees.filter(emp =>
                emp.employeename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.assigneddepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.contactdetails?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEmployees(filtered);
        }
    }, [searchTerm, employees]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            // Fetch only Production and Assembly employees
            const response = await fetch(
                'https://gatsis-hub.vercel.app/employees'
            );
            const data = await response.json();
            
            // Filter to only show Production and Assembly roles
            const productionAndAssembly = data.employees.filter(
                emp => emp.assigneddepartment === 'Production' || emp.assigneddepartment === 'Assembly'
            );
            
            setEmployees(productionAndAssembly);
            setFilteredEmployees(productionAndAssembly);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (employee, editing = false) => {
        setSelectedEmployee(employee);
        setIsEditing(editing);
        setFormData({
            employeename: employee.employeename,
            contactdetails: employee.contactdetails || "",
            shifthours: employee.shifthours || "",
            assigneddepartment: employee.assigneddepartment || "",
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
        setIsEditing(false);
        setFormData({
            employeename: "",
            contactdetails: "",
            shifthours: "",
            assigneddepartment: "",
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateEmployee = async () => {
        try {
            const response = await fetch(
                `https://gatsis-hub.vercel.app/employees/${selectedEmployee.employeeid}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                }
            );

            if (response.ok) {
                alert('Employee updated successfully!');
                handleCloseModal();
                fetchEmployees(); // Refresh the list
            } else {
                const error = await response.json();
                alert(`Error: ${error.error || 'Failed to update employee'}`);
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Failed to update employee');
        }
    };

    const handleDeleteEmployee = async (employeeid, employeename) => {
        if (!window.confirm(`Are you sure you want to delete ${employeename}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(
                `https://gatsis-hub.vercel.app/employees/${employeeid}`,
                {
                    method: 'DELETE',
                }
            );

            if (response.ok) {
                alert('Employee deleted successfully!');
                fetchEmployees(); // Refresh the list
            } else {
                const error = await response.json();
                alert(`Error: ${error.error || 'Failed to delete employee'}`);
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Failed to delete employee');
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case "all":
                return (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#35408E] mx-auto mb-4"></div>
                                Loading employees...
                            </div>
                        ) : filteredEmployees.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No employees found {searchTerm && `matching "${searchTerm}"`}
                            </div>
                        ) : (
                            <>
                                <table className="w-full text-left">
                                    <thead className="bg-[#35408E] text-white">
                                        <tr>
                                            <th className="p-3">Employee</th>
                                            <th className="p-3">Department</th>
                                            <th className="p-3">Contact details</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Shift hours</th>
                                            <th className="p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmployees.map((emp) => (
                                            <tr
                                                key={emp.employeeid}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#35408E] to-[#4a5899] text-white flex items-center justify-center font-semibold">
                                                            {emp.employeename?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{emp.employeename}</p>
                                                            <p className="text-xs text-gray-500">{emp.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        emp.assigneddepartment === 'Production' 
                                                            ? 'bg-blue-100 text-blue-700' 
                                                            : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                        {emp.assigneddepartment}
                                                    </span>
                                                </td>
                                                <td className="p-3">{emp.contactdetails || 'N/A'}</td>
                                                <td className="p-3">
                                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                                        emp.ispresent 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {emp.ispresent ? 'Present' : 'Absent'}
                                                    </span>
                                                </td>
                                                <td className="p-3">{emp.shifthours || 'N/A'}</td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(emp, false)}
                                                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                                                            title="View Details"
                                                        >
                                                            <FaEllipsisV />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenModal(emp, true)}
                                                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition-colors"
                                                            title="Edit Employee"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteEmployee(emp.employeeid, emp.employeename);
                                                            }}
                                                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete Employee"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Modal */}
                                {isModalOpen && selectedEmployee && (
                                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative mx-4">
                                            <button
                                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                                onClick={handleCloseModal}
                                            >
                                                &times;
                                            </button>
                                            <div className="flex gap-4 items-center mb-6">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#35408E] to-[#4a5899] text-white flex items-center justify-center text-2xl font-bold">
                                                    {selectedEmployee.employeename?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold mb-1">{selectedEmployee.employeename}</h2>
                                                    <p className="text-gray-600">{selectedEmployee.assigneddepartment}</p>
                                                    <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">Employee Name</label>
                                                    <input
                                                        type="text"
                                                        name="employeename"
                                                        className={`w-full border rounded px-4 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
                                                        value={formData.employeename}
                                                        onChange={handleInputChange}
                                                        readOnly={!isEditing}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">Department</label>
                                                    <select
                                                        name="assigneddepartment"
                                                        className={`w-full border rounded px-4 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
                                                        value={formData.assigneddepartment}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                    >
                                                        <option value="Production">Production</option>
                                                        <option value="Assembly">Assembly</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">Contact Details</label>
                                                    <input
                                                        type="text"
                                                        name="contactdetails"
                                                        className={`w-full border rounded px-4 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
                                                        value={formData.contactdetails}
                                                        onChange={handleInputChange}
                                                        readOnly={!isEditing}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">Shift Hours</label>
                                                    <input
                                                        type="text"
                                                        name="shifthours"
                                                        className={`w-full border rounded px-4 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
                                                        value={formData.shifthours}
                                                        onChange={handleInputChange}
                                                        readOnly={!isEditing}
                                                        placeholder="e.g., 8:00 AM - 5:00 PM"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">Account Status</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border rounded px-4 py-2 bg-gray-100"
                                                        value={selectedEmployee.accountstatus}
                                                        readOnly
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">Presence Status</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border rounded px-4 py-2 bg-gray-100"
                                                        value={selectedEmployee.ispresent ? 'Present' : 'Absent'}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3">
                                                <button
                                                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded text-lg font-semibold hover:bg-gray-400 transition-colors"
                                                    onClick={handleCloseModal}
                                                >
                                                    Close
                                                </button>
                                                {isEditing && (
                                                    <button
                                                        className="bg-[#35408E] text-white px-6 py-2 rounded text-lg font-semibold hover:bg-[#2a3470] transition-colors"
                                                        onClick={handleUpdateEmployee}
                                                    >
                                                        Save Changes
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            case "edit":
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Edit Employees</h2>
                        <p className="text-gray-600">Switch to the "All" tab to view, edit, or delete employees.</p>
                    </div>
                );
            case "teams":
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Teams</h2>
                        <p className="text-gray-600">Team management feature coming soon...</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex w-full bg-gray-100">
            {/* Main Content */}
            <main className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-6">Employees</h1>

                {/* Controls */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 rounded cursor-pointer transition-colors ${
                                activeTab === "all" 
                                    ? "bg-[#ECBA0B] text-black font-semibold" 
                                    : "bg-gray-200 hover:bg-gray-300"
                            }`}
                            onClick={() => setActiveTab("all")}
                        >
                            All Employees
                        </button>
                        <button
                            className={`px-4 py-2 rounded cursor-pointer transition-colors ${
                                activeTab === "teams" 
                                    ? "bg-[#ECBA0B] text-black font-semibold" 
                                    : "bg-gray-200 hover:bg-gray-300"
                            }`}
                            onClick={() => setActiveTab("teams")}
                        >
                            Teams
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
                            {employees.filter(e => e.ispresent).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Absent Today</h3>
                        <p className="text-3xl font-bold text-red-600">
                            {employees.filter(e => !e.ispresent).length}
                        </p>
                    </div>
                </div>

                {/* Dynamic Content */}
                {renderContent()}
            </main>
        </div>
    );
};

export default Employees;
