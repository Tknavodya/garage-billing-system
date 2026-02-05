import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  FileText, 
  Wrench, 
  Package, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css'; 

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/vehicles', label: 'Vehicles', icon: Car },
    { path: '/invoices', label: 'Invoices', icon: FileText },
    { path: '/services', label: 'Services', icon: Wrench },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Garage Admin</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
