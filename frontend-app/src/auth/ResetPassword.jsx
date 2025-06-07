import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, {
        password
      });
      alert('Parola a fost resetată.');
      navigate('/login');
    } catch (err) {
      alert('Token invalid sau expirat.');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleReset} className="bg-white p-8 rounded shadow w-[400px]">
        <h2 className="text-xl font-bold mb-4">Setează parolă nouă</h2>
        <input
          type="password"
          className="w-full border p-2 mb-4 rounded"
          placeholder="Parola nouă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-purple-600 text-white w-full py-2 rounded hover:bg-purple-700">
          Resetează
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
