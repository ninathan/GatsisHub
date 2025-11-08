import React from 'react'
import { useState, useEffect } from 'react';
import { User, ChevronDown, Trash2, Edit, Eye, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { a } from 'framer-motion/client';
import { supabase } from '../../../supabaseClient';


const ProfileComponent = () => {


    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('Profile');
    
    // Debug: Log active tab changes
    console.log('Current active tab:', activeTab);
    const [companyName, setCompanyName] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyNumber, setCompanyNumber] = useState('');
    const [savedDesigns, setSavedDesigns] = useState([]);
    const [loadingDesigns, setLoadingDesigns] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ type: '', message: '', onConfirm: null });
    const [isEditing, setIsEditing] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [showAddAddressModal, setShowAddAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', address: '' });
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Fetch customer data when user is available
    useEffect(() => {
        if (user?.userid) {
            fetchCustomerData();
        }
    }, [user?.userid]);

    // Fetch saved designs when Designs tab is active
    useEffect(() => {
        if (activeTab === 'Designs' && user?.userid) {
            fetchSavedDesigns();
        }
    }, [activeTab, user]);

    const fetchSavedDesigns = async () => {
        if (!user?.userid) return;
        
        setLoadingDesigns(true);
        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/designs/user/${user.userid}`);
            if (!response.ok) {
                throw new Error('Failed to fetch designs');
            }
            const data = await response.json();
            setSavedDesigns(data);
            console.log('✅ Loaded designs:', data);
        } catch (error) {
            console.error('❌ Error fetching designs:', error);
        } finally {
            setLoadingDesigns(false);
        }
    };

    const handleDeleteDesign = async (designid) => {
        setModalConfig({
            type: 'confirm',
            message: 'Are you sure you want to delete this design? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    const response = await fetch(`https://gatsis-hub.vercel.app/designs/${designid}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete design');
                    }

                    setModalConfig({
                        type: 'success',
                        message: 'Design deleted successfully!',
                        onConfirm: null
                    });
                    setShowModal(true);
                    fetchSavedDesigns(); // Refresh the list
                } catch (error) {
                    console.error('❌ Error deleting design:', error);
                    setModalConfig({
                        type: 'error',
                        message: 'Failed to delete design. Please try again.',
                        onConfirm: null
                    });
                    setShowModal(true);
                }
            }
        });
        setShowModal(true);
    };

    const handleDuplicateDesign = (design) => {
        // Navigate to checkout page with design data pre-loaded
        try {
            const designData = JSON.parse(design.url || '{}');
            console.log('🔄 Loading design into checkout:', designData);
            
            // Navigate to checkout with state
            navigate('/checkout', { 
                state: { 
                    loadDesign: true,
                    designData: designData 
                } 
            });
        } catch (error) {
            console.error('❌ Error loading design:', error);
            setModalConfig({
                type: 'error',
                message: 'Failed to load design. Please try again.',
                onConfirm: null
            });
            setShowModal(true);
        }
    };

    useEffect(() => {
        if (user?.userid) {
            fetchCustomerData();
        }
    }, [user?.userid]);

    const fetchCustomerData = async () => {
        if (!user?.userid) return;

        try {
            const { data: customer, error } = await supabase
                .from('customers')
                .select('*')
                .eq('userid', user.userid)
                .single();

            if (error) {
                console.error('Error fetching customer data:', error);
                // Don't show error modal, just use default values from AuthContext
                return;
            }

            if (customer) {
                // Set customer basic info
                setCompanyName(customer.companyname || '');
                setCompanyEmail(customer.emailaddress || '');
                setCompanyNumber(customer.companynumber || '');

                // Load addresses from database
                if (customer.addresses && Array.isArray(customer.addresses) && customer.addresses.length > 0) {
                    setAddresses(customer.addresses);
                    console.log('✅ Loaded addresses from database:', customer.addresses);
                } else {
                    // No addresses yet - user can add them in the Addresses section
                    console.log('⚠️ No addresses found, user can add new addresses');
                }
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
            // Don't show modal on initial load failure
        }
    };

    const tabs = ['Profile', 'Designs', 'Settings'];

    const handleEditProfile = () => {
        if (isEditing) {
            // Save profile
            saveProfile();
        } else {
            // Enable editing
            setIsEditing(true);
        }
    };

    const saveProfile = async () => {
        if (!user?.userid) return;

        setIsSavingProfile(true);

        try {
            const { error } = await supabase
                .from('customers')
                .update({
                    companyname: companyName,
                    emailaddress: companyEmail,
                    companynumber: companyNumber
                })
                .eq('userid', user.userid);

            if (error) throw error;

            // Update user in AuthContext and localStorage
            const updatedUser = {
                ...user,
                companyname: companyName,
                emailaddress: companyEmail,
                companynumber: companyNumber
            };
            login(updatedUser);

            setIsEditing(false);
            setModalConfig({
                type: 'success',
                message: 'Profile updated successfully!',
                onConfirm: null
            });
            setShowModal(true);

            // Refresh user data in AuthContext if needed
            fetchCustomerData();
        } catch (error) {
            console.error('Error saving profile:', error);
            setModalConfig({
                type: 'error',
                message: 'Failed to update profile. Please try again.',
                onConfirm: null
            });
            setShowModal(true);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset to original values
        if (user) {
            setCompanyName(user.companyname || '');
            setCompanyEmail(user.emailaddress || '');
            setCompanyNumber(user.companynumber || '');
        }
        fetchCustomerData();
    };

    const handleAddAddress = () => {
        setNewAddress({ name: '', phone: '', address: '' });
        setShowAddAddressModal(true);
    };

    const handleSaveNewAddress = async () => {
        if (!newAddress.name.trim() || !newAddress.address.trim()) {
            setModalConfig({
                type: 'error',
                message: 'Please fill in at least the name and address fields.',
                onConfirm: null
            });
            setShowModal(true);
            return;
        }

        setIsSavingAddress(true);

        try {
            // Add new address to the addresses array
            const newAddressEntry = {
                id: Date.now(), // temporary ID
                name: newAddress.name,
                phone: newAddress.phone,
                address: newAddress.address,
                isDefault: addresses.length === 0 // First address is default
            };

            const updatedAddresses = [...addresses, newAddressEntry];
            
            // Save addresses to database
            const { error } = await supabase
                .from('customers')
                .update({ addresses: updatedAddresses })
                .eq('userid', user.userid);

            if (error) throw error;

            setAddresses(updatedAddresses);
            setShowAddAddressModal(false);
            
            // Reset form
            setNewAddress({ name: '', phone: '', address: '' });
            
            setModalConfig({
                type: 'success',
                message: 'Address added successfully!',
                onConfirm: null
            });
            setShowModal(true);
            
            console.log('✅ Address saved to database');
        } catch (error) {
            console.error('Error adding address:', error);
            setModalConfig({
                type: 'error',
                message: 'Failed to add address. Please try again.',
                onConfirm: null
            });
            setShowModal(true);
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        setModalConfig({
            type: 'confirm',
            message: 'Are you sure you want to delete this address?',
            onConfirm: async () => {
                try {
                    const updatedAddresses = addresses.filter(addr => addr.id !== id);
                    
                    // Save to database
                    const { error } = await supabase
                        .from('customers')
                        .update({ addresses: updatedAddresses })
                        .eq('userid', user.userid);

                    if (error) throw error;

                    setAddresses(updatedAddresses);
                    setModalConfig({
                        type: 'success',
                        message: 'Address deleted successfully!',
                        onConfirm: null
                    });
                    setShowModal(true);
                    
                    console.log('✅ Address deleted from database');
                } catch (error) {
                    console.error('Error deleting address:', error);
                    setModalConfig({
                        type: 'error',
                        message: 'Failed to delete address. Please try again.',
                        onConfirm: null
                    });
                    setShowModal(true);
                }
            }
        });
        setShowModal(true);
    };

    const handleEditAddress = (id) => {
        const addressToEdit = addresses.find(addr => addr.id === id);
        if (addressToEdit) {
            setNewAddress({
                name: addressToEdit.name,
                phone: addressToEdit.phone,
                address: addressToEdit.address
            });
            // Remove old address before editing
            setAddresses(addresses.filter(addr => addr.id !== id));
            setShowAddAddressModal(true);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const updatedAddresses = addresses.map(addr => ({
                ...addr,
                isDefault: addr.id === id
            }));
            
            // Save to database
            const { error } = await supabase
                .from('customers')
                .update({ addresses: updatedAddresses })
                .eq('userid', user.userid);

            if (error) throw error;

            setAddresses(updatedAddresses);
            
            setModalConfig({
                type: 'success',
                message: 'Default address updated!',
                onConfirm: null
            });
            setShowModal(true);
            
            console.log('✅ Default address updated in database');
        } catch (error) {
            console.error('Error setting default address:', error);
            setModalConfig({
                type: 'error',
                message: 'Failed to update default address.',
                onConfirm: null
            });
            setShowModal(true);
        }
    };

    const handleChangePassword = async () => {
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setModalConfig({
                type: 'error',
                message: 'Please fill in all password fields.',
                onConfirm: null
            });
            setShowModal(true);
            return;
        }

        if (newPassword.length < 6) {
            setModalConfig({
                type: 'error',
                message: 'New password must be at least 6 characters long.',
                onConfirm: null
            });
            setShowModal(true);
            return;
        }

        if (newPassword !== confirmPassword) {
            setModalConfig({
                type: 'error',
                message: 'New password and confirmation do not match.',
                onConfirm: null
            });
            setShowModal(true);
            return;
        }

        if (currentPassword === newPassword) {
            setModalConfig({
                type: 'error',
                message: 'New password must be different from current password.',
                onConfirm: null
            });
            setShowModal(true);
            return;
        }

        setIsChangingPassword(true);

        try {
            // Call backend API to change password
            const response = await fetch('https://gatsis-hub.vercel.app/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userid: user.userid,
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to change password');
            }

            console.log('✅ Password changed successfully via backend');

            // Clear password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setModalConfig({
                type: 'success',
                message: 'Password updated successfully! Please use your new password for future logins.',
                onConfirm: null
            });
            setShowModal(true);
        } catch (error) {
            console.error('❌ Error changing password:', error);
            setModalConfig({
                type: 'error',
                message: error.message || 'Failed to update password. Please try again.',
                onConfirm: null
            });
            setShowModal(true);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = () => {
        setModalConfig({
            type: 'confirm',
            message: 'Are you sure you want to delete your account? This action cannot be undone. All your designs and data will be permanently deleted.',
            onConfirm: async () => {
                try {
                    // Call backend API to delete account
                    const response = await fetch('https://gatsis-hub.vercel.app/auth/delete-account', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userid: user.userid
                        })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to delete account');
                    }

                    console.log('✅ Account deleted successfully');

                    // Show success message
                    setModalConfig({
                        type: 'success',
                        message: 'Your account has been deleted successfully. You will be redirected to the home page.',
                        onConfirm: null
                    });
                    setShowModal(true);

                    // Redirect to home page after 2 seconds
                    setTimeout(() => {
                        localStorage.removeItem('user');
                        navigate('/');
                        window.location.reload();
                    }, 2000);

                } catch (error) {
                    console.error('❌ Error deleting account:', error);
                    setModalConfig({
                        type: 'error',
                        message: error.message || 'Failed to delete account. Please try again.',
                        onConfirm: null
                    });
                    setShowModal(true);
                }
            }
        });
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <div className="w-48 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`w-full text-left px-6 py-4 transition-colors ${activeTab === tab
                                        ? 'bg-[#35408E] text-white font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    style={activeTab === tab ? { backgroundColor: '#35408E', color: 'white' } : {}}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm p-8">
                            {/* Profile Tab Content */}
                            {activeTab === 'Profile' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column - Profile Form */}
                                    <div>
                                        {/* Profile Picture */}
                                        <div className="flex flex-col items-center mb-8">
                                            <div className="w-24 h-24 bg-gray-400 rounded-full flex items-center justify-center mb-3">
                                                <User size={48} className="text-white" />
                                            </div>
                                            <p className="text-lg font-semibold">{user.companyname}</p>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Company Name</label>
                                                <input
                                                    type="text"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    disabled={!isEditing}
                                                    className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E] ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Company Email</label>
                                                <input
                                                    type="email"
                                                    value={companyEmail}
                                                    onChange={(e) => setCompanyEmail(e.target.value)}
                                                    disabled={!isEditing}
                                                    className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E] ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Contact Number</label>
                                                <input
                                                    type="text"
                                                    value={companyNumber}
                                                    onChange={(e) => setCompanyNumber(e.target.value)}
                                                    disabled={!isEditing}
                                                    className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E] ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleEditProfile}
                                                            disabled={isSavingProfile}
                                                            className="flex-1 bg-[#35408E] hover:bg-[#2c3e50] text-white font-semibold py-2 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isSavingProfile ? 'Saving...' : 'Save Profile'}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={handleEditProfile}
                                                        className="w-full bg-[#35408E] hover:bg-[#2c3e50] text-white font-semibold py-2 px-6 rounded transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Edit size={16} />
                                                        Edit Profile
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - My Address */}
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold">My Addresses</h2>
                                            <button
                                                onClick={handleAddAddress}
                                                className="bg-[#35408E] hover:bg-[#2c3e50] text-white py-2 px-4 rounded text-sm transition-colors flex items-center gap-2"
                                            >
                                                <span className="text-lg">+</span>
                                                Add Address
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {addresses.length === 0 ? (
                                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                                    <p className="text-gray-500 mb-4">No address saved yet</p>
                                                    <button
                                                        onClick={handleAddAddress}
                                                        className="text-[#35408E] hover:text-[#2c3e50] font-medium"
                                                    >
                                                        + Add your first address
                                                    </button>
                                                </div>
                                            ) : (
                                                addresses.map((address, index) => (
                                                    <div
                                                        key={address.id}
                                                        className={`border-2 rounded-lg p-4 ${
                                                            address.isDefault 
                                                                ? 'border-[#35408E] bg-blue-50' 
                                                                : 'border-gray-300 bg-white'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {address.isDefault && (
                                                                        <span className="text-xs bg-[#35408E] text-white px-2 py-1 rounded font-semibold">
                                                                            DEFAULT
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="font-semibold mb-1">
                                                                    {address.name} {address.phone && `| ${address.phone}`}
                                                                </p>
                                                                <p className="text-sm text-gray-700 whitespace-pre-line">{address.address}</p>
                                                                
                                                                {/* Action Buttons */}
                                                                <div className="flex gap-2 mt-3">
                                                                    {!address.isDefault && (
                                                                        <button
                                                                            onClick={() => handleSetDefault(address.id)}
                                                                            className="text-xs text-[#35408E] hover:text-[#2c3e50] font-medium"
                                                                        >
                                                                            Set as Default
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleEditAddress(address.id)}
                                                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteAddress(address.id)}
                                                                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            {/* Info Text */}
                                            {addresses.length > 0 && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <p className="text-sm text-blue-800">
                                                        <span className="font-semibold">💡 Tip:</span> Set a default address to be used automatically for deliveries.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Designs Tab Content */}
                            {activeTab === 'Designs' && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6">My Designs</h2>
                                    
                                    {loadingDesigns ? (
                                        <div className="text-center py-12">
                                            <div className="text-4xl mb-4">⏳</div>
                                            <p className="text-gray-600">Loading your designs...</p>
                                        </div>
                                    ) : savedDesigns.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">🪝</div>
                                            <h3 className="text-xl font-semibold mb-2">No Saved Designs Yet</h3>
                                            <p className="text-gray-600 mb-6">Start creating custom hanger designs and save them here!</p>
                                            <a 
                                                href="/create-design" 
                                                className="inline-block bg-[#35408E] text-white py-2 px-6 rounded hover:bg-[#2c3e50] transition-colors"
                                            >
                                                Create Your First Design
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {savedDesigns.map((design) => {
                                                const designData = JSON.parse(design.url || '{}');
                                                const hasThumbnail = designData.thumbnail;
                                                
                                                return (
                                                    <div key={design.designid} className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                        {/* Design Preview */}
                                                        <div className="bg-gray-100 h-40 rounded-lg mb-4 flex flex-col items-center justify-center relative overflow-hidden">
                                                            {hasThumbnail ? (
                                                                <img 
                                                                    src={designData.thumbnail} 
                                                                    alt={design.designname || 'Design preview'}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <>
                                                                    <span className="text-gray-500 text-5xl mb-2">🪝</span>
                                                                    {designData.color && (
                                                                        <div 
                                                                            className="absolute bottom-2 right-2 w-8 h-8 rounded-full border-2 border-white shadow-md"
                                                                            style={{ backgroundColor: designData.color }}
                                                                            title={`Color: ${designData.color}`}
                                                                        ></div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Design Info */}
                                                        <h3 className="font-semibold mb-1 truncate">{design.designname || 'Untitled Design'}</h3>
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            {designData.hangerType && `Model: ${designData.hangerType}`}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mb-3">
                                                            Created: {new Date(design.datecreated).toLocaleDateString()}
                                                        </p>
                                                        
                                                        {/* Design Details */}
                                                        <div className="bg-gray-50 rounded p-2 mb-3 text-xs space-y-1">
                                                            {designData.customText && (
                                                                <p className="truncate">✓ Text: "{designData.customText}"</p>
                                                            )}
                                                            {designData.logoPreview && (
                                                                <p>✓ Logo included</p>
                                                            )}
                                                            {designData.materials && Object.keys(designData.materials).length > 0 && (
                                                                <p className="truncate">✓ {Object.keys(designData.materials).length} material(s)</p>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Action Buttons */}
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleDuplicateDesign(design)}
                                                                className="flex-1 border border-[#35408E] text-[#35408E] py-2 px-3 rounded text-sm hover:bg-[#35408E] hover:text-white transition-colors flex items-center justify-center gap-1"
                                                                title="Use this design"
                                                            >
                                                                <Copy size={14} />
                                                                Use
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteDesign(design.designid)}
                                                                className="border border-red-500 text-red-500 py-2 px-3 rounded text-sm hover:bg-red-500 hover:text-white transition-colors"
                                                                title="Delete design"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Add New Design Card */}
                                            <a 
                                                href="/create-design"
                                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-[360px] hover:border-[#35408E] transition-colors cursor-pointer"
                                            >
                                                <div className="text-gray-400 text-4xl mb-4">+</div>
                                                <h3 className="font-semibold text-gray-600 mb-2">Create New Design</h3>
                                                <p className="text-sm text-gray-500 text-center">Start designing your custom hanger</p>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Settings Tab Content */}
                            {activeTab === 'Settings' && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                                    <div className="space-y-6">
                                        {/* Password Section */}
                                        <div className="border-b border-gray-200 pb-6">
                                            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Current Password</label>
                                                    <input
                                                        type="password"
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                        placeholder="Enter current password"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">New Password</label>
                                                        <input
                                                            type="password"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                            placeholder="Enter new password (min 6 characters)"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                                        <input
                                                            type="password"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                            placeholder="Confirm new password"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={handleChangePassword}
                                                disabled={isChangingPassword}
                                                className="mt-4 bg-[#35408E] hover:bg-[#2c3e50] text-white py-2 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isChangingPassword ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>

                                        {/* Notifications Section */}
                                        <div className="border-b border-gray-200 pb-6">
                                            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                                            <div className="space-y-3">
                                                <label className="flex items-center">
                                                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 mr-3" defaultChecked />
                                                    <span className="text-sm">Email notifications for order updates</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 mr-3" defaultChecked />
                                                    <span className="text-sm">SMS notifications for urgent updates</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 mr-3" />
                                                    <span className="text-sm">Marketing emails</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Account Actions */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
                                            <div className="space-y-3">
                                                <button 
                                                    onClick={handleDeleteAccount}
                                                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded transition-colors"
                                                >
                                                    Delete Account
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Component */}
            {showModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        {/* Modal Icon */}
                        <div className="flex justify-center mb-4">
                            {modalConfig.type === 'success' && (
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-3xl">✓</span>
                                </div>
                            )}
                            {modalConfig.type === 'error' && (
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-3xl">✕</span>
                                </div>
                            )}
                            {modalConfig.type === 'confirm' && (
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-3xl">⚠</span>
                                </div>
                            )}
                        </div>

                        {/* Modal Message */}
                        <p className="text-center text-gray-700 mb-6">{modalConfig.message}</p>

                        {/* Modal Buttons */}
                        <div className="flex gap-3">
                            {modalConfig.type === 'confirm' ? (
                                <>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            if (modalConfig.onConfirm) modalConfig.onConfirm();
                                        }}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-[#35408E] text-white rounded hover:bg-[#2c3e50] transition-colors"
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Address Modal */}
            {showAddAddressModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Add New Address</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Name / Label *</label>
                                <input
                                    type="text"
                                    value={newAddress.name}
                                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                    placeholder="e.g., Home, Office, Warehouse"
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={newAddress.phone}
                                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                    placeholder="Contact number for this address"
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Full Address *</label>
                                <textarea
                                    value={newAddress.address}
                                    onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                                    placeholder="Street, City, State, Postal Code"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddAddressModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNewAddress}
                                disabled={isSavingAddress}
                                className="flex-1 px-4 py-2 bg-[#35408E] text-white rounded hover:bg-[#2c3e50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavingAddress ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileComponent