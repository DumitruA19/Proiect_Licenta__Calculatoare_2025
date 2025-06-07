import { useState } from 'react';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const LeaveRequests = () => {
  const [form, setForm] = useState({
    tip: 'concediu',
    dataStart: '',
    dataStop: '',
    motiv: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/cereri-concediu`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Cerere trimisă cu succes!');
      setForm({ tip: 'concediu', dataStart: '', dataStop: '', motiv: '' });
    } catch (err) {
      alert('Eroare la trimiterea cererii');
      console.error(err);
    }
  };

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-4">Cerere de Concediu / Zile Libere</h2>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <select
          name="tip"
          className="w-full border p-2 rounded"
          value={form.tip}
          onChange={handleChange}
        >
          <option value="concediu">Concediu</option>
          <option value="zi libera">Zi liberă</option>
          <option value="medical">Concediu medical</option>
        </select>
        <div className="flex gap-4">
          <input
            type="date"
            name="dataStart"
            value={form.dataStart}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="date"
            name="dataStop"
            value={form.dataStop}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <textarea
          name="motiv"
          rows="3"
          placeholder="Motivul cererii..."
          className="w-full border p-2 rounded"
          value={form.motiv}
          onChange={handleChange}
        />
        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
          Trimite cererea
        </button>
      </form>
    </LayoutWrapper>
  );
};

export default LeaveRequests;
