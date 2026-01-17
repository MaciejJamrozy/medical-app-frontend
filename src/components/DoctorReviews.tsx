import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Rating } from '../types';

interface DoctorReviewsProps {
    doctorId: number | string;
}

const DoctorReviews: React.FC<DoctorReviewsProps> = ({ doctorId }) => {
    const [reviews, setReviews] = useState<Rating[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadReviews = async () => {
            try {
                setLoading(true);
                const data = await api.getDoctorRatings(doctorId);
                setReviews(data);
            } catch (error) {
                console.error("Błąd pobierania opinii:", error);
            } finally {
                setLoading(false);
            }
        };

        loadReviews();
    }, [doctorId]);

    // Funkcja pomocnicza do gwiazdek (mniejsza wersja)
    const renderStars = (stars: number) => {
        return (
            <span style={{ color: '#f1c40f', fontSize: '1rem', letterSpacing: '2px' }}>
                {'★'.repeat(stars)}
                <span style={{ color: '#bdc3c7' }}>{'★'.repeat(5 - stars)}</span>
            </span>
        );
    };

    if (loading) return <div style={{ padding: '20px', color: '#7f8c8d' }}>Ładowanie opinii...</div>;

    if (reviews.length === 0) {
        return (
            <div style={styles.container}>
                <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>Ten lekarz nie ma jeszcze opinii tekstowych.</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#2c3e50' }}>
                Opinie pacjentów ({reviews.length})
            </h3>
            
            <div style={styles.list}>
                {reviews.map((review) => (
                    <div key={review.id} style={styles.reviewItem}>
                        <div style={styles.reviewHeader}>
                            <div>{renderStars(review.stars)}</div>
                        </div>
                        
                        <p style={styles.comment}>
                            "{review.comment}"
                        </p>
                        
                        <div style={styles.date}>
                            Dodano: {new Date(review.createdAt || '').toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #e1e8ed'
    },
    list: {
        maxHeight: '400px',
        overflowY: 'auto',
        paddingRight: '10px'
    },
    reviewItem: {
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: '1px solid #eee'
    },
    reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    comment: {
        color: '#555',
        lineHeight: '1.5',
        fontSize: '0.95rem',
        fontStyle: 'italic',
        margin: '0 0 10px 0'
    },
    date: {
        fontSize: '0.8rem',
        color: '#95a5a6',
        textAlign: 'right'
    }
};

export default DoctorReviews;