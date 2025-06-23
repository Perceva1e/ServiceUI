import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

function SavedFilms() {
  const { user } = useAuth();
  const [savedFilms, setSavedFilms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchSavedFilms();
    }
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
      setSavedFilms(savedFilms.filter(film => film.id !== savedFilmId));
      setError('Фильм успешно удалён!');
      setTimeout(() => setError(''), 2000);
    } catch (err) {
      setError('Ошибка удаления фильма: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  if (!user) {
    return <h1 className="text-3xl font-bold text-center">Пожалуйста, войдите</h1>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Сохранённые фильмы</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {savedFilms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedFilms.map(film => (
            <div key={film.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">{film.film.title}</h3>
              <p>Год: {film.film.releaseYear}</p>
              <p>Рейтинг: {film.film.rating || 'Нет'}</p>
              <p>Язык: {film.film.originalLanguage || 'Не указан'}</p>
              <p>Жанры: {film.film.genres?.map(g => g.name).join(', ') || 'Нет'}</p>
              <p>Длительность: {film.film.duration} мин</p>
              <p>Сохранён: {new Date(film.savedAt).toLocaleDateString()}</p>
              <button
                onClick={() => handleDeleteFilm(film.id)}
                className="mt-2 w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Сохранённых фильмов нет.</p>
      )}
    </div>
  );
}

export default SavedFilms;