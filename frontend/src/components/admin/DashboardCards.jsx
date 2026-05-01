import React from 'react';
import { Package, ShoppingCart, IndianRupee, Truck } from 'lucide-react';

const Card = ({ title, value, icon: Icon, growth, colorClass }) => (
  <div className="admin-stat-card fade-in" style={{ 
      backgroundColor: '#0f172a', 
      padding: '1.5rem', 
      borderRadius: '0.75rem', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'transform 0.2s',
      border: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: colorClass }}></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>{title}</span>
      <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        <Icon size={20} color={colorClass} />
      </div>
    </div>
    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white', marginTop: '0.5rem' }}>
      {value}
    </div>
    <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span>+{growth} this week</span>
    </div>
  </div>
);

const DashboardCards = ({ stats }) => {
  if (!stats) return null;
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      <Card 
        title="Total Revenue" 
        value={`₹${stats.totalRevenue?.toLocaleString() || '0'}`} 
        icon={IndianRupee} 
        growth={stats.growth?.revenue || 0} 
        colorClass="#10b981" 
      />
      <Card 
        title="Successful Deliveries" 
        value={stats.successfulDeliveries || 0} 
        icon={Truck} 
        growth={stats.growth?.deliveries || 0} 
        colorClass="#3b82f6" 
      />
      <Card 
        title="Total Orders" 
        value={stats.totalOrders || 0} 
        icon={ShoppingCart} 
        growth={stats.growth?.orders || 0} 
        colorClass="#f59e0b" 
      />
      <Card 
        title="Total Products" 
        value={stats.totalProducts || 0} 
        icon={Package} 
        growth={stats.growth?.products || 0} 
        colorClass="#8b5cf6" 
      />
    </div>
  );
};

export default DashboardCards;
