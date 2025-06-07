import { useEffect, useState } from 'react';
import LayoutWrapper from '../../layout/LayoutWrapper';
import StatCard from '../../components/cards/StatCard';
import { Wrench, Car } from 'lucide-react';
import axios from 'axios';
import Button from '../../components/Button';

const MecanicDashboard = () => {
  const [stats, setStats] = useState({
    masiniInReparatie: 0,
    masiniReparate: 0,
  });
  const [cereri, setCereri] = useState([]);
  const [cereriAcceptate, setCereriAcceptate] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pretPiese, setPretPiese] = useState('');
  const [pretManopera, setPretManopera] = useState('');
  const [total, setTotal] = useState(0);
  const [notificari, setNotificari] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchCereri();
    fetchCereriAcceptate();
    fetchNotificari();
  }, []);

  useEffect(() => {
    const piese = parseFloat(pretPiese) || 0;
    const manopera = parseFloat(pretManopera) || 0;
    setTotal(piese + manopera);
  }, [pretPiese, pretManopera]);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/mecanic`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error('💥 Eroare la dashboard:', err);
    }
  };

  const fetchCereri = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reparatii/mecanici/disponibile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCereri(res.data);
    } catch (err) {
      console.error('💥 Eroare la cereri:', err);
    }
  };

  const fetchCereriAcceptate = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/reparatii/mecanic/acceptate`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    // Permite și statusul 'acceptata' și 'in_progress'
    const filtrate = res.data.filter(cerere => 
      cerere.status === 'acceptata' || cerere.status === 'in_progress'
    );
    setCereriAcceptate(filtrate);
  } catch (err) {
    console.error('💥 Eroare la cereri acceptate:', err);
  }
};

  const fetchNotificari = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return console.error('⚠️ userId lipsă');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/notificari/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotificari(res.data);
    } catch (err) {
      console.error('💥 Eroare la notificări:', err);
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/reparatii/${id}/accepta`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Cerere acceptată!');
      fetchCereri();
      fetchCereriAcceptate();
      fetchNotificari();
    } catch (err) {
      console.error('💥 Eroare la acceptare:', err);
      alert(err.response?.data?.message || 'Eroare la acceptare.');
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/reparatii/${id}/respingere`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Cerere respinsă!');
      fetchCereri();
      fetchCereriAcceptate();
      fetchNotificari();
    } catch (err) {
      console.error('💥 Eroare la respingere:', err);
      alert(err.response?.data?.message || 'Eroare la respingere.');
    }
  };

 const handleSubmitRepair = async () => {
  if (!selectedRequest) {
    alert('Selectează o cerere!');
    return;
  }
  try {
    await axios.patch(
      `${import.meta.env.VITE_API_URL}/reparatii/${selectedRequest.id}`,
      {
        parts_cost: parseFloat(pretPiese) || 0,
        manopera_cost: parseFloat(pretManopera) || 0,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    alert('Reparație finalizată!');
    setSelectedRequest(null);
    setPretPiese('');
    setPretManopera('');
    fetchDashboardData();
    fetchCereriAcceptate();
    fetchNotificari();
  } catch (err) {
    console.error('💥 Eroare la finalizare:', err);
    alert('Eroare la finalizare.');
  }
};

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-6">Dashboard - Mecanic</h2>

      {/* Statistici */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Mașini în reparație" value={stats.masiniInReparatie} icon={<Wrench />} />
        <StatCard title="Mașini reparate" value={stats.masiniReparate} icon={<Car />} />
      </div>

      {/* Cereri disponibile */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Cereri de reparație disponibile</h3>
        {cereri.length > 0 ? (
          <ul className="list-disc ml-5 text-sm text-gray-600">
            {cereri.map((cerere) => (
              <li key={cerere.id} className="mb-2">
                <div className="flex justify-between items-center">
                  <span>{cerere.nr_inmatriculare} - {cerere.descriere}</span>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleAcceptRequest(cerere.id)}>Acceptă</Button>
                    <Button variant="danger" size="sm" onClick={() => handleRejectRequest(cerere.id)}>Respinge</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nu există cereri de reparație disponibile.</p>
        )}
      </div>

      {/* Finalizare Reparație */}
  <div className="bg-white rounded-2xl shadow p-6 mb-6">
  <h3 className="text-xl font-semibold mb-4">Finalizare Reparație</h3>
  <div className="space-y-3">
    <div>
      <label className="block text-sm font-medium mb-1">Selectează cererea</label>
      <select
        className="w-full border p-2 rounded text-sm"
        value={selectedRequest?.id || ''}
        onChange={(e) => {
          const cerere = cereriAcceptate.find(c => c.id === parseInt(e.target.value, 10));
          setSelectedRequest(cerere || null);
        }}
      >
        <option value="">-- Selectează --</option>
        {cereriAcceptate.map((cerere) => (
          <option key={cerere.id} value={cerere.id}>
            {cerere.nr_inmatriculare} - {cerere.descriere}
          </option>
        ))}
      </select>
    </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Preț piese</label>
              <input
                type="number"
                className="w-full border p-2 rounded text-sm"
                value={pretPiese}
                onChange={(e) => setPretPiese(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Preț manoperă</label>
              <input
                type="number"
                className="w-full border p-2 rounded text-sm"
                value={pretManopera}
                onChange={(e) => setPretManopera(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Total</label>
              <input
                type="number"
                className="w-full border p-2 rounded text-sm bg-gray-100"
                value={total}
                readOnly
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSubmitRepair}>Finalizează</Button>
          </div>
        </div>
      </div>

      {/* Notificări */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold mb-2">Notificări recente</h3>
        {notificari.length > 0 ? (
          <ul className="list-disc ml-5 text-sm text-gray-600">
            {notificari.map((notif) => (
              <li key={notif.id} className="mb-2">
                <div className="flex justify-between items-center">
                  <span><strong>{notif.type}:</strong> {notif.message}</span>
                  {notif.type === 'reparatie_noua' && notif.reparatie_id && (
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={() => handleAcceptRequest(notif.reparatie_id)}>Acceptă</Button>
                      <Button variant="danger" size="sm" onClick={() => handleRejectRequest(notif.reparatie_id)}>Respinge</Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nu există notificări disponibile.</p>
        )}
      </div>
    </LayoutWrapper>
  );
};

export default MecanicDashboard;
