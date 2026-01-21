import React from 'react';
import CalendarView from '../common/CalendarView';
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
            {/* Używamy klasy calendar-header z index.css dla responsywności */}
            <div className="calendar-header">
                <h3 style={{ margin: 0, color: '#2c3e50' }}>Twój grafik pracy</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => onChangeWeek(-1)} className="nav-btn">&lt;</button>
                    
                    {/* Klasa pomocnicza dla daty (zostanie ukryta na mobile jeśli dodałeś regułę w CSS) */}
                    <span className="current-date-label">
                        {currentDate.toLocaleDateString()}
                    </span>
                    
                    <button onClick={() => onChangeWeek(1)} className="nav-btn">&gt;</button>
                </div>
            </div>

            <div className="schedule-wrapper">
                <CalendarView 
                    slots={slots}
                    absences={absences}
                    onSlotClick={() => {}} 
                    currentDate={currentDate}
                    myId={myId}
                    role="doctor"
                />
            </div>
        </div>
    );
};

export default DoctorSchedule;