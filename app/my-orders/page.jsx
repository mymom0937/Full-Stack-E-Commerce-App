"use client";
import React, { useEffect, useState } from "react";
import { assets, orderDummyData } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const MyOrders = () => {
  const { currency, getToken, user } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/order/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setOrders(data.orders.reverse());
        setLoading(false);
      } else {
        toast.error(data.message || "Failed to fetch orders");
        setLoading(false);
      }
      setLoading(false);
    } catch (error) {
        toast.error(error.message || "An error occurred while fetching orders");
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <div className="space-y-5">
          <h2 className="text-lg font-medium mt-6">My Orders</h2>
          {loading ? (
            <Loading />
          ) : (
            <div className="max-w-5xl border-t border-gray-300 text-sm">
              {orders.map((order, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300"
                >
                  <div className="flex-1 flex gap-5 max-w-80">
                    <Image
                      className="max-w-16 max-h-16 object-cover"
                      src={assets.box_icon}
                      alt="box_icon"
                    />
                    <p className="flex flex-col gap-3">
                      <span className="font-medium text-base">
                        {(order.items || [])
                          .map(
                            (item) => {
                              const productName = item.product?.name || 'Product';
                              return productName + ` x ${item.quantity || 1}`;
                            }
                          )
                          .join(", ")}
                      </span>
                      <span>Items : {(order.items || []).length}</span>
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">
                        {order.address?.fullName || 'No name available'}
                      </span>
                      <br />
                      <span>{order.address?.area || 'No area available'}</span>
                      <br />
                      <span>{`${order.address?.city || 'No city'}, ${order.address?.state || 'No state'}`}</span>
                      <br />
                      <span>{order.address?.phoneNumber || 'No phone number'}</span>
                    </p>
                  </div>
                  <p className="font-medium my-auto">
                    {currency}
                    {order.amount || 0}
                  </p>
                  <div>
                    <p className="flex flex-col">
                      <span>Method : COD</span>
                      <span>
                        Date : {order.date ? new Date(order.date).toLocaleDateString() : 'Unknown date'}
                      </span>
                      <span>Payment : Pending</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
