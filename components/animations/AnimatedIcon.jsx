'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';

/**
 * AnimatedIcon - A reusable animated icon component
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Icon source path
 * @param {string} props.alt - Icon alt text
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.size - Icon size in pixels
 * @param {Object} props.animationProps - Custom animation properties
 * @returns {React.ReactElement} Animated icon component
 */
const AnimatedIcon = ({ 
  src, 
  alt = "Icon", 
  onClick, 
  className = "", 
  size = 24,
  animationProps = {},
  ...props 
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Default animation props
  const defaultAnimationProps = {
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.9 },
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 17 
    }
  };

  // Merge default and custom animation props
  const animations = { ...defaultAnimationProps, ...animationProps };

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      onClick={onClick}
      {...animations}
      {...props}
    >
      <div className={`w-${size/4} h-${size/4} relative`} style={{ width: size, height: size }}>
        <Image 
          className="w-full h-full object-contain" 
          src={src} 
          alt={alt}
          width={size}
          height={size}
          style={isDarkMode ? { filter: 'brightness(0) invert(1)' } : {}}
        />
      </div>
    </motion.div>
  );
};

export default AnimatedIcon; 