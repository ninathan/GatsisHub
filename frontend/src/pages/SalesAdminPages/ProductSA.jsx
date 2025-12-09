import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react'
import ProductCards from '../../components/Checkout/productcard'

const ProductSA = () => {
    const [products, setProducts] = useState([])
    const [materials, setMaterials] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    // Modal states
    const [showProductModal, setShowProductModal] = useState(false)
    const [showMaterialModal, setShowMaterialModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [editingMaterial, setEditingMaterial] = useState(null)
    
    // Form states
    const [productForm, setProductForm] = useState({ productname: '', description: '' })
    const [materialForm, setMaterialForm] = useState({ materialname: '', features: [''] })
    
    useEffect(() => {
        fetchData()
    }, [])
    
    const fetchData = async () => {
        try {
            setLoading(true)
            const [productsRes, materialsRes] = await Promise.all([
                fetch('https://gatsis-hub.vercel.app/products'),
                fetch('https://gatsis-hub.vercel.app/materials')
            ])
            
            const productsData = await productsRes.json()
            const materialsData = await materialsRes.json()
            
            setProducts(productsData.products || [])
            setMaterials(materialsData.materials || [])
        } catch (err) {
            console.error('Error fetching data:', err)
            setError('Failed to load data')
        } finally {
            setLoading(false)
        }
    }
    
    // Product handlers
    const handleAddProduct = () => {
        setEditingProduct(null)
        setProductForm({ productname: '', description: '' })
        setShowProductModal(true)
    }
    
    const handleEditProduct = (product) => {
        setEditingProduct(product)
        setProductForm({ productname: product.productname, description: product.description || '' })
        setShowProductModal(true)
    }
    
    const handleSaveProduct = async () => {
        try {
            const url = editingProduct 
                ? `https://gatsis-hub.vercel.app/products/${editingProduct.productid}`
                : 'https://gatsis-hub.vercel.app/products'
            
            const method = editingProduct ? 'PATCH' : 'POST'
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productForm)
            })
            
            if (!response.ok) throw new Error('Failed to save product')
            
            await fetchData()
            setShowProductModal(false)
        } catch (err) {
            alert('Failed to save product: ' + err.message)
        }
    }
    
    const handleDeleteProduct = async (productid) => {
        if (!confirm('Are you sure you want to delete this product?')) return
        
        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/products/${productid}`, {
                method: 'DELETE'
            })
            
            if (!response.ok) throw new Error('Failed to delete product')
            
            await fetchData()
        } catch (err) {
            alert('Failed to delete product: ' + err.message)
        }
    }
    
    // Material handlers
    const handleAddMaterial = () => {
        setEditingMaterial(null)
        setMaterialForm({ materialname: '', features: [''] })
        setShowMaterialModal(true)
    }
    
    const handleEditMaterial = (material) => {
        setEditingMaterial(material)
        setMaterialForm({ 
            materialname: material.materialname, 
            features: material.features && material.features.length > 0 ? material.features : ['']
        })
        setShowMaterialModal(true)
    }
    
    const handleSaveMaterial = async () => {
        try {
            const filteredFeatures = materialForm.features.filter(f => f.trim() !== '')
            
            const url = editingMaterial
                ? `https://gatsis-hub.vercel.app/materials/${editingMaterial.materialid}`
                : 'https://gatsis-hub.vercel.app/materials'
            
            const method = editingMaterial ? 'PATCH' : 'POST'
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...materialForm, features: filteredFeatures })
            })
            
            if (!response.ok) throw new Error('Failed to save material')
            
            await fetchData()
            setShowMaterialModal(false)
        } catch (err) {
            alert('Failed to save material: ' + err.message)
        }
    }
    
    const handleDeleteMaterial = async (materialid) => {
        if (!confirm('Are you sure you want to delete this material?')) return
        
        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/materials/${materialid}`, {
                method: 'DELETE'
            })
            
            if (!response.ok) throw new Error('Failed to delete material')
            
            await fetchData()
        } catch (err) {
            alert('Failed to delete material: ' + err.message)
        }
    }
    
    const addFeature = () => {
        setMaterialForm({ ...materialForm, features: [...materialForm.features, ''] })
    }
    
    const updateFeature = (index, value) => {
        const newFeatures = [...materialForm.features]
        newFeatures[index] = value
        setMaterialForm({ ...materialForm, features: newFeatures })
    }
    
    const removeFeature = (index) => {
        const newFeatures = materialForm.features.filter((_, i) => i !== index)
        setMaterialForm({ ...materialForm, features: newFeatures })
    }

    // Product Card Component
    const ProductCard = ({ product }) => (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow relative group">
            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={() => handleEditProduct(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
                    title="Edit product"
                >
                    <Edit2 size={16} />
                </button>
                <button
                    onClick={() => handleDeleteProduct(product.productid)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                    title="Delete product"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            
            {/* Product Image Area */}
            <div className="bg-gray-50 h-32 flex items-center justify-center border-b border-gray-200">
                <div className="text-6xl"><ProductCards /></div>
            </div>
            {/* Product Name Badge */}
            <div className="bg-[#E6AF2E] p-3 text-center">
                <span className="font-bold text-gray-900">{product.productname}</span>
            </div>
        </div>
    )

    // Add Product Card Component
    const AddProductCard = () => (
        <div 
            onClick={handleAddProduct}
            className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-dashed border-gray-300 hover:border-[#E6AF2E] hover:shadow-lg transition-all cursor-pointer"
        >
            {/* Add Button Area */}
            <div className="bg-gray-50 h-32 flex items-center justify-center border-b border-gray-200">
                <Plus size={48} className="text-gray-400" />
            </div>
            {/* Add Label */}
            <div className="bg-[#E6AF2E] p-3 text-center">
                <span className="font-bold text-gray-900">Add Product</span>
            </div>
        </div>
    )

    // Material Card Component
    const MaterialCard = ({ material }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow relative group">
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => handleEditMaterial(material)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
                    title="Edit material"
                >
                    <Edit2 size={16} />
                </button>
                <button
                    onClick={() => handleDeleteMaterial(material.materialid)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                    title="Delete material"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            
            {/* Material Name Header */}
            <h3 className="font-bold text-lg text-gray-900 mb-4">{material.materialname}</h3>
            {/* Features List */}
            <ul className="space-y-2">
                {material.features && material.features.map((feature, index) => (
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
        <div 
            onClick={handleAddMaterial}
            className="bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 hover:border-[#DAC325] hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center p-6 min-h-[200px]"
        >
            <Plus size={64} className="text-gray-400 mb-3" />
            <span className="font-bold text-gray-900 text-lg">Add Materials</span>
        </div>
    )

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products and materials...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <p className="text-red-800 font-semibold mb-2">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                    <button 
                        onClick={fetchData}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

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
            
            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-blur-50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-xl font-bold mb-4">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Product Name</label>
                            <input
                                type="text"
                                value={productForm.productname}
                                onChange={(e) => setProductForm({ ...productForm, productname: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="e.g., MB3"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                            <textarea
                                value={productForm.description}
                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                                rows="3"
                                placeholder="Product description..."
                            />
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveProduct}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                            >
                                <Save size={16} />
                                Save
                            </button>
                            <button
                                onClick={() => setShowProductModal(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded flex items-center justify-center gap-2"
                            >
                                <X size={16} />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Material Modal */}
            {showMaterialModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingMaterial ? 'Edit Material' : 'Add New Material'}
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Material Name</label>
                            <input
                                type="text"
                                value={materialForm.materialname}
                                onChange={(e) => setMaterialForm({ ...materialForm, materialname: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="e.g., Polypropylene (PP)"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Features</label>
                            {materialForm.features.map((feature, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => updateFeature(index, e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        placeholder={`Feature ${index + 1}`}
                                    />
                                    {materialForm.features.length > 1 && (
                                        <button
                                            onClick={() => removeFeature(index)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addFeature}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                            >
                                + Add Feature
                            </button>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveMaterial}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                            >
                                <Save size={16} />
                                Save
                            </button>
                            <button
                                onClick={() => setShowMaterialModal(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded flex items-center justify-center gap-2"
                            >
                                <X size={16} />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductSA