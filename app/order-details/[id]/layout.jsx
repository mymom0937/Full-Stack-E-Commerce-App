"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import SellerNavbar from "@/components/seller/Navbar";
import SellerSidebar from "@/components/seller/Sidebar";
import SellerFooter from "@/components/seller/Footer";

export default function OrderDetailsLayout({ children }) {
  const { user } = useAppContext();
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    if (user && user.role === "seller") {
      setIsSeller(true);
    } else {
      setIsSeller(false);
    }
  }, [user]);

  if (isSeller) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
        <SellerSidebar />
        <div className="flex-1 flex flex-col">
          <SellerNavbar />
          <main className="flex-1">{children}</main>
          <SellerFooter />
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 