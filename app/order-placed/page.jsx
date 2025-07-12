'use client'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import Image from 'next/image'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'

// Create a separate component for the parts that need searchParams
const OrderPlacedContent = () => {
  const { router, getToken } = useAppContext()
  const [message, setMessage] = useState("Order Placed Successfully")
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyAndFixPayment = async () => {
      try {
        // Check if we have an order_id from the URL
        const orderId = searchParams.get('order_id')
        if (orderId) {
          console.log(`Found order_id in URL: ${orderId}`)
          
          // Try to update payment status if needed
          const token = await getToken()
          const response = await axios.post(
            "/api/order/update-payment",
            { orderId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          
          if (response.data.success) {
            console.log("Order payment status verified and updated if needed")
          }
        } else {
          console.log("No order_id found in URL")
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        setMessage("Order placed. Redirecting to your orders...")
      }
    }
    
    // Verify and fix payment status if needed
    verifyAndFixPayment()
    
    // Redirect after delay
    const redirectTimer = setTimeout(() => {
      router.push('/my-orders')
    }, 5000)
    
    // Clean up timeout
    return () => clearTimeout(redirectTimer)
  }, [router, searchParams, getToken])

  return (
    <div className='h-screen flex flex-col justify-center items-center gap-5'>
      <div className="flex justify-center items-center relative">
        <Image className="absolute p-5" src={assets.checkmark} alt='' />
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-300 border-gray-200"></div>
      </div>
      <div className="text-center text-2xl font-semibold">{message}</div>
    </div>
  )
}

// Main component that uses Suspense
const OrderPlaced = () => {
  return (
    <Suspense fallback={
      <div className='h-screen flex flex-col justify-center items-center gap-5'>
        <div className="flex justify-center items-center relative">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-300 border-gray-200"></div>
        </div>
        <div className="text-center text-2xl font-semibold">Loading...</div>
      </div>
    }>
      <OrderPlacedContent />
    </Suspense>
  )
}

export default OrderPlaced