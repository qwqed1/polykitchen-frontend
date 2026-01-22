import React, { useState, useEffect } from 'react';
import { Star, Send, MessageCircle, User } from 'lucide-react';
import { getAutoApiUrl } from '../utils/apiConfig';

const ReviewSection = ({ dishId, dishName }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  
  // Form state
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Initialize API URL
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

  // Fetch reviews for this dish
  useEffect(() => {
    if (!dishId) return;
    
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/api/dishes/${dishId}/reviews`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [dishId, apiUrl]);

  // Submit review
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !reviewText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dish_id: dishId,
          user_name: userName.trim(),
          rating,
          review_text: reviewText.trim()
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setShowForm(false);
        setUserName('');
        setRating(5);
        setReviewText('');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Star rating component
  const StarRating = ({ value, onChange, readonly = false }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`w-5 h-5 ${
              (readonly ? value : (hoverRating || value)) >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-400'
            }`}
          />
        </button>
      ))}
    </div>
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="mt-6 border-t border-white/20 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white/90 text-xs md:text-sm uppercase tracking-widest">
          <MessageCircle className="w-4 h-4" />
          Отзывы ({reviews.length})
        </div>
        
        {!showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 text-xs md:text-sm bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 hover:scale-105"
          >
            + Оставить отзыв
          </button>
        )}
      </div>

      {/* Success message */}
      {submitted && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm">
          ✓ Спасибо за отзыв! Он появится после модерации.
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
          <div className="space-y-3">
            <div>
              <label className="block text-white/70 text-xs mb-1">Ваше имя</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Введите имя..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40"
                required
              />
            </div>
            
            <div>
              <label className="block text-white/70 text-xs mb-1">Оценка</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            
            <div>
              <label className="block text-white/70 text-xs mb-1">Отзыв</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Поделитесь впечатлениями о блюде..."
                rows={3}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40 resize-none"
                required
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-white text-red-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center text-white/50 py-4">
          <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full mx-auto"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-white/50 py-4 text-sm">
          Пока нет отзывов. Будьте первым!
        </div>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-white/70" />
                  </div>
                  <span className="text-white font-medium text-sm">{review.user_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} readonly />
                  <span className="text-white/40 text-xs">{formatDate(review.created_at)}</span>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{review.review_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
