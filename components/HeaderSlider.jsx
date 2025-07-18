'use client';

import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedText from "./animations/AnimatedText";
import AnimatedButton from "./animations/AnimatedButton";

// Arrow component that adapts to theme
const ThemedArrow = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <motion.svg 
      width="15" 
      height="11" 
      viewBox="0 0 15 11" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="group-hover:translate-x-1 transition"
      animate={{ x: [0, 5, 0] }}
      transition={{ 
        repeat: Infinity, 
        repeatType: "reverse", 
        duration: 1.5,
        ease: "easeInOut",
        repeatDelay: 1
      }}
    >
      <path d="M0.999912 5.5L14.0908 5.5" stroke={isDark ? "#ffffff" : "#1f2937"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.94796 1L14.0908 5.5L8.94796 10" stroke={isDark ? "#ffffff" : "#1f2937"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </motion.svg>
  );
};

const HeaderSlider = () => {
  const sliderData = [
    {
      id: 1,
      title: "Premium Sound Experience - High-Quality Headphones",
      offer: "Limited Time Offer 30% Off",
      buttonText1: "Buy now",
      buttonText2: "Find more",
      imgSrc: assets.header_headphone_image,
    },
    {
      id: 2,
      title: "Apple Watch Ultra 2 - Ultimate Adventure Companion",
      offer: "Designed for Explorers and Athletes",
      buttonText1: "Buy Now",
      buttonText2: "Learn Features",
      imgSrc: assets.Apple_Watch_Ultra_2,
    },
    {
      id: 3,
      title: "Garmin Venu 2 - Advanced Fitness Smartwatch",
      offer: "Track your fitness journey with precision!",
      buttonText1: "Shop Now",
      buttonText2: "Learn More",
      imgSrc: assets.venu_watch_image,
    },
    {
      id: 4,
      title: "ASUS ROG Gaming Laptop - Ultimate Performance",
      offer: "Special Gaming Edition - Limited Stock",
      buttonText1: "Order Now",
      buttonText2: "View Specs",
      imgSrc: assets.asus_laptop_image,
    },
    {
      id: 5,
      title: "Sony WF-1000XM5 - Premium Wireless Earbuds",
      offer: "Industry-leading Noise Cancellation",
      buttonText1: "Shop Now",
      buttonText2: "See Features",
      imgSrc: assets.Sony_WF_1000XM5,
    },
    {
      id: 6,
      title: "Samsung Galaxy S23 - Cutting Edge Technology",
      offer: "Experience the Next Level of Mobile Innovation",
      buttonText1: "Buy Now",
      buttonText2: "Discover More",
      imgSrc: assets.samsung_s23phone_image,
    },
    
    {
      id: 7,
      title: "MacBook Air M4 - Unmatched Performance",
      offer: "The World's Thinnest Laptop",
      buttonText1: "Buy Now",
      buttonText2: "View Specs",
      imgSrc: assets.MacBook_Air_M4,
    },
    {
      id: 8,
      title: "Galaxy S25 Ultra - Flagship Innovation",
      offer: "Elevate Your Mobile Experience",
      buttonText1: "Buy Now",
      buttonText2: "Learn More",
      imgSrc: assets.Galaxy_S25_Ultra,
    },

    {
      id: 9,
      title: "Apple iPhone 16e - Revolutionary Performance",
      offer: "Next Generation Apple Intelligence",
      buttonText1: "Pre-Order",
      buttonText2: "View Specs",
      imgSrc: assets.Apple_iPhone_16e,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    })
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.5
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.2
      }
    }
  };

  const indicatorVariants = {
    inactive: { scale: 1 },
    active: { 
      scale: 1.2,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="overflow-hidden relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentSlide}
          custom={currentSlide}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="w-full"
        >
          <div className="flex flex-col-reverse md:flex-row items-center justify-between bg-card-bg py-8 md:px-14 px-5 mt-6 rounded-xl w-full transition-colors duration-200">
            <motion.div 
              className="md:pl-8 mt-10 md:mt-0"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <motion.p 
                variants={textVariants}
                className="md:text-base text-orange-600 pb-1"
              >
                {sliderData[currentSlide].offer}
              </motion.p>
              
              <motion.h1 
                variants={textVariants}
                className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold text-text-primary"
              >
                {sliderData[currentSlide].title}
              </motion.h1>
              
              <motion.div 
                variants={textVariants}
                className="flex items-center mt-4 md:mt-6"
              >
                <AnimatedButton
                  variant="primary"
                  className="md:px-10 px-7 md:py-2.5 py-2 rounded-full"
                >
                  {sliderData[currentSlide].buttonText1}
                </AnimatedButton>
                
                <motion.button 
                  className="group flex items-center gap-2 px-6 py-2.5 font-medium text-text-primary"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {sliderData[currentSlide].buttonText2}
                  <ThemedArrow />
                </motion.button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex items-center flex-1 justify-center"
              variants={imageVariants}
              initial="hidden"
              animate="visible"
            >
              <Image
                className="md:w-72 w-48"
                src={sliderData[currentSlide].imgSrc}
                alt={`Slide ${currentSlide + 1}`}
              />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <motion.div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              currentSlide === index ? "bg-orange-600" : "bg-gray-500/30"
            }`}
            variants={indicatorVariants}
            animate={currentSlide === index ? "active" : "inactive"}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          ></motion.div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
