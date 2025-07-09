import React from 'react';
import { assets } from '@/assets/assets';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  
  // Icon wrapper component with dark mode support
  const SocialIcon = ({ src, alt }) => (
    <div className="relative w-6 h-6">
      <Image 
        src={src} 
        alt={alt} 
        width={24} 
        height={24}
        className="w-full h-full object-contain"
        style={theme === 'dark' ? { filter: 'brightness(0) invert(1)' } : {}}
      />
    </div>
  );
  
  return (
    <footer className="bg-card-bg pt-16 pb-12 border-t border-border-color transition-colors duration-200">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <Image className="w-28 md:w-32 mb-4" src={assets.logo} alt="EzCart" />
            <p className="text-text-secondary mb-4">
              EzCart offers a modern shopping experience with quality products at competitive prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-text-secondary hover:text-accent-color transition">
                <SocialIcon src={assets.facebook_icon} alt="Facebook" />
              </a>
              <a href="#" className="text-text-secondary hover:text-accent-color transition">
                <SocialIcon src={assets.twitter_icon} alt="Twitter" />
              </a>
              <a href="#" className="text-text-secondary hover:text-accent-color transition">
                <SocialIcon src={assets.instagram_icon} alt="Instagram" />
              </a>
            </div>
        </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <div className="flex flex-col space-y-3">
              <Link href="/" className="text-text-secondary hover:text-accent-color transition">
                Home
              </Link>
              <Link href="/all-products" className="text-text-secondary hover:text-accent-color transition">
                Shop
              </Link>
              <Link href="/about" className="text-text-secondary hover:text-accent-color transition">
                About Us
              </Link>
              <Link href="/contact" className="text-text-secondary hover:text-accent-color transition">
                Contact
              </Link>
              <Link href="/wishlist" className="text-text-secondary hover:text-accent-color transition">
                Wishlist
              </Link>
            </div>
          </div>

          {/* Account & Service */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Account
            </h3>
            <div className="flex flex-col space-y-3">
              <Link href="/cart" className="text-text-secondary hover:text-accent-color transition">
                My Cart
              </Link>
              <Link href="/my-orders" className="text-text-secondary hover:text-accent-color transition">
                Order History
              </Link>
              <Link href="/add-address" className="text-text-secondary hover:text-accent-color transition">
                Manage Addresses
              </Link>
              <Link href="/seller" className="text-text-secondary hover:text-accent-color transition">
                Seller Dashboard
              </Link>
          </div>
        </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <div className="flex flex-col space-y-3">
              <p className="text-text-secondary">123 Commerce Street</p>
              <p className="text-text-secondary">New York, NY 10001</p>
              <p className="text-text-secondary">+1 (555) 123-4567</p>
              <span className="text-text-secondary">contact@ezcart.com</span>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border-color pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-secondary text-sm mb-4 md:mb-0">
            © {currentYear} EzCart. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-text-secondary hover:text-accent-color text-sm transition">
              Privacy Policy
            </Link>
            <Link href="#" className="text-text-secondary hover:text-accent-color text-sm transition">
              Terms of Service
            </Link>
            <Link href="#" className="text-text-secondary hover:text-accent-color text-sm transition">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;