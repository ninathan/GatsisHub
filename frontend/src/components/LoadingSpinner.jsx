import React from 'react';

const LoadingSpinner = ({ size = 'md', text = '', fullScreen = false, color = 'google' }) => {
    // Define size configurations
    const sizeConfig = {
        sm: { height: 'h-8', width: 'w-1', gap: 'gap-0.5' },
        md: { height: 'h-12', width: 'w-1.5', gap: 'gap-1' },
        lg: { height: 'h-16', width: 'w-2', gap: 'gap-1' },
        xl: { height: 'h-24', width: 'w-3', gap: 'gap-1.5' }
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    const currentSize = sizeConfig[size];

    // Google colors or single color mode
    const isGoogleColors = color === 'google' || color === 'white';
    const barColors = isGoogleColors 
        ? color === 'white'
            ? ['bg-white', 'bg-white', 'bg-white', 'bg-white']
            : ['bg-blue-500', 'bg-red-500', 'bg-yellow-400', 'bg-green-500']
        : [`bg-${color}-600`, `bg-${color}-600`, `bg-${color}-600`, `bg-${color}-600`];

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* Google-style animated bars */}
            <div className={`flex items-end justify-center ${currentSize.gap} ${currentSize.height}`}>
                {[0, 1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className={`${currentSize.width} h-full ${barColors[index]} rounded-full origin-bottom`}
                        style={{
                            animation: 'bounce 0.6s ease-in-out infinite',
                            animationDelay: `${index * 0.15}s`,
                            minHeight: '20%'
                        }}
                    ></div>
                ))}
            </div>

            {/* Loading text */}
            {text && (
                <p className={`${textSizes[size]} font-medium ${color === 'white' ? 'text-white' : 'text-gray-700'}`}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
