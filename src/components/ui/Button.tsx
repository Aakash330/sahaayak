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
    const baseStyles = 'inline-flex items-center justify-center gap-3 min-h-[48px] min-w-[48px] px-6 py-3 font-semibold transition-all rounded-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs active:scale-[0.99]';
    
    const variantStyles = {
      primary: 'bg-[#1E3A5F] text-white hover:bg-[#152B47] active:bg-[#0E1E33] focus:ring-[#1E3A5F]/40 border border-[#152B47]/40 shadow-sm',
      secondary: 'bg-white text-stone-900 hover:bg-amber-50/80 active:bg-amber-100/60 focus:ring-amber-500/30 border-2 border-stone-300 hover:border-amber-400 shadow-xs',
      back: 'bg-transparent text-stone-700 hover:bg-amber-100/40 focus:ring-stone-400 !px-4',
      danger: 'bg-rose-700 text-white hover:bg-rose-800 focus:ring-rose-700/40 shadow-sm',
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
