import React from 'react'
import { useState, useEffect } from 'react';
import { User, ChevronDown, Trash2, Edit, Eye, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { a } from 'framer-motion/client';


const ProfileComponent = () => {


    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('Profile');
    const [companyName, setCompanyName] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyNumber, setCompanyNumber] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [savedDesigns, setSavedDesigns] = useState([]);
    const [loadingDesigns, setLoadingDesigns] = useState(false);

    useEffect(() => {
        if (user) {
            setCompanyName(user.companyname || '');
            setCompanyEmail(user.emailaddress || '');
            setCompanyNumber(user.companynumber || '');
            setCompanyAddress(user.companyaddress || '');
        }
    }, [user]);

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
        if (!confirm('Are you sure you want to delete this design?')) return;

        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/designs/${designid}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete design');
            }

            alert('✅ Design deleted successfully!');
            fetchSavedDesigns(); // Refresh the list
        } catch (error) {
            console.error('❌ Error deleting design:', error);
            alert('Failed to delete design. Please try again.');
        }
    };

    const handleDuplicateDesign = (design) => {
        // Navigate to checkout page with design data pre-loaded
        try {
            const designData = JSON.parse(design.url || '{}');
            console.log('🔄 Loading design into checkout:', designData);
            
            // Navigate to checkout with state
            navigate('/product', { 
                state: { 
                    loadDesign: true,
                    designData: designData 
                } 
            });
        } catch (error) {
            console.error('❌ Error loading design:', error);
            alert('Failed to load design. Please try again.');
        }
    };
    };


    const [addresses, setAddresses] = useState([
        {
            id: 1,
            name: 'Juan Corporation',
            phone: '(+63) 9060069683',
            address: 'San Juan City #551 Barangay SJ, Metro Manila,Quezon City,',
            isDefault: true
        },
        {
            id: 2,
            name: 'Juan Corporation',
            phone: '(+63) 9060069683',
            address: '#106 Pingkian I Central, Brgy Pasong Tamo, QC',
            isDefault: false
        }
    ]);

    const tabs = ['Profile', 'Designs', 'Settings'];

    const handleEditProfile = () => {
        console.log('Edit Profile clicked');
    };

    const handleAddAddress = () => {
        console.log('Add Address clicked');
    };

    const handleEditAddress = (id) => {
        console.log('Edit Address:', id);
    };

    const handleSetDefault = (id) => {
        setAddresses(addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        })));
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
                                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Company Email</label>
                                                <input
                                                    type="email"
                                                    value={companyEmail}
                                                    onChange={(e) => setCompanyEmail(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Contact Number</label>
                                                <input
                                                    type="text"
                                                    value={companyNumber}
                                                    onChange={(e) => setCompanyNumber(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Office Address</label>
                                                <input
                                                    type="text"
                                                    value={companyAddress}
                                                    onChange={(e) => setCompanyAddress(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                />
                                            </div>

                                            <button
                                                onClick={handleEditProfile}
                                                className="w-full bg-[#35408E] hover:bg-[#2c3e50] text-white font-semibold py-2 px-6 rounded transition-colors"
                                            >
                                                Edit Profile
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Column - My Address */}
                                    <div>
                                        <h2 className="text-xl font-bold mb-6">My Address</h2>

                                        <div className="space-y-4">
                                            {addresses.map((address) => (
                                                <div
                                                    key={address.id}
                                                    className="border-2 border-gray-300 rounded-lg p-4"
                                                >
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <input
                                                            type="radio"
                                                            name="defaultAddress"
                                                            checked={address.isDefault}
                                                            onChange={() => handleSetDefault(address.id)}
                                                            className="mt-1 w-5 h-5 text-[#35408E] cursor-pointer"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="text-xs text-gray-500">Address: Edit</p>
                                                            </div>
                                                            <p className="font-semibold mb-1">
                                                                {address.name} | {address.phone}
                                                            </p>
                                                            <p className="text-sm text-gray-600">{address.address}</p>
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={() => handleEditAddress(address.id)}
                                                                    className="text-xs text-[#35408E] underline hover:text-[#2c3e50]"
                                                                >
                                                                    Edit to Address
                                                                </button>
                                                                {address.isDefault && (
                                                                    <span className="text-xs bg-[#35408E] text-white px-2 py-1 rounded">
                                                                        MAKE AS DEFAULT
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={handleAddAddress}
                                                className="w-full text-[#35408E] hover:text-[#2c3e50] font-medium py-2 text-sm"
                                            >
                                                +Add Address
                                            </button>
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
                                                href="/product" 
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
                                                href="/product"
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
                                            <h3 className="text-lg font-semibold mb-4">Password</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Current Password</label>
                                                    <input
                                                        type="password"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                        placeholder="Enter current password"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">New Password</label>
                                                    <input
                                                        type="password"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35408E]"
                                                        placeholder="Enter new password"
                                                    />
                                                </div>
                                            </div>
                                            <button className="mt-4 bg-[#35408E] hover:bg-[#2c3e50] text-white py-2 px-6 rounded transition-colors">
                                                Update Password
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
                                                <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded transition-colors">
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
        </div>
    )
}

export default ProfileComponent