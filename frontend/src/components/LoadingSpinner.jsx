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
        sm: 0.25,
        md: 0.4,
        lg: 0.6,
        xl: 0.8
    };

    const scale = scaleFactors[size];

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* LEGO Animation Container */}
            <div 
                style={{
                    position: 'relative',
                    height: `${155 * scale}px`,
                    width: `${268 * scale}px`,
                    overflow: 'hidden'
                }}
            >
                <style>{`
                    @keyframes blue-move {
                        0% { top: calc(50% - 15px); left: calc(50% - 140px); z-index: 1; }
                        3.334% { top: calc(50% + 100px); }
                        6.668% { left: calc(50% + 180px); }
                        10% { left: calc(50% + 180px); top: calc(50% - 290px); }
                        13.336% { top: calc(50% - 290px); left: calc(50% - 78px); z-index: 3; }
                        16.67% { top: calc(50% - 202px); left: calc(50% - 78px); z-index: 3; }
                        33.337% { top: calc(50% - 134px); left: calc(50% - 78px); z-index: 2; }
                        50% { top: calc(50% - 15px); left: calc(50% - 78px); z-index: 1; }
                        53.334% { top: calc(50% + 100px); }
                        56.668% { left: calc(50% - 400px); }
                        60% { left: calc(50% - 200px); top: calc(50% - 290px); }
                        63.336% { top: calc(50% - 290px); left: calc(50% - 140px); z-index: 3; }
                        66.68% { top: calc(50% - 202px); left: calc(50% - 140px); z-index: 3; }
                        83.35% { top: calc(50% - 83px); left: calc(50% - 137px); z-index: 2; }
                    }
                    @keyframes red-move {
                        0% { top: calc(50% - 134px); left: calc(50% - 78px); z-index: 2; }
                        16.67% { top: calc(50% - 15px); left: calc(50% - 78px); z-index: 1; }
                        20% { top: calc(50% + 100px); }
                        23.338% { left: calc(50% - 400px); }
                        26.672% { left: calc(50% - 200px); top: calc(50% - 290px); }
                        30% { top: calc(50% - 290px); left: calc(50% - 140px); z-index: 3; }
                        33.337% { top: calc(50% - 202px); left: calc(50% - 140px); z-index: 3; }
                        50% { top: calc(50% - 83px); left: calc(50% - 137px); z-index: 2; }
                        66.68% { top: calc(50% - 15px); left: calc(50% - 140px); z-index: 1; }
                        70.014% { top: calc(50% + 100px); }
                        73.348% { left: calc(50% + 168px); }
                        76.68% { left: calc(50% + 168px); top: calc(50% - 290px); }
                        80.016% { top: calc(50% - 290px); left: calc(50% - 78px); z-index: 3; }
                        83.35% { top: calc(50% - 202px); left: calc(50% - 78px); z-index: 3; }
                    }
                    @keyframes yellow-move {
                        0% { top: calc(50% - 202px); left: calc(50% - 140px); z-index: 3; }
                        16.67% { top: calc(50% - 83px); left: calc(50% - 137px); z-index: 2; }
                        33.337% { top: calc(50% - 15px); left: calc(50% - 140px); z-index: 1; }
                        36.671% { top: calc(50% + 100px); }
                        40% { left: calc(50% + 168px); }
                        43.339% { left: calc(50% + 168px); top: calc(50% - 290px); }
                        46.673% { top: calc(50% - 290px); left: calc(50% - 78px); z-index: 3; }
                        50% { top: calc(50% - 202px); left: calc(50% - 78px); z-index: 3; }
                        66.68% { top: calc(50% - 134px); left: calc(50% - 78px); z-index: 2; }
                        83.35% { top: calc(50% - 15px); left: calc(50% - 78px); z-index: 1; }
                        86.684% { top: calc(50% + 100px); }
                        90.018% { left: calc(50% - 400px); }
                        93.352% { left: calc(50% - 200px); top: calc(50% - 290px); z-index: 1; }
                        96.686% { top: calc(50% - 290px); left: calc(50% - 140px); z-index: 3; }
                    }
                `}</style>

                {/* Blue LEGO */}
                <div
                    style={{
                        position: 'absolute',
                        height: '155px',
                        width: '268px',
                        transform: `rotate(-23deg) scale(${scale})`,
                        transformOrigin: 'center',
                        top: 'calc(50% - 15px)',
                        left: 'calc(50% - 140px)',
                        zIndex: 1,
                        animation: 'blue-move 10s infinite linear',
                        backgroundImage: `
                            linear-gradient(180deg, rgba(255, 255, 255, 0) 95%, rgba(110, 187, 255, 0.4) 98%, rgba(255, 255, 255, 0) 100%),
                            linear-gradient(52deg, #1e88e5 82%, rgba(255, 255, 255, 0) 82%),
                            linear-gradient(113deg, #1e88e5 87%, rgba(0, 0, 0, 0) 86%)
                        `,
                        backgroundSize: '72% 46%, 100% 45%, 92% 56%',
                        backgroundPosition: '70px 0px, 0 0, 18px 100%',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <div style={{
                        content: '""',
                        position: 'absolute',
                        borderRadius: '40%',
                        height: '18px',
                        width: '37px',
                        left: '26px',
                        top: '-9px',
                        transform: 'rotate(23deg)',
                        background: '#2093f7',
                        boxShadow: `0px 10px 0px #1d6bb2, 0px 5px 0px #1d6bb2, 50px -20px 0px #2093f7, 50px -10px 0px #1d6bb2, 50px -15px 0px #1d6bb2, 100px -40px 0px #2093f7, 100px -30px 0px #1d6bb2, 100px -35px 0px #1d6bb2, 150px -60px 0px #2093f7, 150px -50px 0px #1d6bb2, 150px -55px 0px #1d6bb2, 40px 20px 0px #2093f7, 40px 25px 0px #1d6bb2, 40px 30px 0px #1d6bb2, 90px 0px 0px #2093f7, 90px 5px 0px #1d6bb2, 90px 10px 0px #1d6bb2, 140px -20px 0px #2093f7, 140px -15px 0px #1d6bb2, 140px -10px 0px #1d6bb2, 190px -40px 0px #2093f7, 190px -35px 0px #1d6bb2, 190px -30px 0px #1d6bb2`
                    }} />
                    <div style={{
                        content: '""',
                        position: 'absolute',
                        height: '82px',
                        width: '88px',
                        transform: 'rotate(51deg) skew(28deg)',
                        left: '-35px',
                        top: '37px',
                        background: '#1d6bb2'
                    }} />
                </div>

                {/* Red LEGO */}
                <div
                    style={{
                        position: 'absolute',
                        height: '155px',
                        width: '268px',
                        transform: `rotate(-23deg) scale(${scale})`,
                        transformOrigin: 'center',
                        top: 'calc(50% - 134px)',
                        left: 'calc(50% - 78px)',
                        zIndex: 2,
                        animation: 'red-move 10s infinite linear',
                        backgroundImage: `
                            linear-gradient(180deg, rgba(255, 255, 255, 0) 95%, rgba(248, 135, 127, 0.4) 98%, rgba(255, 255, 255, 0) 100%),
                            linear-gradient(52deg, #f44336 82%, rgba(0, 0, 0, 0) 82%),
                            linear-gradient(113deg, #f44336 87%, rgba(0, 0, 0, 0) 86%)
                        `,
                        backgroundSize: '72% 46%, 100% 45%, 92% 56%',
                        backgroundPosition: '70px 0px, 0 0, 18px 100%',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <div style={{
                        content: '""',
                        position: 'absolute',
                        borderRadius: '40%',
                        height: '18px',
                        width: '37px',
                        left: '26px',
                        top: '-9px',
                        transform: 'rotate(23deg)',
                        background: '#f36359',
                        boxShadow: `0px 10px 0px #db3327, 0px 5px 0px #db3327, 50px -20px 0px #f36359, 50px -10px 0px #db3327, 50px -15px 0px #db3327, 100px -40px 0px #f36359, 100px -30px 0px #db3327, 100px -35px 0px #db3327, 150px -60px 0px #f36359, 150px -50px 0px #db3327, 150px -55px 0px #db3327, 40px 20px 0px #f36359, 40px 25px 0px #db3327, 40px 30px 0px #db3327, 90px 0px 0px #f36359, 90px 5px 0px #db3327, 90px 10px 0px #db3327, 140px -20px 0px #f36359, 140px -15px 0px #db3327, 140px -10px 0px #db3327, 190px -40px 0px #f36359, 190px -35px 0px #db3327, 190px -30px 0px #db3327`
                    }} />
                    <div style={{
                        content: '""',
                        position: 'absolute',
                        height: '82px',
                        width: '88px',
                        transform: 'rotate(51deg) skew(28deg)',
                        left: '-35px',
                        top: '37px',
                        background: '#db3327'
                    }} />
                </div>

                {/* Yellow LEGO */}
                <div
                    style={{
                        position: 'absolute',
                        height: '155px',
                        width: '268px',
                        transform: `rotate(-23deg) scale(${scale})`,
                        transformOrigin: 'center',
                        top: 'calc(50% - 202px)',
                        left: 'calc(50% - 140px)',
                        zIndex: 3,
                        animation: 'yellow-move 10s infinite linear',
                        backgroundImage: `
                            linear-gradient(180deg, rgba(255, 255, 255, 0) 95%, #ffe884 98%, #ffe884 98%, rgba(255, 255, 255, 0) 100%),
                            linear-gradient(52deg, #fdd835 82%, rgba(0, 0, 0, 0) 82%),
                            linear-gradient(113deg, #fdd835 87%, rgba(0, 0, 0, 0) 86%)
                        `,
                        backgroundSize: '72% 46%, 100% 45%, 92% 56%',
                        backgroundPosition: '70px 0px, 0 0, 18px 100%',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <div style={{
                        content: '""',
                        position: 'absolute',
                        borderRadius: '40%',
                        height: '18px',
                        width: '37px',
                        left: '26px',
                        top: '-9px',
                        transform: 'rotate(23deg)',
                        background: '#ffe884',
                        boxShadow: `0px 10px 0px #e9c72f, 0px 5px 0px #e9c72f, 50px -20px 0px #ffe884, 50px -10px 0px #e9c72f, 50px -15px 0px #e9c72f, 100px -40px 0px #ffe884, 100px -30px 0px #e9c72f, 100px -35px 0px #e9c72f, 150px -60px 0px #ffe884, 150px -50px 0px #e9c72f, 150px -55px 0px #e9c72f, 40px 20px 0px #ffe884, 40px 25px 0px #e9c72f, 40px 30px 0px #e9c72f, 90px 0px 0px #ffe884, 90px 5px 0px #e9c72f, 90px 10px 0px #e9c72f, 140px -20px 0px #ffe884, 140px -15px 0px #e9c72f, 140px -10px 0px #e9c72f, 190px -40px 0px #ffe884, 190px -35px 0px #e9c72f, 190px -30px 0px #e9c72f`
                    }} />
                    <div style={{
                        content: '""',
                        position: 'absolute',
                        height: '82px',
                        width: '88px',
                        transform: 'rotate(51deg) skew(28deg)',
                        left: '-35px',
                        top: '37px',
                        background: '#e9c72f'
                    }} />
                </div>
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
