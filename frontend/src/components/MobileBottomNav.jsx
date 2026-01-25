import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileBottomNav = ({ navItems, accentColor = '#E6AF2E' }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center items-center p-3 bg-transparent pointer-events-none">
            <article className="border border-solid border-gray-300 w-full max-w-2xl ease-in-out duration-500 rounded-2xl flex shadow-lg shadow-black/15 bg-white pointer-events-auto">
                {navItems.map((item, index) => (
                    <label
                        key={item.id}
                        className={`has-[:checked]:shadow-lg relative w-full h-14 sm:h-16 p-3 sm:p-4 ease-in-out duration-300 border-solid border-black/10 has-[:checked]:border group flex flex-row gap-3 items-center justify-center text-black rounded-xl cursor-pointer ${
                            isActive(item.path) ? 'shadow-lg border' : ''
                        }`}
                        htmlFor={item.id}
                    >
                        <input
                            id={item.id}
                            name="path"
                            type="radio"
                            className="hidden peer/expand"
                            checked={isActive(item.path)}
                            onChange={() => navigate(item.path)}
                        />
                        <item.icon
                            size={20}
                            className={`peer-hover/expand:scale-125 ease-in-out duration-300 sm:w-6 sm:h-6 ${
                                isActive(item.path) ? `scale-125` : ''
                            }`}
                            style={{
                                color: isActive(item.path) ? accentColor : 'inherit',
                            }}
                        />
                    </label>
                ))}
            </article>
        </div>
    );
};

export default MobileBottomNav;