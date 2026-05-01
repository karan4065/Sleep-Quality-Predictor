import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { CartContext } from '../context/CartContext';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/products');
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shop-page-container">
      <div className="shop-header fade-in">
        <div className="shop-header-icon">
          <Sparkles size={24} />
        </div>
        <div>
           <h1 className="shop-title">Premium Sleep Products</h1>
        <p className="shop-subtitle">Enhance your rest with our scientifically curated selection.</p>
        </div>
      </div>

      {loading ? (
        <div className="shop-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="shop-grid">
          {products.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onAddToCart={addToCart} 
            />
          ))}
          {products.length === 0 && (
            <div className="empty-state">
              <p>No products available right now. Check back later!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Shop;
