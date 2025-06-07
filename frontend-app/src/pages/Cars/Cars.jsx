import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutWrapper from '../../layout/LayoutWrapper';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { Dialog } from '@headlessui/react';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modale
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);
  const [accessoryAddOpen, setAccessoryAddOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageAddOpen, setImageAddOpen] = useState(false);

  // Mașini
  const [newCar, setNewCar] = useState({
    marca: '',
    model: '',
    nr_inmatriculare: '',
    serie_sasiu: '',
    fuel_type: '',
    status: ''
  });
  const [newImages, setNewImages] = useState([]);
  const [editImages, setEditImages] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  // Accesorii
  const [accessories, setAccessories] = useState([]);
  const [newAccessory, setNewAccessory] = useState('');
  const [allAccessories, setAllAccessories] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [accessoryViewOpen, setAccessoryViewOpen] = useState(false);


  // Lightbox
  const [selectedCarImages, setSelectedCarImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [carIdForUpload, setCarIdForUpload] = useState(null);

  // Fetch mașini
  const fetchCars = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/flota`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCars(res.data);
    } catch (err) {
      console.error('Eroare la încărcare mașini:', err);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Fetch accesorii
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/accessories`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setAllAccessories(res.data))
      .catch(err => console.error(err));
  }, []);

  // Handlers
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewCar((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImagesChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const handleAccessoriesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setSelectedAccessories(selected);
  };
  const handleEditImagesChange = (e) => {
  setEditImages(Array.from(e.target.files));
};

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newCar).forEach(key => formData.append(key, newCar[key]));
      newImages.forEach(img => formData.append('images', img));
      selectedAccessories.forEach(acc => formData.append('accessories[]', acc));

      await axios.post(`${import.meta.env.VITE_API_URL}/flota`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      setAddOpen(false);
      setNewCar({ marca: '', model: '', nr_inmatriculare: '', serie_sasiu: '', fuel_type: '', status: '' });
      setNewImages([]);
      setSelectedAccessories([]);
      fetchCars();
    } catch (err) {
      console.error('Eroare la adăugare mașină:', err);
    }
  };

  const handleEditOpen = (car) => {
    setSelectedCar(car);
    setEditImages([]);
    setSelectedAccessories(car.accessory_ids || []);
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedCar((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(selectedCar).forEach(key => formData.append(key, selectedCar[key]));
      editImages.forEach(img => formData.append('images', img));
      selectedAccessories.forEach(acc => formData.append('accessories[]', acc));

      await axios.patch(`${import.meta.env.VITE_API_URL}/flota/${selectedCar.id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      setEditOpen(false);
      setSelectedCar(null);
      setEditImages([]);
      setSelectedAccessories([]);
      fetchCars();
    } catch (err) {
      console.error('Eroare la actualizare mașină:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Sigur vrei să ștergi această mașină?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/flota/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchCars();
      } catch (err) {
        console.error('Eroare la ștergerea mașinii:', err);
      }
    }
  };

  const handleAccessories = async (carId) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/flota_accessories?masina_id=${carId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setAccessories(res.data);
    setAccessoriesOpen(true);  // 📢 deschide modalul!
  } catch (err) {
    console.error('Eroare la obținerea accesoriilor:', err);
  }
};


  const handleAddAccessory = async (e) => {
    e.preventDefault();
    try {
      const sediuId = localStorage.getItem('sediu_id');
      await axios.post(`${import.meta.env.VITE_API_URL}/accessories`, {
        name: newAccessory,
        sediu_id: parseInt(sediuId)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNewAccessory('');
      setAccessoryAddOpen(false);
      alert('Accesoriu adăugat cu succes!');
    } catch (err) {
      console.error('Eroare la adăugare accesoriu:', err);
    }
  };

  // Lightbox
  const handleNewImageFilesChange = (e) => {
    setNewImageFiles(Array.from(e.target.files));
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      newImageFiles.forEach(file => formData.append('images', file));
      formData.append('masina_id', carIdForUpload);

      await axios.post(`${import.meta.env.VITE_API_URL}/flota_img`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setImageAddOpen(false);
      alert('Imagine adăugată cu succes.');
      fetchCars();
    } catch (err) {
      console.error('Eroare la adăugare imagine:', err);
    }
  };
  const handleDeleteAccessory = async (id) => {
  if (window.confirm("Sigur vrei să ștergi acest accesoriu?")) {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/accessories/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAllAccessories(allAccessories.filter(acc => acc.id !== id));
      alert('Accesoriul a fost șters cu succes!');
    } catch (err) {
      console.error('Eroare la ștergerea accesoriului:', err);
      alert('Eroare la ștergerea accesoriului.');
    }
  }
};


  return (
    <LayoutWrapper>
            {/* 🔹 Topbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold">Mașini</h2>
              <div className="flex gap-2">
                <button onClick={() => setAddOpen(true)} className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Adaugă Mașină
                </button>
                <button onClick={() => setAccessoryAddOpen(true)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Adaugă Accesoriu
                </button>
              </div>
            </div>

            {/* 🔎 Search + Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              {/* 🔎 Search */}
              <div className="flex items-center border border-gray-300 rounded px-2 w-full sm:w-1/2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Caută..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="outline-none text-sm py-1 px-2 w-full"
                />
              </div>

              {/* 🔥 Butoane Adăugare */}
              <div className="flex gap-2">
                  <button
                    onClick={() => setAddOpen(true)}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Adaugă Mașină
                  </button>
                  <button
                    onClick={() => setAccessoryAddOpen(true)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Adaugă Accesoriu
                  </button>
                  <button
                    onClick={() => setAccessoryViewOpen(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm flex items-center gap-1"
                  >
                    👀 Vizualizează Accesorii
                  </button>
                </div>

            </div>            
            {/* 📝 Tabel */}
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="min-w-full text-sm sm:text-base">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3">Imagini</th>
                    <th className="p-3">Nr. Înmatriculare</th>
                    <th className="p-3">Marcă</th>
                    <th className="p-3">Model</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Angajat</th>
                    <th className="p-3">Accesorii</th>
                    <th className="p-3">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.filter(car =>
                    car.nr_inmatriculare.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((car) => (
                    <tr key={car.id} className="hover:bg-gray-50 border-t">
                      {/* 🔸 Imagini */}
                      <td className="p-3">
                        {car.images && car.images.length > 0 ? (
                          <div className="flex overflow-x-auto gap-2 max-w-xs">
                            {car.images.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`Mașină ${idx}`}
                                className="w-20 h-12 object-cover rounded shadow cursor-pointer"
                                onClick={() => {
                                  setSelectedCarImages(car.images);
                                  setCurrentImageIndex(idx);
                                  setLightboxOpen(true);
                                  setCarIdForUpload(car.id);
                                }}
                              />
                            ))}
                          </div>
                        ) : '—'}
                      </td>

                      <td className="p-3">{car.nr_inmatriculare}</td>
                      <td className="p-3">{car.marca}</td>
                      <td className="p-3">{car.model}</td>
                      <td className="p-3">{car.status}</td>
                      <td className="p-3">{car.angajat_asignat || '—'}</td>
                      <td className="p-3">
                        <button onClick={() => handleAccessories(car.id)} className="text-blue-600 hover:underline">
                          Vezi Accesorii
                        </button>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button onClick={() => handleEditOpen(car)} className="text-blue-600 hover:underline">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(car.id)} className="text-red-600 hover:underline">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Adaugare masina*/}
          <Dialog open={addOpen} onClose={() => setAddOpen(false)} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/50">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6">
            <Dialog.Title className="text-lg font-bold mb-4">Adaugă Mașină</Dialog.Title>
            <form onSubmit={handleAdd} className="space-y-3">
              {['marca', 'model', 'nr_inmatriculare', 'serie_sasiu', 'fuel_type', 'status'].map(field => (
                <input
                  key={field}
                  type="text"
                  name={field}
                  value={newCar[field]}
                  onChange={handleAddChange}
                  className="w-full border p-2 rounded text-sm"
                  placeholder={field}
                />
              ))}

              {/* 🔹 Lista Accesorii */}
              <label className="block text-sm font-semibold">Accesorii:</label>
              <div className="flex flex-col border p-2 rounded text-sm max-h-40 overflow-y-auto">
                {allAccessories.map(acc => (
                  <label key={acc.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={acc.id}
                      checked={selectedAccessories.includes(acc.id)}
                      onChange={(e) => {
                        const accessoryId = parseInt(e.target.value);
                        if (e.target.checked) {
                          setSelectedAccessories(prev => [...prev, accessoryId]);
                        } else {
                          setSelectedAccessories(prev => prev.filter(id => id !== accessoryId));
                        }
                      }}
                    />
                    {acc.name}
                  </label>
                ))}
              </div>

              {/* 🔹 Imagini */}
              <input type="file" multiple accept="image/*" onChange={handleAddImagesChange} />
              <div className="flex flex-wrap gap-2">
                {newImages.map((img, index) => (
                  <img key={index} src={URL.createObjectURL(img)} alt="" className="w-16 h-16 object-cover rounded" />
                ))}
              </div>

              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                Salvează
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>


            {/* 🔥 Modal Editare Mașină */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/50">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6">
            <Dialog.Title className="text-lg font-bold mb-4">Editează Mașină</Dialog.Title>
            {selectedCar && (
              <form onSubmit={handleEditSubmit} className="space-y-3">
                {['marca', 'model', 'nr_inmatriculare', 'serie_sasiu', 'fuel_type', 'status'].map(field => (
                  <input
                    key={field}
                    type="text"
                    name={field}
                    value={selectedCar[field] || ''}
                    onChange={handleEditChange}
                    className="w-full border p-2 rounded text-sm"
                    placeholder={field}
                  />
                ))}

                {/* 🔹 Accesorii */}
                <label className="block text-sm font-semibold">Accesorii:</label>
                <div className="flex flex-col border p-2 rounded text-sm max-h-40 overflow-y-auto">
                  {allAccessories.map(acc => (
                    <label key={acc.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={acc.id}
                        checked={selectedAccessories.includes(acc.id)}
                        onChange={(e) => {
                          const accessoryId = parseInt(e.target.value);
                          if (e.target.checked) {
                            setSelectedAccessories(prev => [...prev, accessoryId]);
                          } else {
                            setSelectedAccessories(prev => prev.filter(id => id !== accessoryId));
                          }
                        }}
                      />
                      {acc.name}
                    </label>
                  ))}
                </div>

                {/* 🔹 Imagini */}
                <input type="file" multiple accept="image/*" onChange={handleEditImagesChange} />
                <div className="flex flex-wrap gap-2">
                  {editImages.map((img, index) => (
                    <img key={index} src={URL.createObjectURL(img)} alt="" className="w-16 h-16 object-cover rounded" />
                  ))}
                </div>

                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                  Actualizează
                </button>
              </form>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>


      <Dialog open={accessoriesOpen} onClose={() => setAccessoriesOpen(false)} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/50">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6">
            <Dialog.Title className="text-lg font-bold mb-4">Accesorii Mașină</Dialog.Title>
            {accessories.length > 0 ? (
              <ul className="space-y-2">
                {accessories.map((acc, index) => (
                  <li key={index} className="border-b pb-1">{acc.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nicio accesoriu activat.</p>
            )}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setAccessoriesOpen(false)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
              >
                Închide
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      <Dialog open={accessoryAddOpen} onClose={() => setAccessoryAddOpen(false)} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/50">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6">
            <Dialog.Title className="text-lg font-bold mb-4">Adaugă Accesoriu</Dialog.Title>
            <form onSubmit={handleAddAccessory} className="space-y-3">
              <input
                type="text"
                name="accessory"
                value={newAccessory}
                onChange={(e) => setNewAccessory(e.target.value)}
                className="w-full border p-2 rounded text-sm"
                placeholder="Nume Accesoriu"
              />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                Adaugă
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
      <Dialog open={lightboxOpen} onClose={() => setLightboxOpen(false)} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/80">
          <Dialog.Panel className="bg-white p-4 rounded shadow-lg flex flex-col items-center max-w-3xl w-full">
            {selectedCarImages.length > 0 && (
              <>
                <img
                  src={selectedCarImages[currentImageIndex]}
                  alt={`Mașină ${currentImageIndex + 1}`}
                  className="max-h-[80vh] max-w-full object-contain rounded"
                />
                <div className="flex justify-between items-center w-full mt-4">
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? selectedCarImages.length - 1 : prev - 1))}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
                  >
                    ◀️ Anterior
                  </button>
                  <span>{currentImageIndex + 1} / {selectedCarImages.length}</span>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === selectedCarImages.length - 1 ? 0 : prev + 1))}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
                  >
                    Următor ▶️
                  </button>
                </div>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm mt-4"
                >
                  Închide
                </button>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
      <Dialog open={imageAddOpen} onClose={() => setImageAddOpen(false)} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/50">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6">
            <Dialog.Title className="text-lg font-bold mb-4">Adaugă Imagine</Dialog.Title>
            <form onSubmit={handleAddImage} className="space-y-3">
              <input type="file" multiple accept="image/*" onChange={handleNewImageFilesChange} />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                Încarcă
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
      <Dialog open={accessoryViewOpen} onClose={() => setAccessoryViewOpen(false)} className="fixed inset-0 z-50">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/50">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow p-6">
            <Dialog.Title className="text-lg font-bold mb-4">Toate Accesoriile</Dialog.Title>
            {allAccessories.length > 0 ? (
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {allAccessories.map((acc, index) => (
                  <li key={acc.id} className="border-b pb-1 flex justify-between items-center">
                    <span>{acc.name}</span>
                    <button
                      onClick={() => handleDeleteAccessory(acc.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                    >
                      🗑️ Șterge
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nu există accesorii disponibile.</p>
            )}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setAccessoryViewOpen(false)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
              >
                Închide
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </LayoutWrapper>
  );
};

export default Cars;
