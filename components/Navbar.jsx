"use client";
import React, { useState, useEffect } from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";
import toast from "react-hot-toast";

const Navbar = () => {
  const { isSeller, router, user, getCartCount, wishlist, handleLogout: contextLogout } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const { openSignIn, signOut } = useClerk();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const cartCount = getCartCount();
  const wishlistCount = wishlist?.length || 0;

  // Custom logout handler that also calls our AppContext's handleLogout
  const handleLogout = () => {
    contextLogout();
    toast.success('Logged out successfully');
  };
  
  // Mobile menu logout handler
  const handleMobileLogout = async () => {
    try {
      await signOut();
      contextLogout();
      toast.success('Logged out successfully');
      setIsMenuOpen(false);
    } catch (error) {
      toast.error('Failed to logout. Please try again.');
    }
  };
  
  // Icon wrapper component with dark mode support
  const IconWrapper = ({ src, alt, onClick, className }) => (
    <div 
      className={`relative cursor-pointer ${onClick ? '' : ''}`} 
      onClick={onClick}
    >
      <div className={`w-5 h-5 relative ${theme === 'dark' ? 'icon-dark-mode' : ''} ${className || ''}`}>
        <Image 
          className="w-full h-full object-contain" 
          src={src} 
          alt={alt}
          style={theme === 'dark' ? { filter: 'brightness(0) invert(1)' } : {}}
        />
      </div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background flex items-center justify-between px-6 md:px-16 lg:px-32 py-4 border-b border-border-color text-text-primary shadow-sm transition-colors duration-200">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push("/")}
        src={assets.logo}
        alt="logo"
      />
      
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        <Link href="/" className="hover:text-accent-color font-medium transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-accent-color font-medium transition">
          Shop
        </Link>
        <Link href="/about" className="hover:text-accent-color font-medium transition">
          About Us
        </Link>
        <Link href="/contact" className="hover:text-accent-color font-medium transition">
          Contact
        </Link>

        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border border-border-color px-4 py-1.5 rounded-full hover:bg-card-bg transition"
          >
            Seller Dashboard
          </button>
        )}
      </div>

      <div className="hidden md:flex items-center gap-5">
        <div className="relative cursor-pointer group">
          <IconWrapper src={assets.search_icon} alt="search icon" />
          <div className="absolute right-0 mt-2 w-64 bg-card-bg shadow-lg rounded-md p-2 hidden group-hover:block">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border border-border-color rounded px-3 py-1.5 text-sm bg-background text-text-primary"
            />
          </div>
        </div>
        
        {/* Theme toggle button */}
        <button 
          onClick={toggleTheme} 
          className="p-1.5 rounded-full hover:bg-card-bg transition"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
        </button>
        
        <div className="relative cursor-pointer" onClick={() => router.push("/wishlist")}>
          <IconWrapper src={assets.heart_icon} alt="wishlist icon" />
          {wishlistCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {wishlistCount}
            </div>
          )}
        </div>
        
        <div className="relative cursor-pointer" onClick={() => router.push("/cart")}>
          <IconWrapper src={assets.cart_icon} alt="cart icon" />
          {cartCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </div>
          )}
        </div>

        {user ? (
          <UserButton afterSignOutUrl="/">
              <UserButton.MenuItems>
                <UserButton.Action
                  label="Home"
                  labelIcon={<HomeIcon />}
                  onClick={() => router.push("/")}
                />
              </UserButton.MenuItems>

              <UserButton.MenuItems>
                <UserButton.Action
                  label="Products"
                  labelIcon={<BoxIcon />}
                  onClick={() => router.push("/all-products")}
                />
              </UserButton.MenuItems>

              <UserButton.MenuItems>
                <UserButton.Action
                label="Wishlist"
                labelIcon={<Image 
                  src={assets.heart_icon} 
                  alt="wishlist" 
                  width={16} 
                  height={16}
                  style={theme === 'dark' ? { filter: 'brightness(0) invert(1)' } : {}}
                />}
                onClick={() => router.push("/wishlist")}
                />
              </UserButton.MenuItems>

              <UserButton.MenuItems>
                <UserButton.Action
                  label="Cart"
                  labelIcon={<CartIcon />}
                  onClick={() => router.push("/cart")}
                />
              </UserButton.MenuItems>

              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Orders"
                  labelIcon={<BagIcon />}
                  onClick={() => router.push("/my-orders")}
                />
              </UserButton.MenuItems>

            <UserButton.MenuItems>
              <UserButton.SignOutButton onSignOut={handleLogout} />
            </UserButton.MenuItems>
            </UserButton>
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 hover:text-accent-color transition"
          >
            <IconWrapper src={assets.user_icon} alt="user icon" />
            <span>Account</span>
          </button>
        )}
      </div>

      {/* Mobile navigation */}
      <div className="flex items-center gap-4 md:hidden">
        {/* Theme toggle button for mobile */}
        <button 
          onClick={toggleTheme} 
          className="p-1 rounded-full hover:bg-card-bg transition"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
        </button>
        
        <div className="relative cursor-pointer" onClick={() => router.push("/wishlist")}>
          <IconWrapper src={assets.heart_icon} alt="wishlist icon" />
          {wishlistCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {wishlistCount}
            </div>
          )}
        </div>
        
        <div className="relative cursor-pointer" onClick={() => router.push("/cart")}>
          <IconWrapper src={assets.cart_icon} alt="cart icon" />
          {cartCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </div>
          )}
        </div>

        {user ? (
          <UserButton afterSignOutUrl="/" onSignOut={handleLogout} />
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 hover:text-accent-color transition"
          >
            <IconWrapper src={assets.user_icon} alt="user icon" />
          </button>
        )}
        
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <IconWrapper src={assets.menu_icon} alt="menu icon" className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile menu drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute right-0 top-0 h-full w-64 bg-background p-5 transition-colors duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)} className="text-2xl">&times;</button>
            </div>
            <div className="flex flex-col gap-4">
              <Link href="/" className="hover:text-accent-color transition py-2 border-b border-border-color" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/all-products" className="hover:text-accent-color transition py-2 border-b border-border-color" onClick={() => setIsMenuOpen(false)}>
                Shop
              </Link>
              <Link href="/wishlist" className="hover:text-accent-color transition py-2 border-b border-border-color" onClick={() => setIsMenuOpen(false)}>
                Wishlist {wishlistCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{wishlistCount}</span>}
              </Link>
              <Link href="/cart" className="hover:text-accent-color transition py-2 border-b border-border-color" onClick={() => setIsMenuOpen(false)}>
                Cart {cartCount > 0 && <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{cartCount}</span>}
              </Link>
              <Link href="/about" className="hover:text-accent-color transition py-2 border-b border-border-color" onClick={() => setIsMenuOpen(false)}>
                About Us
              </Link>
              <Link href="/contact" className="hover:text-accent-color transition py-2 border-b border-border-color" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              {isSeller && (
                <button
                  onClick={() => {
                    router.push("/seller");
                    setIsMenuOpen(false);
                  }}
                  className="hover:text-accent-color transition py-2 border-b border-border-color text-left"
                >
                  Seller Dashboard
                </button>
              )}
              {user && (
                <button
                  onClick={handleMobileLogout}
                  className="hover:text-red-600 transition py-2 border-b border-border-color text-left text-red-600"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
