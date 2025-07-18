'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * Custom hook to determine if an element is in view for animations
 * @param {React.RefObject} ref - Reference to the element to check
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Threshold for when the element is considered in view (0-1)
 * @param {boolean} options.once - Whether to trigger only once
 * @param {number} options.delay - Delay before triggering the animation (ms)
 * @returns {Object} Animation state and utility functions
 */
export const useAnimationInView = (ref, options = {}) => {
  const { threshold = 0.1, once = true, delay = 0 } = options;
  const isInView = useInView(ref, { once, amount: threshold });
  const [isAnimated, setIsAnimated] = useState(false);
  
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setIsAnimated(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isInView, delay]);
  
  return { isInView, isAnimated };
};

/**
 * Custom hook to create staggered animations for children elements
 * @param {number} count - Number of items to animate
 * @param {Object} options - Configuration options
 * @param {number} options.staggerDelay - Delay between each item animation (ms)
 * @param {number} options.initialDelay - Delay before starting the animations (ms)
 * @returns {Array} Array of delays for each item
 */
export const useStaggeredAnimation = (count, options = {}) => {
  const { staggerDelay = 100, initialDelay = 0 } = options;
  
  return Array.from({ length: count }).map((_, index) => {
    return initialDelay + (index * staggerDelay);
  });
};

/**
 * Animation variants for common animations
 */
export const animationVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  },
  
  slideUp: {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 30
      }
    }
  },
  
  slideInLeft: {
    hidden: { x: -50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30
      }
    }
  },
  
  slideInRight: {
    hidden: { x: 50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30
      }
    }
  },
  
  scaleIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20
      }
    }
  },
  
  popIn: {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30
      }
    }
  },
  
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  staggerItem: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  }
}; 