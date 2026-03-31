import React, { useState } from 'react';
import { api } from '../../services/api';
import type { AvailabilityData } from '../../types';

const SingleScheduleForm: React.FC = () => {
    const [singleData, setSingleData] = useState({
        date: '',
        startTime: '08:00',
        endTime: '16:00'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.addAvailability(singleData as AvailabilityData);
            alert("Dodano dostępność jednorazową!");
            setSingleData({ ...singleData, date: '' });
        } catch (err: unknown) { 
            const error = err as Error;
            alert(error.message); 
        }
    };

    return (
        <form onSubmit={handleSubmit}>
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
            <button type="submit" style={{ padding: '8px 20px', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Dodaj Jednorazowo
            </button>
        </form>
    );
};

export default SingleScheduleForm;