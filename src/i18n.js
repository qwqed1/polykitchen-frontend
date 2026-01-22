import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import ruTranslation from './locales/ru.json';
import kkTranslation from './locales/kk.json';

const resources = {
  en: {
    translation: enTranslation
  },
  ru: {
    translation: ruTranslation
  },
  kk: {
    translation: kkTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'ru', // Default to Russian
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
