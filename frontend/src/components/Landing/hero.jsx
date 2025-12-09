import { Link } from 'react-router-dom';
import herobg from '../../images/herobg.png';
import background from '../../images/background.png';
import dropdown from '../../images/dropdown.png';

const Hero = () => {
    return (
        <section className="overflow-hidden">
            {/* Top Hero Section */}
            <div className="flex flex-col md:flex-row">
                {/* Left Image */}
                <div className="md:w-1/2 h-[300px] md:h-[400px] lg:h-[500px] xl:h-auto animate-slideIn">
                    <img src={herobg} alt="Suits" className="w-full h-full object-cover transition-transform duration-700" />
                </div>
                {/* Right Text Content */}
                <div className="md:w-1/2 flex flex-col justify-center items-start p-6 md:p-8 lg:p-10 xl:p-12 bg-white">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-gray-800 leading-tight md:leading-normal mb-4 animate-fadeInUp">
                        Not Just Hangers.<br />
                        A Better Way to Care for Your Clothes.
                    </h1>
                    <p className="text-black text-base md:text-lg lg:text-xl xl:text-2xl font-light mb-6 md:mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                        A beautiful dress may turn heads, but a quality hanger<br className="hidden lg:block" />
                        holds the story behind its grace.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                        <Link to="/checkout" className="bg-[#e6af2e] cursor-pointer text-black text-lg md:text-xl lg:text-2xl xl:text-3xl font-light py-3 md:py-3.5 lg:py-4 px-6 md:px-7 lg:px-8 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl text-center transform">
                            Order Now
                        </Link>
                        <Link to="/create-design" className="bg-[#191716] cursor-pointer text-white text-lg md:text-xl lg:text-2xl xl:text-3xl font-light py-3 md:py-3.5 lg:py-4 px-6 md:px-7 lg:px-8 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl text-center transform">
                            Design Now
                        </Link>
                    </div>
                </div>
            </div>
            {/* Bottom Section with Explore Arrow */}
            <div
                className="relative flex flex-col items-center justify-center h-[200px] md:h-[250px] lg:h-[300px] bg-cover bg-center animate-fadeIn"
                style={{ backgroundImage: `url(${background})`, animationDelay: '600ms' }}
            >
                <p className="text-gray-700 text-base md:text-lg lg:text-xl xl:text-2xl mb-2 font-light -mt-20 md:-mt-28 lg:-mt-40 animate-fadeInUp" style={{ animationDelay: '800ms' }}>Explore More</p>
                <img src={dropdown} alt="Explore More" className="text-2xl md:text-3xl cursor-pointer animate-bounce text-black mt-3 md:mt-4 lg:mt-5 w-8 h-8 md:w-10 md:h-10 hover:scale-110 transition-transform" />
            </div>
        </section>
    )
}

export default Hero
