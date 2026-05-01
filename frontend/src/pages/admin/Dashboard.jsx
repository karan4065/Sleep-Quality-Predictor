import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminSidebar from '../../components/admin/Sidebar';
import ProductForm from '../../components/admin/ProductForm';
import Table from '../../components/admin/Table';
import DashboardCards from '../../components/admin/DashboardCards';
import Charts from '../../components/admin/Charts';
import Suggestions from './Suggestions';
import Requests from './Requests';
import { Trash2, Edit } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editSearchTerm, setEditSearchTerm] = useState('');
  const [deliveriesSearchTerm, setDeliveriesSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [activeTab, navigate, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (activeTab === 'home') {
        const res = await axios.get(`${import.meta.env.VITE_APP}/api/admin/dashboard`, config);
        setDashboardData(res.data);
      } else if (activeTab === 'edit' || activeTab === 'add') {
        const res = await axios.get(`${import.meta.env.VITE_APP}/api/products`);
        setProducts(res.data);
      } else if (activeTab === 'deliveries') {
        const res = await axios.get(`${import.meta.env.VITE_APP}/api/orders`, config);
        setOrders(res.data);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      }
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${import.meta.env.VITE_APP}/api/products/${id}`, config);
      toast.success('Product deleted successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${import.meta.env.VITE_APP}/api/orders/${orderId}`, { status: newStatus }, config);
      toast.success('Order status updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '64px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)' }}></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
            <h1 className="admin-page-title" style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
            {dashboardData ? (
              <>
                <DashboardCards stats={dashboardData} />
                <Charts 
                  ordersByDate={dashboardData.ordersByDate} 
                  revenueByDate={dashboardData.revenueByDate} 
                  orderStatusStats={dashboardData.orderStatusStats} 
                />
              </>
            ) : null}
          </div>
        );
      
      case 'add':
        return (
          <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 className="admin-page-title">Add New Item</h1>
            <div className="admin-card">
              <ProductForm onSuccess={fetchData} />
            </div>
          </div>
        );
      
      case 'edit': {
        if (editingProduct) {
          return (
            <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h1 className="admin-page-title">Edit Item</h1>
              <div className="admin-card">
                <ProductForm 
                  initialData={editingProduct} 
                  onSuccess={() => { setEditingProduct(null); fetchData(); }}
                  onCancel={() => setEditingProduct(null)}
                />
              </div>
            </div>
          );
        }
        
        const filteredProducts = products.filter(p => 
          p.name.toLowerCase().includes(editSearchTerm.toLowerCase())
        );

        return (
          <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="admin-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 className="admin-page-title" style={{ margin: 0 }}>Edit Items</h1>
              <input 
                type="text" 
                placeholder="Search by product name..." 
                className="login-input" 
                style={{ width: '100%', maxWidth: '350px', marginBottom: 0 }}
                value={editSearchTerm}
                onChange={(e) => setEditSearchTerm(e.target.value)}
              />
            </div>
            <Table headers={['Sr. No.', 'Image', 'Product Name', 'Price', 'Actions']}>
              {filteredProducts.map((p, idx) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{idx + 1}</td>
                  <td>
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} 
                    />
                  </td>
                  <td style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{p.name}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: '700' }}>₹{p.price.toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => setEditingProduct(p)} className="admin-action-btn">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => handleDeleteProduct(p._id)} className="admin-action-btn delete">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No products found.</td></tr>
              )}
            </Table>
          </div>
        );
      }
      
      case 'deliveries': {
        const filteredOrders = orders.filter(o => {
          const term = deliveriesSearchTerm.toLowerCase();
          const prodName = o.productId?.name || '';
          return (
            prodName.toLowerCase().includes(term) ||
            o.name.toLowerCase().includes(term) ||
            o.email.toLowerCase().includes(term) ||
            o.phone.toLowerCase().includes(term) ||
            o.address.toLowerCase().includes(term) ||
            o.status.toLowerCase().includes(term)
          );
        });

        return (
          <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="admin-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 className="admin-page-title" style={{ margin: 0 }}>Deliveries</h1>
              <input 
                type="text" 
                placeholder="Search by product, name, email, phone..." 
                className="login-input" 
                style={{ width: '100%', maxWidth: '350px', marginBottom: 0 }}
                value={deliveriesSearchTerm}
                onChange={(e) => setDeliveriesSearchTerm(e.target.value)}
              />
            </div>
            <Table headers={['Sr. No.', 'Product', 'Customer Info', 'Address', 'Qty/Price', 'Mode of Payment', 'Status', 'Update Status']}>
              {filteredOrders.map((o, idx) => (
                <tr key={o._id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{idx + 1}</td>
                  <td style={{ fontWeight: '600' }}>{o.productId?.name || 'Unknown Product'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{o.name}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{o.email}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{o.phone}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.address}>{o.address}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Qty: {o.quantity}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: '700' }}>₹{o.totalPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '500', color: o.paymentMode === 'UPI payment' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                      {o.paymentMode || 'Cash on delivery'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${o.status}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <select 
                      className="login-input"
                      style={{ 
                        width: 'auto', 
                        padding: '8px 12px', 
                        fontSize: '0.9rem',
                        color: o.paymentMode === 'UPI payment' ? 'var(--primary)' : 'var(--text-primary)'
                      }}
                      defaultValue={o.status}
                      onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                      disabled={o.paymentMode === 'UPI payment' && o.status === 'completed'}
                      title={o.paymentMode === 'UPI payment' && o.status === 'completed' ? "UPI completed orders cannot be changed" : ""}
                    >
                      <option value="pending" style={{ color: 'black' }}>Pending</option>
                      <option value="completed" style={{ color: 'black' }}>Completed</option>
                      <option value="cancelled" style={{ color: 'black' }}>Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No orders found.</td></tr>
              )}
            </Table>
          </div>
        );
      }
      
      case 'suggestions':
        return (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Suggestions />
          </div>
        );
      
      case 'requests':
        return (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Requests />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
