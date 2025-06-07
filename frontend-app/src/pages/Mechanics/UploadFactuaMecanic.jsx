import { useState } from 'react';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const UploadFacturaMecanic = () => {
  const [form, setForm] = useState({
    reparatieId: '',
    costPiese: '',
    costManopera: ''
  });
  const [images, setImages] = useState({
    pieseNoi: null,
    pieseVechi: null,
    facturaPdf: null
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setImages({ ...images, [name]: files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append('pieseNoi', images.pieseNoi);
    data.append('pieseVechi', images.pieseVechi);
    data.append('facturaPdf', images.facturaPdf);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/reparatii/upload-factura`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Factura trimisă!');
    } catch (err) {
      alert('Eroare la upload!');
      console.error(err);
    }
  };

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-4">Upload Factură și Imagini Piese</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input
          name="reparatieId"
          type="text"
          placeholder="ID reparație"
          className="w-full border p-2 rounded"
          onChange={handleChange}
          required
        />
        <input
          name="costPiese"
          type="number"
          placeholder="Cost piese (RON)"
          className="w-full border p-2 rounded"
          onChange={handleChange}
          required
        />
        <input
          name="costManopera"
          type="number"
          placeholder="Cost manoperă (RON)"
          className="w-full border p-2 rounded"
          onChange={handleChange}
          required
        />
        <label className="block font-semibold">Imagine piese noi</label>
        <input
          type="file"
          name="pieseNoi"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        <label className="block font-semibold">Imagine piese înlocuite</label>
        <input
          type="file"
          name="pieseVechi"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        <label className="block font-semibold">Factura PDF</label>
        <input
          type="file"
          name="facturaPdf"
          accept="application/pdf"
          onChange={handleFileChange}
          required
        />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          Trimite
        </button>
      </form>
    </LayoutWrapper>
  );
};

export default UploadFacturaMecanic;
