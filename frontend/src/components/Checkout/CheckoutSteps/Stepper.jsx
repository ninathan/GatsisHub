import React from 'react';

const Stepper = ({ currentStep, totalSteps, goToStep }) => {
    const steps = [
        { number: 1, label: 'Customize' },
        { number: 2, label: 'Materials' },
        { number: 3, label: 'Review' }
    ];

    return (
        <div className="py-6 lg:py-6">
            {/* Vertical layout for large screens */}
            <div className="hidden lg:flex flex-col gap-6">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => goToStep(step.number)}
                                disabled={step.number > currentStep}
                                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-bold text-xl md:text-2xl transition-all flex-shrink-0 ${
                                    step.number === currentStep
                                        ? 'bg-[#e6af2e] text-white scale-110 shadow-lg'
                                        : step.number < currentStep
                                        ? 'bg-green-500 text-white cursor-pointer hover:scale-105'
                                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                {step.number < currentStep ? '✓' : step.number}
                            </button>
                            <span className={`text-base md:text-lg font-semibold ${
                                step.number === currentStep ? 'text-[#191716]' : step.number < currentStep ? 'text-green-500' : 'text-gray-500'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-1 h-12 ml-8 md:ml-10 transition-all ${
                                step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Horizontal layout for small/medium screens */}
            <div className="flex lg:hidden flex-row items-center justify-center gap-2">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => goToStep(step.number)}
                                disabled={step.number > currentStep}
                                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-base md:text-lg transition-all flex-shrink-0 ${
                                    step.number === currentStep
                                        ? 'bg-[#e6af2e] text-white scale-110 shadow-lg'
                                        : step.number < currentStep
                                        ? 'bg-green-500 text-white cursor-pointer hover:scale-105'
                                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                {step.number < currentStep ? '✓' : step.number}
                            </button>
                            <span className={`text-xs md:text-sm font-semibold whitespace-nowrap ${
                                step.number === currentStep ? 'text-[#191716]' : step.number < currentStep ? 'text-green-500' : 'text-gray-500'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`h-1 w-8 md:w-12 transition-all ${
                                step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Stepper;
