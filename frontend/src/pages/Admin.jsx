import React from 'react';

const Admin = () => {
  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Admin Dashboard</h1>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Admin access verified. (Admin features coming soon)</p>
      </div>
    </div>
  );
};
export default Admin;
