import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

function ReviewManager() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ filmId: '', rating: '', reviewText: '' });
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState('');
  const [films, setFilms] = useState([]);

  useEffect(() => {
    fetchFilms();
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:8084/api/reviews');
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

  const handleInputChange = (e) => setNewReview({ ...newReview, [e.target.name]: e.target.value });
  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!user || !newReview.filmId || !newReview.rating || !newReview.reviewText) {
      setError('Заполните все поля или войдите');
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
        publicationDate: new Date().toISOString().split('T')[0],
      };
      await axios.post('http://localhost:8084/api/reviews', reviewData);
      await fetchReviews();
      setNewReview({ filmId: '', rating: '', reviewText: '' });
      setError('');
    } catch (err) {
      setError('Ошибка создания отзыва: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setNewReview({
      filmId: review.film.id,
      rating: review.rating,
      reviewText: review.reviewText,
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
        publicationDate: editingReview.publicationDate,
      };
      await axios.put(`http://localhost:8084/api/reviews/${editingReview.id}`, reviewData);
      await fetchReviews();
      setEditingReview(null);
      setNewReview({ filmId: '', rating: '', reviewText: '' });
      setError('');
    } catch (err) {
      setError('Ошибка обновления отзыва: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      await axios.delete(`http://localhost:8084/api/reviews/${id}`);
      await fetchReviews();
      setError('');
    } catch (err) {
      setError('Ошибка удаления отзыва: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  const handleAddLike = async (id) => {
    try {
      await axios.post(`http://localhost:8084/api/reviews/${id}/like`);
      await fetchReviews();
    } catch (err) {
      setError('Ошибка добавления лайка: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  const handleAddDislike = async (id) => {
    try {
      await axios.post(`http://localhost:8084/api/reviews/${id}/dislike`);
      await fetchReviews();
    } catch (err) {
      setError('Ошибка добавления дизлайка: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  return (
    <div className="container mx-auto mt-8">
      {user ? (
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2">Управление отзывами</h1>
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 animate-pulse">{error}</p>}
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            {editingReview ? 'Редактировать отзыв' : 'Добавить новый отзыв'}
          </h2>
          <form onSubmit={editingReview ? handleUpdateReview : handleCreateReview} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Фильм</label>
                <select
                  name="filmId"
                  value={newReview.filmId}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите фильм</option>
                  {films.map((film) => (
                    <option key={film.id} value={film.id}>
                      {film.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Рейтинг (1-10)</label>
                <input
                  type="number"
                  name="rating"
                  value={newReview.rating}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-1">Текст отзыва</label>
                <textarea
                  name="reviewText"
                  value={newReview.reviewText}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
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
                className="mt-2 w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition duration-200"
              >
                Отменить
              </button>
            )}
          </form>

          <h2 className="text-2xl font-bold text-gray-700 mb-4">Список отзывов</h2>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{review.film?.title || 'Фильм не указан'}</h3>
                  <p className="text-gray-600">Автор: {review.user?.name || 'Неизвестный'}</p>
                  <p className="text-gray-600">Рейтинг: {review.rating}</p>
                  <p className="text-gray-600">Текст: {review.reviewText}</p>
                  <p className="text-gray-600">Дата: {review.publicationDate}</p>
                  <p className="text-gray-600">Лайки: {review.numberOfLikes}</p>
                  <p className="text-gray-600">Дизлайки: {review.numberOfDislikes}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAddLike(review.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition duration-200"
                    >
                      Лайк
                    </button>
                    <button
                      onClick={() => handleAddDislike(review.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-200"
                    >
                      Дизлайк
                    </button>
                    {user && review.user && user.id === review.user.id && (
                      <>
                        <button
                          onClick={() => handleEditReview(review)}
                          className="bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition duration-200"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition duration-200"
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center">Отзывы не найдены.</p>
          )}
        </div>
      ) : (
        <h1 className="text-3xl font-bold text-center text-gray-800">Пожалуйста, войдите или зарегистрируйтесь</h1>
      )}
    </div>
  );
}

export default ReviewManager;