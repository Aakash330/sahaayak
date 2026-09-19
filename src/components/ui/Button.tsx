import React from 'react';
import { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'back' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', icon: Icon, isLoading, className = '', disabled, ...props }, ref) => {
    
    // Core styles for 48px touch targets, clear text, focus state
    const baseStyles = 'inline-flex items-center justify-center gap-3 min-h-[48px] min-w-[48px] px-6 py-3 font-medium transition-colors rounded-xl focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: 'bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-700',
      secondary: 'bg-stone-200 text-stone-900 hover:bg-stone-300 focus:ring-stone-400 border border-stone-300',
      back: 'bg-transparent text-stone-700 hover:bg-stone-100 focus:ring-stone-400 !px-4',
      danger: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-700',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {Icon && <Icon className="w-6 h-6" aria-hidden="true" />}
        {/* Do not allow icon-only buttons as per guidelines */}
        <span className="text-lg">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
