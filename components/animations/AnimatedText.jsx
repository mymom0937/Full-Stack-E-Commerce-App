'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedText - A component for animating text with various effects
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - The text to animate
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Animation type (typing, highlight, reveal, wave)
 * @param {Object} props.animationProps - Custom animation properties
 * @returns {React.ReactElement} Animated text component
 */
const AnimatedText = ({
  text,
  className = "",
  type = "reveal",
  animationProps = {},
  ...props
}) => {
  // Animation variants based on type
  const animationVariants = {
    typing: {
      hidden: { width: 0 },
      visible: {
        width: "100%",
        transition: {
          delay: animationProps.delay || 0,
          duration: animationProps.duration || 1,
          ease: "easeInOut"
        }
      }
    },
    highlight: {
      hidden: { backgroundSize: "0% 100%" },
      visible: {
        backgroundSize: "100% 100%",
        transition: {
          delay: animationProps.delay || 0,
          duration: animationProps.duration || 0.8,
          ease: "easeInOut"
        }
      }
    },
    reveal: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          delay: animationProps.delay || 0,
          duration: animationProps.duration || 0.5,
          ease: "easeOut"
        }
      }
    },
    wave: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    }
  };

  // For wave animation, we need to animate each letter separately
  if (type === "wave") {
    return (
      <motion.div
        className={`inline-block ${className}`}
        initial="hidden"
        animate="visible"
        {...props}
      >
        {text.split("").map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  delay: (animationProps.delay || 0) + (index * (animationProps.staggerDelay || 0.05)),
                  duration: animationProps.duration || 0.3,
                  ease: "easeOut"
                }
              }
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>
    );
  }

  // For typing animation, we need a container with overflow hidden
  if (type === "typing") {
    return (
      <div className={`inline-block overflow-hidden ${className}`}>
        <motion.div
          className="inline-block whitespace-nowrap"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={animationVariants[type]}
          {...props}
        >
          {text}
        </motion.div>
      </div>
    );
  }

  // For highlight animation, we need to set background styles
  if (type === "highlight") {
    return (
      <motion.span
        className={`inline-block bg-gradient-to-r from-[#F8BD19] to-[#F8BD19] bg-no-repeat bg-bottom ${className}`}
        style={{ backgroundSize: "0% 30%" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={animationVariants[type]}
        {...props}
      >
        {text}
      </motion.span>
    );
  }

  // Default reveal animation
  return (
    <motion.div
      className={`inline-block ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={animationVariants[type]}
      {...props}
    >
      {text}
    </motion.div>
  );
};

export default AnimatedText; 