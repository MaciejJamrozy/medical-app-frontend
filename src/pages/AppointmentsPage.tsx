import React, { useEffect, useState } from 'react';
import { api, socket } from '../services/api'; 
import type { Slot, Rating } from '../types';
import { AxiosError } from 'axios'; // <--- DODAJ TĘ LINIJKĘ

const AppointmentsPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Slot[]>([]);
    const [ratedDoctors, setRatedDoctors] = useState<Set<number>>(new Set());
    const [ratingData, setRatingData] = useState({ doctorId: null as number | null, stars: 5, comment: '' });

    // NOWOŚĆ: Stan służący tylko do wywoływania odświeżenia
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const isBanned = localStorage.getItem('isBanned') === 'true'; 

    // --- EFEKT POBIERANIA DANYCH ---
    useEffect(() => {
        // Definiujemy funkcję wewnątrz efektu (nie ma problemu z zależnościami)
        const fetchData = async () => {
            try {
                const myAppointments = await api.getMyAppointments();
                setAppointments(myAppointments);

                const myRatings = await api.getMyRatings();
                
                const ratedIds = new Set<number>();
                myRatings.forEach((r: Rating) => {
                    if (r.doctorId) ratedIds.add(Number(r.doctorId));
                });
                setRatedDoctors(ratedIds);

            } catch (err: unknown) {
                console.error("Błąd pobierania danych:", err);
            }
        };

        fetchData();

        // Socket tylko podbija licznik, wymuszając ponowne uruchomienie efektu
        const handleSocketUpdate = () => setRefreshTrigger(prev => prev + 1);
        socket.on('schedule_update', handleSocketUpdate);

        return () => {
            socket.off('schedule_update', handleSocketUpdate);
        };
    }, [refreshTrigger]); // Efekt zależy tylko od licznika

    // --- HELPERY I SORTOWANIE ---
    const isPast = (dateStr: string, timeStr: string) => {
        const appDate = new Date(`${dateStr}T${timeStr}`);
        return appDate < new Date();
    };

    const upcomingAppointments = appointments
        .filter(app => !isPast(app.date, app.time))
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    const pastAppointments = appointments
        .filter(app => isPast(app.date, app.time))
        .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());


    // --- OBSŁUGA AKCJI ---
    
    // Funkcja pomocnicza do odświeżania ręcznego
    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    const handleRateClick = (doctorId: number) => {
        setRatingData({ ...ratingData, doctorId: doctorId });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

const submitRating = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ratingData.doctorId) return;

        try {
            await api.addRating({
                doctorId: ratingData.doctorId,
                stars: Number(ratingData.stars),
                comment: ratingData.comment
            });
            alert("Dziękujemy za opinię!");
            setRatingData({ doctorId: null, stars: 5, comment: '' });
            triggerRefresh(); 
        } catch (err: unknown) {
            // ZMIANA TUTAJ:
            // Rzutujemy na AxiosError, który spodziewa się obiektu z polem 'message' w data
            const error = err as AxiosError<{ message: string }>;
            
            // Teraz TypeScript wie, że error.response może istnieć
            alert(error.response?.data?.message || error.message);
        }
    };

    const handleCancelClick = async (slotId: number) => {
        if (!window.confirm("Czy na pewno chcesz odwołać tę wizytę?")) return;
        try {
            await api.cancelAppointment(slotId);
            alert("Wizyta odwołana.");
            triggerRefresh(); // Zamiast fetchData()
        } catch (err: unknown) {
            const error = err as Error;
            alert("Błąd: " + error.message);
        }
    };

    // --- KARTA WIZYTY ---
    const AppointmentCard = ({ app, isHistory }: { app: Slot, isHistory: boolean }) => {
        const docId = Number(app.doctorId);
        const alreadyRated = ratedDoctors.has(docId);

        return (
            <div style={{
                ...styles.card,
                borderLeft: app.status === 'booked' 
                    ? (isHistory ? '5px solid #95a5a6' : '5px solid #27ae60') 
                    : '5px solid #e74c3c',
                opacity: app.status === 'cancelled' ? 0.7 : 1,
                background: isHistory ? '#fafafa' : 'white'
            }}>
                <div style={styles.dateBox}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isHistory ? '#7f8c8d' : '#2c3e50' }}>
                        {app.time}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                        {app.date}
                    </div>
                </div>

                <div style={styles.infoBox}>
                    <div style={{ fontSize: '0.85rem', color: '#95a5a6', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Lekarz
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#2c3e50', marginBottom: '5px' }}>
                        {app.Doctor?.name || "Nieznany"}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                        {app.Doctor?.specialization || "Specjalista"}
                    </div>
                </div>

                <div style={styles.actionBox}>
                    {app.status === 'booked' ? (
                        <>
                            <div style={isHistory ? styles.badgeHistory : styles.badgeSuccess}>
                                {isHistory ? "✓ ODBYTA" : "NADCHODZĄCA"}
                            </div>
                            
                            <div style={styles.buttonsRow}>
                                {isHistory && !isBanned && !alreadyRated && (
                                    <button onClick={() => handleRateClick(docId)} style={styles.btnRate}>
                                        Oceń
                                    </button>
                                )}
                                
                                {isHistory && alreadyRated && (
                                    <span style={{ fontSize: '0.8rem', color: '#f1c40f', fontWeight: 'bold' }}>
                                        ★ Oceniono
                                    </span>
                                )}

                                {!isHistory && (
                                    <button onClick={() => handleCancelClick(app.id)} style={styles.btnAbort}>
                                        Odwołaj
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={styles.badgeError}>
                            ODWOŁANA
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>Historia Wizyt</h2>
            </div>
            
            {isBanned && (
                <div style={styles.bannedAlert}>
                    <div style={{ fontSize: '1.5rem', marginRight: '15px' }}></div>
                    <div>
                        <strong>Konto ograniczone</strong><br/>
                        Możesz rezerwować wizyty, ale możliwość wystawiania opinii została zablokowana.
                    </div>
                </div>
            )}

            {ratingData.doctorId && (
                <div style={styles.ratingCard}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50' }}>⭐ Wystaw opinię</h3>
                    <form onSubmit={submitRating} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <select 
                            value={ratingData.stars} 
                            onChange={e => setRatingData({...ratingData, stars: parseInt(e.target.value)})}
                            style={styles.select}
                        >
                            <option value="5">5 - Rewelacja</option>
                            <option value="4">4 - Dobrze</option>
                            <option value="3">3 - Przeciętnie</option>
                            <option value="2">2 - Słabo</option>
                            <option value="1">1 - Tragicznie</option>
                        </select>
                        <textarea 
                            placeholder="Twój komentarz..." 
                            value={ratingData.comment} 
                            onChange={e => setRatingData({...ratingData, comment: e.target.value})} 
                            style={styles.textarea}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setRatingData({ doctorId: null, stars: 5, comment: '' })} style={styles.btnCancel}>Anuluj</button>
                            <button type="submit" style={styles.btnSubmit}>Wyślij</button>
                        </div>
                    </form>
                </div>
            )}

            <h3 style={{ color: '#27ae60', borderBottom: '2px solid #27ae60', paddingBottom: '10px', marginTop: '30px' }}>
                Nadchodzące wizyty
            </h3>
            {upcomingAppointments.length === 0 ? (
                <p style={{ color: '#7f8c8d' }}>Brak zaplanowanych wizyt na przyszłość.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {upcomingAppointments.map(app => (
                        <AppointmentCard key={app.id} app={app} isHistory={false} />
                    ))}
                </div>
            )}

            <h3 style={{ color: '#7f8c8d', borderBottom: '2px solid #bdc3c7', paddingBottom: '10px', marginTop: '50px' }}>
                Archiwum wizyt
            </h3>
            {pastAppointments.length === 0 ? (
                <p style={{ color: '#7f8c8d' }}>Brak historii wizyt.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {pastAppointments.map(app => (
                        <AppointmentCard key={app.id} app={app} isHistory={true} />
                    ))}
                </div>
            )}
        </div>
    );
};

// ... Styles object (bez zmian)
const styles: Record<string, React.CSSProperties> = {
    container: { maxWidth: '900px', margin: '0 auto', padding: '20px 10px', fontFamily: "'Segoe UI', sans-serif" },
    header: { marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' },
    bannedAlert: { display: 'flex', alignItems: 'center', background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', borderRadius: '8px', padding: '15px', marginBottom: '30px' },
    ratingCard: { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', marginBottom: '40px', border: '1px solid #e2e8f0' },
    select: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1rem' },
    textarea: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' },
    btnSubmit: { background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
    btnCancel: { background: '#edf2f7', color: '#4a5568', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
    card: { display: 'flex', flexWrap: 'wrap', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', alignItems: 'center', gap: '20px', transition: 'transform 0.2s' },
    dateBox: { minWidth: '100px', textAlign: 'center', paddingRight: '20px', borderRight: '1px solid #eee' },
    infoBox: { flex: '1 1 200px' },
    actionBox: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: '150px' },
    badgeSuccess: { background: '#def7ec', color: '#03543f', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' },
    badgeHistory: { background: '#f1f2f6', color: '#7f8c8d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' },
    badgeError: { background: '#fde8e8', color: '#9b1c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' },
    buttonsRow: { display: 'flex', gap: '10px', alignItems: 'center' },
    btnRate: { background: '#f1c40f', color: '#744210', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' },
    btnAbort: { background: 'white', border: '1px solid #e74c3c', color: '#e74c3c', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }
};

export default AppointmentsPage;