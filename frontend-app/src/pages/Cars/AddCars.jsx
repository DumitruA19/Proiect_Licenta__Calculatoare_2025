
// components/AddCarForm.jsx
import { useState } from 'react';
import axios from 'axios';

const AddCarForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    marca: '',
    model: '',
    nr_inmatriculare: '',
    serie_sasiu: '',
    sediu_id: '',
    fuel_type: '',
    status: 'activ',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/flota`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      onSuccess();
    } catch (error) {
      console.error('Eroare la trimiterea formularului:', error);
      alert('Eroare la trimiterea formularului');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
      <h2 className="text-xl font-bold">Adăugare Mașină</h2>

      <input type="text" name="nr_inmatriculare" placeholder="Număr Înmatriculare" value={form.nr_inmatriculare} onChange={handleChange} className="input" required />
      <input type="text" name="marca" placeholder="Marcă" value={form.marca} onChange={handleChange} className="input" required />
      <input type="text" name="model" placeholder="Model" value={form.model} onChange={handleChange} className="input" required />
      <input type="text" name="serie_sasiu" placeholder="Serie VIN" value={form.serie_sasiu} onChange={handleChange} className="input" required />
      <input type="number" name="sediu_id" placeholder="Sediu ID" value={form.sediu_id} onChange={handleChange} className="input" required />
      <input type="text" name="fuel_type" placeholder="Tip combustibil" value={form.fuel_type} onChange={handleChange} className="input" required />
      <select name="status" value={form.status} onChange={handleChange} className="input">
        <option value="activ">Activă</option>
        <option value="inactiva">Inactivă</option>
      </select>

      <label className="block mt-2">Fotografie</label>
      <input type="file" accept="image/*" onChange={handleFileChange} className="input" />

      <button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
        Confirmare Adăugare
      </button>
    </form>
  );
};

export default AddCarForm;














/*import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const AddCar = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nrInmatriculare: '',
    marca: '',
    model: '',
    vin: '',
    accesorii: [],
  });
  const [accesoriu, setAccesoriu] = useState('');
  const [stareAccesoriu, setStareAccesoriu] = useState('Prezent');
  const [imagini, setImagini] = useState({ file1: null, file2: null });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddAccesoriu = () => {
    if (accesoriu.trim()) {
      setForm((prev) => ({
        ...prev,
        accesorii: [...prev.accesorii, { nume: accesoriu, stare: stareAccesoriu }]
      }));
      setAccesoriu('');
      setStareAccesoriu('Prezent');
    }
  };

  const handleFileChange = (e) => {
    setImagini({ ...imagini, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'accesorii') {
        data.append('accesorii', JSON.stringify(value));
      } else {
        data.append(key, value);
      }
    });

    if (imagini.file1) data.append('poza1', imagini.file1);
    if (imagini.file2) data.append('poza2', imagini.file2);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/cars`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/cars');
    } catch (err) {
      alert('Eroare la adăugare mașină');
    }
  };

  return (
    <LayoutWrapper>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 bg-[#1f1147] text-white p-6 rounded-md">
        <h2 className="text-2xl font-bold text-center mb-4">Adaugare masina</h2>

        <div>
          <label>Nr Inmatriculare</label>
          <input name="nrInmatriculare" className="w-full p-2 rounded text-black" placeholder="Placeholder...." onChange={handleChange} required />
        </div>

        <div>
          <label>Marca</label>
          <input name="marca" className="w-full p-2 rounded text-black" placeholder="Placeholder...." onChange={handleChange} required />
        </div>

        <div>
          <label>Model</label>
          <input name="model" className="w-full p-2 rounded text-black" placeholder="Placeholder...." onChange={handleChange} required />
        </div>

        <div>
          <label>Serie VIN</label>
          <input name="vin" className="w-full p-2 rounded text-black" placeholder="Placeholder...." onChange={handleChange} required />
        </div>

        <div>
          <label className="font-bold">Adauga accesoriu</label>
          <div className="flex space-x-2 mt-1">
            <input
              className="p-2 flex-1 rounded text-black"
              placeholder="Placeholder...."
              value={accesoriu}
              onChange={(e) => setAccesoriu(e.target.value)}
            />
            <select
              className="p-2 rounded text-black"
              value={stareAccesoriu}
              onChange={(e) => setStareAccesoriu(e.target.value)}
            >
              <option>Prezent</option>
              <option>Absent</option>
            </select>
            <button type="button" onClick={handleAddAccesoriu} className="bg-gray-300 text-black px-2 rounded">
              Adauga
            </button>
          </div>
        </div>

        <div>
          <label>Fotografii</label>
          <div className="grid grid-cols-2 gap-2">
            <input name="file1" type="file" onChange={handleFileChange} className="bg-white text-black rounded" />
            <input name="file2" type="file" onChange={handleFileChange} className="bg-white text-black rounded" />
          </div>
        </div>

        <button type="submit" className="w-full bg-gray-500 hover:bg-gray-600 py-2 rounded text-white font-semibold">
          Confirmare Adaugare
        </button>
      </form>
    </LayoutWrapper>
  );
};

export default AddCar;
*/