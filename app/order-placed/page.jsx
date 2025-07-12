'use client'
import { useAppContext } from '@/context/AppContext'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'

// Create a separate component for the parts that need searchParams
const OrderPlacedContent = () => {
  const { router, getToken } = useAppContext()
  const [message, setMessage] = useState("Purchase Complete")
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
            
            // Also trigger an Inngest event for this order
            try {
              await axios.post(
                "/api/order/fix-payments",
                { 
                  orderId,
                  triggerInngest: true 
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              console.log("Triggered Inngest event for the order")
            } catch (inngestError) {
              console.error("Error triggering Inngest event:", inngestError)
            }
          }
        } else {
          console.log("No order_id found in URL")
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        setMessage("Order confirmed. Redirecting...")
      }
    }
    
    // Verify and fix payment status if needed
    verifyAndFixPayment()
    
    // Redirect after delay
    const redirectTimer = setTimeout(() => {
      router.push('/my-orders')
    }, 1000)
    
    // Clean up timeout
    return () => clearTimeout(redirectTimer)
  }, [router, searchParams, getToken])

  return (
    <div className='h-screen flex flex-col justify-center items-center gap-6 bg-background'>
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-green-500 border-opacity-25"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-text-primary mb-1">{message}</h2>
        <p className="text-text-secondary text-sm">Thank you for your order</p>
      </div>
    </div>
  )
}

// Main component that uses Suspense
const OrderPlaced = () => {
  return (
    <Suspense fallback={
      <div className='h-screen flex flex-col justify-center items-center gap-5 bg-background'>
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center text-lg font-medium text-text-primary">Processing...</div>
      </div>
    }>
      <OrderPlacedContent />
    </Suspense>
  )
}

export default OrderPlaced