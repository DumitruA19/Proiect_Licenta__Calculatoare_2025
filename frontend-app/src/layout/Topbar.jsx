import { useAuth } from '../auth/AuthContext';
import { useState } from 'react';

const Topbar = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search functionality here if needed.
  };

  return (
       <header className="h-16 bg-white shadow px-4 sm:px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-40 lg:left-64">

      {/* Stânga: Email-ul */}
      <div className="flex items-center">
        <h1 className="font-bold text-sm sm:text-lg truncate">
          Bun venit, {user?.email}
        </h1>
      </div>

      {/* Dreapta: Search + Deconectare */}
      <div className="flex items-center space-x-4">
        {/* Search input */}
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Caută..."
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Logout button */}
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
          onClick={logout}
        >
          Deconectare
        </button>
      </div>
    </header>
  );
};

export default Topbar;
