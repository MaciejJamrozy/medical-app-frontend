import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { SPECIALIZATIONS } from '../utils/specializations';
import type { Doctor } from '../types';

const GuestDoctorsPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [selectedSpec, setSelectedSpec] = useState<string>('Wszystkie');
    
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDoctors = async () => {
            try {
                const data = await api.getDoctors();
                setDoctors(data);
                setFilteredDoctors(data);
            } catch (err: unknown) {
                console.error(err);
                setError("Nie udało się pobrać listy lekarzy.");
            } finally {
                setLoading(false);
            }
        };
        loadDoctors();
    }, []);

    const handleFilterChange = (spec: string) => {
        setSelectedSpec(spec);
        if (spec === 'Wszystkie') {
            setFilteredDoctors(doctors);
        } else {
            const filtered = doctors.filter(doc => doc.specialization === spec);
            setFilteredDoctors(filtered);
        }
    };

    // Funkcja pomocnicza do wyświetlania gwiazdek
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

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Ładowanie...</div>;
    if (error) return <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}>{error}</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: '#2c3e50' }}>Nasi Specjaliści</h1>
                <p style={{ fontSize: '1.1rem', color: '#7f8c8d' }}>
                    Wybierz lekarza odpowiedniego dla swoich potrzeb.
                </p>
            </div>

            {/* --- SEKCJA FILTRÓW --- */}
            <div style={{ 
                marginBottom: '30px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' 
            }}>
                <button 
                    onClick={() => handleFilterChange('Wszystkie')}
                    style={{
                        padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                        background: selectedSpec === 'Wszystkie' ? '#2c3e50' : '#ecf0f1',
                        color: selectedSpec === 'Wszystkie' ? 'white' : '#2c3e50',
                        fontWeight: 'bold', transition: 'all 0.3s'
                    }}
                >
                    Wszystkie
                </button>

                {SPECIALIZATIONS.map(spec => (
                    <button 
                        key={spec}
                        onClick={() => handleFilterChange(spec)}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            background: selectedSpec === spec ? '#3498db' : '#ecf0f1',
                            color: selectedSpec === spec ? 'white' : '#2c3e50',
                            fontWeight: 'bold', transition: 'all 0.3s'
                        }}
                    >
                        {spec}
                    </button>
                ))}
            </div>

            {/* --- LISTA LEKARZY --- */}
            {filteredDoctors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                    Brak lekarzy o tej specjalizacji.
                </div>
            ) : (
                <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' 
                }}>
                    {filteredDoctors.map(doctor => (
                        <div key={doctor.id} style={{ 
                            background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            overflow: 'hidden', border: '1px solid #eee', display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ padding: '20px', flex: 1 }}>
                                {/* Górna sekcja: Imię i Gwiazdki */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0, color: '#2c3e50' }}>{doctor.name}</h3>
                                    
                                    {/* NOWE: Wyświetlanie oceny */}
                                    <div style={{ marginTop: '2px' }}>
                                        {renderStars(doctor.averageRating || 0, doctor.ratingCount || 0)}
                                    </div>
                                </div>

                                <div style={{ 
                                    display: 'inline-block', background: '#e1f5fe', color: '#0288d1', 
                                    padding: '5px 10px', borderRadius: '15px', fontSize: '0.9rem', marginBottom: '15px'
                                }}>
                                    {doctor.specialization || "Brak specjalizacji"}
                                </div>
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                    Specjalista dostępny w systemie online.
                                </p>
                            </div>
                            
                            <div style={{ 
                                background: '#f8f9fa', padding: '15px', borderTop: '1px solid #eee', textAlign: 'center'
                            }}>
                                <Link to="/login" style={{ 
                                    textDecoration: 'none', color: '#3498db', fontWeight: 'bold' 
                                }}>
                                    Zaloguj się, aby umówić →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GuestDoctorsPage;