import React, { useState } from 'react';

const AddCarForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    marca: '',
    model: '',
    nr_inmatriculare: '',
    serie_sasiu: '',
    fuel_type: '',
    status: '',
    sediu_id: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      body.append(key, val);
    });

    try {
      const res = await fetch('/api/flota', {
        method: 'POST',
        body,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      alert(data.message || 'Mașină adăugată!');
      onClose();
    } catch (err) {
      console.error('Eroare submit:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#1a0735] w-full max-w-lg rounded-lg shadow-lg p-6 relative text-white">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-xl text-white hover:text-red-500"
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Adaugă Mașină</h2>
        <form onSubmit={handleSubmit} className="space-y-3" encType="multipart/form-data">
          <input type="text" name="nr_inmatriculare" placeholder="Nr Înmatriculare" required onChange={handleChange} className="w-full px-4 py-2 rounded text-black" />
          <input type="text" name="marca" placeholder="Marca" required onChange={handleChange} className="w-full px-4 py-2 rounded text-black" />
          <input type="text" name="model" placeholder="Model" required onChange={handleChange} className="w-full px-4 py-2 rounded text-black" />
          <input type="text" name="serie_sasiu" placeholder="Serie VIN" required onChange={handleChange} className="w-full px-4 py-2 rounded text-black" />
          <input type="text" name="fuel_type" placeholder="Tip combustibil" required onChange={handleChange} className="w-full px-4 py-2 rounded text-black" />
          <select name="status" required onChange={handleChange} className="w-full px-4 py-2 rounded text-black">
            <option value="">Alege status</option>
            <option value="activ">Activ</option>
            <option value="in reparatie">În reparație</option>
          </select>
          <input type="number" name="sediu_id" placeholder="ID Sediu" required onChange={handleChange} className="w-full px-4 py-2 rounded text-black" />
          <input type="file" name="image" onChange={handleChange} className="w-full text-white" />

          <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold">
            Confirmare Adăugare
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCarForm;
