import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutWrapper from '../../layout/LayoutWrapper';
import StatCard from '../../components/cards/StatCard';
import { Building, Users, Wrench, ShieldCheck } from 'lucide-react';

const GeneralDashboard = () => {
  const [stats, setStats] = useState({
    sedii: 0,
    angajati: 0,
    mecanici: 0,
    admini: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/general`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setStats(res.data);
      } catch (err) {
        console.error('Eroare la încărcarea dashboardului:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-6">Dashboard - Administrator General</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Sedii Active" value={stats.sedii} icon={<Building />} />
        <StatCard title="Angajați" value={stats.angajati} icon={<Users />} />
        <StatCard title="Mecanici" value={stats.mecanici} icon={<Wrench />} />
        <StatCard title="Administratori Sediu" value={stats.admini} icon={<ShieldCheck />} />
      </div>
    </LayoutWrapper>

  );
};

export default GeneralDashboard;
