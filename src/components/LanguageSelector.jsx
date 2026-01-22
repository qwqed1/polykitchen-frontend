import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'kk', name: 'Қазақша', flag: '🇰🇿' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setIsOpen(false);
  };

  return (
    <div className="relative z-[9999]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-4 md:py-2.5 bg-gradient-to-br from-menu-primary to-menu-primary/80 rounded-lg text-white hover:from-menu-primary hover:to-menu-primary/90 transition-all duration-300 shadow-md hover:shadow-red hover:scale-105 font-semibold relative z-[9999] text-sm md:text-base"
      >
        <Globe className="w-4 h-4 md:w-5 md:h-5" />
        <span className="hidden sm:inline">{currentLanguage?.flag} {currentLanguage?.name}</span>
        <span className="sm:hidden">{currentLanguage?.flag}</span>
        <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 md:w-52 glass-effect border border-menu-primary/30 rounded-lg shadow-2xl z-[9999]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-3 py-2 md:px-4 md:py-3 text-left hover:bg-menu-primary/20 transition-all duration-200 flex items-center gap-2 md:gap-3 text-sm md:text-base ${
                i18n.language === lang.code ? 'text-menu-primary bg-menu-primary/10 font-semibold' : 'text-menu-text/80'
              } ${lang.code === 'en' ? 'rounded-t-lg' : ''} ${lang.code === 'kk' ? 'rounded-b-lg' : ''}`}
            >
              <span className="text-lg md:text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
