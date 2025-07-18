'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";
import Loading from "@/components/Loading";
import { FaShippingFast, FaExchangeAlt, FaMapMarkerAlt, FaShieldAlt } from "react-icons/fa";
import PageTransition from "@/components/animations/PageTransition";
import AnimationWrapper, { fadeIn, slideUp, slideInLeft, slideInRight } from "@/components/animations/AnimationWrapper";

const BenefitCard = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-6 bg-card-bg rounded-lg transition-all duration-200 hover:shadow-md">
    <div className="w-16 h-16 flex items-center justify-center mb-4 text-[#F8BD19]">
      <Icon size={32} />
    </div>
    <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
    <p className="text-sm text-text-secondary">{description}</p>
  </div>
);

const CategoryCard = ({ image, title, count, link }) => (
  <Link href={link} className="group relative overflow-hidden rounded-lg">
    <div className="aspect-square relative overflow-hidden">
      <Image 
        src={image} 
        alt={title} 
        fill 
        className="object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
        <h3 className="text-xl font-medium text-white">{title}</h3>
        <p className="text-sm text-gray-200">{count} Products</p>
      </div>
    </div>
  </Link>
);

// Section Title Component for consistent headings
const SectionTitle = ({ title, highlight = null }) => (
  <AnimationWrapper variants={slideUp}>
    <div className="flex flex-col items-center mb-8">
      <h2 className="text-3xl font-medium text-text-primary">
        {highlight ? (
          <>
            {title} <span className="text-orange-600">{highlight}</span>
          </>
        ) : (
          title
        )}
      </h2>
      <div className="w-28 h-0.5 bg-[#F8BD19] mt-2"></div>
    </div>
  </AnimationWrapper>
);

// Featured Categories Section Component
const FeaturedCategories = () => {
  const { categories, isLoading, error } = useCategories();
  
  if (isLoading) {
    return (
      <div className="py-10 bg-background">
        <SectionTitle title="Featured" highlight="Categories" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-square bg-card-bg rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error || categories.length === 0) {
    return null; // Don't show section if there's an error or no categories
  }
  
  // Take the top categories (up to 8)
  const displayCategories = categories.slice(0, 8);
  
  return (
    <section className="px-6 md:px-16 lg:px-32 py-10 bg-background">
      <SectionTitle title="Featured" highlight="Categories" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayCategories.map((category, index) => (
          <AnimationWrapper key={index} variants={fadeIn} delay={index * 0.1}>
            <CategoryCard
              image={category.image}
              title={category.category}
              count={category.count}
              link={category.link}
            />
          </AnimationWrapper>
        ))}
      </div>
    </section>
  );
};

const Home = () => {
  const benefits = [
    {
      icon: FaShippingFast,
      title: "Free Shipping",
      description: "Free shipping on all orders over $50"
    },
    {
      icon: FaExchangeAlt,
      title: "Easy Returns",
      description: "30-day money back guarantee"
    },
    {
      icon: FaMapMarkerAlt,
      title: "Track Orders",
      description: "Know where your order is at all times"
    },
    {
      icon: FaShieldAlt,
      title: "Secure Payment",
      description: "Multiple secure payment methods"
    }
  ];

  return (
    <>
      <Navbar/>
      <PageTransition>
        <main>
          {/* Hero Section with Header Slider */}
          <AnimationWrapper variants={fadeIn}>
            <section className="px-6 md:px-16 lg:px-32">
              <HeaderSlider />
            </section>
          </AnimationWrapper>
          
          {/* Benefits Section */}
          <section className="px-6 md:px-16 lg:px-32 py-10 bg-background">
            <SectionTitle title="Why" highlight="Choose Us" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <AnimationWrapper key={index} variants={slideUp} delay={index * 0.1}>
                  <BenefitCard 
                    icon={benefit.icon}
                    title={benefit.title}
                    description={benefit.description}
                  />
                </AnimationWrapper>
              ))}
            </div>
          </section>
          
          {/* Featured Categories - Now using dynamic data */}
          <FeaturedCategories />
          
          {/* Top Picks Section */}
          <AnimationWrapper variants={slideInLeft}>
            <section className="px-6 md:px-16 lg:px-32 py-8 bg-background">
              <HomeProducts />
            </section>
          </AnimationWrapper>
          
          {/* Spotlight Section */}
          <AnimationWrapper variants={slideInRight}>
            <section className="px-6 md:px-16 lg:px-32 py-12 bg-[#111] text-white">
              <FeaturedProduct />
            </section>
          </AnimationWrapper>
          
          {/* Newsletter Section */}
          <AnimationWrapper variants={slideUp}>
            <section className="px-6 md:px-16 lg:px-32 py-16 bg-background border-t border-border-color">
              <NewsLetter />
            </section>
          </AnimationWrapper>
        </main>
      </PageTransition>
      <Footer />
    </>
  );
};

export default Home;
