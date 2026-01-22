import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  Check, 
  X, 
  Trash2, 
  Star, 
  Filter,
  RefreshCw,
  User,
  Clock
} from 'lucide-react';
import { getAutoApiUrl } from '../../utils/apiConfig';

function ReviewsManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');

  useEffect(() => {
    const initializeApiUrl = async () => {
      try {
        const url = await getAutoApiUrl();
        setApiUrl(url);
      } catch (error) {
        console.error('Failed to auto-detect API URL:', error);
      }
    };
    initializeApiUrl();
  }, []);

  useEffect(() => {
    loadReviews();
  }, [filter, apiUrl]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await axios.get(`${apiUrl}/api/admin/reviews${params}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`${apiUrl}/api/admin/reviews/${id}`, {
        is_approved: 1,
        moderation_reason: 'Одобрено администратором'
      });
      loadReviews();
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`${apiUrl}/api/admin/reviews/${id}`, {
        is_approved: -1,
        moderation_reason: 'Отклонено администратором'
      });
      loadReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот отзыв навсегда?')) return;
    try {
      await axios.delete(`${apiUrl}/api/admin/reviews/${id}`);
      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const getStatusBadge = (isApproved) => {
    if (isApproved === 1) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Одобрен</span>;
    } else if (isApproved === -1) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Отклонён</span>;
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">На модерации</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Управление отзывами</h1>
          <p className="text-gray-600">Модерация отзывов пользователей</p>
        </div>
        <button
          onClick={loadReviews}
          className="flex items-center gap-2 px-4 py-2 bg-menu-primary text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Обновить
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'Все', icon: MessageSquare },
          { value: 'pending', label: 'На модерации', icon: Clock },
          { value: 'approved', label: 'Одобренные', icon: Check },
          { value: 'rejected', label: 'Отклонённые', icon: X }
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              filter === item.value
                ? 'bg-menu-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-menu-primary border-t-transparent rounded-full"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Нет отзывов для отображения</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* User and dish info */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{review.user_name}</p>
                      <p className="text-sm text-gray-500">
                        Блюдо: <span className="font-medium">{review.dish_name || `ID: ${review.dish_id}`}</span>
                      </p>
                    </div>
                    <div className="ml-auto">
                      {getStatusBadge(review.is_approved)}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">({review.rating}/5)</span>
                  </div>

                  {/* Review text */}
                  <p className="text-gray-700 mb-3">{review.review_text}</p>

                  {/* Moderation reason if exists */}
                  {review.moderation_reason && (
                    <p className="text-sm text-gray-500 italic mb-2">
                      Причина: {review.moderation_reason}
                    </p>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    {formatDate(review.created_at)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  {review.is_approved !== 1 && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Одобрить"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  {review.is_approved !== -1 && (
                    <button
                      onClick={() => handleReject(review.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Отклонить"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsManager;
