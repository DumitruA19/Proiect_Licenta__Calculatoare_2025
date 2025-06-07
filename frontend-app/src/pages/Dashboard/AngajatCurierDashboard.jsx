import { useEffect, useState } from 'react';
import LayoutWrapper from '../../layout/LayoutWrapper';
import axios from 'axios';

const AngajatCurierDashboard = () => {
  const [masini, setMasini] = useState([]);
  const [selectedMasina, setSelectedMasina] = useState('');
  const [oraStart, setOraStart] = useState('');
  const [oraFinal, setOraFinal] = useState('');
  const [kmStart, setKmStart] = useState('');
  const [kmEnd, setKmEnd] = useState('');
  const [fuelQuantity, setFuelQuantity] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [problema, setProblema] = useState('');
  const [urgent, setUrgent] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchMasini = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/flota`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMasini(res.data);
      } catch (err) {
        console.error('💥 Eroare la încărcarea mașinilor:', err);
      }
    };
    fetchMasini();
  }, []);

  const handleSubmitMasina = async () => {
    if (!selectedMasina) {
      alert('Selectează o mașină!');
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/pontaj/masina`, {
        user_id: user.id,
        masina_id: parseInt(selectedMasina),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Mașina selectată a fost trimisă!');
    } catch (err) {
      console.error('💥 Eroare la trimiterea mașinii:', err);
      alert('Eroare la trimiterea mașinii!');
    }
  };

  const handleSubmitStart = async () => {
    if (!oraStart || !kmStart || !selectedMasina) {
      alert('Completează toate câmpurile pentru start!');
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/pontaj/start`, {
        user_id: user.id,
        sediu_id: user.sediu_id,
        masina_id: parseInt(selectedMasina),
        start_time: oraStart,
        km_start: parseInt(kmStart),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Ora de început și km de start au fost trimise!');
    } catch (err) {
      console.error('💥 Eroare la start:', err);
      alert('Eroare la trimiterea datelor de start!');
    }
  };

  const handleSubmitFinal = async () => {
    if (!oraFinal || !kmEnd || !selectedMasina) {
      alert('Completează toate câmpurile pentru final!');
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/pontaj/final`, {
        user_id: user.id,
        sediu_id: user.sediu_id,
        masina_id: parseInt(selectedMasina),
        end_time: oraFinal,
        km_end: parseInt(kmEnd),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Ora de final și km de final au fost trimise!');
    } catch (err) {
      console.error('💥 Eroare la final:', err);
      alert('Eroare la trimiterea datelor de final!');
    }
  };

  const handleSubmitCombustibil = async () => {
    if (!fuelQuantity || !selectedMasina) {
      alert('Completează cantitatea și selectează o mașină!');
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/pontaj/combustibil`, {
        user_id: user.id,
        sediu_id: user.sediu_id,
        masina_id: parseInt(selectedMasina),
        fuel_used: parseFloat(fuelQuantity),
        fuel_price: parseFloat(fuelPrice),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Datele despre combustibil au fost trimise!');
    } catch (err) {
      console.error('💥 Eroare la combustibil:', err);
      alert('Eroare la trimiterea datelor despre combustibil!');
    }
  };
const handleReportProblema = async () => {
  if (!problema || !selectedMasina) {
    alert('Completează problema și selectează o mașină!');
    return;
  }

  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/reparatii`, {
  masina_id: parseInt(selectedMasina),
  descriere: problema,
  urgent: urgent,
  sediu_id: user.sediu_id
}, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

    alert('Sesizarea a fost trimisă!');
    setProblema('');
    setUrgent(false);
  } catch (err) {
    console.error('💥 Eroare la trimiterea sesizării:', err);
    alert('Eroare la trimiterea sesizării!');
  }
};


  return (
    <LayoutWrapper>
      <div className="bg-gray-100 min-h-screen p-6 pt-24 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Dashboard Curier - Operațiuni Zilnice</h2>

        {/* Mașină */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm mb-1">Alege mașina (Număr de înmatriculare)</label>
          <select
            value={selectedMasina}
            onChange={(e) => setSelectedMasina(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Selectează...</option>
            {masini.map((masina) => (
              <option key={masina.id} value={masina.id}>
                {masina.nr_inmatriculare} ({masina.marca} {masina.model})
              </option>
            ))}
          </select>
          <button
            onClick={handleSubmitMasina}
            className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Trimite mașina selectată
          </button>
        </div>

        {/* Start și Final */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Start */}
          <div className="bg-white rounded-lg shadow p-6 flex-1">
            <h3 className="text-lg font-semibold mb-4">Start de program</h3>
            <label className="block text-sm mb-1">Ora de început</label>
            <input
              type="time"
              value={oraStart}
              onChange={(e) => setOraStart(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <label className="block text-sm mb-1 mt-3">Număr km început</label>
            <input
              type="number"
              value={kmStart}
              onChange={(e) => setKmStart(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button
              onClick={handleSubmitStart}
              className="mt-4 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Trimite start
            </button>
          </div>

          {/* Final */}
          <div className="bg-white rounded-lg shadow p-6 flex-1">
            <h3 className="text-lg font-semibold mb-4">Final de program</h3>
            <label className="block text-sm mb-1">Ora de final</label>
            <input
              type="time"
              value={oraFinal}
              onChange={(e) => setOraFinal(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <label className="block text-sm mb-1 mt-3">Număr km final</label>
            <input
              type="number"
              value={kmEnd}
              onChange={(e) => setKmEnd(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button
              onClick={handleSubmitFinal}
              className="mt-4 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Trimite final
            </button>
          </div>
        </div>

        {/* Combustibil */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Combustibil</h3>
          <label className="block text-sm mb-1">Cantitate combustibil (L)</label>
          <input
            type="number"
            value={fuelQuantity}
            onChange={(e) => setFuelQuantity(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <label className="block text-sm mb-1 mt-3">Preț combustibil (lei/L)</label>
          <input
            type="number"
            value={fuelPrice}
            onChange={(e) => setFuelPrice(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button
            onClick={handleSubmitCombustibil}
            className="mt-4 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Trimite combustibil
          </button>
        </div>

        {/* Raportează problemă */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Raportează o problemă</h3>
          <label className="block text-sm mb-1">Descriere problemă</label>
          <textarea
            rows="3"
            value={problema}
            onChange={(e) => setProblema(e.target.value)}
            className="w-full border p-2 rounded mb-3"
            placeholder="Descrie problema aici..."
          />
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm">Problemă urgentă</label>
          </div>
          <button
            onClick={handleReportProblema}
            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Trimite sesizarea
          </button>
        </div>
      </div>
    </LayoutWrapper>
  );
};

export default AngajatCurierDashboard;
