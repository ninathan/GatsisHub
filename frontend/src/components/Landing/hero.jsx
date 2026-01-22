import { Link } from 'react-router-dom';
import styled from 'styled-components';
import herobg from '../../images/herobg.png';
import background from '../../images/background.png';
import dropdown from '../../images/dropdown.png';

const StyledButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  text-transform: uppercase;
  border-radius: 9999px;
  font-size: 1.25rem;
  font-weight: 500;
  text-shadow: none;
  cursor: pointer;
  box-shadow: transparent;
  border: 1px solid;
  transition: 0.5s ease;
  user-select: none;
  text-align: center;
  display: inline-block;
  text-decoration: none;

  @media (min-width: 768px) {
    padding: 0.875rem 1.75rem;
    font-size: 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 1rem 2rem;
    font-size: 1.875rem;
  }

  @media (min-width: 1280px) {
    font-size: 2.25rem;
  }

  &.order-now {
    color: #000000;
    background: #e6af2e;
    border-color: #e6af2e;

    &:hover,
    &:focus {
      color: #000000;
      background: #e6af2e;
      border-color: #e6af2e;
      text-shadow: 0 0 5px rgba(230, 175, 46, 0.8), 0 0 10px rgba(230, 175, 46, 0.6), 0 0 20px rgba(230, 175, 46, 0.4);
      box-shadow: 0 0 5px #e6af2e, 0 0 20px #e6af2e, 0 0 50px #e6af2e, 0 0 100px #e6af2e;
    }
  }

  &.design-now {
    color: #ffffff;
    background: #191716;
    border-color: #191716;

    &:hover,
    &:focus {
      color: #ffffff;
      background: #191716;
      border-color: #191716;
      text-shadow: 0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 5px #191716, 0 0 20px #191716, 0 0 50px #191716, 0 0 100px #191716;
    }
  }
`;

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
                        <StyledButton to="/checkout" className="order-now">
                            Order Now
                        </StyledButton>
                        <StyledButton to="/create-design" className="design-now">
                            Design Now
                        </StyledButton>
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
