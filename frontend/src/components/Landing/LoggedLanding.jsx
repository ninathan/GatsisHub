import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import logo from "../../images/logo.png";
import { User, Settings, MessageCircle, LogOut } from "lucide-react";

const LoggedLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `${isActive ? "text-yellow-400" : "text-white"} relative text-xl md:text-2xl transition-colors duration-200
    after:content-[''] after:block after:h-[2px] after:bg-yellow-400 after:scale-x-0 after:transition-transform after:duration-300 after:origin-left
    hover:after:scale-x-100 hover:after:bg-yellow-400`;

  const mobileLinkClass = ({ isActive }) =>
    `${isActive ? "text-yellow-400" : "text-white"} block px-1 py-2 text-2xl transition-colors duration-200 hover:text-yellow-400`;

  const homeTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Error parsing user:", err);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-[#353f94] px-4 md:px-6 py-4 border-b-5 border-yellow-400 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          {/* logo and title */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <img src={logo} alt="Logo" className="h-10 w-10 md:h-15 md:w-15 rounded-full" />
            <span className="text-white text-2xl md:text-4xl font-light tracking-wider">
              GatsisHub
            </span>
          </div>

          {/* Desktop navigation links */}
          <div className="hidden md:block">
            <div className="flex space-x-6 items-center">
              <NavLink to="/logged" className={linkClass} onClick={homeTop}>
                Home
              </NavLink>
              <NavLink to="/products" className={linkClass}>
                Products
              </NavLink>
              <NavLink to="/orders" className={linkClass}>
                Orders
              </NavLink>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <User className="text-[#353f94]" size={24} />
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-[#4a5899] rounded-lg shadow-xl overflow-hidden border-2 border-[#353f94]">
                    {/* User Info */}
                    <div className="px-4 py-3 bg-[#3d4785] border-b border-[#353f94]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="text-gray-600" size={28} />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">
                            {user?.companyname || "Guest User"}
                          </p>
                          <p className="text-gray-300 text-sm">
                            {user?.emailaddress || "No email"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <NavLink
                        to="/accountsetting"
                        className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#353f94] transition-colors duration-200 border-b border-[#353f94]"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings size={20} />
                        <span className="text-lg">Settings</span>
                      </NavLink>

                      <NavLink
                        to="/messages"
                        className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#353f94] transition-colors duration-200 border-b border-[#353f94]"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <MessageCircle size={20} />
                        <span className="text-lg">Messages</span>
                      </NavLink>

                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#353f94] transition-colors duration-200"
                        onClick={handleLogout}
                      >
                        <LogOut size={20} />
                        <span className="text-lg">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2z"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden bg-[#353f94] transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-64 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="mt-5 border-t-2 border-white">
            <NavLink
              to="/"
              className={mobileLinkClass}
              onClick={homeTop}
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={mobileLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </NavLink>
            <NavLink
              to="/orders"
              className={mobileLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Orders
            </NavLink>
            <NavLink
              to="/accountsetting"
              className={mobileLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Settings
            </NavLink>
            <NavLink
              to="/messages"
              className={mobileLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Messages
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full text-left px-1 py-2 text-2xl text-white hover:text-yellow-400 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default LoggedLanding;
