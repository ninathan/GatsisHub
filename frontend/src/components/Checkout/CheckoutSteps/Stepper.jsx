import React from 'react';

const Stepper = ({ currentStep, totalSteps, goToStep }) => {
    const steps = [
        { number: 1, label: 'Customize' },
        { number: 2, label: 'Materials' },
        { number: 3, label: 'Review' }
    ];

    return (
        <div className="py-3 lg:py-4">
            {/* Vertical layout for large screens */}
            <div className="hidden lg:flex flex-col gap-3">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => goToStep(step.number)}
                                disabled={step.number > currentStep}
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all flex-shrink-0 ${
                                    step.number === currentStep
                                        ? 'bg-[#e6af2e] text-white scale-110 shadow-lg'
                                        : step.number < currentStep
                                        ? 'bg-green-500 text-white cursor-pointer hover:scale-105'
                                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                {step.number < currentStep ? '✓' : step.number}
                            </button>
                            <span className={`text-sm font-semibold ${
                                step.number === currentStep ? 'text-[#191716]' : step.number < currentStep ? 'text-green-500' : 'text-gray-500'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-1 h-8 ml-6 transition-all ${
                                step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Horizontal layout for small/medium screens */}
            <div className="flex lg:hidden flex-row items-center justify-center gap-1">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={() => goToStep(step.number)}
                                disabled={step.number > currentStep}
                                className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all flex-shrink-0 ${
                                    step.number === currentStep
                                        ? 'bg-[#e6af2e] text-white scale-110 shadow-lg'
                                        : step.number < currentStep
                                        ? 'bg-green-500 text-white cursor-pointer hover:scale-105'
                                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                {step.number < currentStep ? '✓' : step.number}
                            </button>
                            <span className={`text-[10px] md:text-xs font-semibold whitespace-nowrap ${
                                step.number === currentStep ? 'text-[#191716]' : step.number < currentStep ? 'text-green-500' : 'text-gray-500'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`h-0.5 w-6 md:w-8 transition-all ${
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
