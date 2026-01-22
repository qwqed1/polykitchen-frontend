import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  X, 
  Save,
  User,
  Mail,
  Lock,
  Shield
} from 'lucide-react';
import { getAutoApiUrl } from '../../utils/apiConfig';

function AdminUsers({ onUpdate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  // Initialize API URL dynamically
  useEffect(() => {
    const initializeApiUrl = async () => {
      try {
        const url = await getAutoApiUrl();
        setApiUrl(url);
        console.log('🔧 AdminUsers auto-detected API URL:', url);
      } catch (error) {
        console.error('AdminUsers failed to auto-detect API URL:', error);
        setApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3000');
      }
    };
    
    initializeApiUrl();
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validation
    const errors = {};
    if (!formData.username) errors.username = 'Имя пользователя обязательно';
    if (!formData.email) errors.email = 'Email обязателен';
    if (!formData.email.includes('@')) errors.email = 'Некорректный email';
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${apiUrl}/api/admin/users`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadUsers();
      if (onUpdate) onUpdate();
      closeModal();
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Ошибка при создании пользователя');
      }
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert('Вы не можете удалить свою учетную запись');
      return;
    }

    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${apiUrl}/api/admin/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadUsers();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Ошибка при удалении пользователя');
    }
  };

  const openModal = () => {
    setFormData({
      username: '',
      email: '',
      password: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      username: '',
      email: '',
      password: ''
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
            <h1 className="text-3xl font-bold text-gray-800">Управление администраторами</h1>
            <p className="text-gray-600 mt-2">Всего администраторов: {users.length}</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-menu-primary to-menu-primary/90 text-white rounded-lg hover:from-menu-primary/90 hover:to-menu-primary/80 transition-all"
          >
            <Plus className="w-5 h-5" />
            Добавить администратора
          </button>
        </div>
      </div>

      {/* Users list */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата создания
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-menu-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-menu-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        {user.id === currentUser.id && (
                          <span className="text-xs text-menu-primary font-semibold">Текущий</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {user.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
                  Добавить администратора
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя пользователя *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                    className={`w-full pl-10 pr-4 py-2 border ${formErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-menu-primary focus:border-menu-primary`}
                    placeholder="admin"
                  />
                </div>
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    className={`w-full pl-10 pr-4 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-menu-primary focus:border-menu-primary`}
                    placeholder="admin@example.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                    className={`w-full pl-10 pr-4 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-menu-primary focus:border-menu-primary`}
                    placeholder="Минимум 6 символов"
                  />
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                )}
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
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
