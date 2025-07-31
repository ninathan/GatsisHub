import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../images/logo.png';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const linkClass = ({ isActive }) =>
        `${isActive ? 'text-yellow-400' : 'text-white'} relative text-xl md:text-2xl transition-colors duration-200
        after:content-[''] after:block after:h-[2px] after:bg-yellow-400 after:scale-x-0 after:transition-transform after:duration-300 after:origin-left
        hover:after:scale-x-100 hover:after:bg-yellow-400 `;

    const mobileLinkClass = ({ isActive }) =>
        `${isActive ? 'text-yellow-400' : 'text-white'} block px-1 py-2 text-2xl transition-colors duration-200 hover:text-yellow-400`;

    const homeTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
        setIsMenuOpen(false);
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    return (
        <>
            <nav className="bg-[#353f94] px-4 md:px-6 py-4 border-b-5 border-yellow-400 sticky top-0 z-50">

                <div className="flex items-center justify-between">
                    {/* logo and title */}
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <img src={logo} alt="Logo" className="h-10 w-10 md:h-15 md:w-15 rounded-full" />
                        <span className="text-white text-2xl md:text-4xl font-light tracking-wider">GatsisHub</span>
                    </div>

                    {/* Desktop navigation links */}
                    <div className="hidden md:block">
                        <div className='flex space-x-6'>
                            <NavLink to="/" className={linkClass} onClick={homeTop}>Home</NavLink>
                            <NavLink to="/products" className={linkClass}>Products</NavLink>
                            <NavLink to="/orders" className={linkClass}>Orders</NavLink>
                            <NavLink to="/Login" className={linkClass}>Login</NavLink>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-white focus:text-yellow-400 transition-colors duration-200"
                            aria-label="Toggle menu"
                        >
                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                                ) : (
                                    <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Mobile menu */}
                <div className={`md:hidden bg-[#353f94] transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden' 
                    }`}>
                    <div className="mt-5 border-t-2 border-white">
                        <NavLink to="/" className={mobileLinkClass} onClick={homeTop}>Home</NavLink>
                        <NavLink to="/products" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Products</NavLink>
                        <NavLink to="/orders" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Orders</NavLink>
                        <NavLink to="/about" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Login</NavLink>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar