import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { LoginCredentials } from '../types';

const LoginPage: React.FC = () => {
    // 1. Typowanie stanu formularza
    const [formData, setFormData] = useState<LoginCredentials>({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // 2. Typowanie zdarzenia zmiany inputa
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Typowanie zdarzenia wysyłki
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            // api.login jest generyczne, zwraca AxiosResponse<AuthResponse>
            const res = await api.login(formData);
            const data = res.data;
            const tokenToSave = data.accessToken; // W typach mamy accessToken

            login({
                accessToken: tokenToSave,
                role: data.role,
                id: data.id,
                name: data.name,
                username: data.username,
                isBanned: data.isBanned,
                authMode: data.authMode
            }, data.authMode);

            localStorage.setItem('isBanned', String(data.isBanned));

            if (data.authMode !== 'NONE') localStorage.setItem('userId', String(data.id));
            navigate(data.role === 'admin' ? '/admin' : '/dashboard');

        } catch (err: unknown) {
                const error = err as AxiosError<{ message: string }>;
                setError(error.response?.data?.message || "Błąd logowania.");
            }
    };

    return (
        <div style={styles.container}>
            <div style={styles.splitCard}>
                <div style={styles.leftPanel}>
                    <div style={styles.brandContent}>
                        <h1 style={styles.brandTitle}>Przychodnia<br/>Online</h1>
                        <p style={styles.brandText}>Twoje zdrowie w bezpiecznych rękach.</p>
                    </div>
                </div>

                <div style={styles.rightPanel}>
                    <h2 style={styles.formTitle}>Zaloguj się</h2>
                    <p style={styles.formSubtitle}>Wpisz swoje dane dostępowe</p>
                    
                    {error && <div style={styles.error}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Login</label>
                            <input 
                                type="text" 
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Hasło</label>
                            <input 
                                type="password" 
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <button type="submit" style={styles.button}>Wejdź</button>
                    </form>

                    <div style={styles.footer}>
                        Nie masz konta? <Link to="/register" style={styles.link}>Zarejestruj się</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... Styles (bez zmian - TS akceptuje obiekt JS jako CSSProperties)
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

export default LoginPage;