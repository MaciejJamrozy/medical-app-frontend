import React, { useEffect, useState } from 'react';
import { api, socket } from '../services/api'; 
import DoctorPanel from '../components/doctor/DoctorPanel'; 
import ReservationModal from '../components/patient/ReservationModal';
import DoctorSchedule from '../components/doctor/DoctorSchedule';
import { useAuth } from '../context/AuthContext';
import type { Doctor, Slot, Absence, ReservationFormData } from '../types';

// Import nowych komponentów
import PatientDoctorList from '../components/patient/PatientDoctorList';
import PatientSchedule from '../components/patient/PatientSchedule';

const Dashboard: React.FC = () => {
    const { user } = useAuth(); 
    const role = user ? user.role : null;
    const myId = localStorage.getItem('userId'); 

    // --- STAN DANYCH ---
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    
    // Stan wyboru lekarza
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | string | null>(() => {
        if (user?.role === 'doctor') return localStorage.getItem('userId');
        return null;
    });

    // Stan kalendarza
    const [slots, setSlots] = useState<Slot[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    
    // Modal
    const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<Slot | null>(null);

    // --- EFEKTY (POBIERANIE DANYCH) ---
    useEffect(() => {
        if (role === 'patient') {
            api.getDoctors().then(setDoctors).catch(console.error);
        }
    }, [role]);

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

    // --- HANDLERY ---
    const changeWeek = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
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

    // Pomocnik do znalezienia obiektu wybranego lekarza
    const selectedDoctor = doctors.find(d => d.id == selectedDoctorId);

    if (!user) return <div style={{padding: 20}}>Ładowanie...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 10px' }}>
            
            {/* WIDOK 1: Lista Lekarzy (tylko dla pacjenta, gdy nikt nie wybrany) */}
            {role === 'patient' && !selectedDoctorId && (
                <PatientDoctorList 
                    doctors={doctors}
                    onSelectDoctor={(doc) => setSelectedDoctorId(doc.id)}
                />
            )}

            {/* WIDOK 2: Harmonogram Lekarza (dla pacjenta) */}
            {role === 'patient' && selectedDoctorId && selectedDoctor && (
                <PatientSchedule 
                    doctor={selectedDoctor}
                    slots={slots}
                    absences={absences}
                    currentDate={currentDate}
                    onChangeWeek={changeWeek}
                    onBackToList={() => {
                        setSelectedDoctorId(null);
                        setSlots([]);
                    }}
                    onSlotClick={setSelectedSlotForBooking}
                    myId={myId}
                    role={role}
                />
            )}

            {/* WIDOK 3: Panel dla Lekarza */}
            {role === 'doctor' && (
                <div style={{ marginTop: '30px' }}>
                    <DoctorSchedule 
                        slots={slots}
                        absences={absences}
                        currentDate={currentDate}
                        onChangeWeek={changeWeek}
                        myId={myId}
                    />
                    <DoctorPanel />
                </div>
            )}

            {/* MODAL REZERWACJI */}
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

export default Dashboard;