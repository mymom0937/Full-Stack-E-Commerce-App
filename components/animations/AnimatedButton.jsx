'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedButton - A reusable animated button component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 * @param {string} props.variant - Button variant (primary, secondary, outline, text)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {Object} props.animationProps - Custom animation properties
 * @returns {React.ReactElement} Animated button component
 */
const AnimatedButton = ({ 
  children, 
  className = "", 
  onClick, 
  variant = "primary", 
  size = "md", 
  disabled = false,
  animationProps = {},
  ...props 
}) => {
  // Define variant styles
  const variantStyles = {
    primary: "bg-[#F8BD19] text-white hover:bg-[#F8BD19]/90",
    secondary: "bg-background border border-[#F8BD19] text-[#F8BD19] hover:bg-[#F8BD19]/10",
    outline: "bg-transparent border border-border-color text-text-primary hover:bg-card-bg",
    text: "bg-transparent text-text-primary hover:bg-card-bg/50"
  };

  // Define size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  // Default animation props
  const defaultAnimationProps = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 17 
    }
  };

  // Merge default and custom animation props
  const animations = { ...defaultAnimationProps, ...animationProps };

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      className={`
        rounded font-medium transition-colors
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...(disabled ? {} : animations)}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton; 