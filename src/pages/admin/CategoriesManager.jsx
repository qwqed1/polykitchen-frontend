import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save,
  ArrowUp,
  ArrowDown,
  Grid3x3
} from 'lucide-react';
import { getAutoApiUrl } from '../../utils/apiConfig';

function CategoriesManager({ onUpdate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  const [formData, setFormData] = useState({
    name_ru: '',
    name_en: '',
    name_kk: '',
    display_order: 0,
    page: 'kitchen'
  });
  const [formErrors, setFormErrors] = useState({});

  // Initialize API URL dynamically
  useEffect(() => {
    const initializeApiUrl = async () => {
      try {
        const url = await getAutoApiUrl();
        setApiUrl(url);
        console.log('🔧 CategoriesManager auto-detected API URL:', url);
      } catch (error) {
        console.error('CategoriesManager failed to auto-detect API URL:', error);
        setApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3000');
      }
    };
    
    initializeApiUrl();
  }, []);

  // Refs for uncontrolled inputs (fixes Cyrillic IME issues on Android)
  const nameRuRef = useRef(null);
  const nameEnRef = useRef(null);
  const nameKkRef = useRef(null);
  const displayOrderRef = useRef(null);
  const pageRef = useRef(null);

  // Helper function to get auth config with UTF-8 charset
  const getAuthConfig = () => {
    const token = localStorage.getItem('adminToken');
    return {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      }
    };
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/api/admin/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading categories:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Get values from refs (uncontrolled inputs for Cyrillic IME support)
    const nameRu = (nameRuRef.current?.value || '').trim();
    const nameEn = (nameEnRef.current?.value || '').trim();
    const nameKk = (nameKkRef.current?.value || '').trim();
    const displayOrder = parseInt(displayOrderRef.current?.value) || 0;
    const page = pageRef.current?.value || 'kitchen';

    // Validation
    const errors = {};
    if (!nameRu) errors.name_ru = 'Название на русском обязательно';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const categoryData = {
        name_ru: nameRu,
        name_en: nameEn || nameRu,
        name_kk: nameKk || nameRu,
        display_order: displayOrder,
        page: page
      };

      const config = getAuthConfig();
      
      if (editingCategory) {
        await axios.put(`${apiUrl}/api/admin/categories/${editingCategory.id}`, categoryData, config);
      } else {
        await axios.post(`${apiUrl}/api/admin/categories`, categoryData, config);
      }
      
      loadCategories();
      if (onUpdate) onUpdate();
      closeModal();
    } catch (error) {
      console.error('Error saving category:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Ошибка при сохранении категории');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию? Убедитесь, что в ней нет блюд.')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${apiUrl}/api/admin/categories/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadCategories();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting category:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Ошибка при удалении категории');
      }
    }
  };

  const handleMoveUp = async (category) => {
    const index = categories.findIndex(c => c.id === category.id);
    if (index <= 0) return;

    const prevCategory = categories[index - 1];
    
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      await Promise.all([
        axios.put(`${apiUrl}/api/admin/categories/${category.id}`, {
          display_order: prevCategory.display_order
        }, config),
        axios.put(`${apiUrl}/api/admin/categories/${prevCategory.id}`, {
          display_order: category.display_order
        }, config)
      ]);
      loadCategories();
    } catch (error) {
      console.error('Error reordering categories:', error);
    }
  };

  const handleMoveDown = async (category) => {
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= categories.length - 1) return;

    const nextCategory = categories[index + 1];
    
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      await Promise.all([
        axios.put(`${apiUrl}/api/admin/categories/${category.id}`, {
          display_order: nextCategory.display_order
        }, config),
        axios.put(`${apiUrl}/api/admin/categories/${nextCategory.id}`, {
          display_order: category.display_order
        }, config)
      ]);
      loadCategories();
    } catch (error) {
      console.error('Error reordering categories:', error);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name_ru: category.name_ru || category.name || '',
        name_en: category.name_en || '',
        name_kk: category.name_kk || '',
        display_order: category.display_order,
        page: category.page || 'kitchen'
      });
    } else {
      setEditingCategory(null);
      const maxOrder = Math.max(...categories.map(c => c.display_order), 0);
      setFormData({
        name_ru: '',
        name_en: '',
        name_kk: '',
        display_order: maxOrder + 10,
        page: 'kitchen'
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name_ru: '',
      name_en: '',
      name_kk: '',
      display_order: 0,
      page: 'kitchen'
    });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-menu-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Управление категориями</h1>
            <p className="text-gray-600 mt-2">Всего категорий: {categories.length}</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-menu-primary to-menu-primary/90 text-white rounded-lg hover:from-menu-primary/90 hover:to-menu-primary/80 transition-all"
          >
            <Plus className="w-5 h-5" />
            Добавить категорию
          </button>
        </div>
      </div>

      {/* Categories list */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Порядок
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Страница
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Количество блюд
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сортировка
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category, index) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-10 h-10 bg-menu-primary/10 rounded-lg">
                      <span className="text-sm font-semibold text-menu-primary">
                        {category.display_order}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Grid3x3 className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{category.name_ru || category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      category.page === 'kitchen' ? 'bg-green-100 text-green-800' :
                      category.page === 'bar' ? 'bg-blue-100 text-blue-800' :
                      category.page === 'pizza' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {category.page === 'kitchen' ? 'Кухня' :
                       category.page === 'bar' ? 'Напитки' :
                       category.page === 'pizza' ? 'Пицца' :
                       category.page === 'hidden' ? 'Скрыта' :
                       category.page || 'Кухня'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {category.dishes_count || 0} блюд
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMoveUp(category)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-menu-primary hover:bg-gray-100'}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(category)}
                        disabled={index === categories.length - 1}
                        className={`p-1 rounded ${index === categories.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-menu-primary hover:bg-gray-100'}`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form key={editingCategory?.id || 'new'} onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название на русском *
                </label>
                <input
                  ref={nameRuRef}
                  type="text"
                  defaultValue={formData.name_ru}
                  autoComplete="off"
                  className={`w-full px-4 py-2 border ${formErrors.name_ru ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-menu-primary focus:border-menu-primary`}
                  placeholder="Например: Завтраки"
                />
                {formErrors.name_ru && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name_ru}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название на английском
                </label>
                <input
                  ref={nameEnRef}
                  type="text"
                  defaultValue={formData.name_en}
                  autoComplete="off"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-primary focus:border-menu-primary"
                  placeholder="Например: Breakfast"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название на казахском
                </label>
                <input
                  ref={nameKkRef}
                  type="text"
                  defaultValue={formData.name_kk}
                  autoComplete="off"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-primary focus:border-menu-primary"
                  placeholder="Например: Таңғы ас"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Порядок отображения
                </label>
                <input
                  ref={displayOrderRef}
                  type="number"
                  defaultValue={formData.display_order}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-primary focus:border-menu-primary"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Категории с меньшим числом отображаются первыми
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Страница *
                </label>
                <select
                  ref={pageRef}
                  value={formData.page}
                  onChange={(e) => setFormData({...formData, page: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-primary focus:border-menu-primary"
                >
                  <option value="kitchen">Кухня (/menu)</option>
                  <option value="bar">Напитки (/bar)</option>
                  <option value="pizza">Пицца (/pizza)</option>
                  <option value="hidden">Скрытая категория</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Выберите, на какой странице будет отображаться категория
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-menu-text hover:bg-menu-hover rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-menu-primary to-menu-primary/90 text-white rounded-lg hover:from-menu-primary/90 hover:to-menu-primary/80 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesManager;
