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
  UserCheck,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../shared/BrandLogo';
import './Sidebar.css'; 

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/vehicles', label: 'Vehicles', icon: Car },
    { path: '/invoices', label: 'Invoices', icon: FileText },
    { path: '/services', label: 'Services', icon: Wrench },
    { path: '/inventory', label: 'Inventory', icon: Package },
    ...(user?.role === 'admin' ? [{ path: '/users', label: 'Users', icon: UserCheck }] : []),
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <BrandLogo size="sidebar" />
        <p className="sidebar-brand-subtitle">Workshop operations suite</p>
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
              <span className="nav-icon"><Icon size={18} /></span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
