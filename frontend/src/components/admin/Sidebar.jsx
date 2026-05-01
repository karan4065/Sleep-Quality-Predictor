import React from 'react';
import { LayoutDashboard, PlusCircle, Edit3, Package, LogOut, MessageSquare, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'add', label: 'Add Item', icon: <PlusCircle size={20} /> },
    { id: 'edit', label: 'Edit Items', icon: <Edit3 size={20} /> },
    { id: 'deliveries', label: 'Deliveries', icon: <Package size={20} /> },
    { id: 'suggestions', label: 'User Reviews', icon: <MessageSquare size={20} /> },
    { id: 'requests', label: 'Requests', icon: <ClipboardList size={20} /> },
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2 className="admin-sidebar-title">
          <span>Neuro</span>Rest
        </h2>
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button onClick={handleLogout} className="admin-logout-btn">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
