import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const EditCar = () => {
  const { id } = useParams(); // ID-ul mașinii
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nrInmatriculare: '',
    model: '',
    status: 'Neutilizata'
  });

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/cars/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setForm(res.data);
      } catch (err) {
        console.error('Eroare la încărcarea mașinii:', err);
      }
    };
    fetchCar();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/cars/${id}`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Mașină actualizată!');
      navigate('/cars');
    } catch (err) {
      alert('Eroare la actualizare');
    }
  };

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-4">Editează Mașină</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input
          name="nrInmatriculare"
          className="w-full border p-2 rounded"
          placeholder="Număr înmatriculare"
          value={form.nrInmatriculare}
          onChange={handleChange}
          required
        />
        <input
          name="model"
          className="w-full border p-2 rounded"
          placeholder="Model"
          value={form.model}
          onChange={handleChange}
          required
        />
        <select
          name="status"
          className="w-full border p-2 rounded"
          value={form.status}
          onChange={handleChange}
        >
          <option value="Neutilizata">Neutilizată</option>
          <option value="Utilizata">Utilizată</option>
          <option value="In curs de reparatie">În curs de reparație</option>
          <option value="Defecta">Defectă</option>
        </select>
        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
          Salvează Mașina
        </button>
      </form>
    </LayoutWrapper>
  );
};

export default EditCar;
