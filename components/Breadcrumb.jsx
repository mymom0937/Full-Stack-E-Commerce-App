'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
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
  
  // Build breadcrumb items array
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    ...items,
  ];
  
  if (currentPage) {
    breadcrumbItems.push({ label: currentPage, path: null });
  }

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm my-4 ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">/</span>}
          
          {item.path ? (
            <Link 
              href={item.path}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb; 