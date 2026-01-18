import React, { useState } from 'react';
import type { Rating } from '../../types';

interface AdminRatingsListProps {
    ratings: Rating[];
    onDeleteRating: (id: number) => void;
}

const AdminRatingsList: React.FC<AdminRatingsListProps> = ({ ratings, onDeleteRating }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

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

    return (
        <div style={styles.sectionCard}>
            <div style={styles.headerRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h3 style={{ margin: 0, color: '#2c3e50' }}>Opinie</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        <span style={{fontSize: '0.85rem', color: '#718096'}}>Od:</span>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.dateInput} />
                        <span style={{fontSize: '0.85rem', color: '#718096'}}>Do:</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.dateInput} />
                        {(startDate || endDate) && (
                            <button onClick={() => { setStartDate(''); setEndDate(''); }} style={styles.clearBtn} title="Wyczyść">✕</button>
                        )}
                    </div>
                </div>

                <button onClick={() => setIsExpanded(!isExpanded)} style={styles.toggleBtn}>
                    {isExpanded ? '▼ Zwiń' : '▶ Rozwiń'}
                </button>
            </div>

            {isExpanded && (
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
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{rating.Patient?.name || 'Usunięty'}</td>
                                        <td style={{ padding: '10px' }}>{rating.Doctor?.name || 'Nieznany'}</td>
                                        <td style={{ padding: '10px', color: '#d69e2e', fontWeight: 'bold' }}>{'⭐'.repeat(rating.stars)}</td>
                                        <td style={{ padding: '10px', fontStyle: 'italic', color: '#555' }}>"{rating.comment}"</td>
                                        <td style={{ padding: '10px' }}>
                                            <button onClick={() => rating.id && onDeleteRating(rating.id)} style={styles.btnDelete}>Usuń</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    sectionCard: { background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
    toggleBtn: { background: 'transparent', border: '1px solid #cbd5e0', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', color: '#718096', fontWeight: '600', fontSize: '0.85rem' },
    dateInput: { padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '0.85rem' },
    clearBtn: { background: '#e2e8f0', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', fontSize: '0.8rem', fontWeight: 'bold' },
    btnDelete: { background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', borderRadius: '4px', cursor: 'pointer', padding: '6px 12px', fontSize: '0.85em', transition: 'all 0.2s' }
};

export default AdminRatingsList;