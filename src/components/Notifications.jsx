import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.id) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8083/api/notifications/${user.id}`);
      setNotifications(response.data);
      setError('');
    } catch (err) {
      setError('Ошибка загрузки уведомлений: ' + (err.response?.data?.message || 'Попробуйте позже.'));
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8083/api/notifications/mark-read/${id}`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, reading: true } : n)
      );
    } catch (err) {
      setError('Ошибка при обновлении уведомления: ' + (err.response?.data?.message || 'Попробуйте снова.'));
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.reading)
        .map(n => n.id);
      
      await Promise.all(unreadIds.map(id => 
        axios.put(`http://localhost:8083/api/notifications/mark-read/${id}`)
      ));
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, reading: true }))
      );
    } catch (err) {
      setError('Ошибка при обновлении уведомлений: ' + (err.response?.data?.message || 'Попробуйте снова.'));
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Уведомления</h1>
        
        {notifications.some(n => !n.reading) && (
          <button
            onClick={markAllAsRead}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Пометить все как прочитанные
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-500 text-xl mb-2">У вас пока нет уведомлений</div>
          <div className="text-gray-400">Здесь будут появляться важные обновления</div>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div 
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 ${
                notification.reading 
                  ? 'bg-gray-50 border-gray-300' 
                  : 'bg-blue-50 border-blue-500'
              } shadow-sm transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  <p className={`text-lg ${
                    notification.reading ? 'text-gray-700' : 'text-gray-800 font-medium'
                  }`}>
                    {notification.message}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                
                {!notification.reading && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="ml-4 text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                  >
                    Прочитано
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;