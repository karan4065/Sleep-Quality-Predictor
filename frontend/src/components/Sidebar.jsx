import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, ShoppingBag, ListOrdered, ShoppingCart, LogOut, MessageSquare, Phone } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useContext(AuthContext);
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Check Sleep Quality', path: '/predictor', icon: <Activity size={20} /> },
    { name: 'Shop', path: '/shop', icon: <ShoppingBag size={20} /> },
    { name: 'Orders History', path: '/orders', icon: <ListOrdered size={20} /> },
    { name: 'Cart', path: '/cart', icon: <ShoppingCart size={20} /> },
    { name: 'Suggestion', path: '/suggestion', icon: <MessageSquare size={20} /> },
    { name: 'Contact', path: '/contact', icon: <Phone size={20} /> }
  ];

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{fontFamily: 'Poppins',fontWeight: 'bold'}}>
          <h2>NeuroRest</h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => { if(window.innerWidth <= 768) toggleSidebar(); }}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-link logout-btn" onClick={() => { logout(); toast.success('Logged out successfully'); }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;
