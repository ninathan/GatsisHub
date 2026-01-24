import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import pr1 from '../../images/MB3ProductPage.png';
import pr2 from '../../images/97-12ProductPage.png';
import pr3 from '../../images/CQ-807ProductPage.png';
import pr4 from '../../images/97-08ProductPage.png';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchProducts();
    }, []);
    
    const fetchProducts = async () => {
        try {
            const response = await fetch('https://gatsis-hub.vercel.app/products?is_active=true');
            const data = await response.json();

            console.log('API Response:', data); // Add this
            console.log('First product:', data.products?.[0]); // Add this
            
            // Map products to include default images
            const imageMap = { 'MB3': pr1, '97-12': pr2, 'CQ-807': pr3, '97-11': pr4, '97-08': pr1 };
            const alignments = ['left', 'right', 'left', 'right', 'left'];
            
            const mappedProducts = (data.products || []).map((product, index) => ({
                id: product.productname,
                name: product.productname,
                description: product.description || 'High quality hanger for professional use.',
                image: imageMap[product.productname] || pr1,
                alignment: alignments[index % alignments.length],
                hasOrderButton: product.productname === 'MB3'
            }));
            
            setProducts(mappedProducts);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching products:', err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                {/* Title */}
                <h1 className="text-5xl font-bold text-[#191716] mb-16">
                    Our Product<br />presents
                </h1>

                {/* Products List */}
                <div className="space-y-24">
                    {products.map((product, index) => {
                        return (
                            <div
                                key={product.id}
                                className={`flex items-center gap-12 ${
                                    product.alignment === 'right' ? 'flex-row-reverse' : ''
                                }`}
                            >
                                {/* Product Image */}
                                <div className="flex-1 flex justify-center">
                                    <div className="text-9xl transform transition-all duration-300 hover:scale-105">
                                        {product.id === '97-12' ? <img src={product.image} alt={product.name} className="drop-shadow-lg" /> : <img src={product.image} alt={product.name} className="drop-shadow-lg" />}
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className={`flex-1 ${product.alignment === 'right' ? 'text-right' : ''}`}>
                                    <h2 className="text-5xl font-bold text-[#e6af2e] mb-2 transform transition-all duration-300">
                                        {product.name}
                                    </h2>
                                    <p className="text-[#191716] leading-relaxed max-w-md">
                                        {product.description}
                                        
                                    </p>
                                    {product.hasOrderButton && (
                                        <Link to="/checkout">
                                            <button className="mt-6 bg-[#e6af2e] hover:bg-[#c5941f] text-black font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg transform">
                                                Order Now
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;