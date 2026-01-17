import React, { useEffect, useState } from 'react';
import { api, socket } from '../services/api'; 
import CalendarView from '../components/CalendarView';
import DoctorPanel from '../components/DoctorPanel'; // Zakładam, że ten komponent też przerobisz/masz
import ReservationModal from '../components/ReservationModal';
import { useAuth } from '../context/AuthContext';
import { SPECIALIZATIONS } from '../utils/specializations';
import type { Doctor, Slot, Absence, ReservationFormData } from '../types';

const Dashboard: React.FC = () => {
    const { user } = useAuth(); 
    const role = user ? user.role : null;
    const myId = localStorage.getItem('userId'); 

    // Stan danych z typami
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]); 
    const [selectedSpec, setSelectedSpec] = useState<string>('Wszystkie'); 
    
    // Stan widoku
    // const [selectedDoctorId, setSelectedDoctorId] = useState<number | string | null>(null);
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | string | null>(() => {
    // Jeśli to lekarz, od razu ustawiamy jego ID jako domyślne
    if (user?.role === 'doctor') {
        return localStorage.getItem('userId');
    }
    return null;
});
    
    const [selectedDoctorName, setSelectedDoctorName] = useState<string | null>(null); 
    
    // Stan kalendarza
    const [slots, setSlots] = useState<Slot[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<Slot | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    // --- 1. INICJALIZACJA ---
    useEffect(() => {
        if (role === 'patient') {
            api.getDoctors().then(data => {
                setDoctors(data);
                setFilteredDoctors(data);
            }).catch(console.error);
        }
    }, [role, myId]);

    // --- 2. FILTROWANIE ---
    const handleFilterChange = (spec: string) => {
        setSelectedSpec(spec);
        if (spec === 'Wszystkie') {
            setFilteredDoctors(doctors);
        } else {
            setFilteredDoctors(doctors.filter(doc => doc.specialization === spec));
        }
    };

    // --- 3. KALENDARZ ---
    const getWeekRange = (date: Date) => {
        const start = new Date(date);
        const day = start.getDay() || 7; 
        start.setDate(start.getDate() - day + 1); 
        const end = new Date(start);
        end.setDate(start.getDate() + 6); 
        return { from: start.toISOString().split('T')[0], to: end.toISOString().split('T')[0] };
    };

    const loadSchedule = () => {
        if (!selectedDoctorId) return;
        const { from, to } = getWeekRange(currentDate);
        
        Promise.all([
            api.getSchedule(selectedDoctorId, from, to),
            api.getDoctorAbsences(selectedDoctorId)
        ]).then(([slotsData, absencesData]) => {
            setSlots(slotsData);
            setAbsences(absencesData);
        }).catch(console.error);
    };

    useEffect(() => {
        loadSchedule();
        socket.on('schedule_update', loadSchedule);
        return () => {socket.off('schedule_update')};
    }, [selectedDoctorId, currentDate]);

    const changeWeek = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };

    // --- 4. AKCJE ---
    const handleDoctorSelect = (doctor: Doctor) => {
        setSelectedDoctorId(doctor.id);
        setSelectedDoctorName(doctor.name);
    };

    const handleBackToList = () => {
        setSelectedDoctorId(null);
        setSelectedDoctorName(null);
        setSlots([]); 
    };

    const handleSlotClick = (slot: Slot) => {
        if (role === 'patient') setSelectedSlotForBooking(slot);
    };

    const handleConfirmBooking = async (slotId: number, formData: ReservationFormData) => {
        try {
            await api.addToCart(slotId, formData.duration, formData);
            alert("Dodano do koszyka! Przejdź do zakładki Koszyk, aby sfinalizować.");
            setSelectedSlotForBooking(null);
            loadSchedule(); 
        } catch (err: unknown) {
            const errorObj = err as Error;
            alert("Błąd rezerwacji: " + (errorObj.message || 'Wystąpił błąd'));
        }
    };

    if (!user) return <div style={{padding: 20}}>Ładowanie...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 10px' }}>
            
            {/* --- WIDOK PACJENTA: LISTA LEKARZY (Gdy nie wybrano lekarza) --- */}
            {role === 'patient' && !selectedDoctorId && (
                <div>
                    {/* FILTRY */}
                    <div style={styles.filterContainer}>
                        <button 
                            onClick={() => handleFilterChange('Wszystkie')}
                            style={selectedSpec === 'Wszystkie' ? styles.filterBtnActive : styles.filterBtn}
                        >
                            Wszystkie
                        </button>
                        {SPECIALIZATIONS.map(spec => (
                            <button 
                                key={spec}
                                onClick={() => handleFilterChange(spec)}
                                style={selectedSpec === spec ? styles.filterBtnActive : styles.filterBtn}
                            >
                                {spec}
                            </button>
                        ))}
                    </div>

                    {/* KAFELKI Z LEKARZAMI */}
                    <div style={styles.grid}>
                        {filteredDoctors.map(doctor => (
                            <div key={doctor.id} style={styles.card}>
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '1.2rem' }}>
                                        {doctor.name}
                                    </h3>
                                    
                                    <div style={styles.badge}>
                                        {doctor.specialization || "Lekarz Ogólny"}
                                    </div>
                                    
                                    <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginTop: '15px' }}>
                                        Dostępny w systemie online.
                                    </p>
                                </div>
                                
                                <div style={styles.cardFooter}>
                                    <button 
                                        onClick={() => handleDoctorSelect(doctor)}
                                        style={styles.cardButton}
                                    >
                                        Sprawdź Terminy →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- WIDOK KALENDARZA --- */}
            {selectedDoctorId && (
                <div>
                    <div style={styles.calendarHeader}>
                        {role === 'patient' && (
                            <button onClick={handleBackToList} style={styles.backButton}>
                                ← Lista Lekarzy
                            </button>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button onClick={() => changeWeek(-1)} style={styles.navButton}>&lt;</button>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' }}>
                                {currentDate.toLocaleDateString()}
                            </span>
                            <button onClick={() => changeWeek(1)} style={styles.navButton}>&gt;</button>
                        </div>

                        {role === 'patient' && (
                            <div style={{ color: '#7f8c8d', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                Grafik: <span style={styles.doctorNameLabel}>{selectedDoctorName}</span>
                            </div>
                        )}
                    </div>

                    <div style={styles.calendarWrapper}>
                        <CalendarView 
                            slots={slots}
                            absences={absences}
                            onSlotClick={handleSlotClick} 
                            currentDate={currentDate}
                            myId={myId}
                            role={role}
                        />
                    </div>
                </div>
            )}

            {/* --- PANEL LEKARZA --- */}
            {role === 'doctor' && (
                <div style={{ marginTop: '30px' }}>
                    <DoctorPanel />
                </div>
            )}

            {/* --- MODAL --- */}
            {selectedSlotForBooking && (
                <ReservationModal 
                    slot={selectedSlotForBooking}
                    onClose={() => setSelectedSlotForBooking(null)}
                    onConfirm={handleConfirmBooking}
                />
            )}
        </div>
    );
};

// ... Styles (bez zmian, obiekt JS działa w TS) ...
const styles: Record<string, React.CSSProperties> = {
    filterContainer: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '30px'
    },
    filterBtn: {
        padding: '8px 16px',
        borderRadius: '20px',
        border: 'none',
        cursor: 'pointer',
        background: '#ecf0f1',
        color: '#2c3e50',
        fontWeight: 'bold',
        transition: 'all 0.3s'
    },
    filterBtnActive: {
        padding: '8px 16px',
        borderRadius: '20px',
        border: 'none',
        cursor: 'pointer',
        background: '#2c3e50',
        color: 'white',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(44, 62, 80, 0.3)',
        transform: 'scale(1.05)'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        border: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s'
    },
    badge: {
        display: 'inline-block',
        background: '#e1f5fe', 
        color: '#0288d1',       
        padding: '5px 12px',
        borderRadius: '15px',
        fontSize: '0.85rem',
        fontWeight: 'bold'
    },
    cardFooter: {
        background: '#f8f9fa',
        padding: '15px',
        borderTop: '1px solid #eee',
        textAlign: 'center'
    },
    cardButton: {
        background: 'transparent',
        border: 'none',
        color: '#3498db',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
        padding: '5px'
    },
    calendarHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        background: 'white',
        padding: '15px 25px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        border: '1px solid #eee'
    },
    navButton: {
        background: '#f1f2f6',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: '1.1rem'
    },
    backButton: {
        background: 'transparent',
        border: '1px solid #bdc3c7',
        color: '#7f8c8d',
        padding: '8px 15px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500'
    },
    doctorNameLabel: {
        background: '#e1f5fe',
        color: '#0288d1',
        padding: '4px 10px',
        borderRadius: '4px',
        fontWeight: 'bold',
        fontSize: '0.9rem'
    },
    calendarWrapper: {
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
        border: '1px solid #eee'
    }
};

export default Dashboard;