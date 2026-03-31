import React from 'react';
import type { Slot } from '../../types';
import AppointmentCard from './AppointmentCard';

interface AppointmentsListProps {
    title: string;
    appointments: Slot[];
    isHistory: boolean;
    isBanned: boolean;
    ratedDoctors: Set<number>;
    onRate: (doctorId: number) => void;
    onCancel: (slotId: number) => void;
    headerColor: string;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ 
    title, appointments, isHistory, isBanned, ratedDoctors, onRate, onCancel, headerColor 
}) => {
    return (
        <div style={{ marginTop: isHistory ? '50px' : '30px' }}>
            <h3 style={{ color: headerColor, borderBottom: `2px solid ${headerColor}`, paddingBottom: '10px' }}>
                {title}
            </h3>
            
            {appointments.length === 0 ? (
                <p style={{ color: '#7f8c8d' }}>
                    {isHistory ? 'Brak historii wizyt.' : 'Brak zaplanowanych wizyt na przyszłość.'}
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {appointments.map(app => (
                        <AppointmentCard 
                            key={app.id} 
                            app={app} 
                            isHistory={isHistory}
                            isBanned={isBanned}
                            alreadyRated={ratedDoctors.has(Number(app.doctorId))}
                            onRate={onRate}
                            onCancel={onCancel}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppointmentsList;