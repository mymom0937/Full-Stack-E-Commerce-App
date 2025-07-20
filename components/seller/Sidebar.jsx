import React from 'react';
import Link from 'next/link';
import { assets } from '../../assets/assets';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const SideBar = () => {
    const pathname = usePathname();
    const { theme } = useTheme();
    const menuItems = [
        { name: 'Add Product', path: '/seller', icon: assets.add_icon },
        { name: 'Product List', path: '/seller/product-list', icon: assets.product_list_icon },
        { name: 'Orders', path: '/seller/orders', icon: assets.order_icon },
    ];

    return (
        <div className='md:w-64 w-16 border-r h-[calc(100vh-4rem)] text-base border-border-color bg-background text-text-primary py-2 flex flex-col transition-colors duration-200 fixed top-16 left-0'>
            {menuItems.map((item) => {

                const isActive = pathname === item.path;

                return (
                    <Link href={item.path} key={item.name} passHref>
                        <div
                            className={
                                `flex items-center py-3 md:pl-12 pl-8 pr-4 gap-5 ${isActive
                                    ? "border-r-4 md:border-r-[6px] bg-orange-600/10 border-orange-500/90"
                                    : "hover:bg-card-bg border-background transition-colors duration-200"
                                }`
                            }
                        >
                            <div className="relative w-7 h-7">
                            <Image
                                src={item.icon}
                                alt={`${item.name.toLowerCase()}_icon`}
                                    className="w-full h-full object-contain"
                                    style={theme === 'dark' ? { filter: 'brightness(0) invert(1)' } : {}}
                            />
                            </div>
                            <p className='md:block hidden text-center font-medium'>{item.name}</p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default SideBar;
