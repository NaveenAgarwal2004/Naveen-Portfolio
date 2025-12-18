import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-medium rounded-xl
    transition-all duration-300 transform active:scale-95 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-forge-orange to-ember-red hover:from-ember-red hover:to-clay
      text-white hover:scale-105 hover:shadow-lg hover:shadow-forge-orange/25
      focus:ring-forge-orange/50
    `,
    secondary: `
      bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20
      text-white hover:bg-white/10 hover:scale-105
      focus:ring-white/50
    `,
    outline: `
      border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white
      hover:scale-105 focus:ring-gray-400/50
    `,
    ghost: `
      text-gray-300 hover:text-white hover:bg-white/5
      focus:ring-white/20
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
      text-white hover:scale-105 hover:shadow-lg hover:shadow-red-500/25
      focus:ring-red-400/50
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && leftIcon && leftIcon}
      <span>{children}</span>
      {!loading && rightIcon && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
