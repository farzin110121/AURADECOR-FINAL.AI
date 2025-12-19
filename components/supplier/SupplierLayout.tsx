
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SupplierSidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-card-bg text-white' : 'text-text-muted hover:bg-card-bg hover:text-white'
    }`;

  return (
    <div className="w-64 bg-dark-bg border-r border-border-color flex flex-col h-full">
       <div className="p-4 border-b border-border-color">
         <h1 className="text-xl font-bold font-display tracking-tight gold-gradient-text">AURADECOR.ai</h1>
         <span className="text-xs text-text-muted">Supplier Portal</span>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        <NavLink to="/supplier/dashboard" className={navLinkClass}>Dashboard</NavLink>
        {/* Add links for Leads, Profile, etc. here */}
      </nav>
      <div className="p-4 border-t border-border-color">
        <button onClick={handleLogout} className="w-full text-left text-sm text-text-muted hover:text-white transition-colors">
            Logout
        </button>
      </div>
    </div>
  );
};


const SupplierLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-dark-bg">
      <SupplierSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SupplierLayout;
