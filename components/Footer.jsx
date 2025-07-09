import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 md:px-16 lg:px-32 py-12">
          {/* Column 1: About */}
          <div>
            <Link href="/">
              <Image className="w-28 md:w-32 mb-4" src={assets.logo} alt="QuickCart" />
            </Link>
            <p className="text-sm text-gray-600 mb-4">
              Your one-stop destination for quality electronics, accessories, and more. Shop with confidence and enjoy a seamless experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-gray-500">
                <Image src={assets.facebook_icon} alt="Facebook" width={20} height={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-gray-500">
                <Image src={assets.twitter_icon} alt="Twitter" width={20} height={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-gray-500">
                <Image src={assets.instagram_icon} alt="Instagram" width={20} height={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-orange-500 transition">Home</Link>
              </li>
              <li>
                <Link href="/all-products" className="text-gray-600 hover:text-orange-500 transition">Shop</Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-gray-600 hover:text-orange-500 transition">Wishlist</Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-600 hover:text-orange-500 transition">Cart</Link>
              </li>
              <li>
                <Link href="/my-orders" className="text-gray-600 hover:text-orange-500 transition">My Orders</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-orange-500 transition">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-orange-500 transition">Contact Us</Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-orange-500 transition">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-orange-500 transition">Terms & Conditions</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-orange-500 transition">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-600">123 Commerce Street, San Francisco, CA 94103</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-600">+1 (234) 567-890</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">contact@quickcart.com</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">Mon-Fri: 9AM - 6PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Payment Methods */}
        <div className="px-6 md:px-16 lg:px-32 py-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © {currentYear} QuickCart. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Payment Methods:</span>
              <div className="flex gap-2">
                <div className="w-8 h-5 bg-gray-800 rounded"></div>
                <div className="w-8 h-5 bg-blue-600 rounded"></div>
                <div className="w-8 h-5 bg-red-500 rounded"></div>
                <div className="w-8 h-5 bg-yellow-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;