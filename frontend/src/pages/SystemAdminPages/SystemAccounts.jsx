import React, { useState, useEffect } from 'react'
import { FaSearch, FaTimes, FaEye, FaEdit } from 'react-icons/fa';

const SystemAccounts = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Modal states
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    
    // Form states for Edit
    const [formData, setFormData] = useState({
        companyname: '',
        emailaddress: '',
        companynumber: '',
        gender: '',
        dateofbirth: '',
        password: '',
        addresses: [],
        accountstatus: 'Active',
        emailnotifications: true
    });

    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Fetch customers on component mount
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('https://gatsis-hub.vercel.app/customers');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch customers');
            }

            setCustomers(data.customers || []);
        } catch (err) {

            setError(err.message || 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    // Handle View Customer
    const handleViewCustomer = (customer) => {
        setSelectedCustomer(customer);
        setShowViewModal(true);
    };

    // Handle Edit Customer
    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setFormData({
            companyname: customer.companyname,
            emailaddress: customer.emailaddress,
            companynumber: customer.companynumber || '',
            gender: customer.gender || '',
            dateofbirth: customer.dateofbirth || '',
            password: '', // Leave empty, will only update if filled
            addresses: customer.addresses || [],
            accountstatus: customer.accountstatus,
            emailnotifications: customer.emailnotifications !== undefined ? customer.emailnotifications : true
        });
        setShowEditModal(true);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle Edit Customer Submit
    const handleEditCustomerSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Validate required fields
        if (!formData.companyname || !formData.emailaddress) {
            setFormError('Please fill in all required fields');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.emailaddress)) {
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

            const response = await fetch(`https://gatsis-hub.vercel.app/customers/${selectedCustomer.customerid}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update customer');
            }

            setFormSuccess('Customer updated successfully!');
            setTimeout(() => {
                setShowEditModal(false);
                fetchCustomers(); // Refresh the list
            }, 1500);

        } catch (err) {

            setFormError(err.message || 'Failed to update customer');
        }
    };

    // Handle Delete Customer
    const handleDeleteCustomer = async (customerid) => {
        if (!window.confirm('Are you sure you want to delete this customer account? This will also delete all their orders and designs.')) {
            return;
        }

        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/customers/${customerid}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete customer');
            }

            alert('Customer deleted successfully');
            fetchCustomers(); // Refresh the list
            setShowViewModal(false);
            setShowEditModal(false);

        } catch (err) {

            alert(err.message || 'Failed to delete customer');
        }
    };

    // Filter customers based on search term
    const filteredCustomers = customers.filter(customer =>
        customer.companyname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.emailaddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.companynumber && customer.companynumber.includes(searchTerm))
    );

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="flex w-full bg-gray-100">
            {/* Main Content */}
            <main className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-6">Customer Accounts</h1>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Controls */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded px-3 py-2 bg-white shadow-sm">
                            <FaSearch className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search customers..."
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
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Total Customers</h3>
                        <p className="text-3xl font-bold text-[#35408E]">{customers.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Active Accounts</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {customers.filter(c => c.accountstatus === 'Active').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Google Sign-Ins</h3>
                        <p className="text-3xl font-bold text-blue-600">
                            {customers.filter(c => c.google_id !== null).length}
                        </p>
                    </div>
                </div>

                {/* Customers Table */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-600">Loading customers...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-600">No customers found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#35408E] text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Company Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Sign-In Method</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Date Created</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.customerid} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-[#35408E] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                                        {customer.companyname.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{customer.companyname}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{customer.emailaddress}</td>
                                            <td className="px-6 py-4 text-gray-700">{customer.companynumber || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    customer.google_id 
                                                        ? "bg-blue-100 text-blue-800" 
                                                        : "bg-gray-100 text-gray-800"
                                                }`}>
                                                    {customer.google_id ? "Google" : "Email"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    customer.accountstatus === "Active" 
                                                        ? "bg-green-100 text-green-800" 
                                                        : customer.accountstatus === "Suspended"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}>
                                                    {customer.accountstatus || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 text-sm">{formatDate(customer.datecreated)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleViewCustomer(customer)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                                                    >
                                                        <FaEye /> View
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditCustomer(customer)}
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

            {/* View Customer Modal */}
            {showViewModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-[#35408E] px-6 py-4 flex justify-between items-center sticky top-0">
                            <h2 className="text-white text-2xl font-semibold">Customer Details</h2>
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
                                    {selectedCustomer.companyname.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{selectedCustomer.companyname}</h3>
                                    <p className="text-gray-600">{selectedCustomer.google_id ? 'Google Sign-In' : 'Email Sign-In'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Email</p>
                                    <p className="font-semibold text-gray-900">{selectedCustomer.emailaddress}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Customer ID</p>
                                    <p className="font-semibold text-gray-900">#{selectedCustomer.customerid}</p>
                                </div>
                                {selectedCustomer.companynumber && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                                        <p className="font-semibold text-gray-900">{selectedCustomer.companynumber}</p>
                                    </div>
                                )}
                                {selectedCustomer.gender && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Gender</p>
                                        <p className="font-semibold text-gray-900">{selectedCustomer.gender}</p>
                                    </div>
                                )}
                                {selectedCustomer.dateofbirth && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                                        <p className="font-semibold text-gray-900">{formatDate(selectedCustomer.dateofbirth)}</p>
                                    </div>
                                )}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Account Status</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        selectedCustomer.accountstatus === "Active" 
                                            ? "bg-green-100 text-green-800" 
                                            : selectedCustomer.accountstatus === "Suspended"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                    }`}>
                                        {selectedCustomer.accountstatus || 'Active'}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Date Created</p>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedCustomer.datecreated)}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Email Notifications</p>
                                    <p className="font-semibold text-gray-900">{selectedCustomer.emailnotifications ? 'Enabled' : 'Disabled'}</p>
                                </div>
                                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                                        <p className="text-sm text-gray-600 mb-2">Saved Addresses</p>
                                        <div className="space-y-2">
                                            {selectedCustomer.addresses.map((address, index) => (
                                                <p key={index} className="font-semibold text-gray-900 text-sm">
                                                    {index + 1}. {typeof address === 'string' ? address : JSON.stringify(address)}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-between">
                            <button
                                onClick={() => handleDeleteCustomer(selectedCustomer.customerid)}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                            >
                                Delete Account
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        handleEditCustomer(selectedCustomer);
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

            {/* Edit Customer Modal */}
            {showEditModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-[#35408E] px-6 py-4 flex justify-between items-center sticky top-0">
                            <h2 className="text-white text-2xl font-semibold">Edit Customer</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-white hover:text-gray-200 text-2xl"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleEditCustomerSubmit} className="p-6">
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
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="companyname"
                                        value={formData.companyname}
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
                                        name="emailaddress"
                                        value={formData.emailaddress}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="companynumber"
                                        value={formData.companynumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                        placeholder="Phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        name="dateofbirth"
                                        value={formData.dateofbirth}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E]"
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
                                        <option value="Suspended">Suspended</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="emailnotifications"
                                            checked={formData.emailnotifications}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-[#35408E] border-gray-300 rounded focus:ring-[#35408E] mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                                    </label>
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
                                    Update Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SystemAccounts
