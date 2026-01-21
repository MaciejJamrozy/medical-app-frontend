import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importy stron
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CartPage from './pages/CartPage';
import AppointmentsPage from './pages/AppointmentsPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import GuestDoctorsPage from './pages/GuestDoctorsPage';

// Import Providera i Nowego Navbaru
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar'; // <--- TUTAJ NOWY IMPORT

// --- KOMPONENTY POMOCNICZE (Redirecty i Role) ---
const HomeRedirect: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    if (isAuthenticated) {
        if (user?.role === 'admin') return <Navigate to="/admin" replace />;
        return <Navigate to="/dashboard" replace />;
    }
    return <GuestDoctorsPage />;
};

interface RoleRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user && allowedRoles.includes(user.role)) return <>{children}</>;
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
};

// --- GŁÓWNA APLIKACJA ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Wstawiamy nasz nowy, responsywny Navbar */}
        <Navbar />
        
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/dashboard" element={
              <RoleRoute allowedRoles={['patient', 'doctor']}>
                  <Dashboard />
              </RoleRoute>
            } />

            <Route path="/cart" element={
              <RoleRoute allowedRoles={['patient']}>
                  <CartPage />
              </RoleRoute>
            } />

            <Route path="/appointments" element={
              <RoleRoute allowedRoles={['patient']}>
                  <AppointmentsPage />
            </RoleRoute>
            } />

            <Route path="/admin" element={
              <RoleRoute allowedRoles={['admin']}>
                  <AdminPage />
              </RoleRoute>
            } />
            
            <Route path="/" element={<HomeRedirect />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;