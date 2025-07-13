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
    <div 
      className={`relative cursor-pointer ${onClick ? '' : ''}`} 
      onClick={onClick}
    >
      <div className={`w-5 h-5 relative ${className || ''}`}>
        <Image 
          className="w-full h-full object-contain" 
          src={src} 
          alt={alt}
          style={theme === 'dark' ? { filter: 'brightness(0) invert(1)' } : {}}
        />
      </div>
    </div>
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

  return (
    <nav className="sticky top-0 z-50 bg-background flex items-center justify-between px-6 md:px-16 lg:px-32 py-4 border-b border-border-color text-text-primary shadow-sm transition-colors duration-200">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push("/")}
        src={isDarkMode ? assets.ezcart_logo_white : assets.ezcart_logo_dark}
        alt="EzCart"
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
        <div className="relative cursor-pointer" onClick={(e) => {
          e.stopPropagation();
          setShowSearchResults(true);
        }}>
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchResults(true)}
              className="w-48 border border-border-color rounded-l px-3 py-1.5 text-sm bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button 
              type="submit" 
              className="bg-background hover:bg-card-bg text-text-primary border border-l-0 border-border-color px-2 py-1.5 rounded-r"
            >
              <IconWrapper src={assets.search_icon} alt="search icon" />
            </button>
          </form>
          
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-card-bg border border-border-color shadow-lg rounded-md p-2 z-50">
              {searchResults.map(product => (
                <div 
                  key={product._id}
                  onClick={() => handleResultClick(product._id)}
                  className="p-2 hover:bg-background cursor-pointer rounded flex items-center gap-2"
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
                </div>
              ))}
              <div 
                onClick={handleSearchSubmit}
                className="p-2 text-center text-orange-500 hover:bg-background cursor-pointer rounded text-sm border-t border-border-color mt-1 pt-2"
              >
                See all results
              </div>
            </div>
          )}
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
            <div className="absolute -top-2 -right-2 bg-[#F8BD19] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                labelIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.69C2 5.6 4.49 3.1 7.56 3.1C9.38 3.1 10.99 3.98 12 5.34C13.01 3.98 14.63 3.1 16.44 3.1C19.51 3.1 22 5.6 22 8.69C22 15.69 15.52 19.82 12.62 20.81Z" 
                    stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
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
        {/* Mobile search */}
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowSearchResults(!showSearchResults);
            }}
            className="p-1 rounded-full hover:bg-card-bg transition"
          >
            <IconWrapper src={assets.search_icon} alt="search icon" />
          </button>
          
          {showSearchResults && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-card-bg border border-border-color shadow-lg rounded-md p-2 z-50">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full border border-border-color rounded-l px-3 py-1.5 text-sm bg-background text-text-primary focus:outline-none"
                />
                <button 
                  type="submit" 
                  className="bg-background hover:bg-card-bg text-text-primary border border-l-0 border-border-color px-2 py-1.5 rounded-r"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </button>
              </form>
              
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto">
                  {searchResults.map(product => (
                    <div 
                      key={product._id}
                      onClick={() => handleResultClick(product._id)}
                      className="p-2 hover:bg-background cursor-pointer rounded flex items-center gap-2"
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
                    </div>
                  ))}
                  <div 
                    onClick={handleSearchSubmit}
                    className="p-2 text-center text-orange-500 hover:bg-background cursor-pointer rounded text-sm border-t border-border-color mt-1 pt-2"
                  >
                    See all results
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
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
            <div className="absolute -top-2 -right-2 bg-[#F8BD19] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
              <Link href="/" className="hover:text-accent-color transition py-2 border-b border-border-color flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                  <HomeIcon />
                </span>
                Home
              </Link>
              <Link href="/all-products" className="hover:text-accent-color transition py-2 border-b border-border-color flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                  <BoxIcon />
                </span>
                Shop
              </Link>
              <Link href="/wishlist" className="hover:text-accent-color transition py-2 border-b border-border-color flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <IconWrapper src={assets.heart_icon} alt="wishlist icon" />
                Wishlist {wishlistCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{wishlistCount}</span>}
              </Link>
              <Link href="/cart" className="hover:text-accent-color transition py-2 border-b border-border-color flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                  <CartIcon />
                </span>
                Cart {cartCount > 0 && <span className="ml-2 bg-[#F8BD19] text-white text-xs px-1.5 py-0.5 rounded-full">{cartCount}</span>}
              </Link>
              <Link href="/about" className="hover:text-accent-color transition py-2 border-b border-border-color flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
                About Us
              </Link>
              <Link href="/contact" className="hover:text-accent-color transition py-2 border-b border-border-color flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                Contact
              </Link>
              {isSeller && (
                <button
                  onClick={() => {
                    router.push("/seller");
                    setIsMenuOpen(false);
                  }}
                  className="hover:text-accent-color transition py-2 border-b border-border-color text-left flex items-center gap-2"
                >
                  <IconWrapper src={assets.product_list_icon} alt="seller dashboard icon" />
                  Seller Dashboard
                </button>
              )}
              {user && (
                <button
                  onClick={handleMobileLogout}
                  className="hover:text-red-600 transition py-2 border-b border-border-color text-left text-red-600 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
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
