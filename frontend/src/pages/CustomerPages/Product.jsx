import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import pr1 from '../../images/pr1.png';
import pr2 from '../../images/pr2.png';
import pr3 from '../../images/pr3.png';
import pr4 from '../../images/pr4.png';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const titleAnim = useScrollAnimation({ threshold: 0.3 });
    
    useEffect(() => {
        fetchProducts();
    }, []);
    
    const fetchProducts = async () => {
        try {
            const response = await fetch('https://gatsis-hub.vercel.app/products?is_active=true');
            const data = await response.json();
            
            console.log('Products API response:', data);
            console.log('Products array:', data.products);
            
            // Map products to include default images
            const imageMap = { 'MB3': pr1, '97-12': pr2, 'CQ-807': pr3, '97-11': pr4, '97-08': pr1 };
            const alignments = ['left', 'right', 'left', 'right', 'left'];
            
            const mappedProducts = (data.products || []).map((product, index) => ({
                id: product.productname,
                name: product.productname,
                description: product.description || 'Very strong and tough. Transparent or can be colored. Resistant to heat and wear. Often used for premium, transparent, or designer hangers.',
                image: imageMap[product.productname] || pr1,
                alignment: alignments[index % alignments.length],
                hasOrderButton: product.productname === '97-11'
            }));
            
            console.log('Mapped products:', mappedProducts);
            
            setProducts(mappedProducts);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching products:', err);
            setLoading(false);
        }
    };
    
    // Create animation hooks for each product (must be at top level, not in loop)
    const product1Anim = useScrollAnimation({ threshold: 0.2 });
    const product2Anim = useScrollAnimation({ threshold: 0.2 });
    const product3Anim = useScrollAnimation({ threshold: 0.2 });
    const product4Anim = useScrollAnimation({ threshold: 0.2 });
    const product5Anim = useScrollAnimation({ threshold: 0.2 });
    const product6Anim = useScrollAnimation({ threshold: 0.2 });
    
    const productAnims = [product1Anim, product2Anim, product3Anim, product4Anim, product5Anim, product6Anim];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                {/* Title */}
                <h1 className="text-5xl font-bold text-indigo-900 mb-16">
                    Our Product<br />presents
                </h1>

                {/* Debug: Show product count */}
                {products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-xl">No active products found.</p>
                    </div>
                )}

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
                                    <h2 className="text-5xl font-bold text-indigo-900 mb-2 transform transition-all duration-300 hover:text-[#4a5899]">
                                        {product.name}
                                    </h2>
                                    <p className="text-gray-700 leading-relaxed max-w-md">
                                        {product.description}
                                    </p>
                                    {product.hasOrderButton && (
                                        <Link to="/checkout">
                                            <button className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg transform">
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