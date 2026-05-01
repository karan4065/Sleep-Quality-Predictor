import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Table from '../../components/admin/Table';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${import.meta.env.VITE_APP}/api/contact`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data);
      } catch (err) {
        toast.error('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) {
    return <div className="spinner" style={{ margin: '2rem auto' }}></div>;
  }

  const filteredRequests = requests.filter(r => {
    const term = searchTerm.toLowerCase();
    const dateStr = new Date(r.createdAt).toLocaleDateString().toLowerCase();
    return (
      r.name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.contactNumber.toLowerCase().includes(term) ||
      r.message.toLowerCase().includes(term) ||
      dateStr.includes(term)
    );
  });

  return (
    <div className="fade-in">
      <div className="admin-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>User Requests</h1>
        <input 
          type="text" 
          placeholder="Search by name, email, phone, message..." 
          className="login-input" 
          style={{ width: '100%', maxWidth: '350px', marginBottom: 0 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredRequests.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--text-secondary)' }}>No requests found.</p>
        </div>
      ) : (
        <Table headers={['Sr. No.', 'Date', 'Name', 'Email', 'Contact Number', 'Message']}>
          {filteredRequests.map((r, idx) => (
            <tr key={idx}>
              <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{idx + 1}</td>
              <td style={{ color: 'var(--text-secondary)' }}>
                {new Date(r.createdAt).toLocaleDateString()}
              </td>
              <td style={{ fontWeight: '500' }}>{r.name}</td>
              <td style={{ color: 'var(--primary)' }}>{r.email}</td>
              <td style={{ color: 'var(--primary)' }}>{r.contactNumber}</td>
              <td style={{ maxWidth: '400px', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                {r.message}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default Requests;
