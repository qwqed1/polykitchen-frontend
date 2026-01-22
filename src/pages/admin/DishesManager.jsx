import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X, 
  Save,
  Image,
  DollarSign,
  FileText,
  Weight,
  Eye,
  EyeOff,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { getAutoApiUrl } from '../../utils/apiConfig';

function DishesManager({ onUpdate }) {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  const [formData, setFormData] = useState({
    name: '',
    name_ru: '',
    name_en: '',
    name_kk: '',
    category_id: '',
    description_ru: '',
    description_en: '',
    description_kk: '',
    price: '',
    image_url: '',
    weight: '',
    ingredients_text: '',
    is_available: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [uploading, setUploading] = useState(false);

  // Initialize API URL dynamically
  useEffect(() => {
    const initializeApiUrl = async () => {
      try {
        const url = await getAutoApiUrl();
        setApiUrl(url);
        console.log('🔧 DishesManager auto-detected API URL:', url);
      } catch (error) {
        console.error('DishesManager failed to auto-detect API URL:', error);
        setApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3000');
      }
    };
    
    initializeApiUrl();
  }, []);

  // Helper function to fix image URLs
  const fixImageUrl = (url) => {
    if (!url) return url;
    if (url.includes('/uploads/')) {
      const result = `${apiUrl}${url.substring(url.indexOf('/uploads/'))}`;
      console.log('🖼️ fixImageUrl:', url, '->', result);
      return result;
    }
    return url;
  };

  // Refs for uncontrolled inputs (fixes Cyrillic IME issues on Android)
  const nameRuRef = useRef(null);
  const nameEnRef = useRef(null);
  const nameKkRef = useRef(null);
  const descriptionRuRef = useRef(null);
  const descriptionEnRef = useRef(null);
  const descriptionKkRef = useRef(null);
  const priceRef = useRef(null);
  const weightRef = useRef(null);
  const ingredientsRef = useRef(null);
  const imageUrlRef = useRef(null);
  const categoryRef = useRef(null);
  const availableRef = useRef(null);

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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const [dishesRes, categoriesRes] = await Promise.all([
        axios.get(`${apiUrl}/api/admin/dishes`, config),
        axios.get(`${apiUrl}/api/admin/categories`, config)
      ]);
      setDishes(dishesRes.data);
      setCategories(categoriesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
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
    const descriptionRu = (descriptionRuRef.current?.value || '').trim();
    const descriptionEn = (descriptionEnRef.current?.value || '').trim();
    const descriptionKk = (descriptionKkRef.current?.value || '').trim();
    const price = parseFloat(priceRef.current?.value) || 0;
    const weight = (weightRef.current?.value || '').trim();
    const ingredientsText = (ingredientsRef.current?.value || '').trim();
    const categoryId = categoryRef.current?.value || '';
    const isAvailable = availableRef.current?.checked ?? true;

    // Validation
    const errors = {};
    if (!nameRu) errors.name_ru = 'Название на русском обязательно';
    if (!categoryId) errors.category_id = 'Выберите категорию';
    if (!price || price <= 0) errors.price = 'Укажите корректную цену';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let imageUrl = uploadMode === 'url' 
        ? (imageUrlRef.current?.value || '').trim() 
        : formData.image_url;

      // Upload file if selected
      if (selectedFile && uploadMode === 'file') {
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', selectedFile);

        const token = localStorage.getItem('adminToken');
        const uploadResponse = await axios.post(
          `${apiUrl}/api/admin/upload-image`,
          formDataUpload,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        imageUrl = uploadResponse.data.imageUrl;
        setUploading(false);
      }

      const dishData = {
        name: nameRu,
        name_ru: nameRu,
        name_en: nameEn || nameRu,
        name_kk: nameKk || nameRu,
        category_id: categoryId,
        description_ru: descriptionRu,
        description_en: descriptionEn || descriptionRu,
        description_kk: descriptionKk || descriptionRu,
        price: price,
        image_url: imageUrl,
        weight: weight,
        ingredients_text: ingredientsText,
        is_available: isAvailable
      };

      console.log('Sending dish data:', dishData);

      const config = getAuthConfig();

      if (editingDish) {
        const response = await axios.put(`${apiUrl}/api/admin/dishes/${editingDish.id}`, dishData, config);
        console.log('Update response:', response.data);
      } else {
        const response = await axios.post(`${apiUrl}/api/admin/dishes`, dishData, config);
        console.log('Create response:', response.data);
      }
      
      loadData();
      if (onUpdate) onUpdate();
      closeModal();
    } catch (error) {
      console.error('Error saving dish:', error);
      setUploading(false);
      alert('Ошибка при сохранении блюда: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить это блюдо?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${apiUrl}/api/admin/dishes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert('Ошибка при удалении блюда');
    }
  };

  const handleToggleAvailability = async (dish) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`${apiUrl}/api/admin/dishes/${dish.id}/toggle-availability`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadData();
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const openModal = (dish = null) => {
    if (dish) {
      setEditingDish(dish);
      setFormData({
        name: dish.name,
        name_ru: dish.name_ru || dish.name || '',
        name_en: dish.name_en || '',
        name_kk: dish.name_kk || '',
        category_id: dish.category_id,
        description_ru: dish.description_ru || dish.description || '',
        description_en: dish.description_en || '',
        description_kk: dish.description_kk || '',
        price: dish.price,
        image_url: dish.image_url || '',
        weight: dish.weight || '',
        ingredients_text: dish.ingredients_text || '',
        is_available: dish.is_available
      });
      setImagePreview(fixImageUrl(dish.image_url));
    } else {
      setEditingDish(null);
      setFormData({
        name: '',
        name_ru: '',
        name_en: '',
        name_kk: '',
        category_id: '',
        description_ru: '',
        description_en: '',
        description_kk: '',
        price: '',
        image_url: '',
        weight: '',
        ingredients_text: '',
        is_available: true
      });
      setImagePreview(null);
    }
    setFormErrors({});
    setSelectedFile(null);
    setUploadMode('url');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDish(null);
    setFormData({
      name: '',
      name_ru: '',
      name_en: '',
      name_kk: '',
      category_id: '',
      description_ru: '',
      description_en: '',
      description_kk: '',
      price: '',
      image_url: '',
      weight: '',
      ingredients_text: '',
      is_available: true
    });
    setFormErrors({});
    setSelectedFile(null);
    setImagePreview(null);
    setUploadMode('url');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview(fixImageUrl(editingDish?.image_url));
  };

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dish.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || dish.category_id == selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <h1 className="text-3xl font-bold text-gray-800">Управление блюдами</h1>
            <p className="text-gray-600 mt-2">Всего блюд: {dishes.length}</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-menu-primary to-menu-primary/90 text-white rounded-lg hover:from-menu-primary/90 hover:to-menu-primary/80 transition-all"
          >
            <Plus className="w-5 h-5" />
            Добавить блюдо
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск блюд..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-green focus:border-menu-green"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-green focus:border-menu-green"
          >
            <option value="">Все категории</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name_ru || cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dishes list */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Изображение
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цена
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Вес
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDishes.map(dish => (
                <tr key={dish.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {dish.image_url ? (
                      <img 
                        src={fixImageUrl(dish.image_url)} 
                        alt={dish.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Image className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{dish.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{dish.description_ru || dish.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {dish.category_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{dish.price} ₸</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dish.weight || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleAvailability(dish)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        dish.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {dish.is_available ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Доступно
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Скрыто
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(dish)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dish.id)}
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
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingDish ? 'Редактировать блюдо' : 'Добавить блюдо'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form key={editingDish?.id || 'new'} onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Dish Names in 3 languages */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800">Название блюда</h3>
                <div className="grid grid-cols-1 gap-4">
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
                      placeholder="Введите название на русском"
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
                      placeholder="Enter name in English"
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
                      placeholder="Қазақ тілінде атауын енгізіңіз"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория *
                  </label>
                  <select
                    ref={categoryRef}
                    defaultValue={formData.category_id}
                    className={`w-full px-4 py-2 border ${formErrors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-menu-primary focus:border-menu-primary`}
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name_ru || cat.name}</option>
                    ))}
                  </select>
                  {formErrors.category_id && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.category_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена (₸) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={priceRef}
                      type="number"
                      defaultValue={formData.price}
                      className={`w-full pl-10 pr-4 py-2 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-menu-primary focus:border-menu-primary`}
                    />
                  </div>
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Вес/Объем
                  </label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={weightRef}
                      type="text"
                      defaultValue={formData.weight}
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-green focus:border-menu-green"
                      placeholder="Например: 350г"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание на русском
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      ref={descriptionRuRef}
                      defaultValue={formData.description_ru}
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-green focus:border-menu-green"
                      rows="3"
                      placeholder="Введите описание блюда на русском языке"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание на английском
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      ref={descriptionEnRef}
                      defaultValue={formData.description_en}
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-green focus:border-menu-green"
                      rows="3"
                      placeholder="Enter dish description in English"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание на казахском
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      ref={descriptionKkRef}
                      defaultValue={formData.description_kk}
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-green focus:border-menu-green"
                      rows="3"
                      placeholder="Тағам сипаттамасын қазақ тілінде енгізіңіз"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Изображение
                </label>
                
                {/* Mode selector */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      uploadMode === 'url'
                        ? 'bg-menu-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    URL ссылка
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      uploadMode === 'file'
                        ? 'bg-menu-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Загрузить файл
                  </button>
                </div>

                {uploadMode === 'url' ? (
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={imageUrlRef}
                      type="url"
                      defaultValue={formData.image_url}
                      autoComplete="off"
                      onChange={(e) => {
                        setImagePreview(fixImageUrl(e.target.value));
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-green focus:border-menu-green"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-menu-green transition-colors">
                      <input
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {selectedFile ? selectedFile.name : 'Нажмите для выбора изображения'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF, WEBP до 5MB
                        </p>
                      </label>
                    </div>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Удалить выбранный файл
                      </button>
                    )}
                  </div>
                )}

                {/* Image preview */}
                {imagePreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Предварительный просмотр:</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Состав
                </label>
                <textarea
                  ref={ingredientsRef}
                  defaultValue={formData.ingredients_text}
                  autoComplete="off"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-primary focus:border-menu-primary"
                  rows="2"
                  placeholder="Список ингредиентов"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    ref={availableRef}
                    type="checkbox"
                    defaultChecked={formData.is_available}
                    className="w-4 h-4 text-menu-primary focus:ring-menu-primary border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Блюдо доступно</span>
                </label>
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
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-menu-primary to-menu-primary/90 text-white rounded-lg hover:from-menu-primary/90 hover:to-menu-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingDish ? 'Сохранить' : 'Добавить'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DishesManager;
