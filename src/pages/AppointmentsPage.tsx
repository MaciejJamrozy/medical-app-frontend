import React, { useEffect, useState } from 'react';
import { api, socket } from '../services/api'; 
import type { Slot, Rating } from '../types';
import { AxiosError } from 'axios';

import RatingForm from '../components/patient/RatingForm';
import AppointmentsList from '../components/patient/AppointmentsList';

const AppointmentsPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Slot[]>([]);
    const [ratedDoctors, setRatedDoctors] = useState<Set<number>>(new Set());
    const [ratingDoctorId, setRatingDoctorId] = useState<number | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const isBanned = localStorage.getItem('isBanned') === 'true'; 

    useEffect(() => {
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

        const handleSocketUpdate = () => setRefreshTrigger(prev => prev + 1);
        socket.on('schedule_update', handleSocketUpdate);
        return () => { socket.off('schedule_update', handleSocketUpdate); };
    }, [refreshTrigger]);

    const isPast = (dateStr: string, timeStr: string) => {
        return new Date(`${dateStr}T${timeStr}`) < new Date();
    };

    const upcomingAppointments = appointments
        .filter(app => !isPast(app.date, app.time))
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    const pastAppointments = appointments
        .filter(app => isPast(app.date, app.time))
        .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    const handleRateClick = (doctorId: number) => {
        setRatingDoctorId(doctorId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelClick = async (slotId: number) => {
        if (!window.confirm("Czy na pewno chcesz odwołać tę wizytę?")) return;
        try {
            await api.cancelAppointment(slotId);
            alert("Wizyta odwołana.");
            triggerRefresh();
        } catch (err: unknown) {
            const error = err as Error;
            alert("Błąd: " + error.message);
        }
    };

    const handleSubmitRating = async (stars: number, comment: string) => {
        if (!ratingDoctorId) return;
        try {
            await api.addRating({ doctorId: ratingDoctorId, stars, comment });
            alert("Dziękujemy za opinię!");
            setRatingDoctorId(null);
            triggerRefresh(); 
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            alert(error.response?.data?.message || error.message);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 10px', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>Historia Wizyt</h2>
            </div>
            
            {isBanned && (
                <div style={{ display: 'flex', alignItems: 'center', background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', borderRadius: '8px', padding: '15px', marginBottom: '30px' }}>
                    <div>
                        <strong>Konto ograniczone</strong><br/>
                        Możesz rezerwować wizyty, ale możliwość wystawiania opinii została zablokowana.
                    </div>
                </div>
            )}

            {/* FORMULARZ OCENY */}
            {ratingDoctorId && (
                <RatingForm 
                    onSubmit={handleSubmitRating}
                    onCancel={() => setRatingDoctorId(null)}
                />
            )}

            {/* SEKCJA 1: NADCHODZĄCE */}
            <AppointmentsList 
                title="Przyszłe wizyty"
                appointments={upcomingAppointments}
                isHistory={false}
                isBanned={isBanned}
                ratedDoctors={ratedDoctors}
                onRate={handleRateClick}
                onCancel={handleCancelClick}
                headerColor="#27ae60"
            />

            {/* SEKCJA 2: ARCHIWUM */}
            <AppointmentsList 
                title="Archiwum wizyt"
                appointments={pastAppointments}
                isHistory={true}
                isBanned={isBanned}
                ratedDoctors={ratedDoctors}
                onRate={handleRateClick}
                onCancel={handleCancelClick}
                headerColor="#7f8c8d"
            />
        </div>
    );
};

export default AppointmentsPage;