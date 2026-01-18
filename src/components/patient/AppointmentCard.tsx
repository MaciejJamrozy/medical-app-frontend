import React from 'react';
import type { Slot } from '../../types';

interface AppointmentCardProps {
    app: Slot;
    isHistory: boolean;
    isBanned: boolean;
    alreadyRated: boolean;
    onRate: (doctorId: number) => void;
    onCancel: (slotId: number) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
    app, isHistory, isBanned, alreadyRated, onRate, onCancel 
}) => {
    const docId = Number(app.doctorId);

    return (
        <div style={{
            ...styles.card,
            borderLeft: app.status === 'booked' 
                ? (isHistory ? '5px solid #95a5a6' : '5px solid #27ae60') 
                : '5px solid #e74c3c',
            opacity: app.status === 'cancelled' ? 0.7 : 1,
            background: isHistory ? '#fafafa' : 'white'
        }}>
            {/* DATA */}
            <div style={styles.dateBox}>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isHistory ? '#7f8c8d' : '#2c3e50' }}>
                    {app.time}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    {app.date}
                </div>
            </div>

            {/* INFO O LEKARZU */}
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

            {/* AKCJE I STATUSY */}
            <div style={styles.actionBox}>
                {app.status === 'booked' ? (
                    <>
                        <div style={isHistory ? styles.badgeHistory : styles.badgeSuccess}>
                            {isHistory ? "✓ ODBYTA" : "NADCHODZĄCA"}
                        </div>
                        
                        <div style={styles.buttonsRow}>
                            {isHistory && !isBanned && !alreadyRated && (
                                <button onClick={() => onRate(docId)} style={styles.btnRate}>
                                    Oceń
                                </button>
                            )}
                            
                            {isHistory && alreadyRated && (
                                <span style={{ fontSize: '0.8rem', color: '#f1c40f', fontWeight: 'bold' }}>
                                    ★ Oceniono
                                </span>
                            )}

                            {!isHistory && (
                                <button onClick={() => onCancel(app.id)} style={styles.btnAbort}>
                                    Odwołaj
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={styles.badgeError}>ODWOŁANA</div>
                )}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
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

export default AppointmentCard;