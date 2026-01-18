import React from 'react';
import { Link } from 'react-router-dom';
import type { Doctor } from '../../types';

interface PublicDoctorCardProps {
    doctor: Doctor;
}

const PublicDoctorCard: React.FC<PublicDoctorCardProps> = ({ doctor }) => {
    
    // Helper wewnątrz komponentu karty
    const renderStars = (rating: number, count: number) => {
        if (!count || count === 0) {
            return <span style={{ color: '#bdc3c7', fontSize: '0.9rem' }}>Brak opinii</span>;
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: '#f1c40f', fontSize: '1.1rem' }}>★</span>
                <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{rating}</span>
                <span style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>({count} opinii)</span>
            </div>
        );
    };

    return (
        <div style={styles.card}>
            <div style={{ padding: '20px', flex: 1 }}>
                {/* Górna sekcja: Imię i Gwiazdki */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, color: '#2c3e50' }}>{doctor.name}</h3>
                    <div style={{ marginTop: '2px' }}>
                        {renderStars(doctor.averageRating || 0, doctor.ratingCount || 0)}
                    </div>
                </div>

                <div style={styles.badge}>
                    {doctor.specialization || "Brak specjalizacji"}
                </div>
            </div>
            
            <div style={styles.footer}>
                <Link to="/login" style={styles.link}>
                    Zaloguj się, aby umówić →
                </Link>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    card: { 
        background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden', border: '1px solid #eee', display: 'flex', flexDirection: 'column'
    },
    badge: { 
        display: 'inline-block', background: '#e1f5fe', color: '#0288d1', 
        padding: '5px 10px', borderRadius: '15px', fontSize: '0.9rem', marginBottom: '15px'
    },
    footer: { 
        background: '#f8f9fa', padding: '15px', borderTop: '1px solid #eee', textAlign: 'center'
    },
    link: { 
        textDecoration: 'none', color: '#3498db', fontWeight: 'bold' 
    }
};

export default PublicDoctorCard;