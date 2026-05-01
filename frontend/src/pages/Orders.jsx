import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_APP}/api/orders/my-orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="shop-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Package size={32} color="var(--primary)" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="empty-state-box">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="cart-list">
          {orders.map(order => (
            <div key={order._id} className="cart-item-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Order ID: <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{order._id}</span>
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Placed on: <span style={{ color: 'var(--text-primary)' }}>{new Date(order.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
                <span className={`status-badge status-${order.status}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {order.productId?.name || 'Unknown Product'}
                  </h3>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Qty: {order.quantity}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Payment: <span style={{ color: 'var(--text-primary)' }}>{order.paymentMode || 'Cash on delivery'}</span></p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Amount</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>₹{order.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
