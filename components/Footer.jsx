import React from 'react';
import { assets } from '@/assets/assets';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 pt-16 pb-12 border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <Image className="w-28 md:w-32 mb-4" src={assets.logo} alt="EzCart" />
            <p className="text-gray-500 mb-4">
              EzCart offers a modern shopping experience with quality products at competitive prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Image src={assets.facebook_icon} alt="Facebook" width={24} height={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Image src={assets.twitter_icon} alt="Twitter" width={24} height={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Image src={assets.instagram_icon} alt="Instagram" width={24} height={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <div className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-600 hover:text-gray-800 transition">
                Home
              </Link>
              <Link href="/all-products" className="text-gray-600 hover:text-gray-800 transition">
                Shop
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-800 transition">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-800 transition">
                Contact
              </Link>
              <Link href="/wishlist" className="text-gray-600 hover:text-gray-800 transition">
                Wishlist
              </Link>
            </div>
          </div>

          {/* Account & Service */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
              Account
            </h3>
            <div className="flex flex-col space-y-3">
              <Link href="/cart" className="text-gray-600 hover:text-gray-800 transition">
                My Cart
              </Link>
              <Link href="/my-orders" className="text-gray-600 hover:text-gray-800 transition">
                Order History
              </Link>
              <Link href="/add-address" className="text-gray-600 hover:text-gray-800 transition">
                Manage Addresses
              </Link>
              <Link href="/seller" className="text-gray-600 hover:text-gray-800 transition">
                Seller Dashboard
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <div className="flex flex-col space-y-3">
              <p className="text-gray-600">123 Commerce Street</p>
              <p className="text-gray-600">New York, NY 10001</p>
              <p className="text-gray-600">+1 (555) 123-4567</p>
              <span className="text-gray-600">contact@ezcart.com</span>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            © {currentYear} EzCart. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-gray-600 hover:text-gray-800 text-sm">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-800 text-sm">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-800 text-sm">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;