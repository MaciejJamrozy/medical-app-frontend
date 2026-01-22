import React, { useState, useEffect } from 'react';
import type { Slot, Absence, UserRole } from '../../types';

const HOURS: string[] = [];
for (let h = 6; h < 22; h++) {
    HOURS.push(`${String(h).padStart(2, '0')}:00`);
    HOURS.push(`${String(h).padStart(2, '0')}:30`);
}

const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface DayInfo {
    dateStr: string;
    label: string;
    isToday: boolean;
}

const getDaysOfWeek = (currentDate: Date): DayInfo[] => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay() || 7; 
    startOfWeek.setDate(startOfWeek.getDate() - day + 1);
    
    const days: DayInfo[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push({
            dateStr: formatDateLocal(d),
            label: d.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'numeric' }),
            isToday: formatDateLocal(d) === formatDateLocal(new Date())
        });
    }
    return days;
};

const getSlotTimeRange = (startTime: string): string => {
    const [h, m] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + 30);
    const endH = String(date.getHours()).padStart(2, '0');
    const endM = String(date.getMinutes()).padStart(2, '0');
    return `${startTime}-${endH}:${endM}`;
};

const VISIT_COLORS: Record<string, string> = {
    'Pierwsza wizyta': '#3182ce',
    'Wizyta kontrolna': '#38a169',
    'Choroba przewlekła': '#dd6b20',
    'Recepta': '#805ad5',
    'default': '#718096'
};

interface CalendarViewProps {
    slots: Slot[];
    absences: Absence[];
    onSlotClick: (slot: Slot) => void;
    currentDate: Date;
    role: UserRole | null;
    myId: string | null;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
    slots = [], 
    absences = [], 
    onSlotClick, 
    currentDate, 
    role, 
    myId 
}) => {
    const targetDate = currentDate || new Date();
    const days = getDaysOfWeek(targetDate);
    
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const [hoveredSlot, setHoveredSlot] = useState<Slot | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const findSlot = (date: string, time: string) => slots.find(s => s.date === date && s.time === time);
    const isAbsent = (dateStr: string) => absences.find(a => a.date === dateStr);

    const isPast = (dateStr: string, timeStr: string) => {
        const slotStart = new Date(`${dateStr}T${timeStr}`);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60000); 
        return slotEnd < now;
    };

    const isCurrentTimeSlot = (dayDateStr: string, timeStr: string) => {
        const todayStr = formatDateLocal(now);
        if (dayDateStr !== todayStr) return false;
        const [h, m] = timeStr.split(':').map(Number);
        if (currentHour === h) {
            if (m === 0 && currentMinute >= 0 && currentMinute < 30) return true;
            if (m === 30 && currentMinute >= 30 && currentMinute < 60) return true;
        }
        return false;
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, slot: Slot | undefined) => {
        if (role !== 'doctor') return;
        if (!slot || slot.status !== 'booked') return;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ x: rect.right + 10, y: rect.top });
        setHoveredSlot(slot);
    };

    const handleMouseLeave = () => setHoveredSlot(null);

    return (
        <div className="calendar-container" style={{ position: 'relative' }}>
            
            {/* TOOLTIP */}
            {hoveredSlot && (
                <div style={{
                    position: 'fixed', top: tooltipPos.y, left: tooltipPos.x,
                    background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 9999, width: '240px',
                    fontSize: '0.85rem', color: '#2d3748', pointerEvents: 'none', textAlign: 'left'
                }}>
                    <h4 style={{ margin: '0 0 8px 0', color: VISIT_COLORS[hoveredSlot.visitType || 'default'] || '#333', borderBottom: '1px solid #edf2f7', paddingBottom: '5px' }}>
                        {hoveredSlot.visitType || 'Wizyta'}
                    </h4>
                    <div style={{ marginBottom: '4px' }}><strong>Pacjent:</strong> {hoveredSlot.patientName}</div>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.8em', color: '#718096', marginBottom: '8px' }}>
                        <span>Wiek: {hoveredSlot.patientAge || '-'}</span>
                        <span>Płeć: {hoveredSlot.patientGender || '-'}</span>
                    </div>
                    {hoveredSlot.patientNotes && (
                        <div style={{ background: '#f7fafc', padding: '8px', borderRadius: '6px', fontStyle: 'italic', fontSize: '0.8em', border: '1px solid #edf2f7' }}>
                            "{hoveredSlot.patientNotes}"
                        </div>
                    )}
                </div>
            )}

            {/* NAGŁÓWKI */}
            <div className="calendar-grid-header">
                <div className="header-cell">Godz</div>
                {days.map(day => {
                    const absence = isAbsent(day.dateStr);
                    const bookedCount = slots.filter(s => s.date === day.dateStr && s.status === 'booked').length;

                    const headerStyle: React.CSSProperties = {
                        fontWeight: 'bold',
                        background: absence ? '#ffebee' : (day.isToday ? '#e6fffa' : 'transparent'),
                        color: absence ? '#d32f2f' : (day.isToday ? '#319795' : 'inherit'),
                        borderBottom: day.isToday ? '3px solid #319795' : '1px solid #ddd',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    };

                    return (
                        <div key={day.dateStr} className="header-cell" style={headerStyle}>
                            <div>{day.label}</div>
                            {day.isToday && <div style={{ fontSize: '0.7em', textTransform: 'uppercase' }}>Dzisiaj</div>}
                            {absence && <div style={{ fontSize: '0.7em' }}>NIEOBECNOŚĆ</div>}
                            {role === 'doctor' && !absence && (
                                <div style={{ fontSize: '0.75em', color: bookedCount > 0 ? '#2f855a' : '#a0aec0', marginTop: '4px', fontWeight: 'normal' }}>
                                    Wizyt: <strong>{bookedCount}</strong>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* SIATKA */}
            <div className="calendar-grid-body">
                {HOURS.map(time => (
                    <React.Fragment key={time}>
                        <div className="time-label">{time}</div>
                        {days.map(day => {
                            const absence = isAbsent(day.dateStr);
                            const slot = findSlot(day.dateStr, time);
                            const past = isPast(day.dateStr, time);
                            const isNow = isCurrentTimeSlot(day.dateStr, time);
                            const timeLabel = getSlotTimeRange(time);

                            let cellBackground = day.isToday ? '#f7fafc' : 'white';
                            if (absence) cellBackground = '#ffebee';

                            const nowMarkerStyle: React.CSSProperties = isNow ? {
                                border: '1px solid #e53e3e',
                                borderRadius: '4px',
                                position: 'relative',
                            } : {};

                            if (absence) return <div key={`${day.dateStr}-${time}`} className="calendar-cell" style={{ background: '#ffebee', cursor: 'not-allowed' }} />;
                            
                            if (slot && slot.status === 'cancelled') {
                                const showCancelled = role === 'doctor' || (String(slot.patientId) === String(myId));
                                if (showCancelled) {
                                    return (
                                        <div key={`${day.dateStr}-${time}`} className="calendar-cell" 
                                            style={{ ...nowMarkerStyle, background: '#fed7d7', color: '#c53030', fontSize: '0.65em', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: past ? 0.6 : 1 }}>
                                            ODWOŁANE
                                        </div>
                                    );
                                }
                            }

                            let slotClass = '';
                            let content: React.ReactNode = '';
                            let style: React.CSSProperties = { background: cellBackground, ...nowMarkerStyle };

                            if (slot) {
                                const isEffectivelyFree = slot.status === 'free' || (slot.status === 'pending' && role === 'doctor');

                                if (isEffectivelyFree) {
                                    if (past) {
                                        style.cursor = 'default';
                                        style.background = cellBackground; 
                                        content = ''; 
                                    } 
                                    else {
                                        slotClass = 'slot-free'; 
                                        content = timeLabel; 
                                        style.background = '#f0fff4'; 
                                        style.fontSize = '0.7em';
                                        style.fontWeight = 'bold';
                                        style.color = '#2f855a';
                                        style.display = 'flex'; style.alignItems = 'center'; style.justifyContent = 'center';

                                        if (role === 'patient') {
                                            // click
                                        } else {
                                            style.cursor = 'default';
                                        }
                                    }
                                } 
                                else if (slot.status === 'booked' || slot.status === 'pending') {
                                    if (role === 'patient') {
                                        slotClass = ''; 
                                        style.background = cellBackground; 
                                        style.cursor = 'default';
                                        content = ''; 
                                    } 
                                    else {
                                        slotClass = 'slot-booked';
                                        if (slot.status === 'booked') {
                                            content = timeLabel;
                                            const color = VISIT_COLORS[slot.visitType || 'default'] || VISIT_COLORS['default'];
                                            style = {
                                                ...style,
                                                background: past ? '#cbd5e0' : color, 
                                                color: past ? '#4a5568' : 'white',
                                                fontSize: '0.75em',
                                                fontWeight: 'bold',
                                                cursor: 'help',
                                                pointerEvents: 'auto',
                                                border: 'none',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                            };
                                        }
                                    }
                                }
                            } else {
                                style.background = cellBackground;
                            }

                            return (
                                <div 
                                    key={`${day.dateStr}-${time}`} 
                                    className={`calendar-cell ${slotClass}`}
                                    style={style}
                                    onMouseEnter={(e) => handleMouseEnter(e, slot)}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={() => {
                                        if (role === 'patient' && !past && slot && slot.status === 'free') {
                                            onSlotClick(slot);
                                        }
                                    }}
                                >
                                    {isNow && <div style={{ 
                                        position: 'absolute', top: -9, left: 0, right: 0, 
                                        textAlign: 'center', color: '#e53e3e', fontSize: '0.6em', fontWeight: 'bold', 
                                        background: 'rgba(255,255,255,0)'
                                    }}>TERAZ</div>}
                                    
                                    {content}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

             {/* LEGENDA */}
             {role === 'doctor' && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#f7fafc', borderRadius: '5px', fontSize: '0.85em' }}>
                    <strong>Legenda:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '5px' }}>
                        {Object.keys(VISIT_COLORS).map(type => (
                            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '12px', height: '12px', background: VISIT_COLORS[type], borderRadius: '2px' }}></div>
                                {type === 'default' ? 'Inne' : type}
                            </div>
                        ))}
                         <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#f0fff4', border: '1px solid #38a169', borderRadius: '2px' }}></div>
                            Wolny
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;