import React, { useState } from 'react';
import { api } from '../../services/api'; // Dostosuj ścieżkę w zależności od struktury folderów
import type { CyclicalScheduleData } from '../../types';

const CyclicalScheduleForm: React.FC = () => {
    const [formData, setFormData] = useState<CyclicalScheduleData>({
        startDate: '',
        endDate: '',
        weekDays: [],
        timeRanges: [{ start: '08:00', end: '16:00' }]
    });

    const daysMap = [
        { label: 'Nd', val: 0 }, { label: 'Pn', val: 1 }, { label: 'Wt', val: 2 },
        { label: 'Śr', val: 3 }, { label: 'Cz', val: 4 }, { label: 'Pt', val: 5 }, { label: 'Sb', val: 6 }
    ];

    const toggleDay = (day: number) => {
        setFormData(prev => ({
            ...prev,
            weekDays: prev.weekDays.includes(day) 
                ? prev.weekDays.filter(d => d !== day) 
                : [...prev.weekDays, day]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.weekDays.length === 0) return alert("Wybierz dni tygodnia!");
        try {
            const res: { message: string } = await api.generateCyclicalSchedule(formData);
            alert(res.message || "Grafik wygenerowany");
        } catch (err: unknown) { 
            const error = err as Error;
            alert(error.message); 
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h4 style={{marginTop:0}}>Ustaw grafik na dłuższy okres</h4>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <div>
                    <label>Od:</label><br/>
                    <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                    <label>Do:</label><br/>
                    <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <label>Dni tygodnia:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {daysMap.map(d => (
                        <label key={d.val} style={{cursor:'pointer'}}>
                            <input type="checkbox" checked={formData.weekDays.includes(d.val)} onChange={() => toggleDay(d.val)} /> 
                            {d.label}
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Godziny:</label><br/>
                <input 
                    type="time" 
                    value={formData.timeRanges[0].start} 
                    onChange={e => {const n=[...formData.timeRanges]; n[0].start=e.target.value; setFormData({...formData, timeRanges:n})}} 
                />
                -
                <input 
                    type="time" 
                    value={formData.timeRanges[0].end} 
                    onChange={e => {const n=[...formData.timeRanges]; n[0].end=e.target.value; setFormData({...formData, timeRanges:n})}} 
                />
            </div>
            <button type="submit" style={{ padding: '8px 20px', background: '#198754', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Generuj Cyklicznie
            </button>
        </form>
    );
};

export default CyclicalScheduleForm;