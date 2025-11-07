import { Link } from 'react-router-dom';
import herobg from '../../images/herobg.png';
import background from '../../images/background.png';
import dropdown from '../../images/dropdown.png';

const Hero = () => {
    return (
        <section>
            {/* Top Hero Section */}
            <div className="flex flex-col md:flex-row">
                {/* Left Image */}
                <div className="md:w-1/2">
                    <img src={herobg} alt="Suits" className="w-full h-full object-cover" />
                </div>
                {/* Right Text Content */}
                <div className="md:w-1/2 flex flex-col justify-center items-start p-8 bg-white">
                    <h1 className="text-6xl font-medium text-gray-800 leading-normal mb-4">
                        Not Just Hangers.<br />
                        A Better Way to Care for Your Clothes.
                    </h1>
                    <p className="text-black text-2xl font-light mb-4">
                        A beautiful dress may turn heads, but a quality hanger<br />
                        holds the story behind its grace.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/checkout" className="bg-yellow-400 hover:bg-yellow-500 cursor-pointer text-black text-3xl font-light py-4 px-8 rounded-full transition duration-300">
                            Order Now
                        </Link>
                        <Link to="/create-design" className="bg-[#353f94] hover:bg-[#2a3270] cursor-pointer text-white text-3xl font-light py-4 px-8 rounded-full transition duration-300">
                            Design Now
                        </Link>
                    </div>
                </div>
            </div>
            {/* Bottom Section with Explore Arrow */}
            <div
                className="relative flex flex-col items-center justify-center h-[300px] bg-cover bg-center"
                style={{ backgroundImage: `url(${background})` }}
            >
                <p className="text-gray-700 text-2xl mb-2 font-light -mt-40">Explore More</p>
                <img src={dropdown} alt="Explore More" className="text-3xl cursor-pointer animate-bounce text-black mt-5" />
            </div>
        </section>
    )
}

export default Hero
