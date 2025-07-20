'use client'
import { useState, useEffect, useMemo, Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import Image from "next/image";
import { assets } from "@/assets/assets";
import Breadcrumb from "@/components/Breadcrumb";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";

// Separate component that uses useSearchParams
const ProductsContent = () => {
    const { toggleWishlist, isInWishlist, addToCart } = useAppContext();
    const { products, isLoadingProducts } = useProducts({ refreshInterval: 15000 }); // Auto-refresh every 15 seconds
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortOption, setSortOption] = useState("default");
    const [filterCategory, setFilterCategory] = useState("all");
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [view, setView] = useState("grid"); // grid or list view
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Extract unique categories from products
    const categories = useMemo(() => {
        const categorySet = new Set(products.map(product => product?.category).filter(Boolean));
        return ["all", ...Array.from(categorySet)];
    }, [products]);
    
    // Determine price range for the slider
    const priceRangeValues = useMemo(() => {
        if (products.length === 0) return { min: 0, max: 1000 };
        
        const prices = products
            .filter(Boolean)
            .map(product => product.offerPrice || 0);
        
        return {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices) * 1.1) // Add 10% buffer
        };
    }, [products]);

    // Get search query from URL on initial load
    useEffect(() => {
        const queryParam = searchParams.get('search');
        if (queryParam) {
            setSearchQuery(queryParam);
        }
    }, [searchParams]);
    
    // Filter and sort products
    useEffect(() => {
        if (!products) {
            setFilteredProducts([]);
            return;
        }
        
        let result = [...products].filter(Boolean);
        
        // Apply category filter
        if (filterCategory !== "all") {
            result = result.filter(product => product.category === filterCategory);
        }
        
        // Apply price filter
        result = result.filter(product => 
            product.offerPrice >= priceRange.min && 
            product.offerPrice <= priceRange.max
        );
        
        // Apply search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(product => 
                product.name?.toLowerCase().includes(query) || 
                product.description?.toLowerCase().includes(query) ||
                product.category?.toLowerCase().includes(query)
            );
        }
        
        // Apply sorting
        switch (sortOption) {
            case "price-asc":
                result.sort((a, b) => (a.offerPrice || 0) - (b.offerPrice || 0));
                break;
            case "price-desc":
                result.sort((a, b) => (b.offerPrice || 0) - (a.offerPrice || 0));
                break;
            case "name-asc":
                result.sort((a, b) => a.name?.localeCompare(b.name || ""));
                break;
            case "name-desc":
                result.sort((a, b) => b.name?.localeCompare(a.name || ""));
                break;
            case "newest":
                result.sort((a, b) => (b.date || 0) - (a.date || 0));
                break;
            default:
                // Default sorting (featured)
                result = result;
        }
        
        setFilteredProducts(result);
    }, [products, sortOption, filterCategory, priceRange, searchQuery]);
    
    // Initialize price range on first load
    useEffect(() => {
        if (priceRangeValues.max > 0) {
            setPriceRange(priceRangeValues);
        }
    }, [priceRangeValues]);
    
    const handlePriceChange = (e, type) => {
        const value = parseInt(e.target.value);
        setPriceRange(prev => ({ 
            ...prev, 
            [type]: value 
        }));
    };
    
    const resetFilters = () => {
        setFilterCategory("all");
        setPriceRange(priceRangeValues);
        setSearchQuery("");
        setSortOption("default");
        
        // Remove search query from URL
        const url = new URL(window.location);
        url.searchParams.delete('search');
        router.replace(url.pathname);
    };

    // Handle search form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        
        // Update URL with search query
        const url = new URL(window.location);
        if (searchQuery) {
            url.searchParams.set('search', searchQuery);
        } else {
            url.searchParams.delete('search');
        }
        router.replace(url.pathname + url.search);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background transition-colors duration-200 pt-20">
                {/* Hero Banner */}
                <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
                    <div className="absolute inset-0 opacity-20 bg-center bg-cover" style={{ backgroundImage: 'url(/shop-banner.jpg)' }}></div>
                    <div className="container mx-auto px-6 md:px-16 lg:px-32 relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Shop Our Products</h1>
                        <p className="text-lg md:text-xl max-w-2xl">Discover our curated selection of premium electronics, accessories, and more.</p>
                    </div>
                </div>
                
                <div className="container mx-auto px-6 md:px-16 lg:px-32 py-8">
                    {/* Breadcrumb */}
                    <Breadcrumb currentPage="Shop" />
                    
                    <div className="flex flex-col md:flex-row gap-8 mt-6">
                        {/* Mobile filter toggle */}
                        <div className="md:hidden flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setView("grid")}
                                    className={`p-2 ${view === 'grid' ? 'bg-orange-100 text-orange-500' : 'bg-card-bg text-text-secondary'} rounded`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => setView("list")}
                                    className={`p-2 ${view === 'list' ? 'bg-orange-100 text-orange-500' : 'bg-card-bg text-text-secondary'} rounded`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-background border border-border-color rounded shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filters
                            </button>
                        </div>
                        
                        {/* Sidebar filters */}
                        <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0 bg-card-bg md:sticky md:top-20 md:self-start h-fit rounded-lg shadow-sm transition-colors duration-200`}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-medium text-text-primary">Filters</h2>
                                    <button 
                                        onClick={resetFilters} 
                                        className="text-xs text-orange-500 hover:underline"
                                    >
                                        Reset All
                                    </button>
                                </div>
                                
                                {/* Search */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2 text-text-primary">Search</label>
                                    <form onSubmit={handleSearchSubmit} className="relative">
                                        <input 
                                            type="text" 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search products..."
                                            className="w-full border border-border-color rounded-lg p-2 pl-10 text-sm bg-background text-text-primary"
                                        />
                                        <button 
                                            type="submit"
                                            className="absolute left-3 top-2.5"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                                
                                {/* Categories */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2 text-text-primary">Categories</label>
                                    <div className="space-y-2">
                                        {categories.map((category) => (
                                            <div key={category} className="flex items-center">
                                                <input 
                                                    type="radio"
                                                    id={category}
                                                    name="category"
                                                    checked={filterCategory === category}
                                                    onChange={() => setFilterCategory(category)}
                                                    className="mr-2 accent-orange-500"
                                                />
                                                <label htmlFor={category} className="text-sm capitalize text-text-secondary">
                                                    {category}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Price Range */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2 text-text-primary">Price Range</label>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-text-secondary">
                                            ${priceRange.min}
                                        </span>
                                        <span className="text-xs text-text-secondary">
                                            ${priceRange.max}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-text-secondary">Min</label>
                                            <input
                                                type="number"
                                                min={priceRangeValues.min}
                                                max={priceRange.max}
                                                value={priceRange.min}
                                                onChange={(e) => handlePriceChange(e, "min")}
                                                className="w-full border border-border-color rounded p-2 text-sm bg-background text-text-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-secondary">Max</label>
                                            <input
                                                type="number"
                                                min={priceRange.min}
                                                max={priceRangeValues.max}
                                                value={priceRange.max}
                                                onChange={(e) => handlePriceChange(e, "max")}
                                                className="w-full border border-border-color rounded p-2 text-sm bg-background text-text-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Mobile close button */}
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="w-full py-2 bg-[#F8BD19] text-white rounded md:hidden"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                        
                        {/* Main content */}
                        <div className="flex-1">
                            {/* Sort controls */}
                            <div className="bg-card-bg p-4 rounded-lg shadow-sm mb-6 transition-colors duration-200">
                                <div className="flex flex-wrap justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-text-primary">
                                            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden md:flex items-center gap-2">
                                            <button 
                                                onClick={() => setView("grid")}
                                                className={`p-2 ${view === 'grid' ? 'bg-orange-100 text-orange-500' : 'bg-card-bg text-text-secondary'} rounded`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => setView("list")}
                                                className={`p-2 ${view === 'list' ? 'bg-orange-100 text-orange-500' : 'bg-card-bg text-text-secondary'} rounded`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-text-secondary">Sort by:</span>
                                            <select
                                                value={sortOption}
                                                onChange={(e) => setSortOption(e.target.value)}
                                                className="border border-border-color rounded p-2 text-sm bg-background text-text-primary"
                                            >
                                                <option value="default">Featured</option>
                                                <option value="newest">Newest</option>
                                                <option value="price-asc">Price: Low to High</option>
                                                <option value="price-desc">Price: High to Low</option>
                                                <option value="name-asc">Name: A-Z</option>
                                                <option value="name-desc">Name: Z-A</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Products */}
                            {isLoadingProducts ? (
                                <Loading variant="products" count={8} />
                            ) : filteredProducts.length === 0 ? (
                                <div className="bg-card-bg p-8 rounded-lg shadow-sm text-center transition-colors duration-200">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium mb-2 text-text-primary">No products found</h3>
                                    <p className="text-text-secondary mb-4">Try adjusting your search or filter criteria</p>
                                    <button 
                                        onClick={resetFilters}
                                        className="px-4 py-2 bg-[#F8BD19] text-white rounded hover:bg-[#F8BD19]/90 transition"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            ) : view === "grid" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredProducts.map((product, index) => (
                                        <ProductCard key={product._id || index} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredProducts.map((product, index) => (
                                        <div 
                                            key={product._id || index}
                                            className="bg-card-bg rounded-lg shadow-sm p-4 flex flex-col md:flex-row gap-4 cursor-pointer hover:shadow-md transition"
                                            onClick={() => router.push('/product/' + product._id)}
                                        >
                                            <div className="md:w-48 h-48 md:h-36 relative rounded-md overflow-hidden">
                                                <Image
                                                    src={product.image?.[0] || product.images?.[0] || '/placeholder-image.png'}
                                                    alt={product.name || "Product"}
                                                    fill
                                                    className="object-contain"
                                                />
                                                {product.price && product.offerPrice && product.price > product.offerPrice && (
                                                    <div className="absolute top-2 left-2 bg-[#F8BD19] text-white text-xs px-2 py-1 rounded">
                                                        -{Math.round(((product.price - product.offerPrice) / product.price) * 100)}%
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <h3 className="font-medium text-lg mb-1 text-text-primary">{product.name}</h3>
                                                <p className="text-sm text-text-secondary mb-2">{product.category}</p>
                                                <p className="text-sm text-text-secondary line-clamp-2 mb-2">{product.description}</p>
                                                <div className="flex items-center gap-0.5 mb-2">
                                                    {Array.from({ length: 5 }).map((_, index) => (
                                                        <Image
                                                            key={index}
                                                            className="h-3 w-3"
                                                            src={
                                                                index < Math.floor(4)
                                                                    ? assets.star_icon
                                                                    : assets.star_dull_icon
                                                            }
                                                            alt="star_icon"
                                                        />
                                                    ))}
                                                    <span className="text-xs text-text-secondary ml-1">(4.5)</span>
                                                </div>
                                                <div className="mt-auto flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-lg text-text-primary">${product.offerPrice || 0}</p>
                                                        {product.price > product.offerPrice && (
                                                            <p className="text-sm text-text-secondary line-through">${product.price || 0}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleWishlist(product._id);
                                                            }}
                                                            className="p-2 rounded-full bg-card-bg hover:bg-border-color transition"
                                                        >
                                                            <Image
                                                                className="h-5 w-5"
                                                                src={isInWishlist(product._id) ? '/heart-filled.svg' : assets.heart_icon}
                                                                alt="heart_icon"
                                                                width={20}
                                                                height={20}
                                                            />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addToCart(product._id);
                                                            }}
                                                            className="p-2 rounded-full bg-[#F8BD19] text-white hover:bg-[#F8BD19]/90 transition"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Pagination placeholder */}
                            {filteredProducts.length > 0 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex items-center gap-1">
                                        <button className="px-3 py-1 border rounded bg-card-bg text-text-secondary">
                                            &laquo;
                                        </button>
                                        <button className="px-3 py-1 border rounded bg-[#F8BD19] text-white">
                                            1
                                        </button>
                                        <button className="px-3 py-1 border rounded bg-card-bg text-text-secondary">
                                            2
                                        </button>
                                        <button className="px-3 py-1 border rounded bg-card-bg text-text-secondary">
                                            3
                                        </button>
                                        <button className="px-3 py-1 border rounded bg-card-bg text-text-secondary">
                                            &raquo;
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

// Main component wrapped with Suspense
const AllProducts = () => {
    return (
        <Suspense fallback={<Loading />}>
            <ProductsContent />
        </Suspense>
    );
};

export default AllProducts;
