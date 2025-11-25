import React from 'react';

const Stepper = ({ currentStep, totalSteps, goToStep }) => {
    const steps = [
        { number: 1, label: 'Customize' },
        { number: 2, label: 'Materials' },
        { number: 3, label: 'Review' }
    ];

    return (
        <div className="mb-8 md:mb-12">
            <div className="flex items-center justify-center">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => goToStep(step.number)}
                                disabled={step.number > currentStep}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all ${
                                    step.number === currentStep
                                        ? 'bg-[#35408E] text-white scale-110 shadow-lg'
                                        : step.number < currentStep
                                        ? 'bg-green-500 text-white cursor-pointer hover:scale-105'
                                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                {step.number < currentStep ? '✓' : step.number}
                            </button>
                            <span className={`mt-2 text-xs md:text-sm font-semibold ${
                                step.number === currentStep ? 'text-[#35408E]' : step.number < currentStep ? 'text-green-500' : 'text-gray-500'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-16 md:w-24 lg:w-32 h-1 mx-2 md:mx-4 mt-[-20px] md:mt-[-24px] transition-all ${
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
