import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import logo from '../../images/logo.png';
import { useAuth } from '../../context/AuthContext';
import { User } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { Settings } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { ShoppingCart } from 'lucide-react';



const Navbar = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `${isActive ? 'text-[#e6af2e]' : 'text-white'} relative text-lg lg:text-xl xl:text-2xl transition-colors duration-200
    after:content-[''] after:block after:h-[2px] after:bg-[#e6af2e] after:scale-x-0 after:transition-transform after:duration-300 after:origin-left
    hover:after:scale-x-100 hover:after:bg-[#e6af2e]`;

  const mobileLinkClass = ({ isActive }) =>
    `${isActive ? 'text-yellow-400' : 'text-white'} block px-1 py-2 text-lg md:text-xl transition-colors duration-200 hover:text-yellow-400`;

  const homeTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleDesignClick = (e) => {
    if (user) {
      e.preventDefault();
      navigate('/accountsetting', { state: { defaultTab: 'Designs' } });
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        // Check if click is not on the hamburger button
        const hamburgerButton = document.querySelector('[aria-label="Toggle menu"]');
        if (hamburgerButton && !hamburgerButton.contains(e.target)) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if we're on checkout page and if any modal is open
  useEffect(() => {
    if (location.pathname === '/checkout') {
      const checkModals = () => {
        // Check if any modal is open by looking for elements with high z-index
        const modals = document.querySelectorAll('[class*="z-[200]"], [class*="z-[9999]"]');
        const hasOpenModal = Array.from(modals).some(modal => {
          const style = window.getComputedStyle(modal);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
        setHideNavbar(hasOpenModal);
      };

      // Check immediately and set up an interval to check periodically
      checkModals();
      const interval = setInterval(checkModals, 100);

      return () => clearInterval(interval);
    } else {
      setHideNavbar(false);
    }
  }, [location.pathname]);

  if (hideNavbar) {
    return null;
  }


  return (
    <nav className="bg-[#191716] px-3 md:px-4 lg:px-6 py-3 md:py-4 border-b-5 border-[#e6af2e] sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-full">
        {/* logo and title */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <a href="/">
            <img src={logo} alt="Logo" className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full flex-shrink-0" />
          </a>
          <span className="text-white text-lg md:text-2xl lg:text-3xl xl:text-4xl font-light tracking-wider whitespace-nowrap"><a href="/">GatsisHub</a></span>
        </div>

        {/* Desktop navigation links */}
        <div className="hidden md:block">
          <div className="flex space-x-3 lg:space-x-4 xl:space-x-6 items-center">
            <NavLink to="/" className={linkClass} onClick={homeTop}>Home</NavLink>
            <NavLink to="/products" className={linkClass}>Products</NavLink>
            <NavLink to="/create-design" className={linkClass} onClick={handleDesignClick}>Design</NavLink>
            <NavLink to="/orders" className={linkClass}>Orders</NavLink>

            {!user ? (
              <NavLink to="/login" className={linkClass}>Login</NavLink>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 lg:gap-3 px-3 py-2 rounded-lg hover:bg-[#e6af2e] transition-all duration-200 group"
                >
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-[#e6af2e] to-[#c82333] rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                    <User className="text-white" size={20} strokeWidth={2.5} />
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-white text-sm font-medium leading-tight">{user.companyname || 'User'}</span>
                    <span className="text-gray-300 text-xs leading-tight">My Account</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 animate-fadeIn">
                    {/* User Info Header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-[#e6af2e] to-[#c82333] border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#e6af2e] to-[#c82333] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <User className="text-white" size={24} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold text-base truncate">{user.companyname || 'User'}</p>
                          <p className="text-gray-200 text-xs truncate">{user.emailaddress}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className='py-2'>
                      <NavLink
                        to="/checkout"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150 group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#e6af2e] transition-colors">
                          <ShoppingCart size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium block">Place Order</span>
                          <span className="text-xs text-gray-500">Create a new order</span>
                        </div>
                      </NavLink>

                      <NavLink
                        to="/accountsetting"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150 group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#e6af2e] transition-colors">
                          <Settings size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium block">Account Settings</span>
                          <span className="text-xs text-gray-500">Manage your profile</span>
                        </div>
                      </NavLink>
                      
                      <NavLink
                        to="/messages"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150 group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#e6af2e] transition-colors">
                          <MessageCircle size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium block">Messages</span>
                          <span className="text-xs text-gray-500">Chat with support</span>
                        </div>
                      </NavLink>

                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150 group"
                        >
                          <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                            <LogOut size={18} className="text-red-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-sm font-medium block">Sign Out</span>
                            <span className="text-xs text-red-400">End your session</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-white focus:text-yellow-400 transition-colors duration-200 p-1"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden  transition-all duration-300 ease-in-out overflow-x-hidden ${isMenuOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
      >
        <div className="mt-3 border-t-2 border-white pt-3 pb-2">
          <NavLink to="/" className={mobileLinkClass} onClick={homeTop}>Home</NavLink>
          <NavLink to="/products" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Products</NavLink>
          <NavLink to="/create-design" className={mobileLinkClass} onClick={handleDesignClick}>Design</NavLink>
          <NavLink to="/orders" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Orders</NavLink>

          {!user ? (
            <NavLink to="/login" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Login</NavLink>
          ) : (
            <>
              {/* User Profile Section */}
              <div className="mt-3 pt-3 border-t border-gray-400">
                <div className="px-1 py-2 mb-2">
                  <div className="flex items-center gap-3 bg-[#f1b322] rounded-lg p-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#e6af2e] to-[#c82333]  rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <User className="text-white" size={24} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold text-base truncate">{user.companyname || 'User'}</p>
                      <p className="text-gray-300 text-xs truncate">{user.emailaddress}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-1 px-1">
                  <NavLink 
                    to="/checkout" 
                    className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-[#f1b322] group-hover rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-[#f1b322] group-hover:bg-[#e6af2e] transition-colors rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingCart size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium block">Place Order</span>
                      <span className="text-xs text-gray-300">Create a new order</span>
                    </div>
                  </NavLink>

                  <NavLink 
                    to="/accountsetting" 
                    className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-[#4a5899] rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-[#f1b322] group-hover:bg-[#e6af2e] transition-colors rounded-lg flex items-center justify-center flex-shrink-0">
                      <Settings size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium block">Account Settings</span>
                      <span className="text-xs text-gray-300">Manage your profile</span>
                    </div>
                  </NavLink>

                  <NavLink 
                    to="/messages" 
                    className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-[#4a5899] rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-[#f1b322] group-hover:bg-[#e6af2e] transition-colors rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageCircle size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium block">Messages</span>
                      <span className="text-xs text-gray-300">Chat with support</span>
                    </div>
                  </NavLink>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-white hover:bg-red-600 rounded-lg transition-colors duration-200 mt-2"
                  >
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <LogOut size={18} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium block">Sign Out</span>
                      <span className="text-xs text-red-200">End your session</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
