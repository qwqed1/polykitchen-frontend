import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Home, 
  UtensilsCrossed, 
  Grid3x3, 
  Users, 
  LogOut, 
  Menu,
  X,
  Plus,
  Settings,
  MessageSquare
} from 'lucide-react';
import DishesManager from './DishesManager';
import CategoriesManager from './CategoriesManager';
import AdminUsers from './AdminUsers';
import ReviewsManager from './ReviewsManager';
import { getAutoApiUrl } from '../../utils/apiConfig';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ dishes: 0, categories: 0, admins: 0 });
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize API URL dynamically
  useEffect(() => {
    const initializeApiUrl = async () => {
      try {
        const url = await getAutoApiUrl();
        setApiUrl(url);
        console.log('🔧 Dashboard auto-detected API URL:', url);
      } catch (error) {
        console.error('Dashboard failed to auto-detect API URL:', error);
        setApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3000');
      }
    };
    
    initializeApiUrl();
  }, []);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!token || !adminUser) {
      navigate('/admin/login');
      return;
    }

    setUser(JSON.parse(adminUser));
    
    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Verify token
    axios.get(`${apiUrl}/api/admin/verify`)
      .catch(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
      });

    // Load stats
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const [dishesRes, categoriesRes, usersRes] = await Promise.all([
        axios.get(`${apiUrl}/api/admin/dishes`),
        axios.get(`${apiUrl}/api/admin/categories`),
        axios.get(`${apiUrl}/api/admin/users`)
      ]);

      setStats({
        dishes: dishesRes.data.length,
        categories: categoriesRes.data.length,
        admins: usersRes.data.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: Home, label: 'Главная' },
    { path: '/admin/dashboard/dishes', icon: UtensilsCrossed, label: 'Блюда' },
    { path: '/admin/dashboard/categories', icon: Grid3x3, label: 'Категории' },
    { path: '/admin/dashboard/reviews', icon: MessageSquare, label: 'Отзывы' },
    { path: '/admin/dashboard/users', icon: Users, label: 'Пользователи' }
  ];

  const isActivePath = (path) => {
    if (path === '/admin/dashboard' && location.pathname === '/admin/dashboard') return true;
    if (path !== '/admin/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-800 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-menu-primary to-menu-primary/90 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>
              Админ панель
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {sidebarOpen && user && (
            <div className="mt-4 text-sm">
              <p className="opacity-90">Добро пожаловать,</p>
              <p className="font-semibold">{user.username}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isActivePath(item.path)
                      ? 'bg-white/20 text-white'
                      : 'hover:bg-white/10 text-white/80 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Выйти</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardHome stats={stats} />} />
          <Route path="/dishes/*" element={<DishesManager onUpdate={loadStats} />} />
          <Route path="/categories/*" element={<CategoriesManager onUpdate={loadStats} />} />
          <Route path="/reviews/*" element={<ReviewsManager />} />
          <Route path="/users/*" element={<AdminUsers onUpdate={loadStats} />} />
        </Routes>
      </div>
    </div>
  );
}

function DashboardHome({ stats }) {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Блюда',
      count: stats.dishes,
      icon: UtensilsCrossed,
      color: 'from-blue-500 to-blue-600',
      path: '/admin/dashboard/dishes'
    },
    {
      title: 'Категории',
      count: stats.categories,
      icon: Grid3x3,
      color: 'from-green-500 to-green-600',
      path: '/admin/dashboard/categories'
    },
    {
      title: 'Администраторы',
      count: stats.admins,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      path: '/admin/dashboard/users'
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Панель управления</h1>
        <p className="text-gray-600 mt-2">Управление меню ресторана</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map(card => (
          <div
            key={card.title}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className={`h-2 bg-gradient-to-r ${card.color}`} />
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{card.count}</p>
                </div>
                <div className={`p-3 bg-gradient-to-r ${card.color} rounded-lg`}>
                  <card.icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Быстрые действия</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/dashboard/dishes')}
              className="w-full flex items-center gap-3 p-4 bg-menu-hover hover:bg-menu-border rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-menu-primary" />
              <span className="text-gray-700">Добавить новое блюдо</span>
            </button>
            <button
              onClick={() => navigate('/admin/dashboard/categories')}
              className="w-full flex items-center gap-3 p-4 bg-menu-hover hover:bg-menu-border rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-menu-primary" />
              <span className="text-gray-700">Добавить новую категорию</span>
            </button>
            <button
              onClick={() => navigate('/admin/dashboard/users')}
              className="w-full flex items-center gap-3 p-4 bg-menu-hover hover:bg-menu-border rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-menu-primary" />
              <span className="text-gray-700">Управление пользователями</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Информация о системе</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">База данных</span>
              <span className="font-semibold text-gray-800">PostgreSQL</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">API сервер</span>
              <span className="font-semibold text-gray-800">Активен</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Версия</span>
              <span className="font-semibold text-gray-800">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
