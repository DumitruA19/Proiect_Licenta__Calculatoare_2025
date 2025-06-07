import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user } = useAuth();

  // Nu e logat
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Dacă există restricții de rol și rolul userului NU e permis
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <div className="p-8 text-center text-red-600 text-xl">
      Acces interzis. Nu ai permisiunea să accesezi această pagină.
    </div>;
  }

  return children;
};

export default ProtectedRoute;
