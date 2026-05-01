import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const API_URL = 'http://localhost:3001/api/cart';

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await axios.get(API_URL);
      if (res.data && res.data.products) {
        const formattedCart = res.data.products.map(item => ({
          ...item.productId,
          quantity: item.quantity
        }));
        setCart(formattedCart);
      }
    } catch (err) {
      console.error('Failed to fetch cart', err);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/add`, { productId: product._id });
      await fetchCart();
      toast.success('Added to Cart');
    } catch (err) {
      toast.error('Failed to add item to cart');
      console.error(err);
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return;
    
    try {
      await axios.delete(`${API_URL}/remove/${productId}`);
      await fetchCart();
    } catch (err) {
      toast.error('Failed to remove item');
      console.error(err);
    }
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
