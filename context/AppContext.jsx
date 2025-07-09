"use client";
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as Toast from "@/lib/toast";

export const AppContext = createContext();
export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const {data} = await axios.get("/api/product/list");
      if(data.success){
        setProducts(data.products);
      } else {
        Toast.showError(data.message || "Failed to load products");
      }
    } catch (error) {
      Toast.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      if (user && user.publicMetadata && user.publicMetadata.role === "seller") {
        setIsSeller(true);
      }

      const token = await getToken();
      const { data } = await axios.get("/api/user/data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setUserData(data.user);
        setCartItems(data.user.cartItems || {});
        setWishlist(data.user.wishlist || []);
      } else {
        Toast.showError(data.message || "Failed to load user data");
      }
    } catch (error) {
      Toast.handleApiError(error);
    }
  };

  const addToCart = async (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    if(user){
      try {
        const token = await getToken();
        await axios.post(
          "/api/cart/update",
          { cartData },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Toast.showSuccess("Item added to cart");
      } catch (error) {
        Toast.handleApiError(error);
      }
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
    if (user) {
      try {
        const token = await getToken();
        await axios.post(
          "/api/cart/update",
          { cartData },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Toast.showSuccess(quantity === 0 ? "Item removed from cart" : "Cart updated");
      } catch (error) {
        Toast.handleApiError(error);
      }
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      Toast.showInfo("Please sign in to save items to your wishlist");
      return false;
    }

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/user/wishlist",
        { productId, action: "toggle" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setWishlist(data.wishlist);
        Toast.showSuccess(data.message);
        return data.isInWishlist;
      } else {
        Toast.showError(data.message || "Failed to update wishlist");
        return null;
      }
    } catch (error) {
      Toast.handleApiError(error);
      return null;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product && product._id === items);
      if (itemInfo && cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  const handleLogout = () => {
    setCartItems({});
    setUserData(null);
    setIsSeller(false);
    setWishlist([]);
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      handleLogout();
    }
  }, [user]);

  const value = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    isLoading,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    wishlist,
    toggleWishlist,
    isInWishlist,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
