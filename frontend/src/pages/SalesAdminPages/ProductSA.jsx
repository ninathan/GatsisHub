import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import ProductCards from '../../components/Checkout/productcard'

const ProductSA = () => {
    // State for product types
    const [products] = useState([
        { id: 1, name: 'MB3', image: <ProductCards />},
        { id: 2, name: 'MB3', image: <ProductCards />},
        { id: 3, name: 'MB3', image: <ProductCards />},
        { id: 4, name: 'MB3', image: <ProductCards />},
    ])

    // State for material types with detailed descriptions
    const [materials] = useState([
        {
            id: 1,
            name: 'Polypropylene (PP)',
            features: [
                'Lightweight yet strong',
                'Good chemical resistance',
                'Flexible enough to prevent breaking under stress',
                'Easy to mold, often used for colorful or custom-shaped'
            ]
        },
        {
            id: 2,
            name: 'Acrylonitrile Butadiene Styrene (ABS)',
            features: [
                'Durable and impact-resistant',
                'Has a smooth, glossy finish for premium look',
                'Resistant to physical wear',
                'Often used for sturdy, designer-style hangers/hangers'
            ]
        },
        {
            id: 3,
            name: 'Polystyrene (PS) / High Impact polystyrene (HIPS)',
            features: [
                'Rigid and glossy',
                'Economical but still offers a clean, high-quality finish',
                'Used in hangers that require a firm structure'
            ]
        },
        {
            id: 4,
            name: 'Nylon (Polyamide)',
            features: [
                'Strong, flexible, and durable',
                'Resistant to wear and some chemicals',
                'Used in specialized or high-end hangers requiring flexibility'
            ]
        },
        {
            id: 5,
            name: 'Polycarbonate (PC)',
            features: [
                'Very strong and tough',
                'Transparent or can be colored',
                'Resistance to heat and wear',
                'Often used for premium, transparent, or designer hangers'
            ]
        }
    ])

    // Product Card Component
    const ProductCard = ({ product }) => (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Product Image Area */}
            <div className="bg-gray-50 h-32 flex items-center justify-center border-b border-gray-200">
                <div className="text-6xl">{product.image}</div>
            </div>
            {/* Product Name Badge */}
            <div className="bg-[#DAC325] p-3 text-center">
                <span className="font-bold text-gray-900">{product.name}</span>
            </div>
        </div>
    )

    // Add Product Card Component
    const AddProductCard = () => (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-dashed border-gray-300 hover:border-[#DAC325] hover:shadow-lg transition-all cursor-pointer">
            {/* Add Button Area */}
            <div className="bg-gray-50 h-32 flex items-center justify-center border-b border-gray-200">
                <Plus size={48} className="text-gray-400" />
            </div>
            {/* Add Label */}
            <div className="bg-[#DAC325] p-3 text-center">
                <span className="font-bold text-gray-900">Add Product</span>
            </div>
        </div>
    )

    // Material Card Component
    const MaterialCard = ({ material }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Material Name Header */}
            <h3 className="font-bold text-lg text-gray-900 mb-4">{material.name}</h3>
            {/* Features List */}
            <ul className="space-y-2">
                {material.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                        <span className="text-[#35408E] mr-2 mt-1">•</span>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    )

    // Add Material Card Component
    const AddMaterialCard = () => (
        <div className="bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 hover:border-[#DAC325] hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center p-6 min-h-[200px]">
            <Plus size={64} className="text-gray-400 mb-3" />
            <span className="font-bold text-gray-900 text-lg">Add Materials</span>
        </div>
    )

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="px-8 py-6">
                    <h1 className="text-4xl font-bold text-gray-900">Products and materials</h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-8">
                {/* Product Types Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Product types</h2>

                    {/* Product Grid - 3 columns on medium screens and up */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                        <AddProductCard />
                    </div>
                </div>

                {/* Divider Line */}
                <hr className="border-gray-300 mb-12" />

                {/* Material Types Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Material types</h2>

                    {/* Material Grid - 2 columns on large screens */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {materials.map((material) => (
                            <MaterialCard key={material.id} material={material} />
                        ))}
                        <AddMaterialCard />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductSA