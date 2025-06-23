import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Service UI</Link>
        <div>
          {user ? (
            <>
              <span className="mr-4">Привет, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4">Войти</Link>
              <Link to="/register">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;