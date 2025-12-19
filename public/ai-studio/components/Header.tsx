
import React from 'react';

interface HeaderProps {
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="sticky top-0 z-10 bg-[rgba(10,10,10,0.98)] backdrop-blur-md border-b border-[rgba(212,175,55,0.1)]">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
            <div className="w-10 h-10 bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] rounded-full flex items-center justify-center text-[#050505] font-bold text-xl font-display">
                A
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight gold-gradient-text">
              AURADECOR.ai Studio
            </h1>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-2 text-sm font-medium rounded-full border-2 border-[#D4AF37] text-[#D4AF37] bg-[rgba(212,175,55,0.1)] hover:bg-[rgba(212,175,55,0.2)] hover:shadow-[0_5px_20px_rgba(212,175,55,0.3)] transition-all duration-300 transform hover:-translate-y-0.5"
        >
          New Session
        </button>
      </div>
    </header>
  );
};

export default Header;
