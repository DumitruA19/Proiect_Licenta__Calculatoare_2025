import { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, { email });
      setSent(true);
    } catch (err) {
      alert('Eroare trimitere email');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-[400px]">
        <h2 className="text-xl font-bold mb-4">Recuperare parolă</h2>
        {sent ? (
          <p className="text-green-600">Email trimis! Verifică inboxul.</p>
        ) : (
          <>
            <input
              type="email"
              className="w-full border p-2 mb-4 rounded"
              placeholder="Adresa de email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="bg-purple-600 text-white w-full py-2 rounded hover:bg-purple-700">
              Trimite link resetare
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
