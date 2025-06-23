import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

function FilmSearch() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    title: '',
    genreNames: '',
    releaseYear: '',
    minRating: '',
    originalLanguage: '',
    sortBy: 'releaseYear',
    sortDirection: 'desc'
  });
  const [films, setFilms] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const params = {
        title: searchParams.title.trim() || undefined,
        genreNames: searchParams.genreNames.trim() || undefined, 
        releaseYear: searchParams.releaseYear ? parseInt(searchParams.releaseYear) : undefined,
        minRating: searchParams.minRating ? parseFloat(searchParams.minRating) : undefined,
        originalLanguage: searchParams.originalLanguage.trim() || undefined,
        sortBy: searchParams.sortBy,
        sortDirection: searchParams.sortDirection
      };
      console.log('Search params:', params);
      const response = await axios.get('http://localhost:8083/api/catalog/films', {
        params,
        paramsSerializer: params => {
          const result = [];
          for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) {
              if (key === 'genreNames') {
                result.push(`${key}=${encodeURIComponent(value)}`);
              } else {
                result.push(`${key}=${encodeURIComponent(value)}`);
              }
            }
          }
          return result.join('&');
        }
      });
      console.log('Response:', response.data);
      setFilms(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Ошибка поиска фильмов: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  const handleSaveFilm = async (filmId) => {
    if (!user) {
      setError('Пожалуйста, войдите для сохранения фильма');
      return;
    }
    try {
      await axios.post(`http://localhost:8085/api/saved-films?userId=${user.id}&filmId=${filmId}`);
      setError('Фильм сохранён!');
      setTimeout(() => setError(''), 2000); // Скрыть сообщение через 2 секунды
    } catch (err) {
      console.error('Save error:', err);
      setError('Ошибка сохранения фильма: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  return (
    <div className="container mx-auto mt-8">
      {user ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Поиск фильмов</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Название</label>
                <input
                  type="text"
                  name="title"
                  value={searchParams.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Введите название фильма"
                />
              </div>
              <div>
                <label className="block text-gray-700">Жанры (названия через запятую)</label>
                <input
                  type="text"
                  name="genreNames"
                  value={searchParams.genreNames}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Например: Sci-Fi, Action"
                />
              </div>
              <div>
                <label className="block text-gray-700">Год выпуска</label>
                <input
                  type="number"
                  name="releaseYear"
                  value={searchParams.releaseYear}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Например: 1999"
                />
              </div>
              <div>
                <label className="block text-gray-700">Минимальный рейтинг</label>
                <input
                  type="number"
                  name="minRating"
                  value={searchParams.minRating}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Например: 7.0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-gray-700">Язык</label>
                <input
                  type="text"
                  name="originalLanguage"
                  value={searchParams.originalLanguage}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Например: English"
                />
              </div>
              <div>
                <label className="block text-gray-700">Сортировка</label>
                <select
                  name="sortBy"
                  value={searchParams.sortBy}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="releaseYear">Год выпуска</option>
                  <option value="rating">Рейтинг</option>
                  <option value="popularity">Популярность</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Направление сортировки</label>
                <select
                  name="sortDirection"
                  value={searchParams.sortDirection}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="asc">По возрастанию</option>
                  <option value="desc">По убыванию</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Поиск
            </button>
          </form>

          {films.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {films.map(film => (
                <div key={film.id} className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-2">{film.title}</h3>
                  <p>Год: {film.releaseYear}</p>
                  <p>Рейтинг: {film.rating || 'Нет'}</p>
                  <p>Язык: {film.originalLanguage || 'Не указан'}</p>
                  <p>Жанры: {film.genres?.map(g => g.name).join(', ') || 'Нет'}</p>
                  <p>Длительность: {film.duration} мин</p>
                  <button
                    onClick={() => handleSaveFilm(film.id)}
                    className="mt-2 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                  >
                    Сохранить
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Фильмы не найдены. Попробуйте изменить критерии поиска.</p>
          )}
        </div>
      ) : (
        <h1 className="text-3xl font-bold text-center">Пожалуйста, войдите или зарегистрируйтесь</h1>
      )}
    </div>
  );
}

export default FilmSearch;