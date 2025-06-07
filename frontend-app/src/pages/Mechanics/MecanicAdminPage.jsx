import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutWrapper from '../../layout/LayoutWrapper';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';
import Button from '../../components/Button';
import { Dialog } from '@headlessui/react';
import { useAuth } from '../../auth/AuthContext'; // 💡 Adaugă useAuth pentru a obține user.sediu_id

const MecanicAdminPage = () => {
  const { user } = useAuth(); // 💡 Verifică să ai useAuth implementat și user să aibă sediu_id
  const [mechanics, setMechanics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCarId, setSelectedCarId] = useState('');
  const [description, setDescription] = useState('');
  const [cars, setCars] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newMechanic, setNewMechanic] = useState({
    name: '',
    email: '',
    password: '',
    role: 'mecanic',
    phone: '',
  });

  useEffect(() => {
    fetchMechanics();
    fetchCars();
  }, []);

  const fetchMechanics = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMechanics(res.data);
    } catch (err) {
      console.error('Eroare la încărcare mecanici:', err);
    }
  };

  const fetchCars = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/flota`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCars(res.data);
    } catch (err) {
      console.error('Eroare la încărcare mașini:', err);
    }
  };

  const handleRequestRepair = async () => {
    if (!selectedCarId || !description) {
      alert('Selectează o mașină și completează descrierea!');
      return;
    }

    // 🛑 Adaugă verificare user și sediu_id
    if (!user || !user.sediu_id) {
      alert('Eroare: Utilizatorul nu are sediu_id asociat!');
      console.error('User object:', user);
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/reparatii`, {
        masina_id: selectedCarId,
        descriere: description,
        sediu_id: user.sediu_id, // 👈 sediu_id corect
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setSelectedCarId('');
      setDescription('');
      alert('Cerere de reparație trimisă cu succes!');
    } catch (err) {
      console.error('Eroare la trimiterea cererii:', err);
      alert('Eroare la trimiterea cererii: ' + (err.response?.data?.message || 'Verifică consola.'));
    }
  };

  const handleAddMechanicChange = (e) => {
    const { name, value } = e.target;
    setNewMechanic((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMechanic = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users`, newMechanic, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAddOpen(false);
      setNewMechanic({ name: '', email: '', password: '', role: 'mecanic', phone: '' });
      fetchMechanics();
    } catch (err) {
      console.error('Eroare la adăugare mecanic:', err);
    }
  };

  const filteredMechanics = mechanics
    .filter((mecanic) => mecanic.role === 'mecanic')
    .filter((mecanic) => mecanic.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-4">Mecanici</h2>

      {/* 🔥 Search bar și buton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex items-center border border-gray-300 rounded px-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Caută mecanic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm py-1 px-2 w-full"
          />
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Adaugă Mecanic
        </button>
      </div>

      {/* Tabel scrollabil cu max 5 rânduri */}
      <div className="overflow-y-auto max-h-[300px] border border-gray-200 rounded-md mb-6">
        <table className="min-w-full text-sm sm:text-base">
          <thead className="bg-gray-100 text-gray-700 sticky top-0">
            <tr>
              <th className="p-3 whitespace-nowrap">Nume</th>
              <th className="p-3 whitespace-nowrap">Email</th>
              <th className="p-3 whitespace-nowrap">Telefon</th>
              <th className="p-3 whitespace-nowrap text-center">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filteredMechanics.length > 0 ? (
              filteredMechanics.map((mecanic) => (
                <tr key={mecanic.id} className="hover:bg-gray-50 border-t">
                  <td className="p-3">{mecanic.name}</td>
                  <td className="p-3">{mecanic.email}</td>
                  <td className="p-3">{mecanic.phone || '—'}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800" title="Editează">
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-800" title="Șterge">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-3 text-center text-gray-500">
                  Nu există mecanici.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Secțiune request reparație */}
      <div className="p-4 border rounded-lg bg-white shadow">
        <h3 className="text-lg font-semibold mb-2">Trimite cerere de reparație</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Selectează mașina</label>
            <select
              className="w-full border p-2 rounded text-sm"
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
            >
              <option value="">-- Selectează --</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.nr_inmatriculare} - {car.marca} {car.model}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descriere problemă</label>
            <textarea
              className="w-full border p-2 rounded text-sm"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex. Problemă motor..."
            ></textarea>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleRequestRepair}>Trimite cererea</Button>
          </div>
        </div>
      </div>

      {/* Modal Add Mechanic */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/50">
          <Dialog.Panel className="w-full max-w-md sm:max-w-lg bg-white rounded-lg shadow p-6">
            <Dialog.Title className="text-lg font-bold mb-4">Adaugă Mecanic</Dialog.Title>
            <form onSubmit={handleAddMechanic} className="space-y-3">
              <input type="text" name="name" value={newMechanic.name} onChange={handleAddMechanicChange} placeholder="Nume" className="w-full border p-2 rounded text-sm" />
              <input type="email" name="email" value={newMechanic.email} onChange={handleAddMechanicChange} placeholder="Email" className="w-full border p-2 rounded text-sm" />
              <input type="password" name="password" value={newMechanic.password} onChange={handleAddMechanicChange} placeholder="Parolă" className="w-full border p-2 rounded text-sm" />
              <input type="text" name="phone" value={newMechanic.phone} onChange={handleAddMechanicChange} placeholder="Telefon" className="w-full border p-2 rounded text-sm" />
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-sm">Anulează</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm">Adaugă</button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </LayoutWrapper>
  );
};

export default MecanicAdminPage;
