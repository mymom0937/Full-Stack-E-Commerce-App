'use client';

import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import toast from 'react-hot-toast';

const OrderPlaced = () => {
  const { router } = useAppContext();

  useEffect(() => {
    const updatePaymentStatus = async () => {
      try {
        // Check if this is a return from Stripe payment
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (sessionId) {
          // Mark the order as paid using the session ID
          const { data } = await axios.post('/api/order/mark-paid', { sessionId });
          
          if (data.success) {
            toast.success('Payment confirmed successfully!');
          }
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    };

    updatePaymentStatus();
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="mb-6">
          <Image
            src={assets.checkmark}
            alt="Order Placed"
            width={100}
            height={100}
            className="mx-auto"
          />
        </div>
        <h1 className="text-3xl font-semibold mb-4 text-text-primary">Order Placed Successfully!</h1>
        <p className="text-lg text-text-secondary mb-8 max-w-lg">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <Link href="/my-orders">
            <button className="px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700">
              View My Orders
            </button>
          </Link>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderPlaced;