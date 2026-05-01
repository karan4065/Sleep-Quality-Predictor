import React, { useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { Send, Lightbulb } from 'lucide-react';

const Suggestion = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_APP}/api/suggestions`, formData);
      toast.success('Thank you for your suggestion!');
      setFormData({ ...formData, message: '' }); 
    } catch (err) {
      toast.error('Failed to send suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container fade-in">
      {/* Left: Form Section */}
      <div className="card" style={{ flex: '1.5' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Share Your Ideas</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Help us improve NeuroRest by sharing your thoughts and suggestions.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          <div className="input-group">
            <label>Name</label>
            <input type="text" name="name" className="input-modern" required value={formData.name} onChange={handleChange} placeholder="Your Name" />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" className="input-modern" required value={formData.email} onChange={handleChange} placeholder="Your Email" />
          </div>
          <div className="input-group">
            <label>Suggestion</label>
            <textarea name="message" className="input-modern" rows="5" required value={formData.message} onChange={handleChange} placeholder="How can we improve?"></textarea>
          </div>
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Sending...' : <><Send size={18} /> Send Suggestion</>}
          </button>
        </form>
      </div>

      {/* Right: Info / Actions Panel */}
      <div className="card" style={{ flex: '1', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <Lightbulb size={28} color="#f59e0b" />
          <h2 style={{ fontSize: '1.5rem' }}>Why Your Feedback Matters</h2>
        </div>
        
        <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '1.2rem', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
          <li>Helps us improve user experience</li>
          <li>Guides future features</li>
          <li>Makes the platform better for everyone</li>
        </ul>

        <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', textAlign: 'left' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.2rem' }}>What happens next?</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1rem' }}>
            All suggestions are sent directly to our dashboard. Our product team reviews them weekly, and we may reach out via email if your idea is selected!
            <br /><br />
           Every single voice is heard and actively shapes our future roadmap.
          </p>

          <div className="rotating-pattern-container">
            <div className="rotating-pattern"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suggestion;
