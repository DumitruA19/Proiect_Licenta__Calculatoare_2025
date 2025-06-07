import { useState, useEffect } from 'react';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const Pontaj = () => {
  const [masini, setMasini] = useState([]);
  const [form, setForm] = useState({
    masinaId: '',
    oraStart: '',
    oraStop: '',
    kmStart: '',
    kmStop: '',
    combustibil: '',
    pretCombustibil: '',
    problema: '',
  });

  const [poze, setPoze] = useState([]);

  useEffect(() => {
    const fetchMasini = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/cars/available`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMasini(res.data);
      } catch (err) {
        console.error('Eroare masini:', err);
      }
    };
    fetchMasini();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPoze([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => data.append(key, val));
    poze.forEach((file) => data.append('pozeProblema', file));

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/pontaj/complet`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Date pontaj trimise!');
    } catch (err) {
      alert('Eroare la trimitere!');
      console.error(err);
    }
  };

  return (
    <LayoutWrapper>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Col 1 */}
        <div className="space-y-4">
          <div>
            <label className="font-semibold">Selectează Mașina</label>
            <select
              name="masinaId"
              className="w-full border p-2 rounded"
              value={form.masinaId}
              onChange={handleChange}
              required
            >
              <option value="">Alege mașină</option>
              {masini.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nrInmatriculare}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-semibold">Ora start</label>
              <input type="time" name="oraStart" className="w-full border p-2 rounded" value={form.oraStart} onChange={handleChange} />
            </div>
            <div className="flex-1">
              <label className="font-semibold">Ora stop</label>
              <input type="time" name="oraStop" className="w-full border p-2 rounded" value={form.oraStop} onChange={handleChange} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-semibold">KM start</label>
              <input type="number" name="kmStart" className="w-full border p-2 rounded" value={form.kmStart} onChange={handleChange} />
            </div>
            <div className="flex-1">
              <label className="font-semibold">KM stop</label>
              <input type="number" name="kmStop" className="w-full border p-2 rounded" value={form.kmStop} onChange={handleChange} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-semibold">Combustibil (L)</label>
              <input type="number" name="combustibil" className="w-full border p-2 rounded" value={form.combustibil} onChange={handleChange} />
            </div>
            <div className="flex-1">
              <label className="font-semibold">Cost (RON)</label>
              <input type="number" name="pretCombustibil" className="w-full border p-2 rounded" value={form.pretCombustibil} onChange={handleChange} />
            </div>
          </div>

          <button
            type="submit"
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 w-full"
          >
            Trimite Date
          </button>
        </div>

        {/* Col 2 */}
        <div className="space-y-4">
          <div>
            <label className="font-semibold">Descrie o problemă</label>
            <textarea
              name="problema"
              rows="4"
              className="w-full border p-2 rounded"
              value={form.problema}
              onChange={handleChange}
              placeholder="Placeholder..."
            />
          </div>

          <div>
            <label className="font-semibold">Atașează Foto/Video</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <button
            type="submit"
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 w-full"
          >
            Trimite sesizarea
          </button>
        </div>
      </form>
    </LayoutWrapper>
  );
};

export default Pontaj;
