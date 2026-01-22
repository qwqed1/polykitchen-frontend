import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Utensils, ChevronRight, Wine } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import '../i18n';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{backgroundImage: 'url(/img/background.jpg)'}} />
      </div>

      {/* Language selector - top right corner */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
        <LanguageSelector />
      </div>

      {/* Main content - centered and simple */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 md:px-8">
        {/* Decorative background patterns */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {/* Top left pattern */}
          <img 
            src="/img/Logo.png" 
            alt="" 
            className="absolute -top-20 -left-20 w-96 h-96 object-contain opacity-30 rotate-12"
          />
          {/* Top right pattern */}
          <img 
            src="/img/Logo.png" 
            alt="" 
            className="absolute -top-32 -right-32 w-80 h-80 object-contain opacity-20 -rotate-45"
          />
          {/* Bottom left pattern */}
          <img 
            src="/img/Logo.png" 
            alt="" 
            className="absolute -bottom-24 -left-24 w-72 h-72 object-contain opacity-25 -rotate-12"
          />
          {/* Bottom right pattern */}
          <img 
            src="/img/Logo.png" 
            alt="" 
            className="absolute -bottom-40 -right-40 w-96 h-96 object-contain opacity-15 rotate-45"
          />
        </div>

        {/* Logo and Title */}
        <div className="text-center animate-fadeInUp relative z-10">
          {/* Logo image */}
          <div className="mb-4">
            <img 
              src="/img/Logo.png" 
              alt="POLYTECH KITHEN Logo" 
              className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 mx-auto object-contain"
            />
          </div>
          
          {/* Company name - Halal Hall */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 md:mb-8 tracking-wider animate-fadeIn" style={{fontFamily: 'serif', textShadow: '0 4px 20px rgba(0,0,0,0.3)'}}>
            POLYTECH KITHEN
          </h1>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col w-full max-w-md md:max-w-none md:flex-row md:justify-center md:items-center gap-3 md:gap-4 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          <button
            onClick={() => navigate('/menu')}
            className="group px-6 py-3 md:px-10 md:py-4 bg-white border-2 border-white text-menu-primary text-base md:text-xl font-bold rounded-full hover:bg-menu-primary hover:text-white hover:border-menu-primary hover:shadow-2xl hover:shadow-white/30 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3"
          >
            <Utensils className="w-5 h-5 md:w-6 md:h-6" />
            {t('menu.title')?.toUpperCase() || 'КУХНЯ'}
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/bar')}
            className="group px-6 py-3 md:px-10 md:py-4 bg-transparent border-2 border-white text-white text-base md:text-xl font-bold rounded-full hover:bg-white hover:text-menu-primary hover:shadow-2xl hover:shadow-white/30 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3"
          >
            <Wine className="w-5 h-5 md:w-6 md:h-6" />
            {t('menu.bar')?.toUpperCase() || 'НАПИТКИ'}
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
