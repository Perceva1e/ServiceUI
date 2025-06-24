import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

function FilmSearch() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    title: '',
    genreNames: '',
    releaseYear: '',
    minRating: '',
    originalLanguage: '',
    sortBy: 'releaseYear',
    sortDirection: 'desc',
  });
  const [films, setFilms] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (e) => setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
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
        sortDirection: searchParams.sortDirection,
      };
      const response = await axios.get('http://localhost:8083/api/catalog/films', {
        params,
        paramsSerializer: (params) =>
          Object.entries(params)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join('&'),
      });
      setFilms(response.data);
    } catch (err) {
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
      setTimeout(() => setError(''), 2000);
    } catch (err) {
      setError('Ошибка сохранения фильма: ' + (err.response?.data?.message || 'Попробуйте снова.'));
    }
  };

  return (
    <div className="container mx-auto mt-8">
      {user ? (
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2">Поиск фильмов</h2>
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 animate-pulse">{error}</p>}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Название', name: 'title', placeholder: 'Введите название фильма' },
                { label: 'Жанры', name: 'genreNames', placeholder: 'Например: Sci-Fi, Action' },
                { label: 'Год выпуска', name: 'releaseYear', placeholder: 'Например: 1999', type: 'number' },
                { label: 'Минимальный рейтинг', name: 'minRating', placeholder: 'Например: 7.0', type: 'number', step: '0.1' },
                { label: 'Язык', name: 'originalLanguage', placeholder: 'Например: English' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-gray-700 font-medium mb-1">{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={searchParams[field.name]}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder}
                    step={field.step}
                  />
                </div>
              ))}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Сортировка</label>
                <select
                  name="sortBy"
                  value={searchParams.sortBy}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="releaseYear">Год выпуска</option>
                  <option value="rating">Рейтинг</option>
                  <option value="popularity">Популярность</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Направление</label>
                <select
                  name="sortDirection"
                  value={searchParams.sortDirection}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="asc">По возрастанию</option>
                  <option value="desc">По убыванию</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Поиск
            </button>
          </form>

          {films.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {films.map((film) => (
                <div key={film.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{film.title}</h3>
                  <p className="text-gray-600">Год: {film.releaseYear}</p>
                  <p className="text-gray-600">Рейтинг: {film.rating || 'Нет'}</p>
                  <p className="text-gray-600">Язык: {film.originalLanguage || 'Не указан'}</p>
                  <p className="text-gray-600">Жанры: {film.genres?.map((g) => g.name).join(', ') || 'Нет'}</p>
                  <p className="text-gray-600">Длительность: {film.duration} мин</p>
                  <button
                    onClick={() => handleSaveFilm(film.id)}
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200"
                  >
                    Сохранить
                  </button>
                  <Link
                    to={`/details/${film.id}`}
                    className="mt-2 block w-full bg-indigo-600 text-white py-2 rounded-lg text-center hover:bg-indigo-700 transition duration-200"
                  >
                    Детали
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center">Фильмы не найдены. Попробуйте изменить критерии поиска.</p>
          )}
        </div>
      ) : (
        <h1 className="text-3xl font-bold text-center text-gray-800">Пожалуйста, войдите или зарегистрируйтесь</h1>
      )}
    </div>
  );
}

export default FilmSearch;