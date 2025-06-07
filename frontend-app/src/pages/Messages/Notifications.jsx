import { useEffect, useState } from 'react';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const Notifications = () => {
  const [notificari, setNotificari] = useState([]);

  const fetchNotificari = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/notificari`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotificari(res.data);
    } catch (err) {
      console.error('Eroare notificări:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/notificari/${id}/citita`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotificari(); // Refresh
    } catch (err) {
      alert('Eroare la marcarea ca citită');
    }
  };

  useEffect(() => {
    fetchNotificari();
  }, []);

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-4">Notificările Tale</h2>
      {notificari.length === 0 ? (
        <p className="text-gray-600">Nu ai notificări noi.</p>
      ) : (
        <ul className="space-y-4">
          {notificari.map((n) => (
            <li key={n.id} className={`border p-4 rounded shadow-sm ${n.citita ? 'bg-gray-100' : 'bg-white'}`}>
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{n.titlu}</p>
                  <p className="text-sm text-gray-600">{n.mesaj}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.citita && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Marchează ca citită
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </LayoutWrapper>
  );
};

export default Notifications;
