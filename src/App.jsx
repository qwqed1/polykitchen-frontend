import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DishList from './components/DishList';
import DishModal from './components/DishModal';
import AIChat from './components/AIChat';
import { getAutoApiUrl } from './utils/apiConfig';
import './i18n';

function App() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useAPI, setUseAPI] = useState(import.meta.env.VITE_USE_API === 'true'); // Toggle between API and mock data
  const [activeDish, setActiveDish] = useState(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [dataSource, setDataSource] = useState('loading'); // 'api', 'mock', 'loading'
  const [API_URL, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');

  // Category images mapping
  const categoryImages = {
    1: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=400&fit=crop', // Завтраки
    2: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop', // Супы
    3: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=400&fit=crop', // Салаты
    4: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop', // Основные блюда
    5: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop', // Десерты
    6: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop', // Напитки
  }

  // Initialize API URL dynamically
  useEffect(() => {
    const initializeApiUrl = async () => {
      try {
        const url = await getAutoApiUrl();
        setApiUrl(url);
        console.log('🔧 Auto-detected API URL:', url);
      } catch (error) {
        console.error('Failed to auto-detect API URL:', error);
        setApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3000');
      }
    };
    
    initializeApiUrl();
  }, []);

  const loadDataFromAPI = () => {
    if (useAPI) {
      // Fetch from API
      Promise.all([
        fetch(`${API_URL}/api/categories`).then(res => res.json()),
        fetch(`${API_URL}/api/dishes`).then(res => res.json())
      ])
        .then(([categoriesData, dishesData]) => {
          // Filter only kitchen categories using 'page' field
          // This allows flexible addition of new categories without breaking the code
          const kitchenCategories = categoriesData.filter(cat => 
            cat.page === 'kitchen' || (!cat.page && cat.display_order >= 1 && cat.display_order <= 12)
          );
          setCategories(kitchenCategories);
          
          // Filter dishes: only include kitchen categories (display_order 1-12)
          const kitchenCategoryIds = kitchenCategories.map(c => c.id);
          const kitchenDishes = dishesData.filter(dish => 
            kitchenCategoryIds.includes(dish.category_id)
          );
          
          // Transform dishes data: convert snake_case to camelCase and fix image URLs
          const transformedDishes = kitchenDishes.map(dish => ({
            id: dish.id,
            categoryId: dish.category_id,
            name: dish.name,
            name_ru: dish.name_ru,
            name_en: dish.name_en,
            name_kk: dish.name_kk,
            description: dish.description,
            description_ru: dish.description_ru,
            description_en: dish.description_en,
            description_kk: dish.description_kk,
            price: dish.price,
            weight: dish.weight,
            // Fix image URL: extract /uploads/ path from any URL and prepend current API_URL
            imageUrl: dish.image_url?.includes('/uploads/')
              ? `${API_URL}${dish.image_url.substring(dish.image_url.indexOf('/uploads/'))}`
              : dish.image_url,
            ingredients_text: dish.ingredients_text,
            is_available: dish.is_available
          }));
          
          setDishes(transformedDishes);
          setDataSource('api');
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching data from API:', error);
          console.log('API URL was:', API_URL);
          // Fallback to mock data if API fails
          setDataSource('mock');
          loadMockData();
        });
    } else {
      // Use mock data
      loadMockData();
    }
  };

  useEffect(() => {
    loadDataFromAPI();
  }, [useAPI, API_URL]);

  // Auto-refresh data every 30 seconds when using API
  useEffect(() => {
    if (useAPI) {
      const interval = setInterval(() => {
        loadDataFromAPI();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [useAPI, API_URL]);

  // Auto-rotate carousel
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentCarouselIndex((prev) => (prev + 1) % categories.length);
          setIsAnimating(false);
        }, 500); // Half of animation duration
      }, 4000); // Change every 4 seconds

      return () => clearInterval(interval);
    }
  }, [selectedCategory, categories]);

  const loadMockData = async () => {
    const { menuData } = await import('./data/mockMenu');
    setCategories(menuData.categories);
    setDishes(menuData.dishes);
    if (dataSource !== 'mock') setDataSource('mock');
    setLoading(false);
  };

  const handleGoBack = () => {
    setSelectedCategory(null);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewDish = (dish) => {
    if (!dish) return;
    const category = categories.find((cat) => cat.id === (dish.categoryId || dish.category_id));
    const categoryName = getCategoryName(category);
    setActiveDish({
      ...dish,
      categoryName: categoryName || dish.categoryName || 'Меню',
    });
  };

  const handleCloseDishModal = () => setActiveDish(null);

  const filteredDishes = selectedCategory 
    ? dishes.filter(dish => (dish.categoryId || dish.category_id) === selectedCategory)
    : [];

  // Get category name based on current language
  const getCategoryName = (category) => {
    if (!category) return t('menu.title');
    const lang = i18n.language || 'ru';
    if (lang === 'en' && category.name_en) return category.name_en;
    if (lang === 'kk' && category.name_kk) return category.name_kk;
    return category.name_ru || category.name;
  };

  const currentTitle = selectedCategory 
    ? getCategoryName(categories.find(cat => cat.id === selectedCategory))
    : t('menu.title');

  const currentCarouselCategory = categories[currentCarouselIndex];
  
  // Get first dish from current category
  const firstDishInCategory = currentCarouselCategory
    ? dishes.find(dish => (dish.categoryId || dish.category_id) === currentCarouselCategory.id)
    : null;
  
  // Use first dish image if available, otherwise fallback to category image
  const currentImage = firstDishInCategory?.imageUrl 
    ? firstDishInCategory.imageUrl
    : (currentCarouselCategory 
        ? (categoryImages[currentCarouselCategory.id] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop')
        : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop');

  if (loading) {
    return (
      <div className="min-h-screen bg-menu-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-menu-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-menu-text text-lg font-medium drop-shadow-md">Загрузка меню...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{
            backgroundImage: 'url(/img/background.jpg)',
            filter: 'blur(10px) saturate(0.7)',
            transform: 'scale(1.1)'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 h-screen flex flex-col">
        <Header 
          title={currentTitle}
          onBack={handleGoBack}
          onHome={handleGoHome}
          showBack={selectedCategory !== null}
        />
        
        {/* Data source indicator - for debugging */}
        <div className={`fixed bottom-2 left-2 z-50 px-2 py-1 rounded text-xs font-bold ${
          dataSource === 'api' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {dataSource === 'api' ? '✓ API' : '✗ MOCK'}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {selectedCategory ? (
            <>
              <div className="flex-1 overflow-y-auto animate-fadeIn pb-20 md:pb-0">
                <DishList dishes={filteredDishes} onViewDish={handleViewDish} />
              </div>
              {/* Desktop Sidebar - hidden on mobile */}
              <div className="hidden md:block">
                <Sidebar 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
              
              {/* Mobile Bottom Navigation */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
                {/* Category toggle button */}
                <button
                  onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                  className="w-full bg-white/95 backdrop-blur-md border-t-2 border-white/30 px-4 py-3 flex items-center justify-between text-menu-primary font-semibold shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    {getCategoryName(categories.find(cat => cat.id === selectedCategory))}
                  </span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${isMobileCategoriesOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Categories drawer */}
                {isMobileCategoriesOpen && (
                  <div className="bg-white/98 backdrop-blur-md border-t border-white/30 max-h-64 overflow-y-auto">
                    <div className="p-3 space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setIsMobileCategoriesOpen(false);
                          }}
                          className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                            selectedCategory === category.id
                              ? 'bg-menu-primary text-white font-semibold shadow-lg'
                              : 'bg-white/80 text-menu-text border border-white/50 hover:bg-white'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            selectedCategory === category.id ? 'bg-white' : 'bg-menu-text/40'
                          }`} />
                          <span className="text-sm">{getCategoryName(category)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col md:flex-row">
              {/* Left side content - carousel */}
              <div className="flex-1 flex items-center justify-center px-4 md:px-0">
                <div className="relative w-full max-w-md">
                  <div className="relative z-10 text-center">
                    {/* Animated Dish image and category */}
                    <div className="mb-4">
                      <div 
                        className={`transition-all duration-1000 overflow-hidden p-4 md:p-8 ${
                          isAnimating ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
                        }`}
                      >
                        <img 
                          key={currentCarouselIndex}
                          src={currentImage}
                          alt={currentCarouselCategory?.name || 'Featured dish'}
                          className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover mx-auto mb-4 md:mb-6 ring-4 ring-menu-primary/40 shadow-2xl shadow-menu-primary/20"
                        />
                        
                        <h2 className="text-2xl md:text-3xl font-light text-white drop-shadow-lg" style={{textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}>
                          {getCategoryName(currentCarouselCategory)}
                        </h2>
                      </div>
                    </div>
                    
                    {/* Fixed button - stays in place */}
                    <button 
                      onClick={() => currentCarouselCategory && setSelectedCategory(currentCarouselCategory.id)}
                      className="px-6 py-3 md:px-10 md:py-4 bg-white border-2 border-white text-menu-primary text-sm md:text-base font-semibold rounded-full flex items-center gap-2 mx-auto hover:bg-menu-primary hover:text-white hover:border-menu-primary hover:shadow-2xl hover:shadow-white/30 transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="text-menu-primary">📋</span>
                      {t('menu.goToMenu')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop sidebar - hidden on mobile */}
              <div className="hidden md:block">
                <Sidebar 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <DishModal dish={activeDish} onClose={handleCloseDishModal} />
      
      {/* AI Chat Button */}
      <AIChat />
    </div>
  );
}

export default App;
