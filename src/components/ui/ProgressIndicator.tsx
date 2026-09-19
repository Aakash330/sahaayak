import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps,
  label = 'Progress'
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  
  return (
    <div className="w-full" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={label}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-lg font-medium text-stone-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-lg font-bold text-blue-700">
          {percentage}%
        </span>
      </div>
      <div className="h-4 bg-stone-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
