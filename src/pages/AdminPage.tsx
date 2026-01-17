import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SPECIALIZATIONS } from '../utils/specializations';
import type { User, Rating, CreateDoctorData } from '../types';
import { AxiosError } from 'axios';

const AdminPage: React.FC = () => {
    // --- STANY DANYCH ---
    const [users, setUsers] = useState<User[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [doctorForm, setDoctorForm] = useState<CreateDoctorData>({
        name: '', username: '', password: '', specialization: ''
    });
    const [authMode, setAuthMode] = useState<'LOCAL' | 'SESSION' | 'NONE'>('LOCAL');

    // --- STANY FILTRÓW I WIDOKU ---
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [userRoleFilter, setUserRoleFilter] = useState<string>('all'); 
    
    // Stany zwijania sekcji
    const [isUsersExpanded, setIsUsersExpanded] = useState(true);
    const [isRatingsExpanded, setIsRatingsExpanded] = useState(true);

    // --- POPRAWIONY USE EFFECT ---
    useEffect(() => {
        // 1. Definiujemy funkcję wewnątrz efektu
        const fetchData = async () => {
            try {
                const [usersData, ratingsData] = await Promise.all([
                    api.getAllUsers(),
                    api.getAllRatings()
                ]);
                setUsers(usersData);
                
                const sortedRatings = ratingsData.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                });
                setRatings(sortedRatings);
            } catch (err: unknown) {
                console.error("Błąd pobierania danych:", err);
            }
        };

        // 2. Wywołujemy ją
        fetchData();

        // 3. Pobieramy ustawienia auth
        api.getAuthSettings()
            .then(res => setAuthMode(res.data.mode))
            .catch(console.error);
    }, []); // Pusta tablica zależności = uruchom tylko raz

    // --- LOGIKA FILTROWANIA UŻYTKOWNIKÓW ---
    const getFilteredUsers = () => {
        if (userRoleFilter === 'all') return users;
        return users.filter(user => user.role === userRoleFilter);
    };
    const filteredUsers = getFilteredUsers();

    // --- LOGIKA FILTROWANIA OPINII ---
    const getFilteredRatings = () => {
        if (!startDate && !endDate) return ratings;

        return ratings.filter(rating => {
            if (!rating.createdAt) return false;
            const ratingDate = new Date(rating.createdAt);
            
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0); 
                if (ratingDate < start) return false;
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); 
                if (ratingDate > end) return false;
            }

            return true;
        });
    };
    const filteredRatings = getFilteredRatings();

    // --- OBSŁUGA AKCJI (tutaj musimy odświeżać ręcznie, bo fetchData jest teraz wewnątrz useEffect) ---
    
    // Pomocnicza funkcja do odświeżania userów po dodaniu lekarza/banie
    const refreshUsers = async () => {
        try {
            const data = await api.getAllUsers();
            setUsers(data);
        } catch (e) { console.error(e); }
    };

    const handleDoctorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createDoctor(doctorForm);
            alert("Lekarz dodany!");
            setDoctorForm({ name: '', username: '', password: '', specialization: '' });
            refreshUsers(); // Odświeżamy listę
        } catch (err: unknown) {
            const error = err as Error;
            alert("Błąd: " + error.message);
        }
    };

    const handleToggleBan = async (userId: number, currentStatus?: boolean) => {
        const newStatus = !currentStatus;
        if (!window.confirm(`Czy na pewno chcesz ${newStatus ? 'ZBANOWAĆ' : 'ODBANOWAĆ'} tego użytkownika?`)) return;

        try {
            await api.toggleBan(userId, newStatus);
            // Optymistyczna aktualizacja UI (szybsza niż pobieranie wszystkiego od nowa)
            setUsers(users.map(u => u.id === userId ? { ...u, isBanned: newStatus } : u));
        } catch (err: unknown) {
            const error = err as Error;
            alert("Błąd zmiany statusu: " + error.message);
        }
    };

    const handleDeleteRating = async (ratingId: number) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tę opinię?")) return;
        try {
            await api.deleteRating(ratingId);
            setRatings(ratings.filter(r => r.id !== ratingId));
        } catch (err: unknown) {
            const error = err as Error;
            alert("Błąd usuwania opinii: " + error.message);
        }
    };

const handleChangeAuthMode = async (newMode: 'LOCAL' | 'SESSION' | 'NONE') => {
        try {
            await api.updateAuthMode(newMode);
            setAuthMode(newMode);
        } catch (err: unknown) {
            // Rzutujemy na AxiosError, który spodziewa się obiektu z polem 'message'
            const error = err as AxiosError<{ message: string }>;
            alert("Błąd zmiany trybu: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
            <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Panel Administratora</h1>

            {/* SEKCJA USTAWIEŃ */}
            <div style={{ background: '#edf2f7', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #cbd5e0' }}>
                <h3 style={{ marginTop: 0 }}>Ustawienia trybu logowania</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'bold', color: '#4a5568' }}>Tryb sesji:</span>
                    {(['LOCAL', 'SESSION', 'NONE'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => handleChangeAuthMode(mode)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                background: authMode === mode ? '#2b6cb0' : 'white',
                                color: authMode === mode ? 'white' : '#2d3748',
                                border: authMode === mode ? 'none' : '1px solid #cbd5e0',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* SEKCJA 1: DODAWANIE LEKARZA */}
            <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Dodaj Lekarza</h3>
                <form onSubmit={handleDoctorSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'stretch' }}>
                    <input 
                        placeholder="Imię i Nazwisko" 
                        value={doctorForm.name} 
                        onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} 
                        required 
                        style={styles.input}
                    />
                    <input 
                        placeholder="Login (Email)" 
                        value={doctorForm.username} 
                        onChange={e => setDoctorForm({...doctorForm, username: e.target.value})} 
                        required 
                        style={styles.input}
                    />
                    
                    <select
                        value={doctorForm.specialization}
                        onChange={e => setDoctorForm({...doctorForm, specialization: e.target.value})}
                        required
                        style={{...styles.input, background: 'white'}}
                    >
                        <option value="" disabled>-- Specjalizacja --</option>
                        {SPECIALIZATIONS.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>

                    <input 
                        type="password" 
                        placeholder="Hasło" 
                        value={doctorForm.password} 
                        onChange={e => setDoctorForm({...doctorForm, password: e.target.value})} 
                        required 
                        style={styles.input}
                    />
                    <button type="submit" style={styles.btnAdd}>Dodaj</button>
                </form>
            </div>

            {/* SEKCJA 2: LISTA UŻYTKOWNIKÓW */}
            <div style={styles.sectionCard}>
                <div style={styles.headerRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h3 style={{ margin: 0 }}>Lista Użytkowników</h3>
                        
                        <select 
                            value={userRoleFilter}
                            onChange={(e) => setUserRoleFilter(e.target.value)}
                            style={styles.filterSelect}
                        >
                            <option value="all">Wszyscy</option>
                            <option value="doctor">Lekarze</option>
                            <option value="patient">Pacjenci</option>
                        </select>
                    </div>

                    <button 
                        onClick={() => setIsUsersExpanded(!isUsersExpanded)}
                        style={styles.toggleBtn}
                    >
                        {isUsersExpanded ? '▼ Zwiń' : '▶ Rozwiń'}
                    </button>
                </div>

                {isUsersExpanded && (
                    <div style={{ maxHeight: '500px', overflowY: 'auto', marginTop: '15px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                                <tr style={{ borderBottom: '2px solid #edf2f7', textAlign: 'left', color: '#718096', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '10px' }}>ID</th>
                                    <th style={{ padding: '10px' }}>Imię</th>
                                    <th style={{ padding: '10px' }}>Login</th>
                                    <th style={{ padding: '10px' }}>Rola</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                                        <td style={{ padding: '10px', color: '#718096' }}>{user.id}</td>
                                        <td style={{ padding: '10px', fontWeight: '500' }}>
                                            {user.name} 
                                            {user.role === 'doctor' && user.specialization && (
                                                <div style={{fontSize: '0.75em', color: '#718096', marginTop: '2px'}}>
                                                    {user.specialization}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '10px' }}>{user.username}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{ 
                                                background: user.role === 'admin' ? '#purple' : (user.role === 'doctor' ? '#e6fffa' : '#ebf8ff'),
                                                color: user.role === 'admin' ? 'purple' : (user.role === 'doctor' ? '#2c7a7b' : '#2b6cb0'),
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.75em', fontWeight: 'bold', textTransform: 'uppercase'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            {user.isBanned ? 
                                                <span style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: '0.9rem' }}> BAN</span> : 
                                                <span style={{ color: '#38a169', fontSize: '0.9rem' }}>Aktywny</span>
                                            }
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            {user.role === 'patient' && (
                                                <button 
                                                    onClick={() => handleToggleBan(user.id, user.isBanned)}
                                                    style={{
                                                        ...styles.btnBan,
                                                        background: user.isBanned ? '#48bb78' : '#e53e3e'
                                                    }}
                                                >
                                                    {user.isBanned ? 'Odbanuj' : 'Zbanuj'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && <p style={{textAlign: 'center', color: '#cbd5e0', padding: '20px'}}>Brak użytkowników.</p>}
                    </div>
                )}
            </div>

            {/* SEKCJA 3: ZARZĄDZANIE OPINIAMI */}
            <div style={styles.sectionCard}>
                <div style={styles.headerRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h3 style={{ margin: 0 }}>Opinie</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <span style={{fontSize: '0.85rem', color: '#718096'}}>Od:</span>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={styles.dateInput}
                            />
                            <span style={{fontSize: '0.85rem', color: '#718096'}}>Do:</span>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={styles.dateInput}
                            />
                            
                            {(startDate || endDate) && (
                                <button 
                                    onClick={() => { setStartDate(''); setEndDate(''); }} 
                                    style={styles.clearBtn}
                                    title="Wyczyść filtry daty"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsRatingsExpanded(!isRatingsExpanded)}
                        style={styles.toggleBtn}
                    >
                        {isRatingsExpanded ? '▼ Zwiń' : '▶ Rozwiń'}
                    </button>
                </div>

                {isRatingsExpanded && (
                    <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                        {filteredRatings.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#718096', padding: '20px' }}>
                                {(startDate || endDate) ? "Brak opinii w wybranym przedziale czasowym." : "Brak opinii w systemie."}
                            </p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #edf2f7', textAlign: 'left', background: '#f7fafc', fontSize: '0.9rem', color: '#718096' }}>
                                        <th style={{ padding: '10px' }}>Data</th>
                                        <th style={{ padding: '10px' }}>Pacjent</th>
                                        <th style={{ padding: '10px' }}>Lekarz</th>
                                        <th style={{ padding: '10px' }}>Ocena</th>
                                        <th style={{ padding: '10px', width: '40%' }}>Treść</th>
                                        <th style={{ padding: '10px' }}>Akcje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRatings.map(rating => (
                                        <tr key={rating.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                                            <td style={{ padding: '10px', fontSize: '0.85rem', color: '#718096' }}>
                                                {rating.createdAt && new Date(rating.createdAt).toLocaleDateString()}
                                                <div style={{fontSize: '0.75rem', color: '#a0aec0'}}>
                                                    {rating.createdAt && new Date(rating.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px', fontWeight: 'bold' }}>
                                                {rating.Patient?.name || 'Usunięty'}
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                {rating.Doctor?.name || 'Nieznany'}
                                            </td>
                                            <td style={{ padding: '10px', color: '#d69e2e', fontWeight: 'bold' }}>
                                                {'⭐'.repeat(rating.stars)}
                                            </td>
                                            <td style={{ padding: '10px', fontStyle: 'italic', color: '#555' }}>
                                                "{rating.comment}"
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                <button 
                                                    onClick={() => rating.id && handleDeleteRating(rating.id)}
                                                    style={styles.btnDelete}
                                                >
                                                    Usuń
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ... Styles (bez zmian - TS akceptuje obiekt JS jako CSSProperties)
const styles: Record<string, React.CSSProperties> = {
    sectionCard: { background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
    sectionTitle: { margin: '0 0 15px 0', color: '#2d3748' },
    input: { padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0', flex: '1 1 200px', minWidth: '0', fontSize: '0.95rem' },
    btnAdd: { background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '10px 20px', fontWeight: 'bold', flex: '1 1 100px', transition: 'background 0.2s' },
    toggleBtn: { background: 'transparent', border: '1px solid #cbd5e0', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', color: '#718096', fontWeight: '600', fontSize: '0.85rem' },
    filterSelect: { padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', background: '#f7fafc', cursor: 'pointer', fontSize: '0.9rem', color: '#2d3748' },
    dateInput: { padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '0.85rem' },
    clearBtn: { background: '#e2e8f0', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', fontSize: '0.8rem', fontWeight: 'bold' },
    btnBan: { color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '6px 12px', fontSize: '0.85em', fontWeight: 'bold' },
    btnDelete: { background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', borderRadius: '4px', cursor: 'pointer', padding: '6px 12px', fontSize: '0.85em', transition: 'all 0.2s' }
};

export default AdminPage;