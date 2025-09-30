import React, { useState } from "react";
import { FaSearch, FaFilter, FaEllipsisV } from "react-icons/fa";

const Employees = () => {
    const employees = [
        { name: "Liam Parker", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        { name: "Isabela Cruz", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        { name: "Ethan Navarro", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        { name: "Sophia Ramirez", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        { name: "Noah Gucci", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        { name: "Tomo Gucci", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        { name: "Lucas Moreno", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        { name: "Light Skin Monte", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        { name: "Artorias Stiff", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
        { name: "Regine Velazquez", role: "Production", phone: "(555) 123-4567", attendance: "Present", target: 250, finished: 158, shift: "8:00 am to 5:00 pm" },
    ];

    const [activeTab, setActiveTab] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const handleOpenModal = (employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const teams = [
        {
            name: "Team 1",
            group: "Production team",
            order: "ORD-20250529-8743",
            task: "Production",
            target: 1000,
            finished: 632,
            shift: "8:00am - 5:00pm",
        },
        {
            name: "Team 2",
            group: "Assembly team",
            order: "ORD-20250529-8743",
            task: "Assembly",
            target: 1000,
            finished: 632,
            shift: "8:00am - 5:00pm",
        },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "all":
                return (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#35408E] text-white">
                                <tr>
                                    <th className="p-3">
                                        <input type="checkbox" />
                                    </th>
                                    <th className="p-3">Employee</th>
                                    <th className="p-3">Contact details</th>
                                    <th className="p-3">Attendance</th>
                                    <th className="p-3">Target quota</th>
                                    <th className="p-3">Finished quota</th>
                                    <th className="p-3">Shift hours</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, i) => (
                                    <tr
                                        key={i}
                                        className="border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleOpenModal(emp)}
                                    >
                                        <td className="p-3">
                                            <input type="checkbox" />
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-400"></div>
                                                <div>
                                                    <p className="font-semibold">{emp.name}</p>
                                                    <p className="text-sm text-gray-500">{emp.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">{emp.phone}</td>
                                        <td className="p-3">
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                                {emp.attendance}
                                            </span>
                                        </td>
                                        <td className="p-3">{emp.target}</td>
                                        <td className="p-3">{emp.finished}</td>
                                        <td className="p-3">{emp.shift}</td>
                                        <td className="p-3">
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleOpenModal(emp);
                                                }}
                                            >
                                                <FaEllipsisV />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Modal */}
                        {isModalOpen && selectedEmployee && (
                            <div className="fixed inset-0 flex items-center justify-center bg-[rgba(143,143,143,0.65)] z-50">
                                <div className="bg-white rounded-lg shadow-lg w-[500px] p-8 relative">
                                    <button
                                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        &times;
                                    </button>
                                    <div className="flex gap-4 items-center mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gray-300"></div>
                                        <div>
                                            <h2 className="text-2xl font-bold mb-1">{selectedEmployee.name}</h2>
                                            <p className="text-gray-600">{selectedEmployee.role}</p>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-1">Contact Details</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded px-3 py-2"
                                            value={selectedEmployee.phone}
                                            readOnly
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-1">Shift Hours</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded px-3 py-2"
                                            value={selectedEmployee.shift}
                                            readOnly
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-1">Department</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded px-3 py-2"
                                            value={selectedEmployee.role}
                                            readOnly
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-1">Target Quota</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded px-3 py-2"
                                            value={selectedEmployee.target}
                                            readOnly
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-gray-700 mb-1">Finished Quota</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded px-3 py-2"
                                            value={selectedEmployee.finished}
                                            readOnly
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            className="bg-[#35408E] text-white px-8 py-2 rounded text-lg font-semibold"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case "edit":
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Edit Employees</h2>
                        <p className="text-gray-600">Here you can manage and edit employees.</p>
                    </div>
                );
            case "teams":
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Teams</h2>
                        <table className="w-full text-left">
                            <thead className="bg-[#35408E] text-white">
                                <tr>
                                    <th className="p-3">Team Name</th>
                                    <th className="p-3">Group</th>
                                    <th className="p-3">Order</th>
                                    <th className="p-3">Task</th>
                                    <th className="p-3">Target</th>
                                    <th className="p-3">Finished</th>
                                    <th className="p-3">Shift</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((team, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => {
                                            setSelectedEmployee(team);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <td className="p-3 font-semibold">{team.name}</td>
                                        <td className="p-3">{team.group}</td>
                                        <td className="p-3">{team.order}</td>
                                        <td className="p-3">{team.task}</td>
                                        <td className="p-3">{team.target}</td>
                                        <td className="p-3">{team.finished}</td>
                                        <td className="p-3">{team.shift}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Modal */}
                        {isModalOpen && selectedEmployee && (
                            <div className="fixed inset-0 flex items-center justify-center bg-[rgba(143,143,143,0.65)] z-50">
                                <div className="bg-white rounded-lg shadow-lg w-[700px] p-8 relative">
                                    <button
                                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        &times;
                                    </button>
                                    <div className="border-b pb-4 mb-4">
                                        <h2 className="text-3xl font-bold mb-2">{selectedEmployee.name}</h2>
                                        <p className="text-lg text-gray-600">{selectedEmployee.group}</p>
                                    </div>
                                    <div className="flex gap-8 mb-6">
                                        {/* Dummy avatars for team members */}
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="flex flex-col items-center">
                                                <div className="w-16 h-16 rounded-full bg-gray-300 mb-2"></div>
                                                <p className="font-semibold text-gray-700 text-sm">Member {i + 1}</p>
                                                <p className="text-xs text-gray-500">{selectedEmployee.task}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-gray-700 mb-1">Assign Order</label>
                                            <select className="w-full border rounded px-3 py-2">
                                                <option>{selectedEmployee.order}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-1">Department</label>
                                            <select className="w-full border rounded px-3 py-2">
                                                <option>{selectedEmployee.task}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-1">Target Quota</label>
                                            <input
                                                type="text"
                                                className="w-full border rounded px-3 py-2"
                                                value={selectedEmployee.target.toLocaleString()}
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-1">Finished Quota</label>
                                            <input
                                                type="number"
                                                className="w-full border rounded px-3 py-2"
                                                value={selectedEmployee.finished}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button className="bg-[#35408E] text-white px-8 py-2 rounded text-lg font-semibold">
                                            Assign
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
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
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-1 rounded cursor-pointer ${activeTab === "all" ? "bg-yellow-400" : "bg-gray-200"}`}
                            onClick={() => setActiveTab("all")}
                        >
                            All
                        </button>
                        <button
                            className={`px-4 py-1 rounded cursor-pointer ${activeTab === "edit" ? "bg-yellow-400" : "bg-gray-200"}`}
                            onClick={() => setActiveTab("edit")}
                        >
                            Edit
                        </button>
                        <button
                            className={`px-4 py-1 rounded cursor-pointer ${activeTab === "teams" ? "bg-yellow-400" : "bg-gray-200"}`}
                            onClick={() => setActiveTab("teams")}
                        >
                            Teams
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded px-2">
                            <FaSearch className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="px-2 py-1 outline-none"
                            />
                        </div>
                        <button className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded">
                            <FaFilter /> Filter
                        </button>
                    </div>
                </div>

                {/* Dynamic Content */}
                {renderContent()}

                {/* Pagination */}
                {activeTab === "all" && (
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                        <span>Showing 1–20 of 15</span>
                        <div className="flex gap-1">
                            <button className="px-2 py-1 bg-gray-200 rounded">1</button>
                            <button className="px-2 py-1 hover:bg-gray-200 rounded">2</button>
                            <button className="px-2 py-1 hover:bg-gray-200 rounded">3</button>
                            <button className="px-2 py-1 hover:bg-gray-200 rounded">...</button>
                            <button className="px-2 py-1 hover:bg-gray-200 rounded">15</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Employees;
