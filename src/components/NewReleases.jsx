import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function NewReleases() {
  const { user } = useAuth();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNewReleases = async () => {
      try {
        const response = await axios.get('http://localhost:8089/api/new-releases');
        setFilms(response.data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка загрузки новинок: ' + (err.response?.data?.message || 'Попробуйте снова.'));
        setLoading(false);
      }
    };
    fetchNewReleases();
  }, []);

  if (!user) {
    return <h1 className="text-3xl font-bold text-center text-gray-800">Пожалуйста, войдите</h1>;
  }

  if (loading) return <p className="text-center text-gray-600">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>;
  if (films.length === 0) return <p className="text-center text-gray-600">Новинок нет.</p>;

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2">Новинки</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {films.map((film) => (
          <div key={film.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">{film.title}</h3>
            <p className="text-gray-600">Год: {film.releaseYear || 'Не указан'}</p>
            <p className="text-gray-600">Рейтинг: {film.rating || 'Нет'}</p>
            <p className="text-gray-600">Язык: {film.originalLanguage || 'Не указан'}</p>
            <p className="text-gray-600">Жанры: {film.genres?.map((g) => g.name).join(', ') || 'Нет'}</p>
            <p className="text-gray-600">Длительность: {film.duration ? `${film.duration} мин` : 'Не указана'}</p>
            <Link
              to={`/details/${film.id}`}
              className="mt-4 block w-full bg-indigo-600 text-white py-2 rounded-lg text-center hover:bg-indigo-700 transition duration-200"
            >
              Детали
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewReleases;