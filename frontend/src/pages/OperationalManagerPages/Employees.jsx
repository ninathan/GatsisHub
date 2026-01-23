import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaEllipsisV, FaTrash, FaEdit, FaPlus, FaUsers, FaClipboardList, FaBullseye, FaTrophy, FaChartLine } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState({
        employeename: "",
        contactdetails: "",
        shifthours: "",
        assigneddepartment: "",
        ispresent: false,
    });

    // Teams state
    const [teams, setTeams] = useState([]);
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showDeleteTeamConfirm, setShowDeleteTeamConfirm] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [teamFormData, setTeamFormData] = useState({
        teamname: "",
        description: "",
        selectedEmployees: [],
        assignedOrders: []
    });

    // Quotas state
    const [quotas, setQuotas] = useState([]);
    const [showCreateQuotaModal, setShowCreateQuotaModal] = useState(false);
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    const [showDeleteQuotaConfirm, setShowDeleteQuotaConfirm] = useState(false);
    const [selectedQuota, setSelectedQuota] = useState(null);
    const [isEditingQuota, setIsEditingQuota] = useState(false);
    const [quotaFormData, setQuotaFormData] = useState({
        quotaname: "",
        teamids: [],
        assignedOrders: [],
        finishedquota: 0,
        startdate: "",
        enddate: "",
        status: "Active"
    });

    useEffect(() => {
        fetchEmployees();
        fetchTeams();
        fetchAvailableOrders();
        fetchQuotas();
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
            ispresent: employee.ispresent || false,
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
            ispresent: false,
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
                setSuccessMessage('Employee updated successfully!');
                setShowSuccessModal(true);
                handleCloseModal();
                fetchEmployees(); // Refresh the list
            } else {
                const error = await response.json();
                setErrorMessage(error.error || 'Failed to update employee');
                setShowErrorModal(true);
            }
        } catch (error) {

            setErrorMessage('Failed to update employee. Please try again.');
            setShowErrorModal(true);
        }
    };

    const handleDeleteClick = (employee) => {
        setEmployeeToDelete(employee);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!employeeToDelete) return;

        try {
            const response = await fetch(
                `https://gatsis-hub.vercel.app/employees/${employeeToDelete.employeeid}`,
                {
                    method: 'DELETE',
                }
            );

            if (response.ok) {
                setSuccessMessage(`${employeeToDelete.employeename} has been archived successfully!`);
                setShowSuccessModal(true);
                setShowDeleteConfirm(false);
                setEmployeeToDelete(null);
                fetchEmployees(); // Refresh the list
            } else {
                const error = await response.json();
                setErrorMessage(error.error || 'Failed to archive employee');
                setShowErrorModal(true);
                setShowDeleteConfirm(false);
            }
        } catch (error) {

            setErrorMessage('Failed to archive employee. Please try again.');
            setShowErrorModal(true);
            setShowDeleteConfirm(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setEmployeeToDelete(null);
    };

    // Team functions
    const fetchTeams = async () => {
        try {

            const response = await fetch('https://gatsis-hub.vercel.app/teams');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Transform API data to match frontend structure
            const transformedTeams = data.teams.map(team => ({
                teamid: team.teamid,
                teamname: team.teamname,
                description: team.description,
                members: team.members || [],
                quota: team.quota,
                dailyquota: team.dailyquota,
                assignedOrders: team.assignedorders || [],
                createdAt: team.createdat
            }));

            setTeams(transformedTeams);

        } catch (error) {

            setErrorMessage('Failed to load teams. Please try again.');
            setShowErrorModal(true);
        }
    };

    const fetchAvailableOrders = async () => {
        try {

            const response = await fetch('https://gatsis-hub.vercel.app/orders/all');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Filter orders that are in production or later stages (not completed or cancelled)
            const assignableOrders = data.orders.filter(order =>
                ['In Production', 'Waiting for Shipment', 'In Transit'].includes(order.orderstatus)
            );

            setAvailableOrders(assignableOrders);

        } catch (error) {

            setErrorMessage('Failed to load available orders. Please try again.');
            setShowErrorModal(true);
        }
    };

    const handleCreateTeam = () => {
        setTeamFormData({
            teamname: "",
            description: "",
            selectedEmployees: [],
            quota: "",
            dailyquota: "",
            assignedOrders: []
        });
        setShowCreateTeamModal(true);
    };

    const handleViewTeam = (team) => {
        setSelectedTeam(team);
        setTeamFormData({
            teamname: team.teamname,
            description: team.description || "",
            selectedEmployees: team.members || [],
            quota: team.quota || "",
            dailyquota: team.dailyquota || "",
            assignedOrders: team.assignedOrders || []
        });
        setIsEditingTeam(false);
        setShowTeamModal(true);
    };

    const handleEditTeam = () => {
        setIsEditingTeam(true);
    };

    const handleDeleteTeam = (team) => {
        setSelectedTeam(team);
        setShowDeleteTeamConfirm(true);
    };

    const handleSaveTeam = async () => {
        if (!teamFormData.teamname.trim()) {
            setErrorMessage('Team name is required');
            setShowErrorModal(true);
            return;
        }

        try {

            // Prepare data for API
            const teamData = {
                teamname: teamFormData.teamname,
                description: teamFormData.description,
                members: teamFormData.selectedEmployees,
                assignedOrders: teamFormData.assignedOrders
            };

            let response;
            let result;

            if (selectedTeam) {
                // Update existing team
                response = await fetch(`https://gatsis-hub.vercel.app/teams/${selectedTeam.teamid}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(teamData)
                });
            } else {
                // Create new team
                response = await fetch('https://gatsis-hub.vercel.app/teams/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(teamData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            result = await response.json();

            // Transform API response to match frontend structure
            const transformedTeam = {
                teamid: result.team.teamid,
                teamname: result.team.teamname,
                description: result.team.description,
                members: result.team.members || [],
                quota: result.team.quota,
                dailyquota: result.team.dailyquota,
                assignedOrders: result.team.assignedorders || [],
                createdAt: result.team.createdat
            };

            // Update local state
            let updatedTeams;
            if (selectedTeam) {
                // Update existing team
                updatedTeams = teams.map(team =>
                    team.teamid === selectedTeam.teamid ? transformedTeam : team
                );
            } else {
                // Add new team
                updatedTeams = [...teams, transformedTeam];
            }

            setTeams(updatedTeams);

            setSuccessMessage(`Team ${selectedTeam ? 'updated' : 'created'} successfully!`);
            setShowSuccessModal(true);

            handleCloseTeamModal();

        } catch (error) {

            setErrorMessage(error.message || 'Failed to save team. Please try again.');
            setShowErrorModal(true);
        }
    };

    const handleConfirmDeleteTeam = async () => {
        if (!selectedTeam) return;

        try {

            const response = await fetch(`https://gatsis-hub.vercel.app/teams/${selectedTeam.teamid}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Update local state
            const updatedTeams = teams.filter(team => team.teamid !== selectedTeam.teamid);
            setTeams(updatedTeams);

            setSuccessMessage(`Team "${selectedTeam.teamname}" has been deleted successfully!`);
            setShowSuccessModal(true);

            setShowDeleteTeamConfirm(false);
            setSelectedTeam(null);

        } catch (error) {

            setErrorMessage(error.message || 'Failed to delete team. Please try again.');
            setShowErrorModal(true);
            setShowDeleteTeamConfirm(false);
        }
    };

    const handleTeamInputChange = (e) => {
        const { name, value } = e.target;
        setTeamFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmployeeSelection = (employeeId) => {
        setTeamFormData(prev => ({
            ...prev,
            selectedEmployees: prev.selectedEmployees.includes(employeeId)
                ? prev.selectedEmployees.filter(id => id !== employeeId)
                : [...prev.selectedEmployees, employeeId]
        }));
    };

    const handleOrderSelection = (orderId) => {
        setTeamFormData(prev => ({
            ...prev,
            assignedOrders: prev.assignedOrders.includes(orderId)
                ? prev.assignedOrders.filter(id => id !== orderId)
                : [...prev.assignedOrders, orderId]
        }));
    };

    // ============= QUOTA FUNCTIONS =============
    
    const fetchQuotas = async () => {
        try {

            const response = await fetch('https://gatsis-hub.vercel.app/quotas');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            setQuotas(data.quotas || []);

        } catch (error) {

            setErrorMessage('Failed to load quotas. Please try again.');
            setShowErrorModal(true);
        }
    };

    const handleCreateQuota = () => {
        setSelectedQuota(null);
        setIsEditingQuota(true);
        setQuotaFormData({
            quotaname: "",
            teamids: [],
            assignedOrders: [],
            finishedquota: 0,
            startdate: "",
            enddate: "",
            status: "Active"
        });
        setShowCreateQuotaModal(true);
    };

    const handleViewQuota = (quota) => {
        setSelectedQuota(quota);
        setIsEditingQuota(false);
        setQuotaFormData({
            quotaname: quota.quotaname,
            teamids: quota.teamids || [],
            assignedOrders: quota.assignedorders || [],
            finishedquota: quota.finishedquota || 0,
            startdate: quota.startdate || "",
            enddate: quota.enddate || "",
            status: quota.status || "Active"
        });
        setShowQuotaModal(true);
    };

    const handleEditQuota = () => {
        setIsEditingQuota(true);
    };

    const handleDeleteQuota = (quota) => {
        setSelectedQuota(quota);
        setShowDeleteQuotaConfirm(true);
    };

    const handleCancelDeleteQuota = () => {
        setShowDeleteQuotaConfirm(false);
        setSelectedQuota(null);
    };

    const handleCloseQuotaModal = () => {
        setShowQuotaModal(false);
        setShowCreateQuotaModal(false);
        setSelectedQuota(null);
        setIsEditingQuota(false);
    };

    const handleSaveQuota = async () => {
        try {
            // Validate form
            if (!quotaFormData.quotaname || quotaFormData.assignedOrders.length === 0) {
                setErrorMessage('Quota name and at least one assigned order are required');
                setShowErrorModal(true);
                return;
            }

            const quotaData = {
                quotaname: quotaFormData.quotaname,
                teamids: quotaFormData.teamids.map(id => parseInt(id)),
                assignedorders: quotaFormData.assignedOrders,
                finishedquota: parseInt(quotaFormData.finishedquota) || 0,
                startdate: quotaFormData.startdate || null,
                enddate: quotaFormData.enddate || null,
                status: quotaFormData.status
            };

            let response;
            
            if (selectedQuota) {
                // Update existing quota
                response = await fetch(`https://gatsis-hub.vercel.app/quotas/${selectedQuota.quotaid}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(quotaData)
                });
            } else {
                // Create new quota
                response = await fetch('https://gatsis-hub.vercel.app/quotas/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(quotaData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save quota');
            }

            const savedQuota = await response.json();

            // Refresh quotas and teams
            await fetchQuotas();
            await fetchTeams();

            setSuccessMessage(`Quota "${quotaFormData.quotaname}" has been ${selectedQuota ? 'updated' : 'created'} successfully!`);
            setShowSuccessModal(true);

            handleCloseQuotaModal();

        } catch (error) {

            setErrorMessage(error.message || 'Failed to save quota. Please try again.');
            setShowErrorModal(true);
        }
    };

    const handleConfirmDeleteQuota = async () => {
        if (!selectedQuota) return;

        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/quotas/${selectedQuota.quotaid}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete quota');
            }

            // Refresh quotas and teams
            await fetchQuotas();
            await fetchTeams();

            setSuccessMessage(`Quota "${selectedQuota.quotaname}" has been deleted successfully!`);
            setShowSuccessModal(true);

            setShowDeleteQuotaConfirm(false);
            setSelectedQuota(null);

        } catch (error) {

            setErrorMessage(error.message || 'Failed to delete quota. Please try again.');
            setShowErrorModal(true);
            setShowDeleteQuotaConfirm(false);
        }
    };

    const handleQuotaInputChange = (e) => {
        const { name, value } = e.target;
        setQuotaFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuotaOrderSelection = (orderId) => {
        setQuotaFormData(prev => ({
            ...prev,
            assignedOrders: prev.assignedOrders.includes(orderId)
                ? prev.assignedOrders.filter(id => id !== orderId)
                : [...prev.assignedOrders, orderId]
        }));
    };

    const handleQuotaTeamSelection = (teamId) => {
        setQuotaFormData(prev => ({
            ...prev,
            teamids: prev.teamids.includes(teamId)
                ? prev.teamids.filter(id => id !== teamId)
                : [...prev.teamids, teamId]
        }));
    };

    // ============= END QUOTA FUNCTIONS =============

    const handleCloseTeamModal = () => {
        setShowCreateTeamModal(false);
        setShowTeamModal(false);
        setSelectedTeam(null);
        setIsEditingTeam(false);
        setTeamFormData({
            teamname: "",
            description: "",
            selectedEmployees: [],
            quota: "",
            assignedOrders: []
        });
    };

    const renderContent = () => {
        switch (activeTab) {
            case "all":
                return (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <LoadingSpinner size="lg" text="Loading employees..." />
                            </div>
                        ) : filteredEmployees.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No employees found {searchTerm && `matching "${searchTerm}"`}
                            </div>
                        ) : (
                            <>
                                <table className="w-full text-left">
                                    <thead className="bg-[#191716] text-white">
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
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#191716] to-[#4a5899] text-white flex items-center justify-center font-semibold">
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
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            try {
                                                                const response = await fetch(`https://gatsis-hub.vercel.app/employees/${emp.employeeid}`, {
                                                                    method: 'PATCH',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ ispresent: !emp.ispresent })
                                                                });
                                                                if (response.ok) {
                                                                    await fetchEmployees();
                                                                    setSuccessMessage(`${emp.employeename} marked as ${!emp.ispresent ? 'Present' : 'Absent'}`);
                                                                    setShowSuccessModal(true);
                                                                }
                                                            } catch (error) {

                                                                setErrorMessage('Failed to update presence status');
                                                                setShowErrorModal(true);
                                                            }
                                                        }}
                                                        className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-all hover:shadow-md ${
                                                            emp.ispresent 
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                        title={`Click to mark as ${emp.ispresent ? 'Absent' : 'Present'}`}
                                                    >
                                                        {emp.ispresent ? 'Present' : 'Absent'}
                                                    </button>
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
                                                                handleDeleteClick(emp);
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
                                    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50">
                                        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative mx-4">
                                            <button
                                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                                onClick={handleCloseModal}
                                            >
                                                &times;
                                            </button>
                                            <div className="flex gap-4 items-center mb-6">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#191716] to-[#4a5899] text-white flex items-center justify-center text-2xl font-bold">
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
                                                    {isEditing ? (
                                                        <select
                                                            name="ispresent"
                                                            value={formData.ispresent ? 'true' : 'false'}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, ispresent: e.target.value === 'true' }))}
                                                            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                        >
                                                            <option value="true">Present</option>
                                                            <option value="false">Absent</option>
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            className="w-full border rounded px-4 py-2 bg-gray-100"
                                                            value={selectedEmployee.ispresent ? 'Present' : 'Absent'}
                                                            readOnly
                                                        />
                                                    )}
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
                                                        className="bg-[#E6AF2E] text-[#191716] hover:text-white px-6 py-2 rounded text-lg font-semibold hover:bg-[#191716] transition-colors"
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
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">Teams Management</h2>
                                <button
                                    onClick={handleCreateTeam}
                                    className="bg-[#E6AF2E] text-[#191716] px-4 py-2 rounded-lg font-semibold hover:bg-[#191716] hover:text-white cursor-pointer transition-colors flex items-center gap-2"
                                >
                                    <FaPlus /> Create Team
                                </button>
                            </div>
                        </div>

                        {teams.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FaUsers className="mx-auto text-4xl mb-4 text-gray-300" />
                                <p className="text-lg font-medium mb-2">No teams created yet</p>
                                <p className="text-sm">Create your first team to start organizing employees and assigning orders.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                {teams.map((team) => (
                                    <div 
                                        key={team.id} 
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handleViewTeam(team)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-semibold text-lg">{team.teamname}</h3>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTeam(team);
                                                }}
                                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                                                title="Delete Team"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>

                                        {team.description && (
                                            <p className="text-gray-600 text-sm mb-3">{team.description}</p>
                                        )}

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <FaUsers className="text-gray-500" />
                                                <span className="text-gray-600">
                                                    {team.members?.length || 0} members
                                                </span>
                                            </div>

                                            {team.assignedOrders && team.assignedOrders.length > 0 && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaClipboardList className="text-gray-500" />
                                                    <span className="text-gray-600">
                                                        {team.assignedOrders.length} order{team.assignedOrders.length !== 1 ? 's' : ''} assigned
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-gray-500">
                                                Created: {new Date(team.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Create Team Modal */}
                        {showCreateTeamModal && (
                            <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50">
                                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold">Create New Team</h3>
                                        <button
                                            onClick={handleCloseTeamModal}
                                            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Team Name *</label>
                                            <input
                                                type="text"
                                                name="teamname"
                                                value={teamFormData.teamname}
                                                onChange={handleTeamInputChange}
                                                className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                placeholder="Enter team name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Description</label>
                                            <textarea
                                                name="description"
                                                value={teamFormData.description}
                                                onChange={handleTeamInputChange}
                                                className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                placeholder="Enter team description"
                                                rows="3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Assign Employees</label>
                                            <div className="border rounded p-4 max-h-48 overflow-y-auto">
                                                {employees.length === 0 ? (
                                                    <p className="text-gray-500 text-sm">No employees available</p>
                                                ) : (
                                                    employees.map((emp) => (
                                                        <label key={emp.employeeid} className="flex items-center gap-3 py-2 hover:bg-gray-50 px-2 rounded cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={teamFormData.selectedEmployees.includes(emp.employeeid)}
                                                                onChange={() => handleEmployeeSelection(emp.employeeid)}
                                                                className="rounded border-gray-300 text-[#35408E] focus:ring-[#35408E]"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#35408E] to-[#4a5899] text-white flex items-center justify-center text-sm font-semibold">
                                                                    {emp.employeename?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-sm">{emp.employeename}</p>
                                                                    <p className="text-xs text-gray-500">{emp.assigneddepartment}</p>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Assign Orders</label>
                                            <div className="border rounded p-4 max-h-48 overflow-y-auto">
                                                {availableOrders.length === 0 ? (
                                                    <p className="text-gray-500 text-sm">No orders available for assignment</p>
                                                ) : (
                                                    availableOrders.map((order) => (
                                                        <label key={order.orderid} className="flex items-center gap-3 py-2 hover:bg-gray-50 px-2 rounded cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={teamFormData.assignedOrders.includes(order.orderid)}
                                                                onChange={() => handleOrderSelection(order.orderid)}
                                                                className="rounded border-gray-300 text-[#35408E] focus:ring-[#35408E]"
                                                            />
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-sm">
                                                                        Order #{order.orderid.slice(0, 8).toUpperCase()}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {order.companyname} • {order.hangertype} • {order.quantity} units
                                                                    </p>
                                                                    <p className="text-xs text-blue-600">
                                                                        Status: {order.orderstatus}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Only orders in production or later stages can be assigned to teams
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            onClick={handleCloseTeamModal}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveTeam}
                                            className="px-6 py-2 bg-[#35408E] text-white rounded-lg font-semibold hover:bg-[#2a3470] transition-colors"
                                        >
                                            Create Team
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Team View/Edit Modal */}
                        {showTeamModal && selectedTeam && (
                            <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50">
                                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold">
                                            {isEditingTeam ? 'Edit Team' : selectedTeam.teamname}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            {!isEditingTeam && (
                                                <button
                                                    onClick={handleEditTeam}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                >
                                                    <FaEdit /> Edit Team
                                                </button>
                                            )}
                                            <button
                                                onClick={handleCloseTeamModal}
                                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    </div>

                                    {isEditingTeam ? (
                                        // Edit Mode
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Team Name *</label>
                                                <input
                                                    type="text"
                                                    name="teamname"
                                                    value={teamFormData.teamname}
                                                    onChange={handleTeamInputChange}
                                                    className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                    placeholder="Enter team name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                                                <textarea
                                                    name="description"
                                                    value={teamFormData.description}
                                                    onChange={handleTeamInputChange}
                                                    className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                    placeholder="Enter team description"
                                                    rows="3"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Assign Employees</label>
                                                <div className="border rounded p-4 max-h-48 overflow-y-auto">
                                                    {employees.length === 0 ? (
                                                        <p className="text-gray-500 text-sm">No employees available</p>
                                                    ) : (
                                                        employees.map((emp) => (
                                                            <label key={emp.employeeid} className="flex items-center gap-3 py-2 hover:bg-gray-50 px-2 rounded cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={teamFormData.selectedEmployees.includes(emp.employeeid)}
                                                                    onChange={() => handleEmployeeSelection(emp.employeeid)}
                                                                    className="rounded border-gray-300 text-[#35408E] focus:ring-[#35408E]"
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#35408E] to-[#4a5899] text-white flex items-center justify-center text-sm font-semibold">
                                                                        {emp.employeename?.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-sm">{emp.employeename}</p>
                                                                        <p className="text-xs text-gray-500">{emp.assigneddepartment}</p>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Assign Orders</label>
                                                <div className="border rounded p-4 max-h-48 overflow-y-auto">
                                                    {availableOrders.length === 0 ? (
                                                        <p className="text-gray-500 text-sm">No orders available for assignment</p>
                                                    ) : (
                                                        availableOrders.map((order) => (
                                                            <label key={order.orderid} className="flex items-center gap-3 py-2 hover:bg-gray-50 px-2 rounded cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={teamFormData.assignedOrders.includes(order.orderid)}
                                                                    onChange={() => handleOrderSelection(order.orderid)}
                                                                    className="rounded border-gray-300 text-[#35408E] focus:ring-[#35408E]"
                                                                />
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-sm">
                                                                            Order #{order.orderid.slice(0, 8).toUpperCase()}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {order.companyname} • {order.hangertype} • {order.quantity} units
                                                                        </p>
                                                                        <p className="text-xs text-blue-600">
                                                                            Status: {order.orderstatus}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Only orders in production or later stages can be assigned to teams
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <div className="space-y-6">
                                            {selectedTeam.description && (
                                                <div>
                                                    <h4 className="text-lg font-semibold mb-2">Description</h4>
                                                    <p className="text-gray-600">{selectedTeam.description}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaUsers className="text-gray-500" />
                                                        <span className="font-semibold">Team Members</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-[#35408E]">{selectedTeam.members?.length || 0}</p>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaClipboardList className="text-gray-500" />
                                                        <span className="font-semibold">Assigned Orders</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-[#35408E]">{selectedTeam.assignedOrders?.length || 0}</p>
                                                </div>
                                            </div>

                                            {selectedTeam.members && selectedTeam.members.length > 0 && (
                                                <div>
                                                    <h4 className="text-lg font-semibold mb-3">Team Members</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {selectedTeam.members.map(memberId => {
                                                            const member = employees.find(emp => emp.employeeid === memberId);
                                                            return member ? (
                                                                <div key={memberId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#35408E] to-[#4a5899] text-white flex items-center justify-center font-semibold">
                                                                        {member.employeename?.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">{member.employeename}</p>
                                                                        <p className="text-sm text-gray-500">{member.assigneddepartment}</p>
                                                                    </div>
                                                                </div>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedTeam.assignedOrders && selectedTeam.assignedOrders.length > 0 && (
                                                <div>
                                                    <h4 className="text-lg font-semibold mb-3">Assigned Orders</h4>
                                                    <div className="space-y-2">
                                                        {selectedTeam.assignedOrders.map(orderId => {
                                                            const order = availableOrders.find(o => o.orderid === orderId);
                                                            return order ? (
                                                                <div key={orderId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                    <div>
                                                                        <p className="font-medium">Order #{order.orderid.slice(0, 8).toUpperCase()}</p>
                                                                        <p className="text-sm text-gray-500">
                                                                            {order.companyname} • {order.hangertype} • {order.quantity} units
                                                                        </p>
                                                                    </div>
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                        order.orderstatus === 'In Production' ? 'bg-blue-100 text-blue-700' :
                                                                        order.orderstatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                        {order.orderstatus}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div key={orderId} className="p-3 bg-gray-50 rounded-lg">
                                                                    <p className="text-sm text-gray-500">Order #{orderId.slice(0, 8).toUpperCase()} (details not available)</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-4 border-t">
                                                <p className="text-sm text-gray-500">
                                                    Created: {new Date(selectedTeam.createdAt).toLocaleDateString()} at {new Date(selectedTeam.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            onClick={handleCloseTeamModal}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                        >
                                            {isEditingTeam ? 'Cancel' : 'Close'}
                                        </button>
                                        {isEditingTeam && (
                                            <button
                                                onClick={handleSaveTeam}
                                                className="px-6 py-2 bg-[#35408E] text-white rounded-lg font-semibold hover:bg-[#2a3470] transition-colors"
                                            >
                                                Save Changes
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delete Team Confirmation Modal */}
                        {showDeleteTeamConfirm && selectedTeam && (
                            <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50">
                                <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
                                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                        <FaTrash className="text-red-600 text-xl" />
                                    </div>
                                    <h3 className="text-xl font-bold text-center mb-2">Delete Team</h3>
                                    <p className="text-gray-600 text-center mb-6">
                                        Are you sure you want to delete <span className="font-semibold">"{selectedTeam.teamname}"</span>? 
                                        This will remove all team assignments but won't delete the employees.
                                    </p>
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => setShowDeleteTeamConfirm(false)}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmDeleteTeam}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                        >
                                            Delete Team
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case "quotas":
                return (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">Quotas Management</h2>
                                <button
                                    onClick={handleCreateQuota}
                                    className="bg-[#E6AF2E] text-[#191716] px-4 py-2 rounded-lg font-semibold hover:bg-[#191716] hover:text-white cursor-pointer transition-colors flex items-center gap-2"
                                >
                                    <FaPlus /> Create Quota
                                </button>
                            </div>
                        </div>

                        {quotas.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FaTrophy className="mx-auto text-4xl mb-4 text-gray-300" />
                                <p className="text-lg font-medium mb-2">No quotas created yet</p>
                                <p className="text-sm">Create your first quota to track production targets and progress.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                {quotas.map((quota) => (
                                    <div 
                                        key={quota.quotaid} 
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handleViewQuota(quota)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-semibold text-lg">{quota.quotaname}</h3>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteQuota(quota);
                                                }}
                                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                                                title="Delete Quota"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Progress Bar */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Progress</span>
                                                    <span className="font-semibold">
                                                        {quota.finishedquota || 0} / {quota.targetquota}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-green-600 h-2 rounded-full transition-all"
                                                        style={{ 
                                                            width: `${Math.min(((quota.finishedquota || 0) / quota.targetquota) * 100, 100)}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {Math.round(((quota.finishedquota || 0) / quota.targetquota) * 100)}% Complete
                                                </div>
                                            </div>

                                            {/* Team Assignment */}
                                            {quota.teams && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaUsers className="text-gray-500" />
                                                    <span className="text-gray-600">
                                                        Team: {quota.teams.teamname}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Assigned Orders */}
                                            {quota.assignedorders && quota.assignedorders.length > 0 && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaClipboardList className="text-gray-500" />
                                                    <span className="text-gray-600">
                                                        {quota.assignedorders.length} order{quota.assignedorders.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    quota.status === 'Active' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : quota.status === 'Completed'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {quota.status}
                                                </span>
                                            </div>

                                            {/* Date Range */}
                                            {(quota.startdate || quota.enddate) && (
                                                <div className="text-xs text-gray-500 pt-2 border-t">
                                                    {quota.startdate && (
                                                        <div>Start: {new Date(quota.startdate).toLocaleDateString()}</div>
                                                    )}
                                                    {quota.enddate && (
                                                        <div>End: {new Date(quota.enddate).toLocaleDateString()}</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Create/Edit Quota Modal */}
                        {(showCreateQuotaModal || showQuotaModal) && (
                            <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 p-4">
                                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
                                    <div className="sticky top-0 bg-[#191716] text-white px-6 py-4 rounded-t-lg flex justify-between items-center z-10">
                                        <h2 className="text-2xl font-bold">
                                            {selectedQuota ? (isEditingQuota ? 'Edit Quota' : 'Quota Details') : 'Create New Quota'}
                                        </h2>
                                        <button
                                            onClick={handleCloseQuotaModal}
                                            className="text-white hover:text-gray-200 text-2xl font-bold cursor-pointer"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Quota Name *</label>
                                                <input
                                                    type="text"
                                                    name="quotaname"
                                                    className={`w-full border rounded px-4 py-2 ${isEditingQuota ? 'bg-white' : 'bg-gray-100'}`}
                                                    value={quotaFormData.quotaname}
                                                    onChange={handleQuotaInputChange}
                                                    readOnly={!isEditingQuota}
                                                    placeholder="e.g., Monthly Production Target"
                                                />
                                            </div>

                                            {/* Target Quota - Auto-calculated from orders */}
                                            {!isEditingQuota && selectedQuota && (
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">Target Quota</label>
                                                    <div className="w-full border rounded px-4 py-2 bg-gray-100 text-gray-700">
                                                        {selectedQuota.targetquota || 0} units (from {quotaFormData.assignedOrders.length} orders)
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Finished Quota</label>
                                                <input
                                                    type="number"
                                                    name="finishedquota"
                                                    className={`w-full border rounded px-4 py-2 ${isEditingQuota ? 'bg-white' : 'bg-gray-100'}`}
                                                    value={quotaFormData.finishedquota}
                                                    onChange={handleQuotaInputChange}
                                                    readOnly={!isEditingQuota}
                                                    min="0"
                                                />
                                            </div>

                                            {/* Assign Teams - Multi-select */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Assign to Teams</label>
                                                {isEditingQuota ? (
                                                    <div className="border rounded px-4 py-2 bg-white max-h-40 overflow-y-auto">
                                                        {teams.map(team => (
                                                            <label key={team.teamid} className="flex items-center py-1 hover:bg-gray-50 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={quotaFormData.teamids.includes(team.teamid)}
                                                                    onChange={() => handleQuotaTeamSelection(team.teamid)}
                                                                    className="mr-2"
                                                                />
                                                                <span>{team.teamname}</span>
                                                            </label>
                                                        ))}
                                                        {teams.length === 0 && (
                                                            <div className="text-gray-500 text-sm">No teams available</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w-full border rounded px-4 py-2 bg-gray-100">
                                                        {quotaFormData.teamids.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {quotaFormData.teamids.map(teamId => {
                                                                    const team = teams.find(t => t.teamid === teamId);
                                                                    return team ? (
                                                                        <span key={teamId} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                                                                            {team.teamname}
                                                                        </span>
                                                                    ) : null;
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-500">No teams assigned</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Start Date</label>
                                                <input
                                                    type="date"
                                                    name="startdate"
                                                    className={`w-full border rounded px-4 py-2 ${isEditingQuota ? 'bg-white' : 'bg-gray-100'}`}
                                                    value={quotaFormData.startdate}
                                                    onChange={handleQuotaInputChange}
                                                    readOnly={!isEditingQuota}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">End Date</label>
                                                <input
                                                    type="date"
                                                    name="enddate"
                                                    className={`w-full border rounded px-4 py-2 ${isEditingQuota ? 'bg-white' : 'bg-gray-100'}`}
                                                    value={quotaFormData.enddate}
                                                    onChange={handleQuotaInputChange}
                                                    readOnly={!isEditingQuota}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">Status</label>
                                                <select
                                                    name="status"
                                                    className={`w-full border rounded px-4 py-2 ${isEditingQuota ? 'bg-white' : 'bg-gray-100'}`}
                                                    value={quotaFormData.status}
                                                    onChange={handleQuotaInputChange}
                                                    disabled={!isEditingQuota}
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Assign Orders Section */}
                                        {isEditingQuota && (
                                            <div className="mb-6">
                                                <label className="block text-gray-700 font-semibold mb-2">Assign Orders</label>
                                                <div className="border rounded p-4 max-h-60 overflow-y-auto bg-gray-50">
                                                    {availableOrders.length === 0 ? (
                                                        <p className="text-gray-500 text-sm">No orders available</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {availableOrders.map(order => (
                                                                <label key={order.orderid} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={quotaFormData.assignedOrders.includes(order.orderid)}
                                                                        onChange={() => handleQuotaOrderSelection(order.orderid)}
                                                                        className="w-4 h-4"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <span className="font-medium">{order.companyname}</span>
                                                                        <span className="text-sm text-gray-500 ml-2">
                                                                            ({order.hangertype} - Qty: {order.quantity})
                                                                        </span>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Assigned Orders Details (View Mode) */}
                                        {!isEditingQuota && quotaFormData.assignedOrders.length > 0 && (
                                            <div className="mb-6">
                                                <label className="block text-gray-700 font-semibold mb-2">Assigned Orders ({quotaFormData.assignedOrders.length})</label>
                                                <div className="border rounded p-4 max-h-80 overflow-y-auto bg-gray-50">
                                                    <div className="space-y-3">
                                                        {quotaFormData.assignedOrders.map(orderId => {
                                                            const order = availableOrders.find(o => o.orderid === orderId);
                                                            if (!order) return null;
                                                            return (
                                                                <div key={orderId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div>
                                                                            <h4 className="font-semibold text-lg text-[#35408E]">{order.companyname}</h4>
                                                                            <p className="text-sm text-gray-600">Order ID: {order.orderid.slice(0, 8)}...</p>
                                                                        </div>
                                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                            order.orderstatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                                                            order.orderstatus === 'In Production' ? 'bg-blue-100 text-blue-700' :
                                                                            order.orderstatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                        }`}>
                                                                            {order.orderstatus}
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                                        <div>
                                                                            <span className="text-gray-600">Type:</span>
                                                                            <span className="ml-2 font-medium">{order.hangertype}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-600">Quantity:</span>
                                                                            <span className="ml-2 font-medium">{order.quantity}</span>
                                                                        </div>
                                                                        {order.deadline && (
                                                                            <div>
                                                                                <span className="text-gray-600">Deadline:</span>
                                                                                <span className="ml-2 font-medium">{new Date(order.deadline).toLocaleDateString()}</span>
                                                                            </div>
                                                                        )}
                                                                        {order.materials && Object.keys(order.materials).length > 0 && (
                                                                            <div className="col-span-2">
                                                                                <span className="text-gray-600">Materials:</span>
                                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                                    {Object.entries(order.materials).map(([mat, percent]) => (
                                                                                        <span key={mat} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                                                                            {mat}: {percent}%
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Progress Stats (View Mode) */}
                                        {!isEditingQuota && quotaFormData.targetquota && (
                                            <div className="mb-6">
                                                <label className="block text-gray-700 font-semibold mb-2">Progress</label>
                                                <div className="border rounded p-4 bg-gradient-to-r from-green-50 to-blue-50">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="font-semibold">
                                                            {quotaFormData.finishedquota} / {quotaFormData.targetquota}
                                                        </span>
                                                        <span className="font-semibold text-green-600">
                                                            {Math.round((quotaFormData.finishedquota / quotaFormData.targetquota) * 100)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                                        <div 
                                                            className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all"
                                                            style={{ 
                                                                width: `${Math.min((quotaFormData.finishedquota / quotaFormData.targetquota) * 100, 100)}%` 
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        Remaining: {quotaFormData.targetquota - quotaFormData.finishedquota}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 justify-end pt-4 border-t">
                                            {!isEditingQuota && selectedQuota && (
                                                <button
                                                    onClick={handleEditQuota}
                                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                >
                                                    <FaEdit /> Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={handleCloseQuotaModal}
                                                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                                            >
                                                {isEditingQuota ? 'Cancel' : 'Close'}
                                            </button>
                                            {isEditingQuota && (
                                                <button
                                                    onClick={handleSaveQuota}
                                                    className="bg-[#35408E] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2a3470] transition-colors"
                                                >
                                                    {selectedQuota ? 'Save Changes' : 'Create Quota'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delete Confirmation Modal */}
                        {showDeleteQuotaConfirm && selectedQuota && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
                                <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
                                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                        <FaTrash className="text-red-600 text-xl" />
                                    </div>
                                    <h3 className="text-xl font-bold text-center mb-2">Delete Quota</h3>
                                    <p className="text-gray-600 text-center mb-6">
                                        Are you sure you want to delete <span className="font-semibold">"{selectedQuota.quotaname}"</span>? 
                                        This will unlink it from the assigned team but won't delete the team or orders.
                                    </p>
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={handleCancelDeleteQuota}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmDeleteQuota}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                        >
                                            Delete Quota
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
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 rounded cursor-pointer transition-colors ${
                                activeTab === "all" 
                                    ? "bg-[#E6AF2E] text-black font-semibold" 
                                    : "bg-gray-200 hover:bg-gray-300"
                            }`}
                            onClick={() => setActiveTab("all")}
                        >
                            All Employees
                        </button>
                        <button
                            className={`px-4 py-2 rounded cursor-pointer transition-colors ${
                                activeTab === "teams" 
                                    ? "bg-[#E6AF2E] text-black font-semibold" 
                                    : "bg-gray-200 hover:bg-gray-300"
                            }`}
                            onClick={() => setActiveTab("teams")}
                        >
                            Teams
                        </button>
                        <button
                            className={`px-4 py-2 rounded cursor-pointer transition-colors ${
                                activeTab === "quotas" 
                                    ? "bg-[#E6AF2E] text-black font-semibold" 
                                    : "bg-gray-200 hover:bg-gray-300"
                            }`}
                            onClick={() => setActiveTab("quotas")}
                        >
                            Quotas
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

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && employeeToDelete && (
                    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <FaTrash className="text-red-600 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2">Archive Employee</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to archive <span className="font-semibold">{employeeToDelete.employeename}</span>? 
                                They can be restored later by the System Admin if needed.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Archive
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2">Success!</h3>
                            <p className="text-gray-600 text-center mb-6">{successMessage}</p>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="px-8 py-2 bg-[#35408E] text-white rounded-lg font-semibold hover:bg-[#2a3470] transition-colors"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Modal */}
                {showErrorModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2">Error</h3>
                            <p className="text-gray-600 text-center mb-6">{errorMessage}</p>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowErrorModal(false)}
                                    className="px-8 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Employees;
