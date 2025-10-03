import React from 'react';

/**
 * Reusable text input with optional left icon and label.
 *
 * @param {string} label       - Label text above the input
 * @param {string} type        - Input type ("text", "email", "password", etc.)
 * @param {string} placeholder - Placeholder text
 * @param {string} icon        - Image path for left-side icon
 * @param {string} className   - Extra tailwind classes for the input
 * @param {object} rest        - Any other props (onChange, value, etc.)
 */
const InputField = ({ label, type = 'text', placeholder, icon, className = '', ...rest }) => {
    return (
        <div className="relative mb-5">
            {label && <p className="text-black text-2xl font-medium mb-2">{label}</p>}

            {icon && (
                <img
                    src={icon}
                    alt=""
                    className="absolute left-4 top-14 w-6 h-6 pointer-events-none"
                />
            )}

            <input
                type={type}
                placeholder={placeholder}
                className={`border border-gray-300 rounded-2xl pl-13 py-3 w-[460px] text-2xl ${className}`}
                {...rest}
            />
        </div>
    );
};

export default InputField;
