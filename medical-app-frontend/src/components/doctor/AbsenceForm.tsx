import React, { useState } from 'react';
import { api } from '../../services/api';
import type { Absence } from '../../types';

const AbsenceForm: React.FC = () => {
    const [absenceData, setAbsenceData] = useState<Absence>({ date: '', reason: '' });

    const handleSubmit = async (e: React.FormEvent) => {
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
        <div style={{ marginBottom: '30px', padding: '20px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, color: '#c53030' }}>Zgłoś Nieobecność</h3>
            <p style={{ fontSize: '0.9em', color: '#742a2a' }}>
                Uwaga: Dodanie nieobecności automatycznie <strong>ODWOŁA</strong> wszystkie wizyty zaplanowane na ten dzień.
            </p><br />
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
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
    );
};

export default AbsenceForm;