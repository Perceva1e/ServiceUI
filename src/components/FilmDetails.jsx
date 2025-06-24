import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function FilmDetails() {
  const { id } = useParams();
  const [film, setFilm] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFilmDetails();
  }, [id]);

  const fetchFilmDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8087/api/aggregation/films/${id}`);
      setFilm(response.data);
    } catch (err) {
      setError('Ошибка загрузки деталей фильма: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  if (!film) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2">
        {film.title}
      </h1>
      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-center animate-pulse">
          {error}
        </p>
      )}
      
      {/* Основная информация о фильме */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Основные данные</h3>
          <p className="text-gray-600">Год: {film.releaseYear}</p>
          <p className="text-gray-600">Язык: {film.originalLanguage || 'Не указан'}</p>
          <p className="text-gray-600">Длительность: {film.duration} мин</p>
          <p className="text-gray-600">Рейтинг: {film.rating || 'Нет'}</p>
        </div>

        {/* Дополнительные данные */}
        {film.filmData && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Дополнительные данные</h3>
            <p className="text-gray-600">Рейтинг: {film.filmData.rating}</p>
            <p className="text-gray-600">Бюджет: ${film.filmData.budget.toLocaleString()}</p>
            <p className="text-gray-600">Доход: ${film.filmData.revenue.toLocaleString()}</p>
            <p className="text-gray-600">Постер: {film.filmData.poster || 'Не указан'}</p>
            <p className="text-gray-600">Трейлер: {film.filmData.trailer || 'Не указан'}</p>
          </div>
        )}
      </div>

      {/* Жанры */}
      {film.genres && film.genres.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b-2 border-gray-200 pb-2">
            Жанры
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {film.genres.map(genre => (
              <div
                key={genre.id}
                className="bg-gray-50 p-3 rounded-lg shadow-md hover:bg-gray-100 transition duration-200"
              >
                <p className="text-gray-800 font-medium">{genre.name}</p>
                <p className="text-gray-600 text-sm">{genre.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Персонал */}
      {film.personnel && film.personnel.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b-2 border-gray-200 pb-2">
            Персонал
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {film.personnel.map(personnel => (
              <div
                key={personnel.id}
                className="bg-gray-50 p-3 rounded-lg shadow-md hover:bg-gray-100 transition duration-200"
              >
                <p className="text-gray-800 font-medium">{personnel.position}</p>
                <p className="text-gray-600">Имя: {personnel.person.name}</p>
                <p className="text-gray-600 text-sm">
                  Биография: {personnel.person.biography || 'Без биографии'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Отзывы */}
      {film.reviews && film.reviews.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b-2 border-gray-200 pb-2">
            Отзывы
          </h3>
          <div className="space-y-4">
            {film.reviews.map(review => (
              <div
                key={review.id}
                className="bg-gray-50 p-4 rounded-lg shadow-md hover:bg-gray-100 transition duration-200"
              >
                <p className="text-gray-800 font-medium">Автор: {review.user.name}</p>
                <p className="text-gray-600">Рейтинг: {review.rating}</p>
                <p className="text-gray-600">Лайки: {review.numberOfLikes}</p>
                <p className="text-gray-600">Дизлайки: {review.numberOfDislikes}</p>
                <p className="text-gray-600">Текст: {review.reviewText}</p>
                <p className="text-gray-500 text-sm">Дата: {review.publicationDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilmDetails;