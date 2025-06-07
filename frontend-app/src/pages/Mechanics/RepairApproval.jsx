import { useEffect, useState } from 'react';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const RepairApproval = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reparatii/in-asteptare`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Eroare la cereri:', err);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/reparatii/${id}/status`, {
        status
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      fetchRequests(); // refresh list
    } catch (err) {
      alert('Eroare la actualizare');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-4">Cereri de Reparație</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">Nu există cereri în așteptare.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="border rounded p-4 shadow-sm">
              <p><strong>Mașină:</strong> {r.nrInmatriculare} - {r.model}</p>
              <p><strong>Defecțiune:</strong> {r.descriere}</p>
              <p><strong>Data:</strong> {new Date(r.createdAt).toLocaleString()}</p>
              <div className="mt-2 flex gap-4">
                <button
                  onClick={() => handleAction(r.id, 'acceptata')}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Acceptă
                </button>
                <button
                  onClick={() => handleAction(r.id, 'respinsa')}
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

export default RepairApproval;
