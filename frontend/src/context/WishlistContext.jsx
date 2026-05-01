import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (user?.email) {
      const saved = localStorage.getItem(`wishlist_${user.email}`);
      setWishlist(saved ? JSON.parse(saved) : []);
      setIsLoaded(true);
    } else {
      setWishlist([]);
      setIsLoaded(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.email && isLoaded) {
      localStorage.setItem(`wishlist_${user.email}`, JSON.stringify(wishlist));
    }
  }, [wishlist, user, isLoaded]);

  const toggleWishlist = (product) => {
    if (!user) {
      toast.error('Please login to use wishlist');
      return;
    }
    setWishlist(prev => {
      const isLiked = prev.find(item => item._id === product._id);
      if (isLiked) {
        toast.success('Removed from Wishlist');
        return prev.filter(item => item._id !== product._id);
      } else {
        toast.success('Added to Wishlist');
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (productId) => {
    if (!user) return;
    setWishlist(prev => prev.filter(item => item._id !== productId));
    toast.success('Removed from Wishlist');
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
