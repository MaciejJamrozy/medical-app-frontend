import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';

// Importy stron
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CartPage from './pages/CartPage';
import AppointmentsPage from './pages/AppointmentsPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import GuestDoctorsPage from './pages/GuestDoctorsPage';

// Import Providera i Hooka
import { AuthProvider, useAuth } from './context/AuthContext';

// --- NOWY KOMPONENT: Inteligentne przekierowanie ---
const HomeRedirect: React.FC = () => {
    const { user, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        if (user?.role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <GuestDoctorsPage />;
};

// --- KOMPONENT: RoleRoute ---
// Definiujemy typy dla propsów
interface RoleRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    // user!.role - wykrzyknik to asercja, że user istnieje (bo isAuthenticated=true)
    // Bezpieczniej: user?.role
    if (user && allowedRoles.includes(user.role)) {
        return <>{children}</>;
    }

    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
};

// --- NAVBAR ---
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '15px 30px', background: '#2c3e50', color: 'white', display: 'flex', gap: '25px', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      {/* 1. LOGO */}
      <Link to="/" style={{ 
          fontWeight: 'bold', 
          fontSize: '1.4rem', 
          marginRight: 'auto', 
          color: 'white', 
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
      }}>
        PrimoMed 
      </Link>

      {/* 2. MENU DLA GOŚCI */}
      {!isAuthenticated && (
        <>
           <Link to="/" style={{ color: '#ecf0f1', textDecoration: 'none', fontSize: '1rem', fontWeight: '500' }}>
             Nasi Lekarze
           </Link>
           <Link to="/login" style={{ color: 'white', textDecoration: 'none', marginLeft: '10px' }}>
             Logowanie
           </Link>
           <Link to="/register" style={{ 
               background: '#3498db', padding: '8px 20px', borderRadius: '25px', 
               color: 'white', textDecoration: 'none', fontWeight: 'bold', transition: 'background 0.3s'
           }}>
             Rejestracja
           </Link>
        </>
      )}

      {/* 3. MENU DLA ZALOGOWANYCH */}
      {isAuthenticated && user && (
        <>
           {user.role !== 'admin' && (
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
                {user.role === 'doctor' ? 'Mój Grafik' : 'Kalendarz Wizyt'}
              </Link>
           )}

           {user.role === 'admin' && (
              <Link to="/admin" style={{ color: '#f1c40f', textDecoration: 'none', fontWeight: 'bold' }}>
                ADMIN
              </Link>
           )}
          
          {user.role === 'patient' && (
             <>
                <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>Koszyk</Link>
                <Link to="/appointments" style={{ color: 'white', textDecoration: 'none' }}>Moje Wizyty</Link>
             </>
          )}
          
          {/* SEKCJA UŻYTKOWNIKA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '20px', paddingLeft: '20px', borderLeft: '1px solid #34495e' }}>
            
            {user.role !== 'admin' && (
                <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                    <div style={{ fontSize: '0.85rem', color: '#bdc3c7' }}>Zalogowany jako:</div>
                    <div style={{ fontWeight: 'bold' }}>
                        {user.role === 'doctor' ? 'Lek. ' : ''}{user.name}
                    </div>
                </div>
            )}
            
            <button 
                onClick={handleLogout} 
                style={{ 
                    background: '#e74c3c', color: 'white', border: 'none', 
                    padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                }}
            >
                Wyloguj
            </button>
          </div>
        </>
      )}
    </nav>
  );
};

// --- GŁÓWNA APLIKACJA ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
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