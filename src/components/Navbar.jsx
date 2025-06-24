import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition duration-200">
          Service UI
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-200">Привет, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200 transition duration-200">
                Войти
              </Link>
              <Link to="/register" className="hover:text-blue-200 transition duration-200">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;