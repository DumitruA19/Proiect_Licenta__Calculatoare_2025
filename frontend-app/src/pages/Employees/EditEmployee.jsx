import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const EditEmployee = () => {
  const { id } = useParams(); // id-ul angajatului
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    sediuId: ''
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setForm(res.data);
      } catch (err) {
        console.error('Eroare la fetch user:', err);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Utilizator actualizat!');
      navigate('/employees');
    } catch (err) {
      alert('Eroare la actualizare');
    }
  };

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-4">Editează Angajat</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input name="name" className="w-full border p-2 rounded" placeholder="Nume" value={form.name} onChange={handleChange} />
        <input name="email" className="w-full border p-2 rounded" placeholder="Email" value={form.email} onChange={handleChange} />
        <select name="role" className="w-full border p-2 rounded" value={form.role} onChange={handleChange}>
          <option value="admin_sediu">Administrator Sediu</option>
          <option value="angajat_curier">Angajat Curier</option>
          <option value="angajat_depozit">Angajat Depozit</option>
          <option value="mecanic">Mecanic</option>
        </select>
        <input name="sediuId" className="w-full border p-2 rounded" placeholder="ID Sediu" value={form.sediuId} onChange={handleChange} />
        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
          Salvează Modificările
        </button>
      </form>
    </LayoutWrapper>
  );
};

export default EditEmployee;
