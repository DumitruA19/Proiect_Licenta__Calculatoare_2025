import { useState, useEffect } from 'react';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const RepairRequest = () => {
  const [cars, setCars] = useState([]);
  const [form, setForm] = useState({
    masinaId: '',
    descriere: '',
  });

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/cars/status/defecte`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCars(res.data);
      } catch (err) {
        console.error('Eroare la mașini defecte:', err);
      }
    };

    fetchCars();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/reparatii`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Cererea de reparație a fost trimisă!');
    } catch (err) {
      alert('Eroare la trimiterea cererii');
      console.error(err);
    }
  };

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-4">Cerere de Reparație</h2>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block font-semibold">Selectează Mașina</label>
          <select
            name="masinaId"
            value={form.masinaId}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Alege mașină defectă</option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nrInmatriculare} - {c.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold">Descriere Defecțiune</label>
          <textarea
            name="descriere"
            value={form.descriere}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            placeholder="Detalii despre problemă..."
            rows="4"
          />
        </div>

        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
          Trimite Cerere
        </button>
      </form>
    </LayoutWrapper>
  );
};

export default RepairRequest;
