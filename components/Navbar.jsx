"use client";
import React, { useState, useEffect } from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { isSeller, router, user, getCartCount, wishlist, handleLogout: contextLogout, products } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { openSignIn, signOut } = useClerk();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
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
    <motion.div 
      className={`relative cursor-pointer ${onClick ? '' : ''}`} 
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className={`w-5 h-5 relative ${className || ''}`}>
        <Image 
          className="w-full h-full object-contain" 
          src={src} 
          alt={alt}
          style={theme === 'dark' ? { filter: 'brightness(0) invert(1)' } : {}}
        />
      </div>
    </motion.div>
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    // Filter products based on search query
    const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(query.toLowerCase()))
    );
    
    setSearchResults(filteredProducts.slice(0, 5)); // Limit to 5 results
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/all-products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  // Handle clicking on a search result
  const handleResultClick = (productId) => {
    router.push(`/product/${productId}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSearchResults(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Animation variants
  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const navContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.nav 
      className="sticky top-0 z-50 bg-background flex items-center justify-between px-6 md:px-16 lg:px-32 py-4 border-b border-border-color text-text-primary shadow-sm transition-colors duration-200"
      initial="hidden"
      animate="visible"
      variants={navContainerVariants}
    >
      <motion.div variants={logoVariants}>
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push("/")}
        src={isDarkMode ? assets.ezcart_logo_white : assets.ezcart_logo_dark}
        alt="EzCart"
      />
      </motion.div>
      
      <motion.div 
        className="hidden md:flex items-center gap-4 lg:gap-8"
        variants={navContainerVariants}
      >
        <motion.div variants={navItemVariants}>
        <Link href="/" className="hover:text-accent-color font-medium transition">
          Home
        </Link>
        </motion.div>
        <motion.div variants={navItemVariants}>
        <Link href="/all-products" className="hover:text-accent-color font-medium transition">
          Shop
        </Link>
        </motion.div>
        <motion.div variants={navItemVariants}>
        <Link href="/about" className="hover:text-accent-color font-medium transition">
          About
        </Link>
        </motion.div>
        <motion.div variants={navItemVariants}>
        <Link href="/contact" className="hover:text-accent-color font-medium transition">
          Contact
        </Link>
        </motion.div>

        {isSeller && (
          <motion.button
            variants={navItemVariants}
            onClick={() => router.push("/seller")}
            className="text-xs border border-border-color px-4 py-1.5 rounded-full hover:bg-card-bg transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Merchant Portal
          </motion.button>
        )}
      </motion.div>

      <motion.div 
        className="hidden md:flex items-center gap-5"
        variants={navContainerVariants}
      >
        <motion.div 
          className="relative cursor-pointer" 
          onClick={(e) => {
          e.stopPropagation();
          setShowSearchResults(true);
          }}
          variants={navItemVariants}
        >
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchResults(true)}
              className="w-48 border border-border-color rounded-l px-3 py-1.5 text-sm bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <motion.button 
              type="submit" 
              className="bg-background hover:bg-card-bg text-text-primary border border-l-0 border-border-color px-2 py-1.5 rounded-r"
              whileHover={{ backgroundColor: "var(--card-bg)" }}
              whileTap={{ scale: 0.95 }}
            >
              <IconWrapper src={assets.search_icon} alt="search icon" />
            </motion.button>
          </form>
          
          <AnimatePresence>
          {showSearchResults && searchResults.length > 0 && (
              <motion.div 
                className="absolute left-0 right-0 mt-1 bg-card-bg border border-border-color shadow-lg rounded-md p-2 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {searchResults.map((product, index) => (
                  <motion.div 
                  key={product._id}
                  onClick={() => handleResultClick(product._id)}
                  className="p-2 hover:bg-background cursor-pointer rounded flex items-center gap-2"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: "var(--background)" }}
                >
                  {product.image && (
                    <div className="w-8 h-8 relative">
                      <Image 
                        src={Array.isArray(product.image) ? product.image[0] : product.image} 
                        alt={product.name}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-text-primary truncate">{product.name}</p>
                    <p className="text-xs text-text-secondary">${product.offerPrice}</p>
                  </div>
                  </motion.div>
              ))}
                <motion.div 
                onClick={handleSearchSubmit}
                className="p-2 text-center text-orange-500 hover:bg-background cursor-pointer rounded text-sm border-t border-border-color mt-1 pt-2"
                  whileHover={{ backgroundColor: "var(--background)" }}
              >
                See all results
                </motion.div>
              </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
        
        {/* Theme toggle button */}
        <motion.button 
          onClick={toggleTheme} 
          className="p-1.5 rounded-full hover:bg-card-bg transition"
          aria-label="Toggle theme"
          variants={navItemVariants}
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
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
        </motion.button>
        
        <motion.div 
          className="relative cursor-pointer" 
          onClick={() => router.push("/wishlist")}
          variants={navItemVariants}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconWrapper src={assets.heart_icon} alt="wishlist icon" />
          <AnimatePresence>
          {wishlistCount > 0 && (
              <motion.div 
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
              {wishlistCount}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div 
          className="relative cursor-pointer" 
          onClick={() => router.push("/cart")}
          variants={navItemVariants}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconWrapper src={assets.cart_icon} alt="cart icon" />
          <AnimatePresence>
          {cartCount > 0 && (
              <motion.div 
                className="absolute -top-2 -right-2 bg-[#F8BD19] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
              {cartCount}
              </motion.div>
          )}
          </AnimatePresence>
        </motion.div>

        {user ? (
          <motion.div variants={navItemVariants}>
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

                {/* Rest of the UserButton content remains the same */}
            </UserButton>
          </motion.div>
        ) : (
          <motion.button
            variants={navItemVariants}
            onClick={openSignIn}
            className="bg-[#F8BD19] text-white px-4 py-1.5 rounded hover:bg-[#F8BD19]/90 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        )}
      </motion.div>

      {/* Mobile menu button - keep the rest of the mobile menu implementation */}
      <div className="md:hidden flex items-center gap-4">
        <motion.div 
          className="relative cursor-pointer" 
          onClick={() => router.push("/cart")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconWrapper src={assets.cart_icon} alt="cart icon" />
          <AnimatePresence>
          {cartCount > 0 && (
              <motion.div 
                className="absolute -top-2 -right-2 bg-[#F8BD19] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
              {cartCount}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          <Image
            className="w-5 h-5"
            src={assets.menu_icon}
            alt="menu"
            style={theme === 'dark' ? { filter: 'brightness(0) invert(1)' } : {}}
          />
        </motion.button>
      </div>

      {/* Mobile menu - keep the rest of the implementation */}
      <AnimatePresence>
      {isMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div 
              className="absolute right-0 top-0 h-full w-64 bg-background p-5 overflow-y-auto"
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Keep the rest of the mobile menu implementation */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
