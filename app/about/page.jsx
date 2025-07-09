"use client";
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import Breadcrumb from '@/components/Breadcrumb';

const AboutUs = () => {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-10">
        {/* Breadcrumb */}
        <Breadcrumb currentPage="About Us" />
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">About QuickCart</h1>
          
          <div className="mb-12 relative rounded-lg overflow-hidden">
            <Image 
              src="/about-hero.jpg" 
              alt="About QuickCart" 
              width={1200} 
              height={600}
              className="w-full h-64 md:h-80 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-image.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/70 to-transparent flex items-center">
              <div className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Your Trusted Shopping Destination</h2>
                <p className="text-white/90 max-w-md">Bringing quality products to your doorstep since 2023</p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Story</h2>
              <p className="text-gray-600 mb-4">
                QuickCart was founded with a simple mission: to create an online shopping experience that is easy, 
                enjoyable, and accessible to everyone. What started as a small startup has grown into a trusted 
                e-commerce platform serving customers nationwide.
              </p>
              <p className="text-gray-600">
                We believe that shopping online should be just as satisfying as shopping in person, with the added 
                convenience of being able to browse and purchase from anywhere, at any time.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                Our mission is to provide a seamless shopping experience with a curated selection of high-quality 
                products at competitive prices. We strive to make online shopping accessible, secure, and enjoyable 
                for all our customers.
              </p>
              <p className="text-gray-600">
                We're committed to exceptional customer service, fast shipping, and building lasting relationships 
                with our customers through trust and reliability.
              </p>
            </div>
          </div>
          
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Why Choose Us</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-orange-100 p-3 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-medium mb-2">Quality Products</h3>
                <p className="text-sm text-gray-500">Carefully selected products that meet our high standards</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-orange-100 p-3 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium mb-2">Fast Delivery</h3>
                <p className="text-sm text-gray-500">Quick processing and shipping to your doorstep</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-orange-100 p-3 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-medium mb-2">Secure Payments</h3>
                <p className="text-sm text-gray-500">Multiple secure payment options for your convenience</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-orange-100 p-3 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium mb-2">24/7 Support</h3>
                <p className="text-sm text-gray-500">Customer service available whenever you need assistance</p>
              </div>
            </div>
          </div>
          
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Our Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="rounded-full overflow-hidden w-32 h-32 mx-auto mb-4">
                  <Image 
                    src="/team-1.jpg" 
                    alt="Team Member" 
                    width={128} 
                    height={128}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                </div>
                <h3 className="font-medium">Sarah Johnson</h3>
                <p className="text-sm text-gray-500">CEO & Founder</p>
              </div>
              <div className="text-center">
                <div className="rounded-full overflow-hidden w-32 h-32 mx-auto mb-4">
                  <Image 
                    src="/team-2.jpg" 
                    alt="Team Member" 
                    width={128} 
                    height={128}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                </div>
                <h3 className="font-medium">Michael Chen</h3>
                <p className="text-sm text-gray-500">CTO</p>
              </div>
              <div className="text-center">
                <div className="rounded-full overflow-hidden w-32 h-32 mx-auto mb-4">
                  <Image 
                    src="/team-3.jpg" 
                    alt="Team Member" 
                    width={128} 
                    height={128}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                </div>
                <h3 className="font-medium">Olivia Martinez</h3>
                <p className="text-sm text-gray-500">Head of Operations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs; 