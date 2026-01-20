import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaEye, FaUndo, FaUserSlash, FaUser } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';

const ArchivedAccounts = () => {
    const [archivedCustomers, setArchivedCustomers] = useState([]);
    const [archivedEmployees, setArchivedEmployees] = useState([]);
    const [activeTab, setActiveTab] = useState('customers');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Modal states
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
    const [accountToRestore, setAccountToRestore] = useState(null);

    useEffect(() => {
        if (activeTab === 'customers') {
            fetchArchivedCustomers();
        } else {
            fetchArchivedEmployees();
        }
    }, [activeTab]);

    const fetchArchivedCustomers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('https://gatsis-hub.vercel.app/customers/archived');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch archived customers');
            }

            setArchivedCustomers(data.customers || []);
        } catch (err) {
            setError(err.message || 'Failed to load archived customers');
        } finally {
            setLoading(false);
        }
    };

    const fetchArchivedEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('https://gatsis-hub.vercel.app/employees/archived');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch archived employees');
            }

            setArchivedEmployees(data.employees || []);
        } catch (err) {
            setError(err.message || 'Failed to load archived employees');
        } finally {
            setLoading(false);
        }
    };

    const handleViewAccount = (account) => {
        setSelectedAccount(account);
        setShowViewModal(true);
    };

    const handleRestoreClick = (account) => {
        setAccountToRestore(account);
        setShowRestoreConfirm(true);
    };

    const handleConfirmRestore = async () => {
        if (!accountToRestore) return;

        try {
            const endpoint = activeTab === 'customers' 
                ? `https://gatsis-hub.vercel.app/customers/${accountToRestore.customerid}/restore`
                : `https://gatsis-hub.vercel.app/employees/${accountToRestore.employeeid}/restore`;

            const response = await fetch(endpoint, {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to restore account');
            }

            alert(`${activeTab === 'customers' ? 'Customer' : 'Employee'} restored successfully`);
            
            // Refresh the list
            if (activeTab === 'customers') {
                fetchArchivedCustomers();
            } else {
                fetchArchivedEmployees();
            }

            setShowRestoreConfirm(false);
            setAccountToRestore(null);
            setShowViewModal(false);

        } catch (err) {
            alert(err.message || 'Failed to restore account');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredCustomers = archivedCustomers.filter(customer =>
        customer.companyname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.emailaddress?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEmployees = archivedEmployees.filter(employee =>
        employee.employeename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex w-full bg-gray-100">
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Archived Accounts</h1>
                    <p className="text-gray-600">View and restore archived customer and employee accounts</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeTab === 'customers'
                                ? 'bg-[#E6AF2E] text-black'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <FaUserSlash className="inline mr-2" />
                        Archived Customers ({archivedCustomers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeTab === 'employees'
                                ? 'bg-[#E6AF2E] text-black'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <FaUser className="inline mr-2" />
                        Archived Employees ({archivedEmployees.length})
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search archived ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6AF2E] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <LoadingSpinner size="lg" />
                        <p className="text-gray-500">Loading archived accounts...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error}
                    </div>
                ) : activeTab === 'customers' ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {filteredCustomers.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FaUserSlash className="mx-auto text-4xl mb-4 text-gray-300" />
                                <p>No archived customers found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-[#191716] text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Company Name</th>
                                        <th className="px-6 py-3 text-left">Email</th>
                                        <th className="px-6 py-3 text-left">Archived Date</th>
                                        <th className="px-6 py-3 text-left">Originally Created</th>
                                        <th className="px-6 py-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.customerid} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-semibold text-gray-900">{customer.companyname}</td>
                                            <td className="px-6 py-4 text-gray-700">{customer.emailaddress}</td>
                                            <td className="px-6 py-4 text-gray-700">{formatDate(customer.archived_at)}</td>
                                            <td className="px-6 py-4 text-gray-700">{formatDate(customer.datecreated)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleViewAccount(customer)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                                                    >
                                                        <FaEye /> View
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRestoreClick(customer)}
                                                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                                                    >
                                                        <FaUndo /> Restore
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {filteredEmployees.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FaUser className="mx-auto text-4xl mb-4 text-gray-300" />
                                <p>No archived employees found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-[#191716] text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Employee Name</th>
                                        <th className="px-6 py-3 text-left">Email</th>
                                        <th className="px-6 py-3 text-left">Role</th>
                                        <th className="px-6 py-3 text-left">Department</th>
                                        <th className="px-6 py-3 text-left">Archived Date</th>
                                        <th className="px-6 py-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((employee) => (
                                        <tr key={employee.employeeid} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-semibold text-gray-900">{employee.employeename}</td>
                                            <td className="px-6 py-4 text-gray-700">{employee.email}</td>
                                            <td className="px-6 py-4 text-gray-700">{employee.role}</td>
                                            <td className="px-6 py-4 text-gray-700">{employee.assigneddepartment}</td>
                                            <td className="px-6 py-4 text-gray-700">{formatDate(employee.archived_at)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleViewAccount(employee)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                                                    >
                                                        <FaEye /> View
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRestoreClick(employee)}
                                                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                                                    >
                                                        <FaUndo /> Restore
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </main>

            {/* View Modal */}
            {showViewModal && selectedAccount && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-[#191916] px-6 py-4 flex justify-between items-center">
                            <h2 className="text-white text-2xl font-semibold">
                                {activeTab === 'customers' ? 'Customer' : 'Employee'} Details
                            </h2>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-white hover:text-gray-200 text-2xl"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'customers' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Company Name</p>
                                            <p className="font-semibold">{selectedAccount.companyname}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Email</p>
                                            <p className="font-semibold">{selectedAccount.emailaddress}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Phone</p>
                                            <p className="font-semibold">{selectedAccount.companynumber || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Account Status</p>
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                Archived
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Originally Created</p>
                                            <p className="font-semibold">{formatDate(selectedAccount.datecreated)}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Archived On</p>
                                            <p className="font-semibold">{formatDate(selectedAccount.archived_at)}</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Employee Name</p>
                                            <p className="font-semibold">{selectedAccount.employeename}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Email</p>
                                            <p className="font-semibold">{selectedAccount.email}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Role</p>
                                            <p className="font-semibold">{selectedAccount.role}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Department</p>
                                            <p className="font-semibold">{selectedAccount.assigneddepartment}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Contact</p>
                                            <p className="font-semibold">{selectedAccount.contactdetails || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 text-sm mb-1">Archived On</p>
                                            <p className="font-semibold">{formatDate(selectedAccount.archived_at)}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-between">
                            <button
                                onClick={() => handleRestoreClick(selectedAccount)}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <FaUndo /> Restore Account
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
            )}

            {/* Restore Confirmation Modal */}
            {showRestoreConfirm && accountToRestore && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                            <FaUndo className="text-green-600 text-xl" />
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">Restore Account</h3>
                        <p className="text-gray-600 text-center mb-6">
                            Are you sure you want to restore this {activeTab === 'customers' ? 'customer' : 'employee'} account?
                            <br />
                            <span className="font-semibold">
                                {activeTab === 'customers' ? accountToRestore.companyname : accountToRestore.employeename}
                            </span>
                            <br />
                            They will be able to access their account again.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowRestoreConfirm(false);
                                    setAccountToRestore(null);
                                }}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRestore}
                                className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                            >
                                Restore
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchivedAccounts;
