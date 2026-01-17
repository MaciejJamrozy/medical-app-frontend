import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import type { RegisterData } from '../types';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    // Typowanie stanu
    const [formData, setFormData] = useState<RegisterData>({ name: '', username: '', password: '' });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await api.register(formData);
            alert("Konto założone pomyślnie! Zaloguj się.");
            navigate('/login'); 
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Błąd rejestracji");
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.splitCard}>
                <div style={styles.leftPanel}>
                    <div style={styles.brandContent}>
                        <h1 style={styles.brandTitle}>Dołącz<br/>do nas</h1>
                        <p style={styles.brandText}>Zarejestruj się w systemie Przychodni.</p>
                    </div>
                </div>

                <div style={styles.rightPanel}>
                    <h2 style={styles.formTitle}>Rejestracja</h2>
                    <p style={styles.formSubtitle}>Utwórz nowe konto pacjenta</p>
                    
                    {error && <div style={styles.error}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Imię i Nazwisko</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={styles.input} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Login</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} required style={styles.input} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Hasło</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={styles.input} />
                        </div>
                        <button type="submit" style={{...styles.button, background: '#1abc9c', boxShadow: '0 3px 10px rgba(26, 188, 156, 0.3)'}}>Załóż konto</button>
                    </form>

                    <div style={styles.footer}>
                        Masz już konto? <Link to="/login" style={{...styles.link, color: '#1abc9c'}}>Zaloguj się</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Style (te same co w Login)
const styles: Record<string, React.CSSProperties> = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', padding: '20px', fontFamily: "'Segoe UI', sans-serif" },
    splitCard: { display: 'flex', flexWrap: 'wrap', width: '100%', maxWidth: '750px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden', minHeight: '450px' },
    leftPanel: { flex: '1 1 300px', background: '#2c3e50', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white' },
    brandTitle: { fontSize: '2rem', margin: '0 0 15px 0', lineHeight: '1.1' },
    brandText: { fontSize: '1rem', opacity: '0.8', lineHeight: '1.5' },
    rightPanel: { flex: '1 1 350px', padding: '35px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
    formTitle: { margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.6rem' },
    formSubtitle: { margin: '0 0 20px 0', color: '#95a5a6', fontSize: '0.9rem' },
    formGroup: { marginBottom: '15px', width: '100%' },
    label: { display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: '#34495e', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '10px 12px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '6px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s', color: '#2c3e50' },
    button: { width: '100%', padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px', transition: 'transform 0.1s', boxShadow: '0 3px 10px rgba(52, 152, 219, 0.3)' },
    error: { background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', marginBottom: '15px', width: '100%', textAlign: 'center', fontSize: '0.85rem' },
    footer: { marginTop: '20px', fontSize: '0.85rem', color: '#7f8c8d' },
    link: { color: '#3498db', textDecoration: 'none', fontWeight: 'bold', marginLeft: '5px' }
};

export default RegisterPage;