import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../images/logo.png';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `${isActive ? 'text-yellow-400' : 'text-white'} relative text-xl md:text-2xl transition-colors duration-200
    after:content-[''] after:block after:h-[2px] after:bg-yellow-400 after:scale-x-0 after:transition-transform after:duration-300 after:origin-left
    hover:after:scale-x-100 hover:after:bg-yellow-400`;

  const mobileLinkClass = ({ isActive }) =>
    `${isActive ? 'text-yellow-400' : 'text-white'} block px-1 py-2 text-2xl transition-colors duration-200 hover:text-yellow-400`;

  const homeTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-[#353f94] px-4 md:px-6 py-4 border-b-5 border-yellow-400 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* logo and title */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <img src={logo} alt="Logo" className="h-10 w-10 md:h-15 md:w-15 rounded-full" />
          <span className="text-white text-2xl md:text-4xl font-light tracking-wider">GatsisHub</span>
        </div>

        {/* Desktop navigation links */}
        <div className="hidden md:block">
          <div className="flex space-x-6 items-center">
            <NavLink to="/" className={linkClass} onClick={homeTop}>Home</NavLink>
            <NavLink to="/products" className={linkClass}>Products</NavLink>
            <NavLink to="/orders" className={linkClass}>Orders</NavLink>

            {!user ? (
              <NavLink to="/login" className={linkClass}>Login</NavLink>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="text-white text-xl md:text-2xl hover:text-yellow-400 flex items-center space-x-2"
                >
                  <span>{user.companyname || 'User'}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#353f94] border border-yellow-400 rounded-lg shadow-lg py-2 z-50">
                    <NavLink
                      to="/logged"
                      className="block px-4 py-2 text-white hover:bg-yellow-400 hover:text-[#353f94] transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </NavLink>
                    <NavLink
                      to="/accountsetting"
                      className="block px-4 py-2 text-white hover:bg-yellow-400 hover:text-[#353f94] transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Account Settings
                    </NavLink>
                    <NavLink
                      to="/messages"
                      className="block px-4 py-2 text-white hover:bg-yellow-400 hover:text-[#353f94] transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Messages
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-white hover:bg-red-500 transition"
                    >
                      Logout
                    </button>
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
            className="text-white focus:text-yellow-400 transition-colors duration-200"
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
        className={`md:hidden bg-[#353f94] transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="mt-5 border-t-2 border-white">
          <NavLink to="/" className={mobileLinkClass} onClick={homeTop}>Home</NavLink>
          <NavLink to="/products" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Products</NavLink>
          <NavLink to="/orders" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Orders</NavLink>

          {!user ? (
            <NavLink to="/login" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Login</NavLink>
          ) : (
            <>
              <NavLink to="/logged" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Profile</NavLink>
              <NavLink to="/accountsetting" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Account Settings</NavLink>
              <NavLink to="/messages" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Messages</NavLink>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-white hover:bg-red-500 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
