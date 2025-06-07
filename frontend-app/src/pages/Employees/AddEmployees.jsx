import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'angajat_curier',
    sediuId: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/employees');
    } catch (err) {
      alert('Eroare la creare cont');
    }
  };

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-4">Adaugă Cont Nou</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block font-semibold">Nume</label>
          <input
            type="text"
            name="name"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border p-2 rounded"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Parolă</label>
          <input
            type="password"
            name="password"
            className="w-full border p-2 rounded"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Rol</label>
          <select
            name="role"
            className="w-full border p-2 rounded"
            value={form.role}
            onChange={handleChange}
          >
            <option value="admin_sediu">Administrator Sediu</option>
            <option value="angajat_curier">Angajat (Curier)</option>
            <option value="angajat_depozit">Angajat (Depozit)</option>
            <option value="mecanic">Mecanic</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold">ID Sediu</label>
          <input
            type="number"
            name="sediuId"
            className="w-full border p-2 rounded"
            value={form.sediuId}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
          Creează Cont
        </button>
      </form>
    </LayoutWrapper>
  );
};

export default AddEmployee;
