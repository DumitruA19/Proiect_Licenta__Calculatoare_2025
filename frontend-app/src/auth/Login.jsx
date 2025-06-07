/*// src/auth/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
      email: email.trim(),
      password,
    });

    if (!res.data || !res.data.token || !res.data.user) {
      alert("Login eșuat – răspuns invalid.");
      return;
    }

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('userId', res.data.user.id);
   localStorage.setItem('sediu_id', res.data.user.sediu_id);


    login(res.data.user, res.data.token);

    switch (res.data.user.role) {
      case 'administrator_general':
        navigate('/dashboard-general');
        break;
      case 'admin_sediu':
        navigate('/dashboard-sediu');
        break;
      case 'mecanic':
        navigate('/dashboard-mecanic');
        break;
      case 'angajat':
      case 'angajat_depozit':
        navigate('/dashboard-angajat');
        break;
      default:
        alert('Rol necunoscut!');
        break;
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert(err.response?.data?.message || 'Login eșuat.');
  }
};




  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1f1147]">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg w-[400px] shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Log in</h2>
        <div className="mb-4">
          <label className="block text-sm font-semibold">Email</label>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold">Parolă</label>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 rounded"
        >
          Login
        </button>
        <div className="flex justify-between text-sm mt-2">
          <label><input type="checkbox" /> Ține-mă minte</label>
          <a href="/forgot-password" className="text-blue-600">Ai uitat parola?</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
*/
// src/auth/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email: email.trim(),
        password,
      });

      if (!res.data || !res.data.token || !res.data.user) {
        alert("Login eșuat – răspuns invalid.");
        return;
      }

      const { token, user } = res.data;

      // Salvăm token și userId în localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('sediu_id', user.sediu_id);

      // Trimitem tot userul în context (inclusiv sediu_id)
      login(user, token);

      // Redirecționare pe rol
      switch (user.role) {
        case 'administrator_general':
          navigate('/dashboard-general');
          break;
        case 'admin_sediu':
          navigate('/dashboard-sediu');
          break;
        case 'mecanic':
          navigate('/dashboard-mecanic');
          break;
        case 'angajat':
        case 'angajat_depozit':
          navigate('/dashboard-angajat');
          break;
        default:
          alert('Rol necunoscut!');
          break;
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || 'Login eșuat.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1f1147]">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg w-[400px] shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Log in</h2>
        <div className="mb-4">
          <label className="block text-sm font-semibold">Email</label>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold">Parolă</label>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 rounded"
        >
          Login
        </button>
        <div className="flex justify-between text-sm mt-2">
          <label>
            <input type="checkbox" /> Ține-mă minte
          </label>
          <a href="/forgot-password" className="text-blue-600">
            Ai uitat parola?
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;
