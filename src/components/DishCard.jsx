import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAutoApiUrl } from '../utils/apiConfig';

const DishCard = ({ dish, onViewDetails, index = 0 }) => {
  const [API_URL, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  const { t, i18n } = useTranslation();

  // Initialize API URL dynamically
  useEffect(() => {
    const initializeApiUrl = async () => {
      try {
        const url = await getAutoApiUrl();
        setApiUrl(url);
        console.log('🔧 DishCard auto-detected API URL:', url);
      } catch (error) {
        console.error('DishCard failed to auto-detect API URL:', error);
        setApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3000');
      }
    };
    
    initializeApiUrl();
  }, []);

  // Helper function to fix image URLs
  const fixImageUrl = (url) => {
    if (!url) return null;
    
    // If it's already a full URL with the correct API_URL, return as is
    if (url.startsWith(API_URL)) return url;
    
    // If it's a relative path starting with /uploads/
    if (url.startsWith('/uploads/')) {
      return `${API_URL}${url}`;
    }
    
    // If it contains /uploads/ somewhere in the URL (old format with different host)
    if (url.includes('/uploads/')) {
      return `${API_URL}${url.substring(url.indexOf('/uploads/'))}`;
    }
    
    // Return as is for external URLs
    return url;
  };

  // Get dish name based on current language
  const getDishName = (dish) => {
    const lang = i18n.language;
    if (lang === 'en' && dish.name_en) return dish.name_en;
    if (lang === 'kk' && dish.name_kk) return dish.name_kk;
    return dish.name_ru || dish.name; // Fallback to Russian or original
  };
  
  // Get description based on current language
  const getDescription = (dish) => {
    const lang = i18n.language;
    if (lang === 'en' && dish.description_en) return dish.description_en;
    if (lang === 'kk' && dish.description_kk) return dish.description_kk;
    return dish.description_ru || dish.description; // Fallback to Russian or original
  };

  return (
    <div 
      className="py-3 md:py-5 border-b border-menu-primary/10 last:border-b-0 animate-fadeInUp hover:bg-menu-hover/30 transition-all duration-300 rounded-lg px-2"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        opacity: 0,
        animationFillMode: 'forwards'
      }}
    >
      <div className="flex items-center justify-between gap-3 md:gap-10">
        {/* Left side: Image and text */}
        <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
          <img 
            src={fixImageUrl(dish.imageUrl || dish.image_url)} 
            alt={dish.name}
            className="w-20 h-20 md:w-32 md:h-32 rounded-2xl object-cover shadow-lg ring-2 ring-menu-primary/20 flex-shrink-0 hover:scale-105 transition-transform duration-300"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2 truncate">{getDishName(dish)}</h3>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed line-clamp-2">
              {getDescription(dish)}
            </p>
            
            {/* "Подробнее" button */}
            <button
              onClick={() => onViewDetails?.(dish)}
              className="mt-2 md:mt-3 px-3 py-1 md:px-4 md:py-1.5 bg-menu-primary/10 border border-menu-primary/30 text-menu-primary text-xs font-medium rounded-full flex items-center gap-1 md:gap-2 w-fit hover:bg-menu-primary hover:text-white transition-all duration-300"
            >
              <span className="text-xs">ℹ️</span>
              <span className="hidden md:inline">Подробнее</span>
              <span className="md:hidden">Инфо</span>
            </button>
          </div>
        </div>

        {/* Right side: Price circle */}
        <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-menu-primary to-menu-primary/80 shadow-xl shadow-menu-primary/30 border border-menu-primary/20 flex-shrink-0 hover:scale-105 transition-transform duration-300">
          <div className="text-center">
            <span className="text-white text-base md:text-2xl font-bold">{Math.floor(dish.price)} ₸</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
