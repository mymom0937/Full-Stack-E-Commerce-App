'use client';

import { useState, useEffect } from 'react';
import { assets } from '@/assets/assets';

// Map of category names to their corresponding images
const categoryImages = {
  'Headphones': assets.header_headphone_image,
  'Earphones': assets.apple_earphone_image,
  'Smartwatch': assets.Apple_watch_ultra2,
  'Smartphone': assets.Samsung_Galaxy_S24_Ultra,
  'Laptop': assets.macbook_image,
  'Camera': assets.cannon_camera_image,
  'Accessories': assets.Sony_WF_1000XM5,
  // Fallbacks for variations in naming
  'Headphone': assets.header_headphone_image,
  'Earphone': assets.apple_earphone_image,
  'Smartwatches': assets.Apple_watch_ultra2,
  'Smartphones': assets.Samsung_Galaxy_S24_Ultra,
  'Laptops': assets.macbook_image,
  'Cameras': assets.cannon_camera_image,
  'Accessory': assets.Sony_WF_1000XM5,
};

// Default fallback image
const defaultImage = assets.upload_area;

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/product/categories');
        const data = await response.json();

        if (data.success) {
          // Map categories to include images
          const categoriesWithImages = data.categories.map(cat => ({
            ...cat,
            image: categoryImages[cat.category] || defaultImage,
            // Create URL-friendly link
            link: `/all-products?category=${encodeURIComponent(cat.category.toLowerCase())}`
          }));
          
          setCategories(categoriesWithImages);
        } else {
          setError(data.message || 'Failed to fetch categories');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
} 