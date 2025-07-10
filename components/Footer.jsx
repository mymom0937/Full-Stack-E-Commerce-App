import React from 'react';
import { assets } from '@/assets/assets';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { useAppContext } from '@/context/AppContext';

const Footer = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { router } = useAppContext();
  
  return (
    <footer className="bg-card-bg py-4 border-t border-border-color transition-colors duration-200">
      <div className="container mx-auto px-4 md:px-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image 
            src={isDarkMode ? assets.ezcart_logo_white : assets.ezcart_logo_dark}
            alt="EzCart"
            width={120}
            height={40}
            className="h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/')}
          />
        </div>

        {/* Bottom section with social links */}
        <div className="text-center sm:flex items-center justify-between border-t border-border-color mx-[10%] py-4">
          <p className="text-text-secondary text-md">
            © {new Date().getFullYear()}, EzCart. All rights reserved.
          </p>
          <ul className="flex items-center gap-3 justify-center mt-4 sm:mt-0">
            <li>
              <a
                target="_blank"
                href="https://www.linkedin.com/in/seid-endris-dev/"
                rel="noopener noreferrer"
              >
                <Image
                  src={isDarkMode ? assets.linkedin_dark : assets.linkedin_light}
                  alt="LinkedIn"
                  width={24}
                  height={24}
                  className="w-6 cursor-pointer hover:-translate-y-1 duration-500 rounded-sm"
                />
              </a>
            </li>
            <li>
              <a 
                target="_blank" 
                href="https://wa.me/251937597917"
                rel="noopener noreferrer"
              >
                <Image
                  src={isDarkMode ? assets.whatsapp_dark : assets.whatsapp_light}
                  alt="WhatsApp"
                  width={24}
                  height={24}
                  className="w-6 cursor-pointer hover:-translate-y-1 duration-500 rounded-sm"
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;