import React from 'react';

const LoadingSpinner = ({ size = 'md', text = '', fullScreen = false, color = 'google' }) => {
    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    // Scale factor based on size
    const scaleFactors = {
        sm: 0.3,
        md: 0.5,
        lg: 0.7,
        xl: 1.0
    };

    const scale = scaleFactors[size];
    const containerSize = 200 * scale;
    const dotSize = 70 * scale;

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* Three Dots Animation Container */}
            <div style={{ position: 'relative', width: `${containerSize}px`, height: `${containerSize}px` }}>
                <style>{`
                    @keyframes dot-3-move {
                        20% { transform: scale(1); }
                        45% { transform: translateY(${-18 * scale}px) scale(0.45); }
                        60% { transform: translateY(${-90 * scale}px) scale(0.45); }
                        80% { transform: translateY(${-90 * scale}px) scale(0.45); }
                        100% { transform: translateY(0px) scale(1); }
                    }
                    @keyframes dot-2-move {
                        20% { transform: scale(1); }
                        45% { transform: translate(${-16 * scale}px, ${12 * scale}px) scale(0.45); }
                        60% { transform: translate(${-80 * scale}px, ${60 * scale}px) scale(0.45); }
                        80% { transform: translate(${-80 * scale}px, ${60 * scale}px) scale(0.45); }
                        100% { transform: translateY(0px) scale(1); }
                    }
                    @keyframes dot-1-move {
                        20% { transform: scale(1); }
                        45% { transform: translate(${16 * scale}px, ${12 * scale}px) scale(0.45); }
                        60% { transform: translate(${80 * scale}px, ${60 * scale}px) scale(0.45); }
                        80% { transform: translate(${80 * scale}px, ${60 * scale}px) scale(0.45); }
                        100% { transform: translateY(0px) scale(1); }
                    }
                    @keyframes rotate-move-${size} {
                        55% { transform: translate(-50%, -50%) rotate(0deg); }
                        80% { transform: translate(-50%, -50%) rotate(360deg); }
                        100% { transform: translate(-50%, -50%) rotate(360deg); }
                    }
                    @keyframes index {
                        0%, 100% { z-index: 3; }
                        33.3% { z-index: 2; }
                        66.6% { z-index: 1; }
                    }
                `}</style>

                <div
                    style={{
                        width: `${containerSize}px`,
                        height: `${containerSize}px`,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        margin: 'auto',
                        filter: 'url(#goo)',
                        animation: `rotate-move-${size} 2s ease-in-out infinite`
                    }}
                >
                    {/* Dot 1 - Yellow */}
                    <div
                        style={{
                            width: `${dotSize}px`,
                            height: `${dotSize}px`,
                            borderRadius: '50%',
                            backgroundColor: '#ffc400',
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            margin: 'auto',
                            animation: 'dot-1-move 2s ease infinite, index 6s -2s ease infinite'
                        }}
                    />
                    {/* Dot 2 - Blue */}
                    <div
                        style={{
                            width: `${dotSize}px`,
                            height: `${dotSize}px`,
                            borderRadius: '50%',
                            backgroundColor: '#0051ff',
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            margin: 'auto',
                            animation: 'dot-2-move 2s ease infinite, index 6s -4s ease infinite'
                        }}
                    />
                    {/* Dot 3 - Red */}
                    <div
                        style={{
                            width: `${dotSize}px`,
                            height: `${dotSize}px`,
                            borderRadius: '50%',
                            backgroundColor: '#ff1717',
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            margin: 'auto',
                            animation: 'dot-3-move 2s ease infinite, index 6s ease infinite'
                        }}
                    />
                </div>

                {/* SVG Filter for Goo Effect */}
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: 0, height: 0 }}>
                    <defs>
                        <filter id="goo">
                            <feGaussianBlur result="blur" stdDeviation="10" in="SourceGraphic" />
                            <feColorMatrix
                                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7"
                                mode="matrix"
                                in="blur"
                            />
                        </filter>
                    </defs>
                </svg>
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
