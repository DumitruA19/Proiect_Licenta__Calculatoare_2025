import { useEffect, useState } from 'react';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const ApproveLeave = () => {
  const [cereri, setCereri] = useState([]);

  const fetchCereri = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/cereri-concediu`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCereri(res.data);
    } catch (err) {
      console.error('Eroare la cereri:', err);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/cereri-concediu/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCereri(); // Refresh list
    } catch (err) {
      alert('Eroare la actualizare status');
    }
  };

  useEffect(() => {
    fetchCereri();
  }, []);

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-4">Cererile de Concediu Primite</h2>
      {cereri.length === 0 ? (
        <p className="text-gray-500">Nu există cereri în așteptare.</p>
      ) : (
        <div className="space-y-4">
          {cereri.map((c) => (
            <div key={c.id} className="border p-4 rounded shadow-sm bg-white">
              <p><strong>{c.numeAngajat}</strong> - {c.tip.toUpperCase()}</p>
              <p>{c.dataStart} ➜ {c.dataStop}</p>
              <p className="text-sm text-gray-600 italic">Motiv: {c.motiv}</p>
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => handleStatus(c.id, 'aprobat')}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Aprobă
                </button>
                <button
                  onClick={() => handleStatus(c.id, 'respins')}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                >
                  Respinge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </LayoutWrapper>
  );
};

export default ApproveLeave;
