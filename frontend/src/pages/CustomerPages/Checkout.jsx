/**
 * Checkout Component - Custom Hanger Order Form
 * 
 * This component handles the complete order submission flow for custom hangers.
 * 
 * THREE.JS INTEGRATION GUIDE:
 * ==========================
 * 1. Install Three.js: npm install three @react-three/fiber @react-three/drei
 * 
 * 2. The 3D viewer container is ready at `threeCanvasRef`
 * 
 * 3. Key integration points:
 *    - updateThreeJsColor(color): Called when color changes, update material.color.set(color)
 *    - customText, textPosition, textSize: Use TextGeometry or troika-three-text
 *    - logoPreview, logoPosition, logoSize: Load texture and apply to plane/decal
 *    - threeCanvasRef: Mount your Canvas component here
 * 
 * 4. Example Three.js setup:
 *    - Create a separate ThreeScene component
 *    - Pass color, text, logo props to control the scene
 *    - Use OrbitControls for camera manipulation
 *    - Load hanger model with GLTFLoader
 *    - Apply color with MeshStandardMaterial
 *    - Add TextGeometry for custom text
 *    - Use texture loader for logo decals
 * 
 * 5. Model files should be placed in: /public/models/
 *    - MB3.glb, MB7.glb, CQ-03.glb, 97-11.glb
 */

import { button, div, label, li, span } from 'framer-motion/client'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, Suspense } from 'react'
import ProductCard from '../../components/Checkout/productcard'
import preview3d from '../../images/preview3d.png'
import { Plus, Minus, Download, ChevronDown, X, Info, Upload, Type, Image as ImageIcon } from 'lucide-react';
import validationIcon from '../../images/validation ico.png'
import { supabase } from '../../../supabaseClient'
import HangerScene from '../../components/Checkout/HangerScene'


const Checkout = () => {
    const navigate = useNavigate();
    const threeCanvasRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);

    // Form state
    const [companyName, setCompanyName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [selectedHanger, setSelectedHanger] = useState('MB7');
    const [selectedMaterials, setSelectedMaterials] = useState({});
    const [customDesignFile, setCustomDesignFile] = useState(null);

    const [color, setColor] = useState('#4F46E5');
    const [quantity, setQuantity] = useState(130);
    const [orderInstructions, setOrderInstructions] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [selectedAddress, setSelectedAddress] = useState(0);

    // 3D Customization state
    const [customText, setCustomText] = useState('');
    const [textColor, setTextColor] = useState('#000000'); // Default black
    const [customLogo, setCustomLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [textPosition, setTextPosition] = useState({ x: 0, y: 0, z: 0.49 });
    const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0, z: 0 });
    const [textSize, setTextSize] = useState(0.5);
    const [logoSize, setLogoSize] = useState(1);
    const [addresses, setAddresses] = useState([]);

    const hangers = [
        { id: 'MB3', name: 'MB3' },
        { id: 'MB7', name: 'MB7' },
        { id: 'CQ-03', name: 'CQ-03' },
        { id: '97-11', name: '97-11' },
        { id: 'own', name: 'Own design' }
    ];

    const colors = [
        '#FF6B6B', '#FF8E8E', '#FFA07A', '#FFB347',
        '#9B59B6', '#E91E63', '#3B82F6', '#10B981',
        '#06B6D4', '#14B8A6', '#84CC16', '#EAB308'
    ];

    const handleQuantityChange = (delta) => {
        setQuantity(Math.max(1, quantity + delta));
    };

    const toggleMaterial = (materialName) => {
        setSelectedMaterials(prev => {
            const newMaterials = { ...prev };
            if (newMaterials[materialName]) {
                delete newMaterials[materialName];
            } else {
                const remainingPercentage = 100 - Object.values(newMaterials).reduce((sum, val) => sum + val, 0);
                newMaterials[materialName] = remainingPercentage > 0 ? remainingPercentage : 50;
            }
            return newMaterials;
        });
    };

    const updateMaterialPercentage = (materialName, value) => {
        const newValue = Math.max(0, Math.min(100, parseInt(value) || 0));
        setSelectedMaterials(prev => ({ ...prev, [materialName]: newValue }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCustomDesignUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomDesignFile(file);
        }
    };

    // Three.js color update callback (to be connected when Three.js is integrated)
    const updateThreeJsColor = (newColor) => {
        setColor(newColor);
        // TODO: Update Three.js material color when integrated
        // if (threeMaterialRef.current) {
        //     threeMaterialRef.current.color.set(newColor);
        // }
    };

    // Form validation
    const validateForm = () => {
        if (!companyName.trim()) {
            alert('Please enter company name');
            return false;
        }
        if (!contactPerson.trim()) {
            alert('Please enter contact person name');
            return false;
        }
        if (!contactPhone.trim()) {
            alert('Please enter contact phone');
            return false;
        }
        if (Object.keys(selectedMaterials).length === 0) {
            alert('Please select at least one material');
            return false;
        }
        const totalPercentage = Object.values(selectedMaterials).reduce((sum, val) => sum + val, 0);
        if (Math.abs(totalPercentage - 100) > 0.1) {
            alert(`Material percentages must total 100%. Current total: ${totalPercentage}%`);
            return false;
        }
        if (quantity < 100) {
            alert('Minimum order quantity is 100 pieces');
            return false;
        }
        return true;
    };

    // Submit order
    const handleSubmitOrder = async () => {
        if (!validateForm()) {
            return;
        }

        // Get user data from localStorage (assuming user is logged in)
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userData.userid || null;

        // Prepare complete 3D design data for database storage and admin viewing
        const threeDDesignData = {
            hangerType: selectedHanger,
            color: color,
            customText: customText || null,
            textColor: textColor,
            textPosition: textPosition,
            textSize: textSize,
            logoFileName: customLogo ? customLogo.name : null,
            logoPreview: logoPreview || null, // Base64 encoded image
            logoPosition: logoPosition,
            logoSize: logoSize,
            materials: selectedMaterials,
            quantity: quantity,
            timestamp: new Date().toISOString()
        };

        const orderData = {
            userid: userId,
            companyName,
            contactPerson,
            contactPhone,
            hangerType: selectedHanger,
            materialType: Object.keys(selectedMaterials)[0], // Primary material
            quantity: quantity,
            materials: selectedMaterials,
            designOption: selectedHanger === 'own' ? 'custom' : 'default',
            customDesignUrl: customDesignFile ? customDesignFile.name : null,
            selectedColor: color,
            customText: customText || null,
            textColor: textColor,
            textPosition: customText ? textPosition : null,
            textSize: customText ? textSize : null,
            customLogo: customLogo ? customLogo.name : null,
            logoPosition: customLogo ? logoPosition : null,
            logoSize: customLogo ? logoSize : null,
            deliveryNotes: deliveryNotes || null,
            threeDDesignData: JSON.stringify(threeDDesignData) // Store complete design as JSON
        };

        try {
            // Submit to backend
            const response = await fetch('https://gatsis-hub.vercel.app/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create order');
            }

            console.log('✅ Order created:', result.order);

            // Also save to localStorage for backward compatibility with Order.jsx
            const localOrderData = {
                id: result.order.orderid,
                orderNumber: `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}`,
                companyName,
                contactPerson,
                contactPhone,
                customerName: contactPerson,
                status: 'For Evaluation',
                statusColor: 'bg-yellow-400',
                price: '₱0',
                details: {
                    company: companyName,
                    orderPlaced: new Date().toLocaleDateString(),
                    quantity: `${quantity}x`,
                    product: selectedHanger,
                    color: color,
                    materials: Object.entries(selectedMaterials).map(([name, percentage]) => ({
                        name,
                        percentage: `${percentage}%`
                    })),
                    deliveryAddress: addresses[selectedAddress],
                    notesAndInstruction: orderInstructions,
                    deliveryNotes: deliveryNotes,
                    designFile: customDesignFile ? customDesignFile.name : null,
                    customization: {
                        text: customText,
                        textPosition,
                        textSize,
                        hasLogo: !!customLogo,
                        logoFileName: customLogo ? customLogo.name : null,
                        logoPosition,
                        logoSize
                    }
                }
            };

            const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            existingOrders.unshift(localOrderData);
            localStorage.setItem('orders', JSON.stringify(existingOrders));
            
            // Show success modal and redirect to orders page after 2 seconds
            setShowModal(true);
            setTimeout(() => {
                navigate('/order');
            }, 2000);
        } catch (error) {
            console.error('❌ Error creating order:', error);
            alert(`Failed to create order: ${error.message}`);
        }
    };

    // Fetch customer data from database
    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                const userId = userData.userid;

                if (!userId) {
                    console.warn('No user logged in');
                    return;
                }

                // Fetch customer data from Supabase
                const { data: customer, error } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('userid', userId)
                    .single();

                if (error) {
                    console.error('Error fetching customer data:', error);
                    return;
                }

                if (customer) {
                    // Pre-fill company information
                    setCompanyName(customer.companyname || '');
                    setContactPerson(customer.companyname || ''); // You can add a separate contact person field in DB if needed
                    setContactPhone(customer.companynumber || '');

                    // Set address from customer data
                    if (customer.companyaddress) {
                        setAddresses([
                            {
                                name: customer.companyname,
                                phone: customer.companynumber || '',
                                address: customer.companyaddress,
                                isDefault: true
                            }
                        ]);
                    }
                }
            } catch (error) {
                console.error('Error loading customer data:', error);
            }
        };

        fetchCustomerData();
        setShowInstructionsModal(true);
    }, []);

    const materials = [
        {
            name: 'Polypropylene (PP)',
            features: [
                'Lightweight and durable',
                'Good chemical resistance',
                'Flexible enough to prevent breaking',
                'Cost-effective',
                'Easy to mass-produce for cellular or recycling'
            ]
        },
        {
            name: 'Polystyrene (PS) / High Impact Polystyrene (HIPS)',
            features: [
                'Rigid and glossy',
                'Economical but still offers durability',
                'Commonly used for low-to-medium weight'
            ]
        },
        {
            name: 'Acrylonitrile Butadiene Styrene (ABS)',
            features: [
                'Durable and impact-resistant',
                'Has a smooth, glossy finish ideal for high-end displays',
                'Resistant to heat and physical wear',
                'Heavier and more durable than polypropylene'
            ]
        },
        {
            name: 'Nylon (Polyamide)',
            features: [
                'Strong, flexible, and durable',
                'Resistant to abrasion and chemicals',
                'Used in specialized or high-end applications',
                'Slightly more expensive'
            ]
        },
        {
            name: 'Polycarbonate (PC)',
            features: [
                'Very strong and tough',
                'High impact resistance',
                'Resistant to heat and wear',
                'Often used for premium, transparent, or designer hangers'
            ]
        }
    ];

    return (
        <div>
            {/* Company Information Section */}
            <div className='flex flex-col items-center justify-center mt-10 mb-6'>
                <h3 className='text-black text-4xl font-medium mb-6'>Start Your Order</h3>
                <div className='w-full max-w-2xl bg-white rounded-lg border-2 border-gray-300 p-6'>
                    <h4 className='text-xl font-semibold mb-4'>Company Information</h4>
                    <div className='space-y-4'>
                        <div>
                            <label className='block text-sm font-semibold mb-2'>Company Name *</label>
                            <input
                                type='text'
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder='Enter company name'
                                className='w-full border rounded px-3 py-2 bg-gray-50'
                                required
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-semibold mb-2'>Contact Person *</label>
                            <input
                                type='text'
                                value={contactPerson}
                                onChange={(e) => setContactPerson(e.target.value)}
                                placeholder='Enter contact person name'
                                className='w-full border rounded px-3 py-2 bg-gray-50'
                                required
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-semibold mb-2'>Contact Phone *</label>
                            <input
                                type='tel'
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder='(+63) 9XX XXX XXXX'
                                className='w-full border rounded px-3 py-2 bg-gray-50'
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex flex-col items-center justify-center mt-10'>
                <h3 className='text-black text-4xl font-medium mb-10'>Select the type of hanger you want</h3>
                <p className='text-black text-2xl font-normal'>Select the type of hanger you want</p>
            </div>

            <section>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {hangers.map(hanger => (
                        <button
                            key={hanger.id}
                            onClick={() => setSelectedHanger(hanger.id)}
                            className={`border-2 rounded-lg overflow-hidden transition-all ${selectedHanger === hanger.id ? 'border-indigo-600 shadow-lg' : 'border-gray-300'
                                }`}
                        >
                            <div className="bg-white p-8 flex items-center justify-center w-90 h-90">
                                <div className="text-6xl"><ProductCard /></div>
                            </div>
                            <div className="bg-gray-100 py-3 font-semibold text-center">{hanger.name}</div>
                        </button>
                    ))}
                </div>
                
                {/* Custom Design Upload */}
                {selectedHanger === 'own' && (
                    <div className='mt-6 p-6 bg-white rounded-lg border-2 border-gray-300'>
                        <h4 className='font-semibold mb-3'>Upload Your Custom Design</h4>
                        <p className='text-sm text-gray-600 mb-3'>Accepted formats: STL, OBJ, STEP, PDF (technical drawing)</p>
                        <label className='flex items-center justify-center gap-2 border-2 border-dashed border-gray-400 rounded-lg p-6 cursor-pointer hover:border-indigo-600 transition-colors'>
                            <Upload size={24} />
                            <span>{customDesignFile ? customDesignFile.name : 'Click to upload design file'}</span>
                            <input
                                type='file'
                                accept='.stl,.obj,.step,.pdf'
                                onChange={handleCustomDesignUpload}
                                className='hidden'
                            />
                        </label>
                    </div>
                )}
            </section>

            <div className='flex flex-col items-center justify-center mt-10'>
                <h3 className='text-black text-4xl font-medium mb-10'>Select the material you want</h3>
                <p className='text-black text-2xl font-normal'>you can select multiple materials and combined by percentage</p>
            </div>

            <section>
                {/* materials selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {materials.map((materials) =>
                        <button
                            key={materials.name}
                            onClick={() => toggleMaterial(materials.name)}
                            className={`cursor-pointer hover:border-yellow-500 border-2 rounded-lg p-4 text-left transition-all ${selectedMaterials[materials.name] ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
                                }`}
                        >
                            <h3 className="text-xl font-semibold mb-2">{materials.name}</h3>
                            <ul className="list-disc list-inside">
                                {materials.features.map((feature, i) => (
                                    <li key={i} className="text-black text-base font-normal">{feature}</li>
                                ))}
                            </ul>
                        </button>
                    )}
                    {/* materials percentage */}
                    <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
                        <h3 className="font-semibold mb-3">Materials selected</h3>
                        <p className='text-xs text-gray-600 mb-3'>Note: You may adjust percentages to achieve 100% mixture</p>
                        <div className='space-y-2'>
                            {Object.entries(selectedMaterials).map(([name, percentage]) => (
                                <div key={name} className='flex items-center justify-between'>
                                    <span className='text-sm'>{name}</span>
                                    <div className='flex items-center gap-2'>
                                        <input
                                            type="number"
                                            value={percentage}
                                            onChange={(e) => updateMaterialPercentage(name, e.target.value)}
                                            className='w-16 px-2 py-1 border rounded text-sm'
                                            min='0'
                                            max='100'
                                        />
                                        <span className='text-sm'>%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* product customization */}
            <section>
                <h2 className='flex flex-col items-center text-black text-4xl font-medium mb-10 '>Product Customization</h2>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Three.js 3D Preview Container */}
                    <div className='bg-gray-900 rounded-lg p-8 ml-5 flex flex-col items-center justify-center min-h-[500px] relative'>
                        {/* Three.js Canvas */}
                        <div ref={threeCanvasRef} className='w-full h-full min-h-[500px] rounded-lg'>
                            <Suspense fallback={
                                <div className='w-full h-full flex items-center justify-center bg-gray-800 rounded-lg'>
                                    <div className='text-center text-white'>
                                        <div className='text-6xl mb-4'>⏳</div>
                                        <p className='text-lg'>Loading 3D Model...</p>
                                    </div>
                                </div>
                            }>
                                <HangerScene
                                    color={color}
                                    hangerType={selectedHanger}
                                    customText={customText}
                                    textColor={textColor}
                                    textPosition={textPosition}
                                    textSize={textSize}
                                    logoPreview={logoPreview}
                                    logoPosition={logoPosition}
                                    logoSize={logoSize}
                                />
                            </Suspense>
                        </div>
                        
                        <p className='text-white text-xs mt-4 text-center'>Drag to rotate • Scroll to zoom • Right-click to pan</p>
                    </div>

                    {/* customization options */}
                    <div className='space-y-6'>
                        {/* color picker */}
                        <div>
                            <h3 className='font-semibold mb-3'>Pick a Color</h3>
                            <div className='bg-white rounded-lg border p-4'>
                                {/* Live Preview */}
                                <div className='relative h-32 rounded-lg mb-4 overflow-hidden border-2' style={{ backgroundColor: color }}>
                                    <div className='absolute inset-0 flex items-center justify-center'>
                                        <div className='bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg'>
                                            <span className='font-mono font-bold text-lg'>{color.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Color Input Controls */}
                                <div className='flex items-center gap-3 mb-4'>
                                    <label className='text-sm font-medium'>Hex:</label>
                                    <input 
                                        type="text"
                                        value={color}
                                        onChange={(e) => updateThreeJsColor(e.target.value)}
                                        className='flex-1 border-2 rounded-lg px-3 py-2 text-sm font-mono focus:border-indigo-600 focus:outline-none transition-colors'
                                        placeholder='#4F46E5'
                                    />
                                    <input 
                                        type="color"
                                        value={color}
                                        onChange={(e) => updateThreeJsColor(e.target.value)}
                                        className='w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-indigo-600 transition-colors'
                                        title='Pick a color'
                                    />
                                </div>
                                
                                {/* Preset Colors Grid */}
                                <div>
                                    <label className='text-sm font-medium mb-2 block'>Quick Select:</label>
                                    <div className='grid grid-cols-6 gap-2'>
                                        {colors.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => updateThreeJsColor(c)}
                                                className={`relative w-full aspect-square rounded-lg border-2 shadow-sm transition-all hover:scale-110 hover:shadow-md ${
                                                    color === c 
                                                        ? 'border-indigo-600 ring-2 ring-indigo-300 scale-105' 
                                                        : 'border-gray-300 hover:border-indigo-400'
                                                }`}
                                                style={{ backgroundColor: c }}
                                                title={c}
                                            >
                                                {color === c && (
                                                    <div className='absolute inset-0 flex items-center justify-center'>
                                                        <svg className='w-4 h-4 text-white drop-shadow-lg' fill='currentColor' viewBox='0 0 20 20'>
                                                            <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Custom Text */}
                        <div>
                            <h3 className='font-semibold mb-3'>Add Custom Text (Optional)</h3>
                            <div className='bg-white rounded-lg border p-4 space-y-3'>
                                <input
                                    type='text'
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder='Enter text to display on hanger'
                                    className='w-full border rounded px-3 py-2 text-sm'
                                    maxLength={50}
                                />
                                <div className='flex gap-4'>
                                    <div className='flex-1'>
                                        <label className='text-xs text-gray-600'>Text Size</label>
                                        <input
                                            type='range'
                                            min='0.5'
                                            max='3'
                                            step='0.1'
                                            value={textSize}
                                            onChange={(e) => setTextSize(parseFloat(e.target.value))}
                                            className='w-full'
                                        />
                                        <span className='text-xs'>{textSize.toFixed(1)}x</span>
                                    </div>
                                </div>
                                <div>
                                    <label className='text-xs text-gray-600 block mb-2'>Text Color</label>
                                    <div className='flex items-center gap-3'>
                                        <input
                                            type='color'
                                            value={textColor}
                                            onChange={(e) => setTextColor(e.target.value)}
                                            className='w-12 h-10 rounded cursor-pointer border'
                                        />
                                        <input
                                            type='text'
                                            value={textColor}
                                            onChange={(e) => setTextColor(e.target.value)}
                                            className='flex-1 border rounded px-3 py-2 text-sm font-mono'
                                            placeholder='#000000'
                                        />
                                    </div>
                                </div>
                                <div className='grid grid-cols-3 gap-2 text-xs'>
                                    <div>
                                        <label className='text-gray-600'>X Position</label>
                                        <input
                                            type='number'
                                            value={textPosition.x}
                                            onChange={(e) => setTextPosition(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                                            className='w-full border rounded px-2 py-1'
                                            step='0.1'
                                        />
                                    </div>
                                    <div>
                                        <label className='text-gray-600'>Y Position</label>
                                        <input
                                            type='number'
                                            value={textPosition.y}
                                            onChange={(e) => setTextPosition(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                                            className='w-full border rounded px-2 py-1'
                                            step='0.1'
                                        />
                                    </div>
                                    <div>
                                        <label className='text-gray-600'>Z Position</label>
                                        <input
                                            type='number'
                                            value={textPosition.z}
                                            onChange={(e) => setTextPosition(prev => ({ ...prev, z: parseFloat(e.target.value) || 0 }))}
                                            className='w-full border rounded px-2 py-1'
                                            step='0.1'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Custom Logo */}
                        <div>
                            <h3 className='font-semibold mb-3'>Add Logo (Optional)</h3>
                            <div className='bg-white rounded-lg border p-4 space-y-3'>
                                <label className='flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-indigo-600 transition-colors'>
                                    <ImageIcon size={20} />
                                    <span className='text-sm'>{customLogo ? customLogo.name : 'Upload Logo (PNG, JPG, SVG)'}</span>
                                    <input
                                        type='file'
                                        accept='image/png,image/jpeg,image/svg+xml'
                                        onChange={handleLogoUpload}
                                        className='hidden'
                                    />
                                </label>
                                
                                {logoPreview && (
                                    <div className='flex items-center gap-3'>
                                        <img src={logoPreview} alt='Logo preview' className='w-16 h-16 object-contain border rounded' />
                                        <button
                                            onClick={() => {
                                                setCustomLogo(null);
                                                setLogoPreview(null);
                                            }}
                                            className='text-red-600 text-sm hover:underline'
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}

                                {customLogo && (
                                    <>
                                        <div className='flex-1'>
                                            <label className='text-xs text-gray-600'>Logo Size</label>
                                            <input
                                                type='range'
                                                min='0.5'
                                                max='3'
                                                step='0.1'
                                                value={logoSize}
                                                onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                                                className='w-full'
                                            />
                                            <span className='text-xs'>{logoSize.toFixed(1)}x</span>
                                        </div>
                                        <div className='grid grid-cols-3 gap-2 text-xs'>
                                            <div>
                                                <label className='text-gray-600'>X Position</label>
                                                <input
                                                    type='number'
                                                    value={logoPosition.x}
                                                    onChange={(e) => setLogoPosition(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                                                    className='w-full border rounded px-2 py-1'
                                                    step='0.1'
                                                />
                                            </div>
                                            <div>
                                                <label className='text-gray-600'>Y Position</label>
                                                <input
                                                    type='number'
                                                    value={logoPosition.y}
                                                    onChange={(e) => setLogoPosition(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                                                    className='w-full border rounded px-2 py-1'
                                                    step='0.1'
                                                />
                                            </div>
                                            <div>
                                                <label className='text-gray-600'>Z Position</label>
                                                <input
                                                    type='number'
                                                    value={logoPosition.z}
                                                    onChange={(e) => setLogoPosition(prev => ({ ...prev, z: parseFloat(e.target.value) || 0 }))}
                                                    className='w-full border rounded px-2 py-1'
                                                    step='0.1'
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* quantity selector */}
                        <div>
                            <h3 className='font-semibold mb-3'>Quantity of Hangers</h3>
                            <p className='text-xs text-gray-600 mb-2'>Minimum order quantity is 100 pieces</p>
                            <div className='flex items-center gap-3'>
                                <button onClick={() => handleQuantityChange(-10)} className='bg-white border rounded p-2 hover:bg-gray-100'>
                                    <Minus size={20} />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    className='border rounded px-4 py-2 text-center w-24'
                                />
                                <button
                                    onClick={() => handleQuantityChange(10)}
                                    className='bg-white border rounded p-2 hover:bg-gray-100'
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                        {/* order instructions */}
                        <div>
                            <h3 className="font-semibold mb-3">Order Instruction (optional)</h3>
                            <textarea value={orderInstructions}
                                onChange={(e) => setOrderInstructions(e.target.value)}
                                placeholder='Type your instructions here...'
                                className='w-full border rounded px-3 py-2 min-h-[100px] text-sm'
                            ></textarea>
                            <div className='mt-4 text-center'>
                                <p className='text-sm text-gray-600'>Note: Please download the order form and attach. <a href="/path/to/order-form.pdf" className="text-blue-500 underline">Download Order Form</a></p>
                            </div>
                        </div>
                        {/* action buttons */}
                        <div className='space-y-2'>
                            <button className='w-full bg-[#ECBA0B] hover:bg-[#d4a709] font-semibold py-3 rounded flex items-center justify-center gap-2 cursor-pointer transition-colors'>
                                <Download size={20} />
                                Download Preview
                            </button>
                            <button className='w-full bg-[#35408E] hover:bg-[#2d3575] text-white font-semibold py-3 rounded flex items-center justify-center gap-2 cursor-pointer transition-colors'>
                                Save Design
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Order summary and address */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-5 ml-5 mr-5'>
                {/* Order summary */}
                <div className='bg-white rounded-lg border-2 border-gray-300 p-6'>
                    <h2 className='text-xl font-semibold mb-6'>Order Summary</h2>

                    <div className='space-y-4'>
                        <div className='flex items-center justify-between pb-4 border-b'>
                            <span className='font-semibold'>Quantity</span>
                            <div className='flex items-center gap-2'>
                                <button onClick={() => handleQuantityChange(-10)} className='border rounded p-1'>
                                    <Minus size={16}></Minus>
                                </button>
                                <span className='w-12 text-center'>{quantity}</span>
                                <button onClick={() => handleQuantityChange(10)} className='border rounded p-1'><Plus size={16}></Plus></button>
                            </div>
                        </div>

                        <div className='space-y-2 text-sm'>
                            <div className='flex justify-between'>
                                <span className='text-gray-600'>Product:</span>
                                <span className='font-semibold'>{selectedHanger}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-gray-600'> Material:</span>
                                <div className='text-right'>
                                    {Object.entries(selectedMaterials).map(([name, percentage]) => (
                                        <div key={name}>{percentage}% {name}</div>
                                    ))}
                                </div>
                            </div>
                            <div className='flex justify-between item-center'>
                                <span className='text-gray-600'>Color:</span>
                                <div className='flex items-center gap-2'>
                                    <div className='w-6 h-6 rounded border' style={{ backgroundColor: color }}></div>
                                    <span className='font-mono text-xs'>{color}</span>
                                </div>
                            </div>
                        </div>

                        <div className='pt-4 border-t'>
                            <label className='block font-semibold mb-2'>Delivery Instruction</label>
                            <textarea 
                                value={deliveryNotes}
                                onChange={(e) => setDeliveryNotes(e.target.value)}
                                placeholder='Write a note...' 
                                className='w-full border rounded px-3 py-2 text-sm min-h-[80px]'
                            ></textarea>
                        </div>
                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                className="cursor-pointer bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-4 px-12 rounded-lg text-lg transition-colors"
                                onClick={handleSubmitOrder}
                            >
                                Send for Evaluation
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(143,143,143,0.65)] z-50">
                        <div className="bg-[#35408E] rounded-lg shadow-lg p-8 text-center max-w-md">
                            <img src={validationIcon} alt="Validation Icon" className="mx-auto mb-4 w-16 h-16" />
                            <h3 className="text-xl text-white font-semibold mb-4">Your order will be validated first</h3>
                            <p className="mb-6 text-white">We will maintain communication and provide updates as needed.</p>
                            <p className="mb-6 text-white text-sm">Order Number: {companyName ? `ORD-${new Date().getFullYear()}...` : ''}</p>
                            <div className='flex gap-3 justify-center'>
                                <Link to="/order">
                                    <button
                                        className="bg-[#ECBA0B] text-black px-8 py-2 rounded-lg font-semibold cursor-pointer hover:bg-[#d4a709] transition-colors"
                                        onClick={() => setShowModal(false)}
                                    >
                                        View My Orders
                                    </button>
                                </Link>
                                <Link to="/messages">
                                    <button
                                        className="bg-white text-[#35408E] px-8 py-2 rounded-lg font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Go to Messages
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions Modal */}
                {showInstructionsModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(143,143,143,0.65)] z-50">
                        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <Info className="text-[#35408E]" size={24} />
                                    <h2 className="text-2xl font-bold text-[#35408E]">Ordering Process Instructions</h2>
                                </div>
                                <button
                                    onClick={() => setShowInstructionsModal(false)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                    <h3 className="font-semibold text-yellow-800 mb-2">Welcome to GatsisHub Custom Hanger Ordering!</h3>
                                    <p className="text-yellow-700">Follow these simple steps to create your perfect custom hangers.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="bg-[#35408E] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                                        <div>
                                            <h4 className="font-semibold text-lg">Select Hanger Type</h4>
                                            <p className="text-gray-600">Choose from our available hanger designs (MB3, MB7, CQ-03, 97-11) or upload your own design.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-[#35408E] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                                        <div>
                                            <h4 className="font-semibold text-lg">Choose Materials</h4>
                                            <p className="text-gray-600">Select one or multiple materials and adjust percentages to create your ideal blend. Popular options include PP, ABS, and Polycarbonate.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-[#35408E] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                                        <div>
                                            <h4 className="font-semibold text-lg">Customize Your Design</h4>
                                            <p className="text-gray-600">Pick your preferred color and specify the quantity (minimum 100 pieces). Add any special instructions.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-[#35408E] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                                        <div>
                                            <h4 className="font-semibold text-lg">Review & Submit</h4>
                                            <p className="text-gray-600">Check your order summary, confirm your delivery address, and submit for evaluation.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-[#35408E] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">5</div>
                                        <div>
                                            <h4 className="font-semibold text-lg">Order Validation</h4>
                                            <p className="text-gray-600">Our team will review your order and contact you with pricing, timeline, and any clarifications needed.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                    <h4 className="font-semibold text-blue-800 mb-2">Important Notes:</h4>
                                    <ul className="text-blue-700 space-y-1 text-sm">
                                        <li>• Minimum order quantity: 100 pieces</li>
                                        <li>• Material percentages should total 100%</li>
                                        <li>• All orders require validation before production</li>
                                        <li>• Production time varies based on complexity and quantity</li>
                                        <li>• Custom designs may require additional review time</li>
                                        <li>• Text and logo customizations available for all models</li>
                                    </ul>
                                </div>

                                <div className="flex justify-center gap-4 pt-4">
                                    <button
                                        onClick={() => setShowInstructionsModal(false)}
                                        className="bg-[#35408E] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2d3575] transition-colors"
                                    >
                                        Got it, let's start!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className='bg-white rounded-lg border-2 border-gray-300 p-6'>
                    <h2 className='text-xl font-semibold mb-6'>My Address</h2>

                    <div className='space-y-4'>
                        {addresses.length > 0 ? (
                            addresses.map((addr, idx) => (
                                <label key={idx} className='flex item-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50'>
                                    <input type="radio"
                                        name='address'
                                        checked={selectedAddress === idx}
                                        onChange={() => setSelectedAddress(idx)}
                                        className='mt-1'
                                    />
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <span className='font-semibold'>{addr.name}</span>
                                            {addr.isDefault && (
                                                <span className='bg-indigo-700 text-white text-xs px-2 py-0.5 rounded'>Default</span>
                                            )}
                                        </div>
                                        <p className='text-sm text-gray-600'>{addr.phone}</p>
                                        <p className='text-sm text-gray-600'>{addr.address}</p>
                                    </div>
                                </label>
                            ))
                        ) : (
                            <div className='text-center py-8 text-gray-500'>
                                <p className='mb-2'>No address found in your profile</p>
                                <p className='text-sm'>Please update your company address in Account Settings</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout