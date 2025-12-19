
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const PublicHeader: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 bg-[rgba(10,10,10,0.98)] backdrop-blur-md border-b border-border-color">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-r from-primary-gold to-secondary-gold rounded-full flex items-center justify-center text-dark-bg font-bold text-xl font-display">
                A
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight gold-gradient-text">
              AURADECOR.ai
            </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-sm font-medium rounded-full text-primary-gold hover:bg-[rgba(212,175,55,0.1)] transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-2 text-sm font-medium rounded-full bg-primary-gold text-black hover:opacity-90 transition-opacity"
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
};

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <PublicHeader />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Outlet />
      </main>
      <footer className="py-6 border-t border-border-color">
          <div className="container mx-auto text-center text-text-muted text-sm">
              &copy; {new Date().getFullYear()} AURADECOR.ai. All rights reserved.
          </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
