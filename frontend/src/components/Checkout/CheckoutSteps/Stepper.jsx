import React from 'react';

const Stepper = ({ currentStep, totalSteps, goToStep }) => {
    const steps = [
        { number: 1, label: 'Customize' },
        { number: 2, label: 'Materials' },
        { number: 3, label: 'Review' }
    ];

    return (
        <div className="py-2">
            <div className="flex flex-col gap-2">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => goToStep(step.number)}
                                disabled={step.number > currentStep}
                                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all flex-shrink-0 ${
                                    step.number === currentStep
                                        ? 'bg-[#007BFF] text-white scale-110 shadow-lg'
                                        : step.number < currentStep
                                        ? 'bg-green-500 text-white cursor-pointer hover:scale-105'
                                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                {step.number < currentStep ? '✓' : step.number}
                            </button>
                            <span className={`text-xs md:text-sm font-semibold ${
                                step.number === currentStep ? 'text-[#007BFF]' : step.number < currentStep ? 'text-green-500' : 'text-gray-500'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-1 h-6 ml-4 md:ml-5 transition-all ${
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
