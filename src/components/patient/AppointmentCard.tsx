import React from 'react';
import type { Slot } from '../../types';
import './AppointmentCard.css';

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

    // Dynamiczny kolor paska po lewej stronie
    const getBorderColor = () => {
        if (app.status === 'cancelled') return '#e74c3c'; // Czerwony
        if (isHistory) return '#95a5a6'; // Szary
        return '#27ae60'; // Zielony
    };

    return (
        <div 
            className="appointment-card"
            style={{
                borderLeftColor: getBorderColor(),
                opacity: app.status === 'cancelled' ? 0.7 : 1,
                background: isHistory ? '#fafafa' : 'white'
            }}
        >
            {/* DATA */}
            <div className="app-date-box">
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isHistory ? '#7f8c8d' : '#2c3e50' }}>
                    {app.time}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    {app.date}
                </div>
            </div>

            {/* INFO O LEKARZU */}
            <div className="app-info-box">
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
            <div className="app-actions">
                {app.status === 'booked' ? (
                    <>
                        <div className={isHistory ? "badge-history" : "badge-success"}>
                            {isHistory ? "✓ ODBYTA" : "NADCHODZĄCA"}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                            {isHistory && !isBanned && !alreadyRated && (
                                <button onClick={() => onRate(docId)} className="btn-rate">
                                    Oceń
                                </button>
                            )}
                            
                            {isHistory && alreadyRated && (
                                <span style={{ fontSize: '0.8rem', color: '#f1c40f', fontWeight: 'bold' }}>
                                    ★ Oceniono
                                </span>
                            )}

                            {!isHistory && (
                                <button onClick={() => onCancel(app.id)} className="btn-abort">
                                    Odwołaj
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="badge-error">ODWOŁANA</div>
                )}
            </div>
        </div>
    );
};

export default AppointmentCard;