import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import FilmSearch from './components/FilmSearch';
import ReviewManager from './components/ReviewManager';
import SavedFilms from './components/SavedFilms';
import FilmDetails from './components/FilmDetails';
import NewReleases from './components/NewReleases';
import Notifications from './components/Notifications';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="space-x-4">
              <Link to="/releases" className="hover:underline">Новинки</Link>
              <Link to="/" className="hover:underline">Поиск фильмов</Link>
              <Link to="/reviews" className="hover:underline">Управление отзывами</Link>
              <Link to="/saved" className="hover:underline">Сохранённые фильмы</Link>
              <Link to="/notifications" className="hover:underline">Уведомления</Link>
            </div>
            <div>
              {user ? (
                <>
                  <span className="mr-4">Привет, {user.name}</span>
                  <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <div className="space-x-4">
                  <Link to="/login" className="hover:underline">Войти</Link>
                  <Link to="/register" className="hover:underline">Регистрация</Link>
                </div>
              )}
            </div>
          </div>
        </nav>
        <div className="container mx-auto mt-8">
          <Routes>
            <Route path="/" element={<FilmSearch />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reviews" element={<ReviewManager />} />
            <Route path="/register" element={<Register />} />
            <Route path="/saved" element={<SavedFilms />} />
            <Route path="/details/:id" element={<FilmDetails />} />
            <Route path="/releases" element={<NewReleases />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;