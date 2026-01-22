import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DishList from '../components/DishList';
import LanguageSelector from '../components/LanguageSelector';
import mockData from '../data/mockData';
import { getAutoApiUrl } from '../utils/apiConfig';

const MenuPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');

  const useAPI = import.meta.env.VITE_USE_API === 'true';

  // Initialize API URL dynamically
  useEffect(() => {
    const initializeApiUrl = async () => {
      try {
        const url = await getAutoApiUrl();
        setApiUrl(url);
        console.log('🔧 MenuPage auto-detected API URL:', url);
      } catch (error) {
        console.error('MenuPage failed to auto-detect API URL:', error);
        setApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3000');
      }
    };
    
    initializeApiUrl();
  }, []);

  useEffect(() => {
    if (useAPI) {
      fetchDataFromAPI();
    } else {
      loadMockData();
    }
  }, [useAPI]);

  const fetchDataFromAPI = async () => {
    try {
      setLoading(true);
      const [categoriesRes, dishesRes] = await Promise.all([
        fetch(`${apiUrl}/api/categories`),
        fetch(`${apiUrl}/api/dishes`)
      ]);

      if (!categoriesRes.ok || !dishesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const categoriesData = await categoriesRes.json();
      const dishesData = await dishesRes.json();

      // Filter categories for kitchen page using 'page' field
      const kitchenCategories = categoriesData.filter(cat => cat.page === 'kitchen');
      const kitchenCategoryIds = kitchenCategories.map(c => c.id);
      const kitchenDishes = dishesData.filter(d => kitchenCategoryIds.includes(d.category_id));

      // Debug: check if name fields are present
      if (kitchenDishes.length > 0) {
        console.log('Sample dish data:', kitchenDishes[0]);
        console.log('Has name_ru?', 'name_ru' in kitchenDishes[0]);
        console.log('Has name_en?', 'name_en' in kitchenDishes[0]);
        console.log('Has name_kk?', 'name_kk' in kitchenDishes[0]);
      }

      setCategories(kitchenCategories);
      setDishes(kitchenDishes);
    } catch (error) {
      console.error('Error fetching data:', error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setCategories(mockData.categories);
    setDishes(mockData.dishes);
    setLoading(false);
  };

  const filteredDishes = dishes.filter(dish => {
    const matchesCategory = selectedCategory === 'all' || dish.category_id === selectedCategory;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-900">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/30 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header with back button and language selector */}
        <div className="flex justify-between items-center p-6 bg-black/20 backdrop-blur-sm border-b border-menu-primary/20">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-menu-primary/80 backdrop-blur-sm border border-menu-primary/30 rounded-lg text-white hover:bg-menu-primary transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{t('menu.backToHome')}</span>
          </button>
          
          <h1 className="text-2xl font-bold text-white">{t('menu.title')}</h1>
          
          <LanguageSelector />
        </div>

        {/* Search Bar */}
        <div className="p-6 bg-menu-bg/30 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-menu-primary/60" />
            <input
              type="text"
              placeholder={t('menu.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-menu-bg/50 backdrop-blur-sm border border-menu-primary/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-menu-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            categories={categories} 
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
          
          <main className="flex-1 p-6 overflow-y-auto h-full">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-menu-primary"></div>
              </div>
            ) : (
              <DishList dishes={filteredDishes} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
