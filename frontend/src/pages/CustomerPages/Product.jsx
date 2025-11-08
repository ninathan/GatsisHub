import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import pr1 from '../../images/pr1.png';
import pr2 from '../../images/pr2.png';
import pr3 from '../../images/pr3.png';
import pr4 from '../../images/pr4.png';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const ProductsPage = () => {
    const titleAnim = useScrollAnimation({ threshold: 0.3 });
    
    // Create animation hooks for each product (must be at top level, not in loop)
    const product1Anim = useScrollAnimation({ threshold: 0.2 });
    const product2Anim = useScrollAnimation({ threshold: 0.2 });
    const product3Anim = useScrollAnimation({ threshold: 0.2 });
    const product4Anim = useScrollAnimation({ threshold: 0.2 });
    
    const productAnims = [product1Anim, product2Anim, product3Anim, product4Anim];
    
    const products = [
        {
            id: 'MB3',
            name: 'MB3',
            material: 'Polycarbonate (PC)',
            description: 'Very strong and tough. Transparent or can be colored. Resistant to heat and wear. Often used for premium, transparent, or designer hangers.',
            image: pr1,
            alignment: 'left'
        },
        {
            id: 'MB7',
            name: 'MB7',
            material: 'Polycarbonate (PC)',
            description: 'Very strong and tough. Transparent or can be colored. Resistant to heat and wear. Often used for premium, transparent, or designer hangers.',
            image: pr2,
            alignment: 'right'
        },
        {
            id: 'CQ-03',
            name: 'CQ-03',
            material: '',
            description: 'Very strong and tough. Transparent or can be colored. Resistant to heat and wear. Often used for premium, transparent, or designer hangers.',
            image: pr3,
            alignment: 'left'
        },
        {
            id: '97-11',
            name: '97-11',
            material: '',
            description: 'Very strong and tough. Transparent or can be colored. Resistant to heat and wear. Often used for premium, transparent, or designer hangers.',
            image: pr4,
            alignment: 'right',
            hasOrderButton: true
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                {/* Title */}
                <h1 
                    ref={titleAnim.ref}
                    className={`text-5xl font-bold text-indigo-900 mb-16 ${
                        titleAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                    }`}
                >
                    Our Product<br />presents
                </h1>

                {/* Products List */}
                <div className="space-y-24">
                    {products.map((product, index) => {
                        const productAnim = productAnims[index];
                        return (
                            <div
                                key={product.id}
                                ref={productAnim.ref}
                                className={`flex items-center gap-12 ${
                                    product.alignment === 'right' ? 'flex-row-reverse' : ''
                                } ${
                                    productAnim.isVisible ? 'scroll-slide-up' : 'scroll-hidden'
                                }`}
                            >
                                {/* Product Image */}
                                <div className="flex-1 flex justify-center">
                                    <div className="text-9xl transform transition-all duration-300 hover:scale-105">
                                        {product.id === 'MB7' ? <img src={product.image} alt={product.name} className="drop-shadow-lg" /> : <img src={product.image} alt={product.name} className="drop-shadow-lg" />}
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className={`flex-1 ${product.alignment === 'right' ? 'text-right' : ''}`}>
                                    <h2 className="text-5xl font-bold text-indigo-900 mb-2 transform transition-all duration-300 hover:text-[#4a5899]">
                                        {product.name}
                                    </h2>
                                    {product.material && (
                                        <h3 className="text-xl font-semibold text-indigo-900 mb-4 opacity-90">
                                            {product.material}
                                        </h3>
                                    )}
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