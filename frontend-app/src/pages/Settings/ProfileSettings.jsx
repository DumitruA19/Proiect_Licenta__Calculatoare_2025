import { useEffect, useState } from 'react';
import LayoutWrapper from '../../layout/LayoutWrapper';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';

const ProfileSettings = () => {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: ''
  });
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || ''
    });
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${user.id}`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Date actualizate!');
    } catch (err) {
      alert('Eroare la actualizare date!');
    }
  };

  const handlePassword = async () => {
    if (!password) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${user.id}/parola`, { password }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Parolă schimbată!');
      setPassword('');
      logout();
    } catch (err) {
      alert('Eroare la schimbarea parolei!');
    }
  };

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-6">Setările contului</h2>
      <form onSubmit={handleUpdate} className="space-y-4 max-w-xl">
        <input
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded"
          placeholder="Nume"
        />
        <input
          name="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border p-2 rounded"
          placeholder="Email"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Salvează modificările
        </button>
      </form>

      <div className="mt-8 space-y-4">
        <h3 className="font-bold">Schimbare parolă</h3>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Parolă nouă"
        />
        <button
          onClick={handlePassword}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
        >
          Schimbă parola
        </button>
      </div>

      <div className="mt-8">
        <h3 className="font-bold mb-2">Tema aplicației</h3>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900"
        >
          Schimbă în {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>
    </LayoutWrapper>
  );
};

export default ProfileSettings;
