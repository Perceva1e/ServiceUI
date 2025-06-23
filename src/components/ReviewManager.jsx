import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

function ReviewManager() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    filmId: '',
    rating: '',
    reviewText: ''
  });
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState('');
  const [films, setFilms] = useState([]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:8084/api/reviews');
      console.log('Fetched reviews:', response.data);
      setReviews(response.data);
    } catch (err) {
      setError('Ошибка загрузки отзывов: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  const fetchFilms = async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/catalog/films');
      setFilms(response.data);
    } catch (err) {
      setError('Ошибка загрузки фильмов: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  useEffect(() => {
    fetchFilms();
    fetchReviews();
  }, []);

  const handleInputChange = (e) => {
    setNewReview({ ...newReview, [e.target.name]: e.target.value });
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Войдите, чтобы оставить отзыв');
      return;
    }
    if (!newReview.filmId || !newReview.rating || !newReview.reviewText) {
      setError('Заполните все поля');
      return;
    }
    if (newReview.rating < 1 || newReview.rating > 10) {
      setError('Рейтинг должен быть от 1 до 10');
      return;
    }
    try {
      const reviewData = {
        user: { id: user.id },
        film: { id: parseInt(newReview.filmId) },
        rating: parseInt(newReview.rating),
        reviewText: newReview.reviewText,
        numberOfLikes: 0,
        numberOfDislikes: 0,
        publicationDate: new Date().toISOString().split('T')[0]
      };
      console.log('Creating review:', reviewData);
      const response = await axios.post('http://localhost:8084/api/reviews', reviewData);
      await fetchReviews();
      setNewReview({ filmId: '', rating: '', reviewText: '' });
      setError('');
    } catch (err) {
      console.error('Create review error:', err.response?.data || err);
      setError('Ошибка создания отзыва: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setNewReview({
      filmId: review.film.id,
      rating: review.rating,
      reviewText: review.reviewText
    });
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!newReview.filmId || !newReview.rating || !newReview.reviewText) {
      setError('Заполните все поля');
      return;
    }
    if (newReview.rating < 1 || newReview.rating > 10) {
      setError('Рейтинг должен быть от 1 до 10');
      return;
    }
    try {
      const reviewData = {
        user: { id: editingReview.user.id },
        film: { id: parseInt(newReview.filmId) },
        rating: parseInt(newReview.rating),
        reviewText: newReview.reviewText,
        numberOfLikes: editingReview.numberOfLikes,
        numberOfDislikes: editingReview.numberOfDislikes,
        publicationDate: editingReview.publicationDate
      };
      console.log('Updating review:', reviewData);
      const response = await axios.put(`http://localhost:8084/api/reviews/${editingReview.id}`, reviewData);
      await fetchReviews(); 
      setEditingReview(null);
      setNewReview({ filmId: '', rating: '', reviewText: '' });
      setError('');
    } catch (err) {
      console.error('Update review error:', err.response?.data || err);
      setError('Ошибка обновления отзыва: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      await axios.delete(`http://localhost:8084/api/reviews/${id}`);
      await fetchReviews(); 
      setError('');
    } catch (err) {
      console.error('Delete review error:', err.response?.data || err);
      setError('Ошибка удаления отзыва: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  const handleAddLike = async (id) => {
    try {
      const response = await axios.post(`http://localhost:8084/api/reviews/${id}/like`);
      await fetchReviews(); 
    } catch (err) {
      console.error('Add like error:', err.response?.data || err);
      setError('Ошибка добавления лайка: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  const handleAddDislike = async (id) => {
    try {
      const response = await axios.post(`http://localhost:8084/api/reviews/${id}/dislike`);
      await fetchReviews(); 
    } catch (err) {
      console.error('Add dislike error:', err.response?.data || err);
      setError('Ошибка добавления дизлайка: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  return (
    <div className="container mx-auto mt-8">
      {user ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">Управление отзывами</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <h2 className="text-2xl font-bold mb-4">{editingReview ? 'Редактировать отзыв' : 'Добавить новый отзыв'}</h2>
          <form onSubmit={editingReview ? handleUpdateReview : handleCreateReview} className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Фильм</label>
                <select
                  name="filmId"
                  value={newReview.filmId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Выберите фильм</option>
                  {films.map(film => (
                    <option key={film.id} value={film.id}>{film.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Рейтинг (1-10)</label>
                <input
                  type="number"
                  name="rating"
                  value={newReview.rating}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Например: 8"
                  min="1"
                  max="10"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700">Текст отзыва</label>
                <textarea
                  name="reviewText"
                  value={newReview.reviewText}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Ваш отзыв"
                  rows="4"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              {editingReview ? 'Сохранить изменения' : 'Добавить отзыв'}
            </button>
            {editingReview && (
              <button
                type="button"
                onClick={() => {
                  setEditingReview(null);
                  setNewReview({ filmId: '', rating: '', reviewText: '' });
                }}
                className="mt-2 w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                Отменить
              </button>
            )}
          </form>

          <h2 className="text-2xl font-bold mb-4">Список отзывов</h2>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-2">{review.film?.title || 'Фильм не указан'}</h3>
                  <p>Пользователь: {review.user?.name || 'Неизвестный'}</p>
                  <p>Рейтинг: {review.rating}</p>
                  <p>Текст: {review.reviewText}</p>
                  <p>Дата: {review.publicationDate}</p>
                  <p>Лайки: {review.numberOfLikes}</p>
                  <p>Дизлайки: {review.numberOfDislikes}</p>
                  <div className="mt-4">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <button
                        onClick={() => handleAddLike(review.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
                      >
                        Лайк
                      </button>
                      <button
                        onClick={() => handleAddDislike(review.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                      >
                        Дизлайк
                      </button>
                      {user && review.user && user.id === review.user.id && (
                        <>
                          <button
                            onClick={() => handleEditReview(review)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-sm"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 text-sm"
                          >
                            Удалить
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Отзывы не найдены.</p>
          )}
        </div>
      ) : (
        <h1 className="text-3xl font-bold text-center">Пожалуйста, войдите или зарегистрируйтесь</h1>
      )}
    </div>
  );
}

export default ReviewManager;