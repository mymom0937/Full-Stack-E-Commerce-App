'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

/**
 * Breadcrumb component for consistent navigation
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of breadcrumb items with label and path
 * @param {String} props.currentPage - Current page label (last item in breadcrumb)
 * @param {String} props.className - Additional CSS class names
 */
const Breadcrumb = ({ items = [], currentPage, className = '' }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Skip Home link for cart, my-orders, order-details, all-products, and product detail pages
  const skipHome = pathname === '/cart' || 
                   pathname === '/my-orders' || 
                   pathname === '/all-products' ||
                   pathname === '/wishlist' ||
                   pathname.includes('/order-details/') ||
                   pathname.includes('/product/');
  
  // Build breadcrumb items array
  const breadcrumbItems = skipHome 
    ? [...items] 
    : [{ label: 'Home', path: '/' }, ...items];
  
  if (currentPage) {
    breadcrumbItems.push({ label: currentPage, path: null });
  }

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm my-4 ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-text-secondary">/</span>}
          
          {item.path ? (
            <Link 
              href={item.path}
              className="text-text-secondary hover:text-accent-color transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb; 