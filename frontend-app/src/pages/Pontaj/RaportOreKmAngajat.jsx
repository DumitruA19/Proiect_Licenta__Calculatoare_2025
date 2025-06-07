import { useEffect, useState } from 'react';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const RaportOreKmAngajat = () => {
  const [raport, setRaport] = useState([]);
  const [interval, setInterval] = useState('lunar');

  const fetchRaport = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/pontaj/raport?interval=${interval}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRaport(res.data);
    } catch (err) {
      console.error('Eroare raport:', err);
    }
  };

  useEffect(() => {
    fetchRaport();
  }, [interval]);

  return (
    <LayoutWrapper>
      <h2 className="text-2xl font-bold mb-4">Raport Ore Lucrate și KM</h2>

      <div className="mb-4">
        <label className="font-semibold mr-2">Interval:</label>
        <select
          className="border rounded p-2"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        >
          <option value="zilnic">Zilnic</option>
          <option value="saptamanal">Săptămânal</option>
          <option value="lunar">Lunar</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Dată</th>
              <th className="p-2 border">Ore lucrate</th>
              <th className="p-2 border">Ore suplimentare</th>
              <th className="p-2 border">KM parcurși</th>
            </tr>
          </thead>
          <tbody>
            {raport.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-2 border">{r.data}</td>
                <td className="p-2 border">{r.oreLucrate} h</td>
                <td className="p-2 border">{r.oreExtra} h</td>
                <td className="p-2 border">{r.km} km</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LayoutWrapper>
  );
};

export default RaportOreKmAngajat;
