"use client";
import React, { useState } from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const { isSeller, router, user, getCartCount, wishlist } = useAppContext();
  const { openSignIn } = useClerk();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const cartCount = getCartCount();
  const wishlistCount = wishlist?.length || 0;

  return (
    <nav className="sticky top-0 z-50 bg-white flex items-center justify-between px-6 md:px-16 lg:px-32 py-4 border-b border-gray-300 text-gray-700 shadow-sm">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push("/")}
        src={assets.logo}
        alt="logo"
      />
      
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        <Link href="/" className="hover:text-gray-900 font-medium transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 font-medium transition">
          Shop
        </Link>
        <Link href="/about" className="hover:text-gray-900 font-medium transition">
          About Us
        </Link>
        <Link href="/contact" className="hover:text-gray-900 font-medium transition">
          Contact
        </Link>

        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border px-4 py-1.5 rounded-full hover:bg-gray-50 transition"
          >
            Seller Dashboard
          </button>
        )}
      </div>

      <div className="hidden md:flex items-center gap-5">
        <div className="relative cursor-pointer group">
          <Image className="w-5 h-5" src={assets.search_icon} alt="search icon" />
          <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md p-2 hidden group-hover:block">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border rounded px-3 py-1.5 text-sm"
            />
          </div>
        </div>
        
        <div className="relative cursor-pointer" onClick={() => router.push("/wishlist")}>
          <Image className="w-5 h-5" src={assets.heart_icon} alt="wishlist icon" />
          {wishlistCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {wishlistCount}
            </div>
          )}
        </div>
        
        <div className="relative cursor-pointer" onClick={() => router.push("/cart")}>
          <Image className="w-5 h-5" src={assets.cart_icon} alt="cart icon" />
          {cartCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </div>
          )}
        </div>

        {user ? (
          <UserButton>
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
                labelIcon={<Image src={assets.heart_icon} alt="wishlist" width={16} height={16} />}
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
          </UserButton>
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Image src={assets.user_icon} alt="user icon" />
            <span>Account</span>
          </button>
        )}
      </div>

      {/* Mobile navigation */}
      <div className="flex items-center gap-4 md:hidden">
        <div className="relative cursor-pointer" onClick={() => router.push("/wishlist")}>
          <Image className="w-5 h-5" src={assets.heart_icon} alt="wishlist icon" />
          {wishlistCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {wishlistCount}
            </div>
          )}
        </div>
        
        <div className="relative cursor-pointer" onClick={() => router.push("/cart")}>
          <Image className="w-5 h-5" src={assets.cart_icon} alt="cart icon" />
          {cartCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </div>
          )}
        </div>

        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Image src={assets.user_icon} alt="user icon" />
          </button>
        )}
        
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Image className="w-6 h-6" src={assets.menu_icon} alt="menu icon" />
        </button>
      </div>

      {/* Mobile menu drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute right-0 top-0 h-full w-64 bg-white p-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)} className="text-2xl">&times;</button>
            </div>
            <div className="flex flex-col gap-4">
              <Link href="/" className="hover:text-gray-900 transition py-2 border-b" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/all-products" className="hover:text-gray-900 transition py-2 border-b" onClick={() => setIsMenuOpen(false)}>
                Shop
              </Link>
              <Link href="/wishlist" className="hover:text-gray-900 transition py-2 border-b" onClick={() => setIsMenuOpen(false)}>
                Wishlist {wishlistCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{wishlistCount}</span>}
              </Link>
              <Link href="/cart" className="hover:text-gray-900 transition py-2 border-b" onClick={() => setIsMenuOpen(false)}>
                Cart {cartCount > 0 && <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{cartCount}</span>}
              </Link>
              <Link href="/about" className="hover:text-gray-900 transition py-2 border-b" onClick={() => setIsMenuOpen(false)}>
                About Us
              </Link>
              <Link href="/contact" className="hover:text-gray-900 transition py-2 border-b" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              {isSeller && (
                <button
                  onClick={() => {
                    router.push("/seller");
                    setIsMenuOpen(false);
                  }}
                  className="text-sm border px-4 py-2 rounded hover:bg-gray-50 transition mt-2"
                >
                  Seller Dashboard
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
