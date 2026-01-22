import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const Header = ({ title, onBack, onHome, showBack }) => {
  return (
    <header className="bg-transparent border-b border-menu-primary/20 px-3 py-3 md:px-6 md:py-5 flex items-center justify-between relative z-[100]">
      <button 
        onClick={onBack}
        className={`p-2 md:p-2.5 rounded-full bg-transparent border-2 border-menu-primary hover:bg-menu-primary/20 transition-all duration-300 hover:scale-105 ${
          showBack ? 'visible' : 'invisible'
        }`}
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-menu-primary" />
      </button>

      <h1 className="text-lg md:text-2xl font-light text-white tracking-wide drop-shadow-md truncate px-2" style={{ color: 'white' }}>{title}</h1>

      <div className="flex items-center gap-2 md:gap-3 relative z-[9999]">
        <LanguageSelector />
        <button 
          onClick={onHome}
          className="p-2 md:p-2.5 rounded-full bg-transparent border-2 border-menu-primary hover:bg-menu-primary/20 transition-all duration-300 hover:scale-105"
        >
          <Home className="w-4 h-4 md:w-5 md:h-5 text-menu-primary" />
        </button>
      </div>
    </header>
  );
};

export default Header;
