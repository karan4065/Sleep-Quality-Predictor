import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Table from '../../components/admin/Table';

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${import.meta.env.VITE_APP}/api/suggestions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuggestions(res.data);
      } catch (err) {
        toast.error('Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  if (loading) {
    return <div className="spinner" style={{ margin: '2rem auto' }}></div>;
  }

  const filteredSuggestions = suggestions.filter(s => {
    const term = searchTerm.toLowerCase();
    const dateStr = new Date(s.createdAt).toLocaleDateString().toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.message.toLowerCase().includes(term) ||
      dateStr.includes(term)
    );
  });

  return (
    <div className="fade-in">
      <div className="admin-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>User Reviews</h1>
        <input 
          type="text" 
          placeholder="Search by name, email, message..." 
          className="login-input" 
          style={{ width: '100%', maxWidth: '350px', marginBottom: 0 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredSuggestions.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--text-secondary)' }}>No reviews found.</p>
        </div>
      ) : (
        <Table headers={['Sr. No.', 'Date', 'Name', 'Email', 'Message']}>
          {filteredSuggestions.map((s, idx) => (
            <tr key={idx}>
              <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{idx + 1}</td>
              <td style={{ color: 'var(--text-secondary)' }}>
                {new Date(s.createdAt).toLocaleDateString()}
              </td>
              <td style={{ fontWeight: '500' }}>{s.name}</td>
              <td style={{ color: 'var(--primary)' }}>{s.email}</td>
              <td style={{ maxWidth: '400px', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                {s.message}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default Suggestions;
