import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

// Arrow component that adapts to theme
const ThemedArrow = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition">
      <path d="M0.999912 5.5L14.0908 5.5" stroke={isDark ? "#ffffff" : "#1f2937"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.94796 1L14.0908 5.5L8.94796 10" stroke={isDark ? "#ffffff" : "#1f2937"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
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
      title: "Garmin Venu 2 - Advanced Fitness Smartwatch",
      offer: "Track your fitness journey with precision!",
      buttonText1: "Shop Now",
      buttonText2: "Learn More",
      imgSrc: assets.venu_watch_image,
    },
    {
      id: 3,
      title: "ASUS ROG Gaming Laptop - Ultimate Performance",
      offer: "Special Gaming Edition - Limited Stock",
      buttonText1: "Order Now",
      buttonText2: "View Specs",
      imgSrc: assets.asus_laptop_image,
    },
    {
      id: 4,
      title: "Sony WF-1000XM5 - Premium Wireless Earbuds",
      offer: "Industry-leading Noise Cancellation",
      buttonText1: "Shop Now",
      buttonText2: "See Features",
      imgSrc: assets.Sony_WF_1000XM5,
    },
    {
      id: 5,
      title: "Samsung Galaxy S23 - Cutting Edge Technology",
      offer: "Experience the Next Level of Mobile Innovation",
      buttonText1: "Buy Now",
      buttonText2: "Discover More",
      imgSrc: assets.samsung_s23phone_image,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-card-bg py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full transition-colors duration-200"
          >
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-orange-600 pb-1">{slide.offer}</p>
              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold text-text-primary">
                {slide.title}
              </h1>
              <div className="flex items-center mt-4 md:mt-6 ">
                <button className="md:px-10 px-7 md:py-2.5 py-2 bg-[#F8BD19] rounded-full text-white font-medium">
                  {slide.buttonText1}
                </button>
                <button className="group flex items-center gap-2 px-6 py-2.5 font-medium text-text-primary">
                  {slide.buttonText2}
                  <ThemedArrow />
                </button>
              </div>
            </div>
            <div className="flex items-center flex-1 justify-center">
              <Image
                className="md:w-72 w-48"
                src={slide.imgSrc}
                alt={`Slide ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              currentSlide === index ? "bg-orange-600" : "bg-gray-500/30"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
