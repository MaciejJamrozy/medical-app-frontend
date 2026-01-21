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
            <div className="calendar-header">
                <button onClick={onBackToList} className="back-btn">← Lista Lekarzy</button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => onChangeWeek(-1)} className="nav-btn">&lt;</button>
                    <span className="current-date-label">
                        {currentDate.toLocaleDateString()}
                    </span>
                    <button onClick={() => onChangeWeek(1)} className="nav-btn">&gt;</button>
                </div>

                {/* Sekcja z nazwiskiem lekarza - ukryjemy ją na bardzo małych ekranach lub zawiniemy */}
                <div style={{ color: '#7f8c8d', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span className="doctor-label">Lek. {doctor.name}</span>
                </div>
            </div>

            {/* KALENDARZ */}
            <div className="schedule-wrapper">
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

export default PatientSchedule;