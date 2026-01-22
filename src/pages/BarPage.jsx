import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DishList from '../components/DishList';
import DishModal from '../components/DishModal';
import { getAutoApiUrl } from '../utils/apiConfig';
import '../i18n';

function BarPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useAPI, setUseAPI] = useState(import.meta.env.VITE_USE_API === 'true');
  const [activeDish, setActiveDish] = useState(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [API_URL, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');

  // Bar category IDs - adjust these based on your database
  const BAR_CATEGORY_IDS = []; // Will be populated with drink categories

  const categoryImages = {
    13: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop', // Напитки
    14: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=400&fit=crop', // Коктейли
    15: 'https://images.unsplash.com/photo-1509669803555-fd5c0c88e8f3?w=400&h=400&fit=crop', // Кофе
  };

  // Initialize API URL dynamically
  useEffect(() => {
    const initializeApiUrl = async () => {
      try {
        const url = await getAutoApiUrl();
        setApiUrl(url);
        console.log('🔧 BarPage auto-detected API URL:', url);
      } catch (error) {
        console.error('BarPage failed to auto-detect API URL:', error);
        setApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3000');
      }
    };
    
    initializeApiUrl();
  }, []);

  const loadDataFromAPI = () => {
    if (useAPI) {
      Promise.all([
        fetch(`${API_URL}/api/categories`).then(res => res.json()),
        fetch(`${API_URL}/api/dishes`).then(res => res.json())
      ])
        .then(([categoriesData, dishesData]) => {
          // Filter bar categories using 'page' field (with fallback to name matching)
          const barCategories = categoriesData.filter(cat => {
            // Primary: use 'page' field if available
            if (cat.page === 'bar') return true;
            
            // Fallback: match by name for backward compatibility
            const barCategoryNames = ['прохладительные напитки', 'лимонады', 'чаи'];
            const nameRu = (cat.name_ru || '').toLowerCase();
            const nameEn = (cat.name_en || '').toLowerCase();
            const nameKk = (cat.name_kk || '').toLowerCase();
            return barCategoryNames.some(name => 
              nameRu.includes(name) || nameEn.includes(name) || nameKk.includes(name)
            );
          });
          
          setCategories(barCategories);
          
          // Filter dishes for bar categories only
          const barCategoryIds = barCategories.map(c => c.id);
          const barDishes = dishesData.filter(dish => 
            barCategoryIds.includes(dish.category_id)
          );
          
          const transformedDishes = barDishes.map(dish => ({
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
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching data from API:', error);
          setLoading(false);
        });
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
      }, 30000);
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
        }, 500);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedCategory, categories]);

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

  const getCategoryName = (category) => {
    if (!category) return t('menu.bar');
    const lang = i18n.language || 'ru';
    if (lang === 'en' && category.name_en) return category.name_en;
    if (lang === 'kk' && category.name_kk) return category.name_kk;
    return category.name_ru || category.name;
  };

  const currentTitle = selectedCategory 
    ? getCategoryName(categories.find(cat => cat.id === selectedCategory))
    : 'НАПИТКИ';

  const currentCarouselCategory = categories[currentCarouselIndex];
  
  const firstDishInCategory = currentCarouselCategory
    ? dishes.find(dish => (dish.categoryId || dish.category_id) === currentCarouselCategory.id)
    : null;
  
  const currentImage = firstDishInCategory?.imageUrl 
    || categoryImages[currentCarouselCategory?.id] 
    || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop';

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
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
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

        {/* Mobile category selector - only visible on mobile when category is selected */}
        {selectedCategory && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-white/30 px-4 py-3 overflow-x-auto shadow-lg">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-menu-primary text-white shadow-lg'
                      : 'bg-white text-menu-text border-2 border-white/50 hover:bg-white hover:border-white'
                  }`}
                >
                  {getCategoryName(category)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {selectedCategory ? (
            <>
              <div className="flex-1 overflow-y-auto animate-fadeIn">
                <DishList dishes={filteredDishes} onViewDish={handleViewDish} />
              </div>
              {/* Hide sidebar on mobile (md:flex) */}
              <div className="hidden md:block">
                <Sidebar 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex">
              {/* Left side content */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative">
                  <div className="relative z-10 text-center px-4">
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
                          alt={currentCarouselCategory?.name || 'Featured drink'}
                          className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover mx-auto mb-4 md:mb-6 ring-4 ring-menu-primary/40 shadow-2xl shadow-menu-primary/20"
                        />
                        
                        <h2 className="text-2xl md:text-3xl font-light text-white drop-shadow-lg" style={{textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}>
                          {getCategoryName(currentCarouselCategory)}
                        </h2>
                      </div>
                    </div>
                    
                    {/* Fixed button */}
                    <button 
                      onClick={() => currentCarouselCategory && setSelectedCategory(currentCarouselCategory.id)}
                      className="px-6 md:px-10 py-3 md:py-4 bg-white border-2 border-white text-menu-primary text-sm md:text-base font-semibold rounded-full flex items-center gap-2 mx-auto hover:bg-menu-primary hover:text-white hover:border-menu-primary hover:shadow-2xl hover:shadow-white/30 transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="text-menu-primary">🍹</span>
                      {t('menu.goToMenu')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right sidebar - hidden on mobile */}
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
    </div>
  );
}

export default BarPage;
