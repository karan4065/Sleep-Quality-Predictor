import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Moon, User, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('login'); // 'login', 'forgot', 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_APP}/api/auth/login`, { ...formData, role });
      
      if (res.data.role === 'admin') {
        localStorage.setItem('adminToken', res.data.token);
        toast.success('Admin login successful!');
        navigate('/admin/dashboard');
      } else {
        login(res.data.token, res.data.user);
        toast.success('Successfully logged in!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_APP}/api/auth/forgot-password`, { email: forgotEmail });
      toast.success('OTP sent to your email');
      setView('reset');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_APP}/api/auth/reset-password`, { email: forgotEmail, otp, newPassword });
      toast.success('Password reset successfully! Please login.');
      setView('login');
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Login Form */}
      <div className="login-left">
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>

        <div className="login-card fade-in">
          {view === 'login' ? (
            <>
          <div className="login-header-text">
            <div className="login-logo">
              <span className="login-logo-text" style={{ fontSize: '2.5rem' }}>
                <span style={{ color: 'var(--primary)' }}>Neuro</span>Rest
              </span>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue to your dashboard.</p>
          </div>

          {/* Role Toggle */}
          <div className="role-toggle-container">
            <button
              type="button"
              className={`role-btn ${role === 'user' ? 'active' : ''}`}
              onClick={() => setRole('user')}
            >
              <User size={16} /> User
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => setRole('admin')}
            >
              <ShieldAlert size={16} /> Admin
            </button>
            {/* Active Highlight */}
            <div className={`role-slider ${role === 'admin' ? 'admin' : ''}`} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="login-input"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
                placeholder={role === 'admin' ? "admin@gmail.com" : "hello@example.com"}
              />
            </div>
            
            <div className="login-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '0.25rem' }}>
                <label style={{ margin: 0 }}>Password</label>
                {role === 'user' && (
                  <a href="#" onClick={(e) => { e.preventDefault(); setView('forgot'); }} style={{ fontSize: '0.75rem', color: '#22d3ee', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
                )}
              </div>
              <input 
                type="password" 
                className="login-input"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
                placeholder="••••••••" 
                style={{ marginTop: '0.5rem' }}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: '24px', height: '24px', borderTopColor: '#fff', margin: '0 auto' }}></div>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>
          
          {role === 'user' && (
            <div className="login-footer">
              Don't have an account? <Link to="/register">Create one</Link>
            </div>
          )}
            </>
          ) : view === 'forgot' ? (
            <>
              <div className="login-header-text">
                <h1>Reset Password</h1>
                <p>Enter your email to receive an OTP.</p>
              </div>
              <form onSubmit={handleForgotPassword}>
                <div className="login-input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="login-input"
                    value={forgotEmail} 
                    onChange={e => setForgotEmail(e.target.value)} 
                    required 
                    placeholder="hello@example.com"
                  />
                </div>
                <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: '1.5rem' }}>
                  {loading ? <div className="spinner" style={{ width: '24px', height: '24px', borderTopColor: '#fff', margin: '0 auto' }}></div> : 'Send OTP'}
                </button>
                <div className="login-footer" style={{ marginTop: '1rem' }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }} style={{ color: '#22d3ee', textDecoration: 'none' }}>Back to Login</a>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="login-header-text">
                <h1>Enter OTP</h1>
                <p>Enter the OTP sent to {forgotEmail} and your new password.</p>
              </div>
              <form onSubmit={handleResetPassword}>
                <div className="login-input-group">
                  <label>OTP</label>
                  <input 
                    type="text" 
                    className="login-input"
                    value={otp} 
                    onChange={e => setOtp(e.target.value)} 
                    required 
                    placeholder="123456"
                  />
                </div>
                <div className="login-input-group" style={{ marginTop: '1rem' }}>
                  <label>New Password</label>
                  <input 
                    type="password" 
                    className="login-input"
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: '1.5rem' }}>
                  {loading ? <div className="spinner" style={{ width: '24px', height: '24px', borderTopColor: '#fff', margin: '0 auto' }}></div> : 'Reset Password'}
                </button>
                <div className="login-footer" style={{ marginTop: '1rem' }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }} style={{ color: '#22d3ee', textDecoration: 'none' }}>Cancel</a>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Visual Section */}
      <div className="login-right">
        {/* Abstract Blobs */}
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>

        {/* Content Overlay */}
        <div className="right-content fade-in">
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
            <Sparkles size={32} color="#22d3ee" />
          </div>
          <h2>Unlock Better <br />Sleep Today.</h2>
          <p>
            Join thousands of users improving their sleep quality with AI-driven insights, premium products, and personalized analytics.
          </p>
          
          {/* Mockup / Decor */}
          <div className="mockup-window">
            <div className="mockup-dots">
              <div className="mockup-dot red"></div>
              <div className="mockup-dot yellow"></div>
              <div className="mockup-dot green"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
