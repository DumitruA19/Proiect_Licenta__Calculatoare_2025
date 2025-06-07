import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const EditRepair = () => {
  const { id } = useParams(); // id-ul reparației
  const navigate = useNavigate();
  const [form, setForm] = useState({
    descriere: '',
    status: ''
  });

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/reparatii/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setForm(res.data);
      } catch (err) {
        console.error('Eroare la încărcarea reparației:', err);
      }
    };
    fetchRepair();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/reparatii/${id}`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Reparația a fost actualizată!');
      navigate('/repair-approval'); // sau redirect în funcție de rol
    } catch (err) {
      alert('Eroare la actualizare');
    }
  };

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-4">Editează Reparație</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <textarea
          name="descriere"
          rows="4"
          className="w-full border p-2 rounded"
          value={form.descriere}
          onChange={handleChange}
          placeholder="Descriere actualizată"
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="in asteptare">În așteptare</option>
          <option value="in curs de reparatie">În curs de reparație</option>
          <option value="finalizata">Finalizată</option>
        </select>
        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
          Salvează Modificările
        </button>
      </form>
    </LayoutWrapper>
  );
};

export default EditRepair;
