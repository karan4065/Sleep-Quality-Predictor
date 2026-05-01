import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, Zap, Heart } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart } = useContext(CartContext);
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product._id);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="cart-page-container fade-in">
      
      {/* 🛒 CART SECTION */}
      <div className="cart-section">
        <h2 className="cart-section-title"><ShoppingCart size={24} /> Your Shopping Cart</h2>
        
        {cart.length === 0 ? (
          <div className="empty-state-box">
            <p>Your cart is empty. Let's find some amazing sleep products!</p>
            <button onClick={() => navigate('/shop')} className="btn-outline-primary" style={{ marginTop: '1rem' }}>
              Go to Shop
            </button>
          </div>
        ) : (
          <div className="cart-list">
            {cart.map(item => (
              <div key={item._id} className="cart-item-card">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>Qty: {item.quantity}</p>
                </div>
                <div className="cart-item-price">
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="cart-item-actions">
                  <button 
                    className="icon-btn" 
                    title="Remove from Cart"
                    onClick={() => removeFromCart(item._id)}
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    className="btn-gradient-primary" 
                    onClick={() => navigate(`/checkout/${item._id}`)}
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    <Zap size={16} /> Buy Now
                  </button>
                </div>
              </div>
            ))}
            
            <div className="cart-total-bar">
              <span className="total-label">Total Amount:</span>
              <span className="total-value">₹{calculateTotal()}</span>
            </div>
          </div>
        )}
      </div>

      {/* ❤️ WISHLIST SECTION */}
      <div className="cart-section" style={{ marginTop: '4rem' }}>
        <h2 className="cart-section-title"><Heart size={24} fill="#ef4444" color="#ef4444" /> Your Wishlist</h2>
        
        {wishlist.length === 0 ? (
          <div className="empty-state-box">
            <p>You haven't liked any items yet.</p>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map(item => (
              <div key={item._id} className="wishlist-item-card">
                <img src={item.image} alt={item.name} className="wishlist-item-img" />
                <div className="wishlist-item-info">
                  <h4>{item.name}</h4>
                  <span>₹{item.price.toFixed(2)}</span>
                </div>
                <div className="wishlist-item-actions">
                  <button 
                    className="btn-outline-primary w-full" 
                    onClick={() => handleMoveToCart(item)}
                    style={{ padding: '8px', fontSize: '0.85rem' }}
                  >
                    Move to Cart
                  </button>
                  <button 
                    className="icon-btn" 
                    onClick={() => removeFromWishlist(item._id)}
                    title="Remove"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
