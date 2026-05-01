import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/auth/register', formData);
      login(res.data.token, res.data.user);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in" style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
      <h2>Create an Account</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Join us to start tracking your sleep quality.</p>
      
      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        <div className="input-group">
          <label>Email</label>
          <input type="email" className="input-modern" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="you@example.com" />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" className="input-modern" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="••••••••" />
        </div>
        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? <div className="spinner"></div> : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</Link>
      </p>
    </div>
  );
};
export default Register;
