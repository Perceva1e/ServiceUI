import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending login request:', formData); 
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      console.log('Login response:', response.data); 
      if (response.data.success) {
        login(response.data);
        navigate('/');
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Login error:', error); 
      setError(`Ошибка входа: ${error.response?.data?.message || 'Попробуйте снова.'}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Вход</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Пароль</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Войти
        </button>
      </form>
    </div>
  );
}

export default Login;