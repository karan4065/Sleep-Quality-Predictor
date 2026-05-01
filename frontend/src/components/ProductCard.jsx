import React, { useContext } from 'react';
import { Heart, RefreshCw, ShoppingCart, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useContext(WishlistContext);

  const isLiked = wishlist.some(item => item._id === product._id);
  const originalPrice = (product.price * 1.2).toFixed(2); // Mock original price for UI
  
  return (
    <div className="product-card fade-in">
      <div className="product-card-image-wrapper">
        <div className="product-card-actions">
          <button 
            className="icon-btn" 
            title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
            onClick={() => toggleWishlist(product)}
            style={isLiked ? { color: '#ef4444', borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' } : {}}
          >
            <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} />
          </button>
          <button className="icon-btn" title="Compare">
            <RefreshCw size={18} />
          </button>
        </div>
        <img src={product.image} alt={product.name} className="product-card-img" />
      </div>
      
      <div className="product-card-content">
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-desc">{product.description?.substring(0, 60)}...</p>
        
        <div className="product-card-price-row">
          <span className="price-discounted">₹{product.price.toFixed(2)}</span>
          <span className="price-original">₹{originalPrice}</span>
        </div>
        
        <div className="product-card-buttons">
          <button 
            className="btn-outline-primary" 
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
          <button 
            className="btn-gradient-primary"
            onClick={() => navigate(`/checkout/${product._id}`)}
          >
            <Zap size={16} /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
