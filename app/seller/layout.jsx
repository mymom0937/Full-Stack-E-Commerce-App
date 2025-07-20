'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import Footer from '@/components/seller/Footer'
import React from 'react'

const Layout = ({ children }) => {
  return (
    <div className="bg-background text-text-primary min-h-screen transition-colors duration-200">
      <Navbar />
      <div className='flex w-full pt-16'>
        <Sidebar />
        <div className="flex-1 p-4 flex flex-col min-h-[calc(100vh-4rem)] md:ml-64 ml-16">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default Layout