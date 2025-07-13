import React from 'react'
import { assets } from '../../assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import { useTheme } from '@/context/ThemeContext'
import { useClerk } from '@clerk/nextjs'
import toast from 'react-hot-toast'

const Navbar = () => {
  const { router, handleLogout: contextLogout } = useAppContext()
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'
  const { signOut } = useClerk()

  const handleLogout = async () => {
    try {
      // First sign out from Clerk
      await signOut()
      
      // Also call the context's handleLogout to clear app state
      contextLogout()
      
      // Show success message and redirect
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout. Please try again.')
    }
  }

  return (
    <div className='sticky top-0 z-50 flex items-center px-6 md:px-16 lg:px-32 py-4 justify-between border-b border-border-color bg-background text-text-primary shadow-sm transition-colors duration-200'>
      <div className="flex items-center">
        <Image 
          onClick={()=>router.push('/')} 
          className='w-28 md:w-32 cursor-pointer' 
          src={isDarkMode ? assets.ezcart_logo_white : assets.ezcart_logo_dark} 
          alt="EzCart" 
        />
      </div>
      
      <div className="flex items-center gap-3">
        {/* Theme toggle button */}
        <button 
          onClick={toggleTheme} 
          className="p-1.5 rounded-full hover:bg-card-bg transition-colors duration-200"
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
      
        <button 
          onClick={handleLogout}
          className='bg-[#F8BD19] hover:bg-[#F8BD19]/80 transition-colors text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar