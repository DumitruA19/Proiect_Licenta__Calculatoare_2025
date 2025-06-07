import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutWrapper from '../../layout/LayoutWrapper';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { Dialog } from '@headlessui/react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    address: '',
    phone: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error('Eroare la încărcare angajați:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Ești sigur că vrei să ștergi acest utilizator?')) return;
    try {
     await axios.delete(`${import.meta.env.VITE_API_URL}/users/delete/${id}`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

      fetchEmployees();
    } catch (err) {
      console.error('Eroare la ștergere utilizator:', err);
    }
  };

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${currentUser.id}`, currentUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEditOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error('Eroare la salvare:', err);
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault(); // 🔥 prevenim submit-ul default care dă warning
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users`,
        newUser,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );


      setAddOpen(false);
      setNewUser({ name: '', email: '', password: '', role: '', address: '', phone: '' });
      fetchEmployees();
    } catch (err) {
      console.error('Eroare la adăugare utilizator:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <LayoutWrapper>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Angajați / Utilizatori</h2>
      </div>

      {/* 🔥 Butonul și search bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        {/* Search bar */}
        <div className="flex items-center border border-gray-300 rounded px-2">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Caută după nume..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm py-1 px-2"
          />
        </div>

        {/* Add Employee button */}
        <button
          onClick={() => setAddOpen(true)}
          className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Adaugă Angajat
        </button>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="min-w-full text-sm sm:text-base">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 whitespace-nowrap">Nume</th>
              <th className="p-3 whitespace-nowrap">Email</th>
              <th className="p-3 whitespace-nowrap">Rol</th>
              <th className="p-3 whitespace-nowrap">Adresă</th>
              <th className="p-3 whitespace-nowrap">Telefon</th>
              <th className="p-3 whitespace-nowrap text-center">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 border-t">
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{emp.email}</td>
                <td className="p-3">{emp.role}</td>
                <td className="p-3">{emp.address || '—'}</td>
                <td className="p-3">{emp.phone || '—'}</td>
                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(emp)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editează"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Șterge"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Edit */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/50">
          <Dialog.Panel className="w-full max-w-md sm:max-w-lg bg-white rounded-lg shadow p-6">
            <Dialog.Title className="text-lg font-bold mb-4">Editează Utilizator</Dialog.Title>
            {currentUser && (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                <input type="text" name="name" value={currentUser.name} onChange={handleEditChange} placeholder="Nume" className="w-full border p-2 rounded text-sm" />
                <input type="email" name="email" value={currentUser.email} onChange={handleEditChange} placeholder="Email" className="w-full border p-2 rounded text-sm" />
                <input type="text" name="role" value={currentUser.role} onChange={handleEditChange} placeholder="Rol" className="w-full border p-2 rounded text-sm" />
                <input type="text" name="address" value={currentUser.address || ''} onChange={handleEditChange} placeholder="Adresă" className="w-full border p-2 rounded text-sm" />
                <input type="text" name="phone" value={currentUser.phone || ''} onChange={handleEditChange} placeholder="Telefon" className="w-full border p-2 rounded text-sm" />
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-sm">Anulează</button>
                  <button type="button" onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">Salvează</button>
                </div>
              </form>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal Add */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/50">
          <Dialog.Panel className="w-full max-w-md sm:max-w-lg bg-white rounded-lg shadow p-6">
            <Dialog.Title className="text-lg font-bold mb-4">Adaugă Angajat</Dialog.Title>
            <form onSubmit={handleAdd} className="space-y-3">
              <input type="text" name="name" value={newUser.name} onChange={handleAddChange} placeholder="Nume" className="w-full border p-2 rounded text-sm" />
              <input type="email" name="email" value={newUser.email} onChange={handleAddChange} placeholder="Email" className="w-full border p-2 rounded text-sm" />
              <input type="password" name="password" value={newUser.password} onChange={handleAddChange} placeholder="Parolă" className="w-full border p-2 rounded text-sm" />
              <input type="text" name="role" value={newUser.role} onChange={handleAddChange} placeholder="Rol" className="w-full border p-2 rounded text-sm" />
              <input type="text" name="address" value={newUser.address} onChange={handleAddChange} placeholder="Adresă" className="w-full border p-2 rounded text-sm" />
              <input type="text" name="phone" value={newUser.phone} onChange={handleAddChange} placeholder="Telefon" className="w-full border p-2 rounded text-sm" />
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

export default Employees;
