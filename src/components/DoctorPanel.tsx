import React, { useEffect, useState } from 'react';
import { api, socket } from '../services/api'; 
import type { Slot, Rating, CyclicalScheduleData, AvailabilityData, Absence } from '../types';

// Typy lokalne dla formularzy
interface SingleScheduleData {
    date: string;
    startTime: string;
    endTime: string;
}

const DoctorPanel: React.FC = () => {
    const [visits, setVisits] = useState<Slot[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const doctorId = localStorage.getItem('userId');
    const [absenceData, setAbsenceData] = useState<Absence>({ date: '', reason: '' });
    
    // ZAKŁADKI: 'cyclical' lub 'single'
    const [mode, setMode] = useState<'cyclical' | 'single'>('cyclical'); 

    // Stan formularza CYKLICZNEGO
    const [cyclicalData, setCyclicalData] = useState<CyclicalScheduleData>({
        startDate: '',
        endDate: '',
        weekDays: [],
        timeRanges: [{ start: '08:00', end: '16:00' }]
    });

    // Stan formularza JEDNORAZOWEGO
    const [singleData, setSingleData] = useState<SingleScheduleData>({
        date: '',
        startTime: '08:00',
        endTime: '16:00'
    });

    // Pobieranie danych
    const fetchData = () => {
        if (!doctorId) return;
        api.getDoctorAppointments().then(setVisits).catch(console.error);
        api.getDoctorRatings(doctorId).then(setRatings).catch(console.error);
    };

    useEffect(() => {
        fetchData();
        socket.on('schedule_update', fetchData);
        return () => {
            socket.off('schedule_update', fetchData);
        };
    }, [doctorId]);


    // --- LOGIKA FORMULARZY ---

    const handleCyclicalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cyclicalData.weekDays.length === 0) return alert("Wybierz dni tygodnia!");
        try {
            const res: { message: string } = await api.generateCyclicalSchedule(cyclicalData);
            alert(res.message || "Grafik wygenerowany");
        } catch (err: unknown) { 
            const error = err as Error;
            alert(error.message); 
        }
    };

    const handleSingleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Rzutowanie na AvailabilityData (pasuje strukturą)
            await api.addAvailability(singleData as AvailabilityData);
            alert("Dodano dostępność jednorazową!");
        } catch (err: unknown) { 
            const error = err as Error;
            alert(error.message); 
        }
    };

    // Pomocnicze funkcje UI
    const toggleDay = (day: number) => {
        setCyclicalData(prev => ({
            ...prev,
            weekDays: prev.weekDays.includes(day) 
                ? prev.weekDays.filter(d => d !== day) 
                : [...prev.weekDays, day]
        }));
    };
    
    const daysMap = [
        { label: 'Nd', val: 0 }, { label: 'Pn', val: 1 }, { label: 'Wt', val: 2 },
        { label: 'Śr', val: 3 }, { label: 'Cz', val: 4 }, { label: 'Pt', val: 5 }, { label: 'Sb', val: 6 }
    ];

    // Dodawanie nieobecności
    const handleAddAbsence = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!window.confirm("UWAGA: To odwoła wszystkie wizyty w tym dniu. Kontynuować?")) return;
        try {
            const res: { message: string } = await api.addAbsence(absenceData);
            alert(res.message || "Dodano nieobecność");
            setAbsenceData({ date: '', reason: '' });
        } catch (err: unknown) {
            const error = err as Error;
            alert(error.message);
        }
    };

    return (
        <div style={{ marginTop: '40px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
            
            {/* --- SEKCJA GENERATORA (ZAKŁADKI) --- */}
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                
                {/* PRZYCISKI ZAKŁADEK */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                    <button 
                        onClick={() => setMode('cyclical')}
                        style={{ padding: '8px 16px', cursor: 'pointer', border: 'none', background: mode === 'cyclical' ? '#0d6efd' : '#e9ecef', color: mode === 'cyclical' ? 'white' : 'black', borderRadius: '4px' }}
                    >
                        Cykliczne (Wiele dni)
                    </button>
                    <button 
                        onClick={() => setMode('single')}
                        style={{ padding: '8px 16px', cursor: 'pointer', border: 'none', background: mode === 'single' ? '#0d6efd' : '#e9ecef', color: mode === 'single' ? 'white' : 'black', borderRadius: '4px' }}
                    >
                        Jednorazowe (Jeden dzień)
                    </button>
                </div>

                {/* --- FORMULARZ CYKLICZNY --- */}
                {mode === 'cyclical' && (
                    <form onSubmit={handleCyclicalSubmit}>
                        <h4 style={{marginTop:0}}>Ustaw grafik na dłuższy okres</h4>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                            <div><label>Od:</label><br/><input type="date" required value={cyclicalData.startDate} onChange={e => setCyclicalData({...cyclicalData, startDate: e.target.value})} /></div>
                            <div><label>Do:</label><br/><input type="date" required value={cyclicalData.endDate} onChange={e => setCyclicalData({...cyclicalData, endDate: e.target.value})} /></div>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Dni tygodnia:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {daysMap.map(d => (
                                    <label key={d.val} style={{cursor:'pointer'}}><input type="checkbox" checked={cyclicalData.weekDays.includes(d.val)} onChange={() => toggleDay(d.val)} /> {d.label}</label>
                                ))}
                            </div>
                        </div>
                        {/* Uproszczone godziny dla przykładu (jeden zakres) */}
                        <div style={{ marginBottom: '15px' }}>
                            <label>Godziny:</label><br/>
                            <input type="time" value={cyclicalData.timeRanges[0].start} onChange={e => {const n=[...cyclicalData.timeRanges]; n[0].start=e.target.value; setCyclicalData({...cyclicalData, timeRanges:n})}} />
                            -
                            <input type="time" value={cyclicalData.timeRanges[0].end} onChange={e => {const n=[...cyclicalData.timeRanges]; n[0].end=e.target.value; setCyclicalData({...cyclicalData, timeRanges:n})}} />
                        </div>
                        <button type="submit" style={{ padding: '8px 20px', background: '#198754', color: 'white', border: 'none', borderRadius: '4px' }}>Generuj Cyklicznie</button>
                    </form>
                )}

                {/* --- FORMULARZ JEDNORAZOWY --- */}
                {mode === 'single' && (
                    <form onSubmit={handleSingleSubmit}>
                        <h4 style={{marginTop:0}}>Dodaj dostępność w konkretnym dniu</h4>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Data:</label><br/>
                            <input type="date" required value={singleData.date} onChange={e => setSingleData({...singleData, date: e.target.value})} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Godziny (Od - Do):</label><br/>
                            <input type="time" value={singleData.startTime} onChange={e => setSingleData({...singleData, startTime: e.target.value})} />
                            -
                            <input type="time" value={singleData.endTime} onChange={e => setSingleData({...singleData, endTime: e.target.value})} />
                        </div>
                        <button type="submit" style={{ padding: '8px 20px', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '4px' }}>Dodaj Jednorazowo</button>
                    </form>
                )}
            </div>

            {/* --- SEKCJA 2: ZGŁOŚ NIEOBECNOŚĆ (NOWE) --- */}
            <div style={{ marginBottom: '30px', padding: '20px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0, color: '#c53030' }}>Zgłoś Nieobecność (L4 / Urlop)</h3>
                <p style={{ fontSize: '0.9em', color: '#742a2a' }}>Uwaga: Dodanie nieobecności automatycznie <strong>ODWOŁA</strong> wszystkie wizyty zaplanowane na ten dzień.</p>
                
                <form onSubmit={handleAddAbsence} style={{ display: 'flex', gap: '15px', alignItems: 'end' }}>
                    <div>
                        <label>Data nieobecności:</label><br/>
                        <input 
                            type="date" 
                            required 
                            value={absenceData.date}
                            onChange={e => setAbsenceData({...absenceData, date: e.target.value})}
                            style={{ padding: '8px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label>Powód (opcjonalnie):</label><br/>
                        <input 
                            type="text" 
                            placeholder="np. Choroba, Urlop"
                            value={absenceData.reason}
                            onChange={e => setAbsenceData({...absenceData, reason: e.target.value})}
                            style={{ padding: '8px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '9px 20px', background: '#c53030', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Zgłoś Absencję
                    </button>
                </form>
            </div>

            {/* --- LISTA WIZYT (Bez zmian) --- */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div>
                    <h3>Nadchodzący Pacjenci (Live)</h3>
                    {visits.length === 0 ? <p>Brak wizyt.</p> : <ul>{visits.map(v => <li key={v.id}>{v.date} {v.time} - <strong>{v.Patient?.username || 'Nieznany'}</strong></li>)}</ul>}
                </div>
                <div>
                    <h3>Opinie ({ratings.length})</h3>
                    {ratings.length === 0 ? <p>Brak opinii.</p> : ratings.map(r => <li key={r.id}>"{r.comment}" ({r.stars}/5)</li>)}
                </div>
            </div>
        </div>
    );
};

export default DoctorPanel;