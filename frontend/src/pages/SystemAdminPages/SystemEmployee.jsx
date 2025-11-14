import React from 'react'
import { FaSearch } from 'react-icons/fa';


const SystemEmployee = () => {
    const [activeTab, setActiveTab] = React.useState("all");
    // const [searchTerm, setSearchTerm] = React.useState("");

    const employees = [
        { name: "Liam Parker", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        { name: "Isabela Cruz", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        { name: "Ethan Navarro", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        { name: "Sophia Ramirez", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        
    ];

    return (
        <div className="flex w-full bg-gray-100">
            {/* Main Content */}
            <main className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-6">Employees</h1>

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
                            onClick=""
                        >
                            Add Employees
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
                                                <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                                                    View
                                                </button>
                                                <button className="px-3 py-1 bg-[#ECBA0B] text-black rounded text-sm hover:bg-yellow-500 transition-colors">
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

            </main>
        </div>
    )
}

export default SystemEmployee