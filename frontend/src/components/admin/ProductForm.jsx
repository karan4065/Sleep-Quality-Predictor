import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Package, IndianRupee, Link as LinkIcon, FileText, LayoutList, Plus, Save, X } from 'lucide-react';

const ProductForm = ({ initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: 'pillows',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price || '',
        description: initialData.description || '',
        image: initialData.image || '',
        category: initialData.category || 'pillows',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      if (initialData) {
        await axios.put(`${import.meta.env.VITE_APP}/api/products/${initialData._id}`, formData, config);
        toast.success('Product updated successfully!');
      } else {
        await axios.post(`${import.meta.env.VITE_APP}/api/products`, formData, config);
        toast.success('Product added successfully!');
        setFormData({ name: '', price: '', description: '', image: '', category: 'pillows' });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Failed to save product');
      console.error(err);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(11, 15, 25, 0.9))',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '2rem',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          <div className="login-input-group" style={{ margin: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Package size={16} /> Product Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="login-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Premium Memory Foam"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          <div className="login-input-group" style={{ margin: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <IndianRupee size={16} /> Price (₹)
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              className="login-input"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          <div className="login-input-group" style={{ margin: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <LayoutList size={16} /> Category
            </label>
            <select
              name="category"
              className="login-input"
              value={formData.category}
              onChange={handleChange}
              style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <option value="pillows" style={{ color: 'black' }}>Pillows</option>
              <option value="masks" style={{ color: 'black' }}>Sleep Masks</option>
              <option value="glasses" style={{ color: 'black' }}>Blue Light Glasses</option>
              <option value="supplements" style={{ color: 'black' }}>Supplements</option>
              <option value="other" style={{ color: 'black' }}>Other</option>
            </select>
          </div>

          <div className="login-input-group" style={{ margin: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <LinkIcon size={16} /> Image URL
            </label>
            <input
              type="url"
              name="image"
              required
              className="login-input"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.png"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

        </div>

        <div className="login-input-group" style={{ margin: '0 0 2rem 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <FileText size={16} /> Description
          </label>
          <textarea
            name="description"
            rows="4"
            className="login-input"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter a detailed description of the product..."
            style={{ resize: 'vertical', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}
          ></textarea>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
          {onCancel && (
            <button type="button" onClick={onCancel} style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer',
              fontWeight: '600', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <X size={18} /> Cancel
            </button>
          )}
          <button type="submit" className="btn-primary" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {initialData ? <><Save size={18} /> Update Item</> : <><Plus size={18} /> Add New Item</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
