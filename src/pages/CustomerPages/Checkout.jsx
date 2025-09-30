import { button, div, label, li, span } from 'framer-motion/client'
import React from 'react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ProductCard from '../../components/Checkout/productcard'
import preview3d from '../../images/preview3d.png'
import { Plus, Minus, Download, ChevronDown, X, Info } from 'lucide-react';
import validationIcon from '../../images/validation ico.png'


const Checkout = () => {

    const [showModal, setShowModal] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);

    const [selectedHanger, setSelectedHanger] = useState('MB7');
    const [selectedMaterials, setSelectedMaterials] = useState({});

    const [color, setColor] = useState('#4F46E5');
    const [quantity, setQuantity] = useState(130);
    const [orderInstructions, setOrderInstructions] = useState('');
    const [selectedAddress, setSelectedAddress] = useState(0);

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

    // Show instructions modal when component mounts
    useEffect(() => {
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

    const addresses = [
        {
            name: 'Juan Corporation',
            phone: '(+63) 9090069683',
            address: 'San Juan City, 0900 Manugay St, Metro Manila-Quezon City',
            isDefault: true
        },
        {
            name: 'Juan Corporation',
            phone: '(+63) 9090069683',
            address: '#100 Tu aldea | Damilag, Brgy Paoay, Ilocos Sur, OC',
            isDefault: false
        }
    ]

    return (
        <div>
            <div className='flex flex-col items-center justify-center mt-10'>
                <h3 className='text-black text-4xl font-medium mb-10'>Start Your Order</h3>
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
                            {/* <div className="bg-yellow-500 py-3 font-semibold text-center">{hanger.name}</div> */}
                        </button>
                    ))}
                </div>
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
                    {/* preview product */}
                    <div className='bg-gray-200 rounded-lg p-8 ml-5 flex items-center justify-center min-h-[400px] relative'>
                        <img src={preview3d} alt="3D Preview" className='max-w-100 max-h-full object-contain' />
                        <button className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md">
                            <span className="text-xl">🔍</span>
                        </button>
                    </div>

                    {/* customization options */}
                    <div className='space-y-6'>
                        {/* color picker */}
                        <div>
                            <h3 className='font-semibold mb-3'>Pick a Color</h3>
                            <div className='bg-white rounded-lg border p-4'>
                                <div className='h-32 rounded mb-4' style={{ background: `linear-gradient(to bottom, ${color}, #000)` }}></div>
                                <div className='flex items-center justify-between mb-4'>
                                    <span className='text-sm'>Hex</span>
                                    <input type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className='border rounded px-2 py-1 text-sm w-24'
                                    />
                                    <span className='text-sm'>Solid</span>
                                </div>
                                <div className='grid grid-cols-6 gap-2'>
                                    {colors.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className='cursor-pointer w-8 h-8 rounded-full border-2 border-white shadow-md'
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
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
                            <button className='w-full bg-[#ECBA0B] font-semibold py-3 rounded flex items-center justify-center gap-2 cursor-pointer'>Download Preview</button>
                            <button className='w-full bg-[#35408E] text-white font-semibold py-3 rounded flex items-center justify-center gap-2 cursor-pointer'>Save Design</button>
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
                            <label className='block font-semibold mb-2'> delivery Instruction</label>
                            <textarea placeholder='Write a note...' className='w-full border rounded px-3 py-2 text-sm min-h-[80px]'></textarea>
                        </div>
                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                className="cursor-pointer bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-4 px-12 rounded-lg text-lg"
                                onClick={() => setShowModal(true)}
                            >
                                Send for Evaluation
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(143,143,143,0.65)] z-50">
                        <div className="bg-[#35408E] rounded-lg shadow-lg p-8 h-2/ text-center">
                            <img src={validationIcon} alt="Validation Icon" className="mx-auto mb-4 w-16 h-16" />
                            <h3 className="text-xl text-white font-semibold mb-4">Your order will be validated first</h3>
                            <p className="mb-6 text-white">We will maintain communication and provide updates as needed.</p>
                            <Link to="/messages">
                                <button
                                    className="bg-[#ECBA0B] text-black px-15 py-2 rounded-lg font-semibold cursor-pointer"
                                    onClick={() => setShowModal(false)}
                                >
                                    Go to messages
                                </button>
                            </Link>
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
                                        <li>• Minimum order quantity: -- pieces</li>
                                        <li>• Material percentages should total 100%</li>
                                        <li>• All orders require validation before production</li>
                                        <li>• Production time varies based on complexity and quantity</li>
                                        <li>• Custom designs may -- </li>
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
                        {addresses.map((addr, idx) => (
                            <label key={idx} className='flex item-start gap-3 p-4 border-2 roudned-lg cursorpointer hover:bg-gray-50'>
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
                                            <span className='bg-indigo-700 text-white text-xs px-2 py-0.5 rounded'>Defaualt</span>
                                        )}
                                    </div>
                                    <p className='text-sm text-gray-600'>{addr.phone}</p>
                                    <p className='text-sm text-gray-600'>{addr.address}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout