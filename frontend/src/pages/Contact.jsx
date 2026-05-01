import React, { useState } from 'react';
import { Code, Link, Briefcase, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', contactNumber: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_APP}/api/contact`, formData);
      toast.success("Message sent successfully");
      setFormData({ name: '', email: '', contactNumber: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container fade-in">
      {/* Left: Form Section */}
      <div className="card" style={{ flex: '1.5' }}>
        <h1 style={{ marginBottom: '0.8rem', fontSize: '1.8rem' }}>Get in Touch</h1>
        

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          <div className="input-group">
            <label>Name</label>
            <input type="text" className="input-modern" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Your Name" />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" className="input-modern" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Your Email" />
          </div>
          <div className="input-group">
            <label>Contact Number</label>
            <input type="tel" className="input-modern" required value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} placeholder="Your Phone Number" />
          </div>
          <div className="input-group">
            <label>Message</label>
            <textarea className="input-modern" rows="4" required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="How can we help you?"></textarea>
          </div>
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* Right: Info / Actions Panel */}
      <div className="card" style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'fit-content' }}>
        <h2 style={{ marginBottom: '1rem' }}>Connect with Me</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Feel free to connect through the platforms below or drop a message anytime.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '350px', marginBottom: '2rem' }}>
          <a href="https://www.linkedin.com/in/karan-jadhav-573968322/" target="_blank" rel="noopener noreferrer" className="social-link-btn">
            <Link size={20} /> LinkedIn
          </a>
          <a href="https://github.com/karan4065" target="_blank" rel="noopener noreferrer" className="social-link-btn">
            <Code size={20} /> GitHub
          </a>
          <a href="https://karanjadhav.netlify.app" target="_blank" rel="noopener noreferrer" className="social-link-btn">
            <Briefcase size={20} /> Portfolio
          </a>
          <a href="mailto:karanjadhav4065@gmail.com" className="social-link-btn">
            <Mail size={20} /> Email Us
          </a>
        </div>

        <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', textAlign: 'left' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.2rem' }}>Operating Hours</h3>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem', listStyle: 'none', padding: 0 }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
  <span>Working Hours</span>
  <span>24×7 • All Days</span>
</li>
            
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Contact;
