"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { FiEdit } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";
import { useProducts } from "@/hooks/useProducts";

const ProductList = () => {
  const { router, getToken, user } = useAppContext();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { sellerProducts, isLoadingSellerProducts, refreshSellerProducts } = useProducts({ refreshInterval: 10000 });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    productId: "",
    name: "",
    description: "",
    category: "",
    price: "",
    offerPrice: "",
    existingImages: []
  });
  const [newImages, setNewImages] = useState([]);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle opening edit modal
  const handleEditClick = async (product) => {
    setSelectedProduct(product);
    setEditFormData({
      productId: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      offerPrice: product.offerPrice,
      existingImages: product.images || []
    });
    setNewImages([]);
    setIsEditModalOpen(true);
  };

  // Handle opening delete confirmation modal
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle image selection
  const handleImageChange = (e, index) => {
    if (e.target.files && e.target.files[0]) {
      const updatedImages = [...newImages];
      updatedImages[index] = e.target.files[0];
      setNewImages(updatedImages);
    }
  };

  // Handle removing existing image
  const handleRemoveExistingImage = (indexToRemove) => {
    setEditFormData({
      ...editFormData,
      existingImages: editFormData.existingImages.filter((_, index) => index !== indexToRemove)
    });
  };

  // Submit the edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (
      !editFormData.name ||
      !editFormData.description ||
      !editFormData.price ||
      !editFormData.offerPrice
    ) {
      toast.error("All fields are required");
      return;
    }

    // Validate that at least one image will be available
    if (editFormData.existingImages.length === 0 && !newImages.some(img => img)) {
      toast.error("At least one image is required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const token = await getToken();
      
      const formData = new FormData();
      formData.append("productId", editFormData.productId);
      formData.append("name", editFormData.name);
      formData.append("description", editFormData.description);
      formData.append("category", editFormData.category);
      formData.append("price", editFormData.price);
      formData.append("offerPrice", editFormData.offerPrice);
      formData.append("existingImages", JSON.stringify(editFormData.existingImages));
      
      // Add new images
      newImages.forEach((image) => {
        if (image) {
          formData.append("newImages", image);
        }
      });
      
      const { data } = await axios.put("/api/product/edit", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      if (data.success) {
        toast.success(data.message);
        // Close modal and refresh product list
        setIsEditModalOpen(false);
        refreshSellerProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a product
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      setIsSubmitting(true);
      
      const token = await getToken();
      
      const { data } = await axios.delete(`/api/product/delete?id=${productToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (data.success) {
        toast.success(data.message);
        // Close modal and refresh product list
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
        refreshSellerProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modals
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {isLoadingSellerProducts ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <div className="flex justify-between items-center pb-4">
            <h2 className="text-lg font-medium">All Products</h2>
          </div>
          
                        {/* Mobile & Tablet Card View (visible on small and medium screens) */}
              <div className="lg:hidden w-full">
            {sellerProducts.length === 0 ? (
              <div className="text-center p-8 bg-card-bg rounded-md border border-border-color">
                No products found. Add your first product!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {sellerProducts.map((product) => (
                  <div key={product._id} className="bg-card-bg rounded-md border border-border-color p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-gray-500/10 rounded p-2">
                        <Image
                          src={product.images && product.images.length > 0 ? product.images[0] : assets.upload_area}
                          alt="product Image"
                          className="w-16 h-16 object-contain"
                          width={64}
                          height={64}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-text-primary font-medium truncate">{product.name}</h3>
                        <p className="text-text-secondary text-sm">{product.category}</p>
                        <p className="font-medium text-text-primary">${product.offerPrice}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="flex-1 py-2 bg-blue-500 text-white rounded-md text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <FiEdit className="text-lg" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="flex-1 py-2 bg-red-500 text-white rounded-md text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <MdDeleteOutline className="text-lg" /> Delete
                      </button>
                      <button
                        onClick={() => router.push(`/product/${product._id}`)}
                        className="flex-1 py-2 bg-[#F8BD19] text-white rounded-md text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <FaRegEye className="text-lg" /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Desktop Table View (visible only on large screens) */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <div className="rounded-md bg-card-bg border border-border-color min-w-[700px]">
              <table className="w-full">
                <thead className="text-text-primary text-sm text-left">
                  <tr>
                    <th className="w-1/3 px-3 py-3 font-medium">Product</th>
                    <th className="w-1/6 px-2 py-3 font-medium">Category</th>
                    <th className="w-1/6 px-2 py-3 font-medium">Price</th>
                    <th className="w-1/6 px-2 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-text-secondary">
                  {sellerProducts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center">
                        No products found. Add your first product!
                      </td>
                    </tr>
                  ) : (
                    sellerProducts.map((product) => (
                      <tr key={product._id} className="border-t border-border-color">
                        <td className="px-3 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="bg-gray-500/10 rounded p-1 flex-shrink-0">
                              <Image
                                src={product.images && product.images.length > 0 ? product.images[0] : assets.upload_area}
                                alt="product Image"
                                className="w-10 h-10 object-contain"
                                width={40}
                                height={40}
                              />
                            </div>
                            <span className="truncate max-w-[100px]">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-2 py-3">{product.category}</td>
                        <td className="px-2 py-3">${product.offerPrice}</td>
                        <td className="px-2 py-3">
                          <div className="flex justify-center gap-0.5">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="p-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                              title="Edit"
                            >
                              <FiEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
                              title="Delete"
                            >
                              <MdDeleteOutline size={14} />
                            </button>
                            <button
                              onClick={() => router.push(`/product/${product._id}`)}
                              className="p-1 bg-[#F8BD19] text-white rounded-md hover:bg-[#e5ad14] transition-colors flex items-center justify-center"
                              title="View"
                            >
                              <FaRegEye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`bg-card-bg p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <h3 className="text-xl font-medium mb-4 text-text-primary">Edit Product</h3>
            
            <form onSubmit={handleEditSubmit}>
              {/* Product Images */}
              <div className="mb-4">
                <label className="block text-text-primary mb-2">Current Images</label>
                <div className="flex flex-wrap gap-3">
                  {editFormData.existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={imageUrl}
                        alt={`Product image ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* New Image Uploads */}
              <div className="mb-4">
                <label className="block text-text-primary mb-2">Add New Images</label>
                <div className="flex flex-wrap gap-3">
                  {[...Array(4 - editFormData.existingImages.length)].map((_, index) => (
                    <label key={index} className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, index)}
                        className="hidden"
                      />
                      <div className="w-20 h-20 border border-dashed border-border-color rounded-md flex items-center justify-center overflow-hidden">
                        {newImages[index] ? (
                          <Image
                            src={URL.createObjectURL(newImages[index])}
                            alt={`New image ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl text-text-secondary">+</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-primary mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-border-color rounded-md bg-background text-text-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-text-primary mb-1">Category</label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-border-color rounded-md bg-background text-text-primary"
                    required
                  >
                    <option value="Earphone">Earphone</option>
                    <option value="Headphone">Headphone</option>
                    <option value="Watch">Watch</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Camera">Camera</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-text-primary mb-1">Regular Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-border-color rounded-md bg-background text-text-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-text-primary mb-1">Offer Price ($)</label>
                  <input
                    type="number"
                    name="offerPrice"
                    value={editFormData.offerPrice}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-border-color rounded-md bg-background text-text-primary"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-text-primary mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full p-2 border border-border-color rounded-md bg-background text-text-primary"
                    required
                  ></textarea>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-border-color rounded-md text-text-primary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F8BD19] text-white rounded-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`bg-card-bg p-6 rounded-lg shadow-lg max-w-md w-full`}>
            <h3 className="text-xl font-medium mb-4 text-text-primary">Confirm Deletion</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete the product "{productToDelete.name}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-border-color rounded-md text-text-primary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
