import React from 'react';
import CalendarView from '../common/CalendarView';
import DoctorReviews from '../common/DoctorReviews';
import type { Doctor, Slot, Absence, UserRole } from '../../types';

interface PatientScheduleProps {
    doctor: Doctor;
    slots: Slot[];
    absences: Absence[];
    currentDate: Date;
    onChangeWeek: (direction: number) => void;
    onBackToList: () => void;
    onSlotClick: (slot: Slot) => void;
    myId: string | null;
    role: UserRole | null;
}

const PatientSchedule: React.FC<PatientScheduleProps> = ({ 
    doctor, slots, absences, currentDate, onChangeWeek, onBackToList, onSlotClick, myId, role 
}) => {

    return (
        <div>
            {/* NAGŁÓWEK KALENDARZA */}
            <div style={styles.calendarHeader}>
                <button onClick={onBackToList} style={styles.backButton}>← Lista Lekarzy</button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => onChangeWeek(-1)} style={styles.navButton}>&lt;</button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' }}>
                        {currentDate.toLocaleDateString()}
                    </span>
                    <button onClick={() => onChangeWeek(1)} style={styles.navButton}>&gt;</button>
                </div>

                <div style={{ color: '#7f8c8d', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Grafik: <span style={styles.doctorNameLabel}>{doctor.name}</span>
                </div>
            </div>

            {/* KALENDARZ */}
            <div style={styles.calendarWrapper}>
                <CalendarView 
                    slots={slots}
                    absences={absences}
                    onSlotClick={onSlotClick} 
                    currentDate={currentDate}
                    myId={myId}
                    role={role}
                />
            </div>

            {/* SEKCJA OPINII */}
            <div style={{ marginTop: '10px', animation: 'fadeIn 0.3s' }}>
                <DoctorReviews doctorId={doctor.id} />
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #eee' },
    navButton: { background: '#f1f2f6', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#2c3e50', fontSize: '1.1rem' },
    backButton: { background: 'transparent', border: '1px solid #bdc3c7', color: '#7f8c8d', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
    doctorNameLabel: { background: '#e1f5fe', color: '#0288d1', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' },
    calendarWrapper: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' }
};

export default PatientSchedule;