import { useEffect, useState } from 'react';
import LayoutWrapper from '../../layout/LayoutWrapper';
import StatCard from '../../components/cards/StatCard';
import { Users, Car, Wrench, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Button from '../../components/Button';

const AdminSediuDashboard = () => {
  const [stats, setStats] = useState({
    angajati: 0,
    mecanici: 0,
    masiniActive: 0,
    masiniInactive: 0,
  });
  const [notificari, setNotificari] = useState([]);
  const [masinaId, setMasinaId] = useState('');
  const [descriere, setDescriere] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [sediuId, setSediuId] = useState('');

  useEffect(() => {
    fetchStats();
    fetchNotificari();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/admin-sediu`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error('💥 Eroare la dashboard:', err);
    }
  };

  const fetchNotificari = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/notificari/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotificari(res.data);
    } catch (err) {
      console.error('💥 Eroare la notificări:', err);
    }
  };

  const handleSubmitCerere = async () => {
    if (!masinaId || !descriere || !sediuId) {
      alert('Completează toate câmpurile!');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/reparatii/admin`, {
        masina_id: masinaId,
        descriere,
        urgent,
        sediu_id: sediuId,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Cerere trimisă!');
      setMasinaId('');
      setDescriere('');
      setUrgent(false);
      setSediuId('');
      fetchNotificari();
    } catch (err) {
      console.error('💥 Eroare la trimitere cerere:', err);
      alert('Eroare la trimitere cerere.');
    }
  };

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-6">Dashboard - Administrator Sediu</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Angajați" value={stats.angajati} icon={<Users />} />
        <StatCard title="Mecanici" value={stats.mecanici} icon={<Wrench />} />
        <StatCard title="Mașini active" value={stats.masiniActive} icon={<Car />} />
        <StatCard title="Mașini inactive" value={stats.masiniInactive} icon={<AlertCircle />} />
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Creează cerere de reparație</h3>
        <div className="space-y-3">
          <input
            type="number"
            placeholder="ID Mașină"
            value={masinaId}
            onChange={(e) => setMasinaId(e.target.value)}
            className="w-full border p-2 rounded text-sm"
          />
          <textarea
            placeholder="Descriere problemă"
            value={descriere}
            onChange={(e) => setDescriere(e.target.value)}
            className="w-full border p-2 rounded text-sm"
          ></textarea>
          <input
            type="number"
            placeholder="ID Sediu"
            value={sediuId}
            onChange={(e) => setSediuId(e.target.value)}
            className="w-full border p-2 rounded text-sm"
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              className="mr-2"
            />
            Urgent
          </label>
          <Button onClick={handleSubmitCerere}>Trimite cererea</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold mb-2">Notificări recente</h3>
        {notificari.length === 0 ? (
          <p className="text-sm text-gray-500">Nu există notificări.</p>
        ) : (
          <ul className="list-disc ml-5 text-sm text-gray-600">
            {notificari.map((notif) => (
              <li key={notif.id}>
                📣 {notif.message} — {new Date(notif.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </LayoutWrapper>
  );
};

export default AdminSediuDashboard;
