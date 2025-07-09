'use client'
import { useState, useEffect, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import Image from "next/image";
import { assets } from "@/assets/assets";
import Breadcrumb from "@/components/Breadcrumb";

const AllProducts = () => {
    const { products, isLoading } = useAppContext();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortOption, setSortOption] = useState("default");
    const [filterCategory, setFilterCategory] = useState("all");
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
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
            default:
                // Default sorting (newest first)
                result.sort((a, b) => (b.date || 0) - (a.date || 0));
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
    };
    
    return (
        <>
            <Navbar />
            <div className="flex flex-col md:flex-row gap-6 px-6 md:px-16 lg:px-32 py-8">
                {/* Breadcrumb */}
                <div className="w-full mb-4">
                    <Breadcrumb currentPage="Shop" />
                </div>

                {/* Mobile filter toggle */}
                <div className="md:hidden flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-medium">Products</h1>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded"
                    >
                        <Image src={assets.menu_icon} alt="Filter" width={16} height={16} />
                        Filters
                    </button>
                </div>
                
                {/* Sidebar filters */}
                <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0 bg-white md:sticky md:top-20 md:self-start h-fit`}>
                    <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-medium">Filters</h2>
                            <button 
                                onClick={resetFilters} 
                                className="text-xs text-orange-500 hover:underline"
                            >
                                Reset All
                            </button>
                        </div>
                        
                        {/* Search */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Search</label>
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full border rounded p-2 text-sm"
                            />
                        </div>
                        
                        {/* Categories */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Categories</label>
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
                                        <label htmlFor={category} className="text-sm capitalize">
                                            {category}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Price Range */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Price Range</label>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs">
                                    ${priceRange.min}
                                </span>
                                <span className="text-xs">
                                    ${priceRange.max}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs">Min</label>
                                    <input
                                        type="number"
                                        min={priceRangeValues.min}
                                        max={priceRange.max}
                                        value={priceRange.min}
                                        onChange={(e) => handlePriceChange(e, "min")}
                                        className="w-full border rounded p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs">Max</label>
                                    <input
                                        type="number"
                                        min={priceRange.min}
                                        max={priceRangeValues.max}
                                        value={priceRange.max}
                                        onChange={(e) => handlePriceChange(e, "max")}
                                        className="w-full border rounded p-2 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Mobile close button */}
                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="w-full py-2 bg-orange-500 text-white rounded md:hidden"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
                
                {/* Main content */}
                <div className="flex-1">
                    {/* Sort controls */}
                    <div className="flex flex-wrap justify-between items-center mb-6">
                        <h1 className="text-2xl font-medium hidden md:block">Products</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Sort by:</span>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="border rounded p-2 text-sm"
                            >
                                <option value="default">Featured</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Name: A-Z</option>
                                <option value="name-desc">Name: Z-A</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Products grid */}
                    {isLoading ? (
                        <Loading variant="products" count={10} />
                    ) : (
                        <>
                            {filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                                    {filteredProducts.map((product, index) => (
                                        <ProductCard key={product._id || index} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
                                    <p className="text-xl text-gray-500 mb-4">No products found</p>
                                    <button 
                                        onClick={resetFilters} 
                                        className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                            
                            <div className="flex justify-between items-center mt-6">
                                <p className="text-sm text-gray-500">
                                    Showing {filteredProducts.length} of {products.filter(Boolean).length} products
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AllProducts;
