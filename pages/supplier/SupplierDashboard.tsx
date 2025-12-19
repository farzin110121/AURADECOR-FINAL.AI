
import React from 'react';
import { Link } from 'react-router-dom';

const SupplierDashboard: React.FC = () => {
  // In a real app, you'd fetch stats like new leads, profile completion, etc.
  const stats = {
    newLeads: 3,
    profileCompletion: 75,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-display mb-8">Supplier Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card-bg border border-border-color rounded-xl p-6">
          <h3 className="font-semibold text-text-muted">New Project Leads</h3>
          <p className="text-4xl font-bold mt-2">{stats.newLeads}</p>
          <Link to="/supplier/leads" className="text-sm text-primary-gold hover:underline mt-4 inline-block">View Leads</Link>
        </div>
        <div className="bg-card-bg border border-border-color rounded-xl p-6">
          <h3 className="font-semibold text-text-muted">Profile Completion</h3>
          <p className="text-4xl font-bold mt-2">{stats.profileCompletion}%</p>
          <Link to="/supplier/profile" className="text-sm text-primary-gold hover:underline mt-4 inline-block">Complete Profile</Link>
        </div>
      </div>

      <div className="bg-card-bg border border-border-color rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to AURADECOR.ai</h2>
          <p className="text-text-muted">Complete your profile to become visible to homeowners. Subscribe to our leads plan to unlock contact information for new projects in your area.</p>
           <div className="mt-6">
                <Link to="/supplier/subscription" className="px-6 py-2 font-semibold rounded-full text-black bg-gradient-to-r from-primary-gold to-secondary-gold hover:shadow-[0_5px_20px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 transition-all">
                    Upgrade to View Leads
                </Link>
           </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
