import { Link } from 'react-router-dom';
import sampleP1 from '../../images/sample1.png';
import sampleP2 from '../../images/sample2.png';
import sampleP3 from '../../images/sample3.png';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const SampleCard = () => {
    const heading = useScrollAnimation({ threshold: 0.3 });
    const card1 = useScrollAnimation({ threshold: 0.2 });
    const card2 = useScrollAnimation({ threshold: 0.2 });
    const card3 = useScrollAnimation({ threshold: 0.2 });
    const viewMore = useScrollAnimation({ threshold: 0.3 });

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-white">
            <h1 
                ref={heading.ref}
                className={`text-xl md:text-2xl lg:text-3xl font-regular mb-4 md:mb-6 text-center mt-2 ${
                    heading.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                }`}
            >
                Sample Products
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
                <div 
                    ref={card1.ref}
                    className={`flex flex-col hover:scale-105 transition-transform duration-300 ${
                        card1.isVisible ? 'scroll-slide-up' : 'scroll-hidden'
                    }`}
                >
                    <img src={sampleP1} alt="Product 1" className="w-full h-auto aspect-[524/579] object-cover shadow-lg hover:shadow-2xl transition-shadow duration-300" />
                    <div className='bg-[#e6af2e] py-4 md:py-5 lg:py-6 text-2xl md:text-3xl lg:text-4xl text-center font-extralight'>
                        <h1>Colorful</h1>
                    </div>
                </div>
                <div 
                    ref={card2.ref}
                    className={`flex flex-col hover:scale-105 transition-transform duration-300 ${
                        card2.isVisible ? 'scroll-slide-up' : 'scroll-hidden'
                    }`}
                    style={{ animationDelay: card2.isVisible ? '150ms' : '0ms' }}
                >
                    <img src={sampleP3} alt="Product 2" className="w-full h-auto aspect-[524/579] object-cover shadow-lg hover:shadow-2xl transition-shadow duration-300" />
                    <div className='bg-[#191716] text-white text-2xl md:text-3xl lg:text-4xl py-4 md:py-5 lg:py-6 text-center font-extralight'>
                        <h1>Formal</h1>
                    </div>
                </div>
                <div 
                    ref={card3.ref}
                    className={`flex flex-col hover:scale-105 transition-transform duration-300 ${
                        card3.isVisible ? 'scroll-slide-up' : 'scroll-hidden'
                    }`}
                    style={{ animationDelay: card3.isVisible ? '300ms' : '0ms' }}
                >
                    <img src={sampleP2} alt="Product 3" className="w-full h-auto aspect-[524/579] object-cover shadow-lg hover:shadow-2xl transition-shadow duration-300" />
                    <div className='bg-[#e6af2e] py-4 md:py-5 lg:py-6 text-2xl md:text-3xl lg:text-4xl text-center font-extralight'>
                        <h1>Stylish</h1>
                    </div>
                </div>
            </div>
            <div 
                ref={viewMore.ref}
                className={`flex justify-center mt-4 md:mt-6 lg:mt-8 ${
                    viewMore.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                }`}
            >
                <Link to='/products' className="text-lg md:text-xl lg:text-2xl font-regular text-center cursor-pointer underline hover:text-[#35408E] hover:scale-105 transition-all duration-300">
                    View More
                </Link>
            </div>
        </div>
    )
}

export default SampleCard