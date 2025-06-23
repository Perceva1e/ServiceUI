import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

function Register() {
  const [formData, setFormData] = useState({ email: '', name: '', hashedPassword: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', formData);
      login({ ...response.data, success: true });
      navigate('/');
    } catch (error) {
      setError(`Ошибка регистрации: ${error.response?.data?.message || 'Email может уже существовать.'}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Регистрация</h2>
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
          <label className="block text-gray-700">Имя</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Пароль</label>
          <input
            type="password"
            name="hashedPassword"
            value={formData.hashedPassword}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}

export default Register;