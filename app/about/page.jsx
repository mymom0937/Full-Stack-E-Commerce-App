"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">About EzCart</h1>
          <p className="max-w-3xl mx-auto text-lg text-gray-600">
            We're on a mission to make online shopping easier, more affordable, and more enjoyable for everyone.
          </p>
        </div>

        {/* About Image */}
        <div className="mb-16 rounded-xl overflow-hidden">
          <img 
            src="/about-hero.jpg" 
            alt="About EzCart" 
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Our Story</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 mb-4">
                Founded in 2020, EzCart began with a simple idea: to create an online shopping experience that truly puts customers first. We noticed that many e-commerce platforms were complicated, filled with hidden fees, and didn't prioritize user experience.
              </p>
              <p className="text-gray-600">
                EzCart was founded with a simple mission: to create an online shopping experience that is easy, transparent, and enjoyable. We believe that shopping online should be just as satisfying as shopping in person, with the added benefits of convenience and wider selection.
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-4">
                What started as a small operation has grown into a thriving marketplace with thousands of products across dozens of categories. But despite our growth, we've never lost sight of our core values: quality, affordability, and exceptional customer service.
              </p>
              <p className="text-gray-600">
                Today, we're proud to serve customers nationwide, offering a carefully curated selection of products from trusted brands and sellers. Our team works tirelessly to ensure that every interaction with EzCart leaves you satisfied and eager to return.
              </p>
            </div>
          </div>
        </div>

        {/* Our Team */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="mb-4 rounded-xl overflow-hidden">
                <img 
                  src="/team-1.jpg" 
                  alt="Team Member" 
                  className="w-full h-64 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">Sarah Johnson</h3>
              <p className="text-gray-600 mb-2">Founder & CEO</p>
              <p className="text-gray-600 text-sm">
                With over 15 years in retail and e-commerce, Sarah brings vision and leadership to EzCart.
              </p>
            </div>
            
            {/* Team Member 2 */}
            <div className="text-center">
              <div className="mb-4 rounded-xl overflow-hidden">
                <img 
                  src="/team-2.jpg" 
                  alt="Team Member" 
                  className="w-full h-64 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">Michael Chen</h3>
              <p className="text-gray-600 mb-2">CTO</p>
              <p className="text-gray-600 text-sm">
                Michael leads our tech team, ensuring EzCart offers a seamless shopping experience.
              </p>
            </div>
            
            {/* Team Member 3 */}
            <div className="text-center">
              <div className="mb-4 rounded-xl overflow-hidden">
                <img 
                  src="/team-3.jpg" 
                  alt="Team Member" 
                  className="w-full h-64 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">Aisha Patel</h3>
              <p className="text-gray-600 mb-2">Head of Customer Experience</p>
              <p className="text-gray-600 text-sm">
                Aisha ensures every customer interaction with EzCart exceeds expectations.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Why Choose EzCart</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Reason 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-gray-600">
                We carefully vet all products and sellers to ensure you receive only the best quality items.
              </p>
            </div>
            
            {/* Reason 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Competitive Pricing</h3>
              <p className="text-gray-600">
                We work hard to offer the best prices and regularly run special promotions and discounts.
              </p>
            </div>
            
            {/* Reason 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Exceptional Support</h3>
              <p className="text-gray-600">
                Our customer service team is available 7 days a week to assist with any questions or concerns.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-50 p-8 rounded-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Ready to Experience EzCart?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have made EzCart their go-to online shopping destination.
          </p>
          <Link 
            href="/all-products" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
          >
            Shop Now
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
} 