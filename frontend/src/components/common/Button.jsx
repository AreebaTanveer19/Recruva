import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

/**
 * Reusable Button Component
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} showArrow - Show arrow icon
 * @param {React.ReactNode} children - Button content
 * @param {function} onClick - Click handler
 * @param {string} className - Additional classes
 * @param {boolean} disabled - Disable button
 * @param {object} props - Additional props
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  showArrow = false,
  children,
  onClick,
  className = '',
  disabled = false,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-semibold';

  const variants = {
    primary: disabled 
      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
      : 'bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    secondary: disabled
      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
      : 'bg-white text-blue-600 hover:bg-gray-50 border border-gray-200',
    outline: disabled
      ? 'border-2 border-gray-300 text-gray-400 cursor-not-allowed'
      : 'border-2 border-white text-white hover:bg-white/10',
    ghost: disabled
      ? 'text-gray-400 cursor-not-allowed'
      : 'text-gray-700 hover:text-blue-600',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
      {showArrow && <FaArrowRight className="ml-1" />}
    </button>
  );
};

export default Button;
