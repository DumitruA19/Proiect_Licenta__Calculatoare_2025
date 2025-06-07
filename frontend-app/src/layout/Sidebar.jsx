import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  FaThLarge, FaUsers, FaCar, FaTools, FaCalendarAlt, FaGasPump,
  FaExclamationTriangle, FaFlag, FaCog, FaBars, FaTimes
} from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const is = (role) => user?.role === role;

  return (
    <>
      {/* Buton mobil */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setOpen(true)} className="text-white bg-purple-700 p-2 rounded-lg">
          <FaBars size={20} />
        </button>
      </div>

      {/* Overlay mobil */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 bg-[#1f1147] text-white shadow-lg z-40 flex-col">
        <div className="flex justify-between items-center p-4 font-bold text-xl border-b border-purple-900">
   <div className="p-4 font-bold text-xl border-b border-purple-900">Nexoria</div>  
          <button onClick={() => setOpen(false)} className="lg:hidden text-white">
            <FaTimes />
          </button>
        </div>
        <nav className="p-4 space-y-4">
          {is('admin_general') && (
            <div className="space-y-2">
              <SidebarLink to="/dashboard-general" icon={<FaThLarge />} label="Dashboard" />
              <SidebarLink to="/employees" icon={<FaUsers />} label="Administratori Sediu" />
              <SidebarLink to="/reports" icon={<FaFlag />} label="Rapoarte Sedii" />
            </div>
          )}

          {is('admin_sediu') && (
            <div className="space-y-2">
              <SidebarLink to="/dashboard-sediu" icon={<FaThLarge />} label="Dashboard" />
              <SidebarLink to="/employees" icon={<FaUsers />} label="Angajați" />
              <SidebarLink to="/cars" icon={<FaCar />} label="Mașini" />
              <SidebarLink to="/mecanici" icon={<FaTools />} label="Mecanici" />
              <SidebarLink to="/pontaj" icon={<FaCalendarAlt />} label="Pontaj" />
              <SidebarLink to="/fuel" icon={<FaGasPump />} label="Consum" />
              <SidebarLink to="/reports" icon={<FaFlag />} label="Rapoarte" />
            </div>
          )}

          {is('mecanic') && (
            <div className="space-y-2">
              <SidebarLink to="/dashboard-mecanic" icon={<FaThLarge />} label="Dashboard" />
              <SidebarLink to="/repairs" icon={<FaTools />} label="Cereri Reparații" />
            </div>
          )}

          {(is('angajat') || is('angajat_depozit')) && (
            <div className="space-y-2">
              <SidebarLink to="/dashboard-angajat" icon={<FaThLarge />} label="Dashboard" />
              <SidebarLink to="/pontaj" icon={<FaCalendarAlt />} label="Pontaj" />
              <SidebarLink to="/cars" icon={<FaCar />} label="Mașini" />
              <SidebarLink to="/fuel" icon={<FaGasPump />} label="Combustibil" />
              <SidebarLink to="/incident" icon={<FaExclamationTriangle />} label="Raportează Problemă" />
            </div>
          )}
        </nav>

        <div className="absolute bottom-4 w-full px-4">
          <SidebarLink to="/profil" icon={<FaCog />} label="Settings" />
        </div>
      </aside>
    </>
  );
};

const SidebarLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center space-x-2 hover:text-purple-300 transition-colors"
  >
    <span>{icon}</span>
    <span>{label}</span>
  </Link>
);

export default Sidebar;
