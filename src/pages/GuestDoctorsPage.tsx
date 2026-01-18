import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import type { Doctor } from '../types';

import DoctorFilterBar from '../components/common/DoctorFilterBar';
import PublicDoctorCard from '../components/common/PublicDoctorCard';

const GuestDoctorsPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedSpec, setSelectedSpec] = useState<string>('Wszystkie');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Pobieranie danych (tylko raz)
    useEffect(() => {
        const loadDoctors = async () => {
            try {
                const data = await api.getDoctors();
                setDoctors(data);
            } catch (err: unknown) {
                console.error(err);
                setError("Nie udało się pobrać listy lekarzy.");
            } finally {
                setLoading(false);
            }
        };
        loadDoctors();
    }, []);

    // 2. Filtrowanie "w locie" (zamiast trzymania filteredDoctors w stanie)
    // To zapobiega błędom synchronizacji i podwójnym renderom.
    const filteredDoctors = useMemo(() => {
        if (selectedSpec === 'Wszystkie') return doctors;
        return doctors.filter(doc => doc.specialization === selectedSpec);
    }, [doctors, selectedSpec]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Ładowanie...</div>;
    if (error) return <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}>{error}</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: '#2c3e50' }}>Nasi Specjaliści</h1>
            </div>

            {/* SEKCJA FILTRÓW */}
            <DoctorFilterBar 
                selectedSpec={selectedSpec} 
                onSelectSpec={setSelectedSpec} 
            />

            {/* LISTA LEKARZY */}
            {filteredDoctors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                    Brak lekarzy o tej specjalizacji.
                </div>
            ) : (
                <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' 
                }}>
                    {filteredDoctors.map(doctor => (
                        <PublicDoctorCard 
                            key={doctor.id} 
                            doctor={doctor} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default GuestDoctorsPage;