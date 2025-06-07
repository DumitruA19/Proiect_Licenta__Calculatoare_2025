import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import LayoutWrapper from './layout/LayoutWrapper';

// Autentificare
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';

// Dashboarduri
import GeneralDashboard from './pages/Dashboard/GeneralDashboard';
import AdminSediuDashboard from './pages/Dashboard/AdminSediuDashboard';
//import AngajatCurierDashboard from './pages/Dashboard/AngajatCurierDashboard';
import MecanicDashboard from './pages/Dashboard/MecanicDashboard';
import AngajatCurierDashboard from './pages/Dashboard/AngajatCurierDashboard';
// Angajați
import Employees from './pages/Employees/Employees';
import AddEmployee from './pages/Employees/AddEmployees';
import EditEmployee from './pages/Employees/EditEmployee';

// Mașini
import Cars from './pages/Cars/Cars';
import AddCar from './pages/Cars/AddCars';
import EditCar from './pages/Cars/EditCar';

// Pontaj și rapoarte
import Pontaj from './pages/Pontaj/Pontaj';
import RaportOreKmAngajat from './pages/Pontaj/RaportOreKmAngajat';
import LeaveRequests from "./pages/Pontaj/LeaveRequest";
import ApproveLeave from './pages/Pontaj/ApproveLeave';

// Reparații
import RepairRequest from './pages/Mechanics/RepairRequest';
import RepairApproval from './pages/Mechanics/RepairApproval';
import UploadFacturaMecanic from './pages/Mechanics/UploadFactuaMecanic';
import EditRepair from './pages/Mechanics/EditRepair';
import MecanicAdminPage from './pages/Mechanics/MecanicAdminPage';

// Notificări și setări
import Notifications from './pages/Messages/Notifications';
import ProfileSettings from './pages/Settings/ProfileSettings';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
    404 - Pagina nu a fost găsită
  </div>
);
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Public */}
         <Route path="/" element={<Login/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Dashboarduri */}
          <Route path="/dashboard-general" element={
            <ProtectedRoute roles={['administrator_general']}>
              <GeneralDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard-sediu" element={
            <ProtectedRoute roles={['admin_sediu']}>
              <AdminSediuDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard-angajat" element={
            <ProtectedRoute roles={['angajat','angajat_curier', 'angajat_depozit']}>
              <AngajatCurierDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard-mecanic" element={
            <ProtectedRoute roles={['mecanic']}>
              <MecanicDashboard />
            </ProtectedRoute>
          } />

          {/* Angajați */}
          <Route path="/employees" element={
            <ProtectedRoute roles={['administrator_general', 'admin_sediu']}>
              <Employees />
            </ProtectedRoute>
          } />
          <Route path="/employees/add" element={
            <ProtectedRoute roles={['administrator_general', 'admin_sediu']}>
              <AddEmployee />
            </ProtectedRoute>
          } />
          <Route path="/employees/edit/:id" element={
            <ProtectedRoute roles={['administrator_general', 'admin_sediu']}>
              <EditEmployee />
            </ProtectedRoute>
          } />

          {/* Mașini */}
          <Route path="/cars" element={
            <ProtectedRoute roles={['admin_sediu', 'angajat_curier']}>
              <Cars />
            </ProtectedRoute>
          } />
          <Route path="/cars/add" element={
            <ProtectedRoute roles={['admin_sediu']}>
              <AddCar />
            </ProtectedRoute>
          } />
          <Route path="/cars/edit/:id" element={
            <ProtectedRoute roles={['admin_sediu']}>
              <EditCar />
            </ProtectedRoute>
          } />

          {/* Pontaj */}
          <Route path="/pontaj" element={
            <ProtectedRoute roles={['admin_sediu','angajat_curier', 'angajat_depozit']}>
              <Pontaj />
            </ProtectedRoute>
          } />
          <Route path="/raport-angajat" element={
            <ProtectedRoute roles={['angajat_curier', 'angajat_depozit']}>
              <RaportOreKmAngajat />
            </ProtectedRoute>
          } />
          <Route path="/cerere-concediu" element={
            <ProtectedRoute roles={['angajat_curier', 'angajat_depozit']}>
              <LeaveRequests />
            </ProtectedRoute>
          } />
          
          <Route path="/cereri-primite" element={
            <ProtectedRoute roles={['admin_sediu']}>
              <ApproveLeave />
            </ProtectedRoute>
          } />

          {/* Reparații */}
          <Route path="/repair-request" element={
            <ProtectedRoute roles={['admin_sediu']}>
              <RepairRequest />
            </ProtectedRoute>
          } />
          <Route path="/repair-approval" element={
            <ProtectedRoute roles={['mecanic']}>
              <RepairApproval />
            </ProtectedRoute>
          } />
          <Route path="/upload-factura" element={
            <ProtectedRoute roles={['mecanic']}>
              <UploadFacturaMecanic />
            </ProtectedRoute>
          } />
          <Route path="/repairs/edit/:id" element={
            <ProtectedRoute roles={['mecanic', 'admin_sediu']}>
              <EditRepair />
            </ProtectedRoute>
          } />
           <Route path="/mecanici" element={
             <ProtectedRoute roles={['admin_sediu']}>
                <MecanicAdminPage />
             </ProtectedRoute>
          } />


          {/* Setări & notificări */}
          <Route path="/notificari" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/profil" element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          } />

          

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
