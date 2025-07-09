"use client";
import React from 'react';
import toast from 'react-hot-toast';

const Toast = {
  showSuccess: (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#10B981',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
    });
  },
  
  showError: (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#EF4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
    });
  },
  
  showInfo: (message) => {
    toast(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#3B82F6',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
    });
  }
};

export default Toast; 