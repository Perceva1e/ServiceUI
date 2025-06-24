import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

function SavedFilms() {
  const { user } = useAuth();
  const [savedFilms, setSavedFilms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchSavedFilms();
  }, [user]);

  const fetchSavedFilms = async () => {
    try {
      const response = await axios.get(`http://localhost:8085/api/saved-films/user/${user.id}`);
      setSavedFilms(response.data);
    } catch (err) {
      setError('Ошибка загрузки сохранённых фильмов: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  const handleDeleteFilm = async (savedFilmId) => {
    try {
      await axios.delete(`http://localhost:8085/api/saved-films/${savedFilmId}`);
      setSavedFilms(savedFilms.filter((film) => film.id !== savedFilmId));
      setError('Фильм успешно удалён!');
      setTimeout(() => setError(''), 2000);
    } catch (err) {
      setError('Ошибка удаления фильма: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  if (!user) {
    return <h1 className="text-3xl font-bold text-center text-gray-800">Пожалуйста, войдите</h1>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2">Сохранённые фильмы</h1>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 animate-pulse">{error}</p>}
      {savedFilms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedFilms.map((film) => (
            <div key={film.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{film.film.title}</h3>
              <p className="text-gray-600">Год: {film.film.releaseYear}</p>
              <p className="text-gray-600">Рейтинг: {film.film.rating || 'Нет'}</p>
              <p className="text-gray-600">Язык: {film.film.originalLanguage || 'Не указан'}</p>
              <p className="text-gray-600">Жанры: {film.film.genres?.map((g) => g.name).join(', ') || 'Нет'}</p>
              <p className="text-gray-600">Длительность: {film.film.duration} мин</p>
              <p className="text-gray-600">Сохранён: {new Date(film.savedAt).toLocaleDateString()}</p>
              <button
                onClick={() => handleDeleteFilm(film.id)}
                className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Удалить
              </button>
              <Link
                to={`/details/${film.film.id}`}
                className="mt-2 block w-full bg-indigo-600 text-white py-2 rounded-lg text-center hover:bg-indigo-700 transition duration-200"
              >
                Детали
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center">Сохранённых фильмов нет.</p>
      )}
    </div>
  );
}

export default SavedFilms;