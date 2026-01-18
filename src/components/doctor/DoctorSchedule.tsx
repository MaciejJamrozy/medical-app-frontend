import React from 'react';
import CalendarView from '../common/CalendarView'; // Pamiętaj o poprawnej ścieżce po grupowaniu
import type { Slot, Absence } from '../../types';

interface DoctorScheduleProps {
    slots: Slot[];
    absences: Absence[];
    currentDate: Date;
    onChangeWeek: (direction: number) => void;
    myId: string | null;
}

const DoctorSchedule: React.FC<DoctorScheduleProps> = ({ 
    slots, absences, currentDate, onChangeWeek, myId 
}) => {
    return (
        <div style={{ marginTop: '30px' }}>
            <div style={styles.header}>
                <h3 style={{ margin: 0, color: '#2c3e50' }}>Twój grafik pracy</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => onChangeWeek(-1)} style={styles.navButton}>&lt;</button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' }}>
                        {currentDate.toLocaleDateString()}
                    </span>
                    <button onClick={() => onChangeWeek(1)} style={styles.navButton}>&gt;</button>
                </div>
            </div>

            <div style={styles.calendarWrapper}>
                <CalendarView 
                    slots={slots}
                    absences={absences}
                    onSlotClick={() => {}} // Lekarz nie klika w sloty, żeby je rezerwować
                    currentDate={currentDate}
                    myId={myId}
                    role="doctor"
                />
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    header: { 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', 
        background: 'white', padding: '15px 25px', borderRadius: '12px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #eee' 
    },
    navButton: { 
        background: '#f1f2f6', border: 'none', padding: '8px 15px', borderRadius: '6px', 
        cursor: 'pointer', fontWeight: 'bold', color: '#2c3e50', fontSize: '1.1rem' 
    },
    calendarWrapper: { 
        background: 'white', padding: '20px', borderRadius: '12px', 
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' 
    }
};

export default DoctorSchedule;