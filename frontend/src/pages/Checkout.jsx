import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const Checkout = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    address: '',
    quantity: 1
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/products/${productId}`);
        setProduct(res.data);
      } catch (err) {
        toast.error('Failed to load product details');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, quantity: val > 0 ? val : 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;
    
    setSubmitting(true);
    const totalPrice = (product.price * formData.quantity).toFixed(2);
    
    const payload = {
      productId: product._id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      quantity: formData.quantity,
      totalPrice: totalPrice
    };

    try {
      await axios.post('http://localhost:3001/api/orders', payload);
      toast.success('Order Placed Successfully! 🎉');
      navigate('/orders'); // Or back to shop / success page
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRazorpayPayment = async () => {
    const form = document.getElementById('checkout-form');
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!product) return;
    
    setSubmitting(true);
    const totalPrice = (product.price * formData.quantity).toFixed(2);
    
    try {
      // 1. Create Razorpay order
      const orderRes = await axios.post('http://localhost:3001/api/orders/create-razorpay-order', {
        amount: totalPrice,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const order = orderRes.data;

      // 2. Open Razorpay checkout
      var options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Sleep.ai",
        description: `Payment for ${product.name}`,
        order_id: order.id,
        handler: async function(response) {
          try {
            const body = {
              ...response,
              orderDetails: {
                productId: product._id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                quantity: formData.quantity,
                totalPrice: totalPrice
              }
            };
            
            await axios.post('http://localhost:3001/api/orders/validate-razorpay-payment', body, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Payment Successful! 🎉 Order Placed.');
            navigate('/orders');
          } catch (err) {
            toast.error('Payment validation failed.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#00f0ff",
        },
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        toast.error("Payment Failed: " + response.error.description);
      });

      rzp1.open();
    } catch (err) {
      toast.error('Failed to initiate payment.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  if (!product) return null;

  const totalPrice = (product.price * formData.quantity).toFixed(2);

  return (
    <div className="checkout-page">
      <button onClick={() => navigate(-1)} className="btn-back">
        <ArrowLeft size={18} /> Back to Shop
      </button>

      <div className="checkout-container fade-in">
        {/* LEFT SIDE: User Form */}
        <div className="checkout-left">
          <h2 className="checkout-section-title">Shipping Details</h2>
          <form id="checkout-form" onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" className="login-input" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" className="login-input" required value={formData.email} onChange={handleChange} placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" className="login-input" required value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            
            <div className="form-group full-width">
              <label>Shipping Address</label>
              <textarea name="address" className="login-input" rows="3" required value={formData.address} onChange={handleChange} placeholder="123 Sleepy Lane, Dreamville, CA 90210"></textarea>
            </div>
            
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" name="quantity" className="login-input" min="1" value={formData.quantity} onChange={handleQuantityChange} style={{ maxWidth: '120px' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn-gradient-primary checkout-submit-btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--primary)', color: 'var(--text-primary)' }} disabled={submitting}>
                {submitting ? 'Processing...' : 'Place Order'}
              </button>
              <button type="button" onClick={handleRazorpayPayment} className="btn-gradient-primary checkout-submit-btn" style={{ flex: 1 }} disabled={submitting}>
                {submitting ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
            
            <div className="trust-badges">
              <span className="trust-badge"><ShieldCheck size={16} /> Secure Checkout</span>
              <span className="trust-badge"><Truck size={16} /> Free Shipping</span>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE: Order Summary */}
        <div className="checkout-right">
          <h2 className="checkout-section-title">Order Summary</h2>
          <div className="summary-card">
            <div className="summary-product">
              <img src={product.image} alt={product.name} className="summary-img" />
              <div className="summary-product-info">
                <h3>{product.name}</h3>
                <p className="summary-desc">{product.description?.substring(0, 50)}...</p>
                <span className="summary-price">₹{product.price.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: 'var(--success)' }}>Free</span>
            </div>
            <div className="summary-row">
              <span>Taxes</span>
              <span>Calculated at next step</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total-row">
              <span>Total Price</span>
              <span className="total-price">₹{totalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
