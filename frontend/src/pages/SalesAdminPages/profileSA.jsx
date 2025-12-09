import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

const profileSA = () => {
    const navigate = useNavigate();
    
    // State for employee data
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    // State for form inputs
    const [profileData, setProfileData] = useState({
        employeename: '',
        email: '',
        contactdetails: '',
        assigneddepartment: '',
        shifthours: ''
    });

    // State for password change
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // State for password visibility toggle
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // State for edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load employee data from localStorage
    useEffect(() => {
        const storedEmployee = localStorage.getItem('employee');
        if (storedEmployee) {
            const employeeData = JSON.parse(storedEmployee);
            setEmployee(employeeData);
            setProfileData({
                employeename: employeeData.employeename || '',
                email: employeeData.email || '',
                contactdetails: employeeData.contactdetails || '',
                assigneddepartment: employeeData.assigneddepartment || 'N/A',
                shifthours: employeeData.shifthours || ''
            });
        } else {
            // No employee data, redirect to login
            navigate('/authsaleadmin');
        }
        setLoading(false);
    }, [navigate]);

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return 'SA';
        const names = name.split(' ');
        if (names.length === 1) return name.substring(0, 2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    // Handler for input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handler for password input changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handler for edit profile button
    const handleEditProfile = () => {
        if (isEditing) {
            // Save changes logic here

            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
            
            // Update localStorage
            const updatedEmployee = { ...employee, ...profileData };
            localStorage.setItem('employee', JSON.stringify(updatedEmployee));
            setEmployee(updatedEmployee);
        }
        setIsEditing(!isEditing);
    };

    // Handler for password change
    const handleChangePassword = async () => {
        setError('');
        setSuccess('');

        // Validate passwords
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError('All password fields are required');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setError('New password must be at least 8 characters long');
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch('https://gatsis-hub.vercel.app/employees/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeid: employee.employeeid,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to change password');
            }

            setSuccess('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setIsChangingPassword(false);
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.message || 'Failed to change password');
        } finally {
            setIsSaving(false);
        }
    };

    // Handler for logout button
    const handleLogout = () => {
        localStorage.removeItem('employee');
        localStorage.removeItem('rememberEmployee');
        navigate('/authsaleadmin');
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
                <LoadingSpinner size="lg" text="Loading..." />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b">
                <div className="px-4 md:px-8 py-4 md:py-6">
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Profile</h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 md:p-8 flex justify-center">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl">
                    {/* Card Header */}
                    <div className="bg-[#191716] text-white px-4 md:px-6 py-3 md:py-4 rounded-t-2xl">
                        <h2 className="text-lg md:text-xl font-semibold">Profile Details</h2>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 md:p-8">
                        {/* Success/Error Messages */}
                        {success && (
                            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm md:text-base">
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm md:text-base">
                                {error}
                            </div>
                        )}

                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center mb-6 md:mb-8">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-400 flex items-center justify-center mb-3">
                                <span className="text-3xl md:text-4xl font-bold text-white">
                                    {getInitials(profileData.employeename)}
                                </span>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 text-center">{profileData.employeename}</h3>
                            <p className="text-gray-600 text-xs md:text-sm">{employee?.role || 'Sales Admin'}</p>
                        </div>

                        {/* Profile Form Fields */}
                        <div className="space-y-4 md:space-y-6">
                            {/* Employee Name Field */}
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-gray-900 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="employeename"
                                    value={profileData.employeename}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                />
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-gray-900 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleInputChange}
                                    disabled
                                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>

                            {/* Contact Details Field */}
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-gray-900 mb-2">
                                    Contact Number
                                </label>
                                <input
                                    type="text"
                                    name="contactdetails"
                                    value={profileData.contactdetails}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                />
                            </div>

                            {/* Department Field */}
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-gray-900 mb-2">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    name="assigneddepartment"
                                    value={profileData.assigneddepartment}
                                    disabled
                                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                />
                            </div>

                            {/* Shift Hours Field */}
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-gray-900 mb-2">
                                    Shift Hours
                                </label>
                                <input
                                    type="text"
                                    name="shifthours"
                                    value={profileData.shifthours}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                />
                            </div>

                            {/* Password Change Section */}
                            <div className="border-t pt-4 md:pt-6">
                                <button
                                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                                    className="text-xs md:text-sm text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                                >
                                    {isChangingPassword ? 'Cancel password change' : 'Change password?'}
                                </button>

                                {isChangingPassword && (
                                    <div className="mt-4 space-y-4 bg-gray-50 p-3 md:p-4 rounded-lg">
                                        {/* Current Password */}
                                        <div>
                                            <label className="block text-xs md:text-sm font-bold text-gray-900 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    name="currentPassword"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 md:pr-12"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="block text-xs md:text-sm font-bold text-gray-900 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 md:pr-12"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-xs md:text-sm font-bold text-gray-900 mb-2">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 md:pr-12"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleChangePassword}
                                            disabled={isSaving}
                                            className="w-full bg-green-600 text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 text-sm md:text-base"
                                        >
                                            {isSaving ? 'Changing Password...' : 'Change Password'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
                            {/* Edit Profile Button */}
                            <button
                                onClick={handleEditProfile}
                                className="flex-1 bg-blue-600 text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
                            >
                                {isEditing ? 'Save Profile' : 'Edit Profile'}
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm md:text-base"
                            >
                                <LogOut size={18} className="md:w-5 md:h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default profileSA