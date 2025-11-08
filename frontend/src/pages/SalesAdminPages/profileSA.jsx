import React, { useState } from 'react';
import { Eye, EyeOff, LogOut } from 'lucide-react';

const profileSA = () => {
    // State for form inputs
    const [profileData, setProfileData] = useState({
        profileName: 'Jane Dela Cruz',
        username: 'JaneDC13',
        password: '***************'
    });

    // State for password visibility toggle
    const [showPassword, setShowPassword] = useState(false);

    // State for edit mode
    const [isEditing, setIsEditing] = useState(false);

    // Handler for input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handler for edit profile button
    const handleEditProfile = () => {
        if (isEditing) {
            // Save changes logic here
            console.log('Saving profile changes:', profileData);
        }
        setIsEditing(!isEditing);
    };

    // Handler for logout button
    const handleLogout = () => {
        // Add your logout logic here
        console.log('Logging out...');
        // Example: Clear session, redirect to login page, etc.
        // navigate('/login');
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b">
                <div className="px-8 py-6">
                    <h1 className="text-4xl font-bold text-gray-900">Profile</h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-8 flex justify-center">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl">
                    {/* Card Header */}
                    <div className="bg-[#35408E] text-white px-6 py-4 rounded-t-2xl">
                        <h2 className="text-xl font-semibold">Profile Details</h2>
                    </div>

                    {/* Card Content */}
                    <div className="p-8">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center mb-3 overflow-hidden">
                                {/* Profile Icon */}
                                <svg
                                    className="w-20 h-20 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{profileData.profileName}</h3>
                            <p className="text-gray-600 text-sm">Sales Admin</p>
                        </div>

                        {/* Profile Form Fields */}
                        <div className="space-y-6">
                            {/* Profile Name Field */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Profile Name
                                </label>
                                <input
                                    type="text"
                                    name="profileName"
                                    value={profileData.profileName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                />
                            </div>

                            {/* User Name Field */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    User Name
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={profileData.username}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={profileData.password}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600 pr-12"
                                    />
                                    {/* Toggle Password Visibility Button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {/* Update Password Link */}
                                <div className="text-right mt-2">
                                    <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                                        Update password?
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8">
                            {/* Edit Profile Button */}
                            <button
                                onClick={handleEditProfile}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                {isEditing ? 'Save Profile' : 'Edit Profile'}
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            >
                                
                                Delete account?
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default profileSA