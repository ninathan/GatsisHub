import React from 'react';

const StepNavigation = ({ currentStep, totalSteps, onNext, onPrev, isLastStep }) => {
    return (
        <div className="flex justify-between items-center mt-8 md:mt-12 pt-6 border-t-2 border-gray-200">
            {currentStep > 1 && (
                <button
                    onClick={onPrev}
                    className="px-6 md:px-8 py-2 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-base md:text-lg shadow-md"
                >
                    ← Previous
                </button>
            )}
            
            <div className="flex-1" />
            
            {!isLastStep && (
                <button
                    onClick={onNext}
                    className="px-6 md:px-8 py-2 md:py-3 bg-[#e6af2e] text-white rounded-lg hover:bg-[#c8971e] transition-colors font-semibold text-base md:text-lg shadow-lg"
                >
                    Next →
                </button>
            )}
        </div>
    );
};

export default StepNavigation;
