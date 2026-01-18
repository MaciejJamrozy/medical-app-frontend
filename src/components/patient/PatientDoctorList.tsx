import React, { useState, useMemo } from 'react'; // <--- 1. Zmieniamy useEffect na useMemo
import { SPECIALIZATIONS } from '../../utils/specializations';
import type { Doctor } from '../../types';

interface PatientDoctorListProps {
    doctors: Doctor[];
    onSelectDoctor: (doctor: Doctor) => void;
}

const PatientDoctorList: React.FC<PatientDoctorListProps> = ({ doctors, onSelectDoctor }) => {
    const [selectedSpec, setSelectedSpec] = useState<string>('Wszystkie');
    
    // --- 2. ZMIANA: Zamiast useState + useEffect, używamy useMemo ---
    // React zapamięta (zmemoizuje) wynik tej funkcji.
    // Przeliczy go ponownie TYLKO gdy zmieni się 'doctors' lub 'selectedSpec'.
    const filteredDoctors = useMemo(() => {
        if (selectedSpec === 'Wszystkie') {
            return doctors;
        }
        return doctors.filter(doc => doc.specialization === selectedSpec);
    }, [doctors, selectedSpec]);

    const renderStars = (rating: number, count: number) => {
        if (!count || count === 0) return <span style={{ color: '#bdc3c7', fontSize: '0.85rem' }}>Brak opinii</span>;
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#f1c40f', fontSize: '1rem' }}>★</span>
                <span style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '0.9rem' }}>{rating}</span>
                <span style={{ color: '#7f8c8d', fontSize: '0.8rem' }}>({count})</span>
            </div>
        );
    };

    return (
        <div>
            {/* FILTRY */}
            <div style={styles.filterContainer}>
                <button 
                    onClick={() => setSelectedSpec('Wszystkie')}
                    style={selectedSpec === 'Wszystkie' ? styles.filterBtnActive : styles.filterBtn}
                >
                    Wszystkie
                </button>
                {SPECIALIZATIONS.map(spec => (
                    <button 
                        key={spec}
                        onClick={() => setSelectedSpec(spec)}
                        style={selectedSpec === spec ? styles.filterBtnActive : styles.filterBtn}
                    >
                        {spec}
                    </button>
                ))}
            </div>

            {/* GRID LEKARZY */}
            <div style={styles.grid}>
                {/* 3. Używamy zmiennej filteredDoctors tak samo jak wcześniej */}
                {filteredDoctors.map(doctor => (
                    <div key={doctor.id} style={styles.card}>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>{doctor.name}</h3>
                                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                                    {renderStars(doctor.averageRating || 0, doctor.ratingCount || 0)}
                                </div>
                            </div>
                            
                            <div style={styles.badge}>{doctor.specialization || "Lekarz Ogólny"}</div>
                            <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginTop: '15px' }}>
                                Dostępny w systemie online.
                            </p>
                        </div>
                        <div style={styles.cardFooter}>
                            <button onClick={() => onSelectDoctor(doctor)} style={styles.cardButton}>
                                Sprawdź Terminy →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    filterContainer: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' },
    filterBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: '#ecf0f1', color: '#2c3e50', fontWeight: 'bold', transition: 'all 0.3s' },
    filterBtnActive: { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: '#2c3e50', color: 'white', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(44, 62, 80, 0.3)', transform: 'scale(1.05)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #eee', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s' },
    badge: { display: 'inline-block', background: '#e1f5fe', color: '#0288d1', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold' },
    cardFooter: { background: '#f8f9fa', padding: '15px', borderTop: '1px solid #eee', textAlign: 'center' },
    cardButton: { background: 'transparent', border: 'none', color: '#3498db', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', padding: '5px' },
};

export default PatientDoctorList;