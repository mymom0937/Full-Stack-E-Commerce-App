"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import Image from 'next/image';
import { assets } from '@/assets/assets';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      Toast.showSuccess('Your message has been sent successfully!');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 2500);
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-background transition-colors duration-200 pt-20">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-text-primary">Contact Us</h1>
          <p className="max-w-3xl mx-auto text-lg text-text-secondary">
            Have questions or need assistance? We're here to help. Reach out to our team using any of the methods below.
          </p>
        </div>
        
        {/* Hero Image */}
        <div className="mb-16 rounded-xl overflow-hidden shadow-lg max-w-3xl mx-auto">
          <div className="relative" style={{ maxHeight: "400px", overflow: "hidden" }}>
            <Image 
              src={assets.about_hero_image}
              alt="Contact EzCart" 
              className="w-full h-auto object-cover"
              width={900}
              height={400}
              priority
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-text-primary">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-1">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border-color rounded-md focus:ring-blue-500 focus:border-blue-500 bg-background text-text-primary placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-1">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border-color rounded-md focus:ring-blue-500 focus:border-blue-500 bg-background text-text-primary placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Your last name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border-color rounded-md focus:ring-blue-500 focus:border-blue-500 bg-background text-text-primary placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Your email address"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-1">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border-color rounded-md focus:ring-blue-500 focus:border-blue-500 bg-background text-text-primary placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="What is this regarding?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2 border border-border-color rounded-md focus:ring-blue-500 focus:border-blue-500 bg-background text-text-primary placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
          
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-text-primary">Contact Information</h2>
            <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-border-color mb-8 transition-colors duration-200">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-text-primary">Address</h3>
                    <p className="mt-1 text-text-secondary">Addis Ababa, Ethiopia</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-text-primary">Phone</h3>
                    <p className="mt-1 text-text-secondary">+251 (937) 597-917</p>
                    <p className="mt-1 text-text-secondary">Mon-Fri: 9AM - 6PM EST</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-text-primary">Email</h3>
                    <p className="mt-1 text-text-secondary">contact@ezcart.com</p>
                    <p className="mt-1 text-text-secondary">support@ezcart.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* FAQ Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-text-primary">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div className="bg-card-bg p-4 rounded-lg shadow-sm border border-border-color transition-colors duration-200">
                  <h3 className="text-lg font-medium text-text-primary">How long does shipping take?</h3>
                  <p className="mt-2 text-text-secondary">Standard shipping typically takes 3-5 business days. Express shipping options are available at checkout.</p>
                </div>
                
                <div className="bg-card-bg p-4 rounded-lg shadow-sm border border-border-color transition-colors duration-200">
                  <h3 className="text-lg font-medium text-text-primary">What is your return policy?</h3>
                  <p className="mt-2 text-text-secondary">We offer a 30-day return policy on most items. Please check the product page for specific return information.</p>
                </div>
                
                <div className="bg-card-bg p-4 rounded-lg shadow-sm border border-border-color transition-colors duration-200">
                  <h3 className="text-lg font-medium text-text-primary">Do you ship internationally?</h3>
                  <p className="mt-2 text-text-secondary">Yes, we ship to select countries internationally. Shipping costs and delivery times vary by location.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 