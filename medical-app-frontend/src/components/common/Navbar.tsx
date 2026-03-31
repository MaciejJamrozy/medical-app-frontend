import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  const renderLinks = (isMobile: boolean) => (
    <>
      {!isAuthenticated && (
        <>
           <Link to="/" onClick={closeMenu} style={styles.link}>Nasi Lekarze</Link>
           <Link to="/login" onClick={closeMenu} style={styles.link}>Logowanie</Link>
           <Link to="/register" onClick={closeMenu} style={{...styles.link, ...styles.registerBtn}}>Rejestracja</Link>
        </>
      )}

      {isAuthenticated && user && (
        <>
           {user.role !== 'admin' && (
              <Link to="/dashboard" onClick={closeMenu} style={styles.link}>
                {user.role === 'doctor' ? 'Mój Grafik' : 'Kalendarz Wizyt'}
              </Link>
           )}

           {user.role === 'admin' && (
              <Link to="/admin" onClick={closeMenu} style={{...styles.link, color: '#f1c40f'}}>ADMIN</Link>
           )}
          
          {user.role === 'patient' && (
             <>
                <Link to="/cart" onClick={closeMenu} style={styles.link}>Koszyk</Link>
                <Link to="/appointments" onClick={closeMenu} style={styles.link}>Moje Wizyty</Link>
             </>
          )}
          
          {/* Sekcja użytkownika */}
          <div style={isMobile ? styles.mobileUserBox : styles.desktopUserBox}>
            <span style={{ fontSize: '0.9rem', color: '#bdc3c7' }}>
                {user.role === 'doctor' ? 'Lek. ' : ''}{user.name}
            </span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Wyloguj</button>
          </div>
        </>
      )}
    </>
  );

  return (
    <nav style={{ background: '#2c3e50', color: 'white', position: 'relative' }}>
      <div className="navbar-container">
        <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.4rem', color: 'white', textDecoration: 'none' }}>
          PrimoMed
        </Link>

        <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className="desktop-menu">
            {renderLinks(false)}
        </div>
      </div>

      {isMenuOpen && (
        <div className="mobile-menu-dropdown">
            {renderLinks(true)}
        </div>
      )}
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
    link: { color: 'white', textDecoration: 'none', fontWeight: '500' },
    registerBtn: { background: '#3498db', padding: '8px 20px', borderRadius: '20px' },
    logoutBtn: { background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' },
    desktopUserBox: { display: 'flex', alignItems: 'center', marginLeft: '20px', paddingLeft: '20px', borderLeft: '1px solid #34495e' },
    mobileUserBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', borderTop: '1px solid #34495e', paddingTop: '15px' }
};

export default Navbar;