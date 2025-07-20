"use client";
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { FaDatabase, FaCloud, FaShieldAlt, FaServer, FaCogs, FaPalette } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-background transition-colors duration-200 pt-20">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-text-primary">About EzCart</h1>
          <p className="max-w-3xl mx-auto text-lg text-text-secondary mb-6">
            A modern e-commerce platform designed for exceptional user experience and performance.
          </p>
          <div className="max-w-3xl mx-auto text-text-secondary">
            <p className="mb-4">
              EzCart is a full-featured e-commerce solution built with cutting-edge technologies to deliver a seamless shopping experience. Our platform connects customers with quality products through an intuitive interface that prioritizes speed, security, and reliability.
            </p>
            <p className="mb-4">
              We've engineered EzCart using the latest web development stack to ensure optimal performance and scalability. From secure user authentication to real-time order processing, every aspect of our platform is designed with both customers and merchants in mind.
            </p>
            <p>
              Whether you're shopping for the latest tech gadgets or managing your product inventory as a seller, EzCart provides the tools and features you need for a frictionless e-commerce experience.
            </p>
          </div>
        </div>

        {/* About Image */}
        <div className="mb-16 rounded-xl overflow-hidden shadow-lg max-w-3xl mx-auto">
          <div className="relative" style={{ maxHeight: "450px", overflow: "hidden" }}>
            <Image 
              src={assets.about_hero_image}
              alt="About EzCart" 
              className="w-full h-auto object-cover"
              width={900}
              height={450}
              priority
            />
          </div>
        </div>

        {/* Technology Stack Section */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-text-primary text-center">Our Technology Stack</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <div className="flex items-center mb-4">
                <FaShieldAlt className="text-[#F8BD19] mr-3 text-2xl" />
                <h3 className="text-xl font-semibold text-text-primary">Clerk Authentication</h3>
              </div>
              <p className="text-text-secondary">
                We implement Clerk for secure, seamless user authentication, providing multi-factor authentication and social login options while maintaining the highest security standards.
              </p>
            </div>
            
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <div className="flex items-center mb-4">
                <FaDatabase className="text-[#F8BD19] mr-3 text-2xl" />
                <h3 className="text-xl font-semibold text-text-primary">MongoDB Atlas Database</h3>
              </div>
              <p className="text-text-secondary">
                Our platform is powered by MongoDB Atlas, a fully-managed cloud database service that provides automatic scaling, high availability, and global distribution for optimal performance and reliability.
              </p>
            </div>
            
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <div className="flex items-center mb-4">
                <FaCloud className="text-[#F8BD19] mr-3 text-2xl" />
                <h3 className="text-xl font-semibold text-text-primary">Cloudinary Storage</h3>
              </div>
              <p className="text-text-secondary">
                All product images are optimized and stored on Cloudinary, ensuring fast loading times and high-quality visual content across all devices and connection speeds.
              </p>
            </div>
            
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <div className="flex items-center mb-4">
                <FaCogs className="text-[#F8BD19] mr-3 text-2xl" />
                <h3 className="text-xl font-semibold text-text-primary">Inngest Background Jobs</h3>
              </div>
              <p className="text-text-secondary">
                We utilize Inngest for reliable background processing of critical operations like user management and order processing, ensuring system stability and responsiveness.
              </p>
            </div>
            
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <div className="flex items-center mb-4">
                <FaServer className="text-[#F8BD19] mr-3 text-2xl" />
                <h3 className="text-xl font-semibold text-text-primary">Next.js Framework</h3>
              </div>
              <p className="text-text-secondary">
                Built on Next.js, our application delivers lightning-fast page loads through server-side rendering and optimized client-side navigation for a smooth browsing experience.
              </p>
            </div>
            
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <div className="flex items-center mb-4">
                <FaPalette className="text-[#F8BD19] mr-3 text-2xl" />
                <h3 className="text-xl font-semibold text-text-primary">TailwindCSS Styling</h3>
              </div>
              <p className="text-text-secondary">
                Our modern, responsive design is implemented with TailwindCSS, providing a consistent and beautiful user interface that adapts perfectly to any screen size.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values Section */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-text-primary text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Customer-Centric Approach</h3>
              <p className="text-text-secondary">
                Every decision we make is guided by what's best for our customers. We continuously collect feedback and make improvements to enhance your shopping experience.
              </p>
            </div>
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Quality Assurance</h3>
              <p className="text-text-secondary">
                We maintain strict standards for all products on our platform. Our team thoroughly vets each item to ensure it meets our quality benchmarks before it reaches you.
              </p>
            </div>
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Transparency</h3>
              <p className="text-text-secondary">
                We believe in honest pricing, clear policies, and open communication. What you see is what you get—no hidden fees or misleading descriptions.
              </p>
            </div>
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Innovation</h3>
              <p className="text-text-secondary">
                We continuously evolve our platform with the latest technology to make your shopping experience faster, safer, and more intuitive.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-text-primary text-center">Why Choose EzCart</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Reason 1 */}
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text-primary">Secure Platform</h3>
              <p className="text-text-secondary">
                With industry-leading authentication and data protection, your personal information and transactions are always secure.
              </p>
            </div>
            
            {/* Reason 2 */}
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text-primary">Lightning Fast</h3>
              <p className="text-text-secondary">
                Our optimized platform ensures quick page loads, smooth navigation, and responsive design for all devices.
              </p>
            </div>
            
            {/* Reason 3 */}
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color transition-colors duration-200">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text-primary">Seamless Experience</h3>
              <p className="text-text-secondary">
                From browsing to checkout, we've designed every step of the shopping journey to be intuitive and hassle-free.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-card-bg p-8 rounded-xl border border-border-color transition-colors duration-200">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-text-primary">Ready to Experience EzCart?</h2>
          <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have made EzCart their go-to online shopping destination.
          </p>
          <Link 
            href="/all-products" 
            className="inline-block bg-[#F8BD19] hover:bg-[#F8BD19]/90 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
          >
            Shop Now
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
} 