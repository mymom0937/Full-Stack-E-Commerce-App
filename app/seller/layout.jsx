'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import React from 'react'

const Layout = ({ children }) => {
  return (
    <div className="bg-background text-text-primary min-h-screen transition-colors duration-200">
      <Navbar />
      <div className='flex w-full'>
        <Sidebar />
        <div className="flex-1 p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout