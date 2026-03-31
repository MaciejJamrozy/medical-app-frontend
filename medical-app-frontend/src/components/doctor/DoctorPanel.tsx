import React, { useState } from 'react';
import DoctorReviews from '../common/DoctorReviews'; 
import CyclicalScheduleForm from './CyclicalScheduleForm';
import SingleScheduleForm from './SingleScheduleForm';
import AbsenceForm from './AbsenceForm';

const DoctorPanel: React.FC = () => {
    const doctorId = localStorage.getItem('userId');
    const [mode, setMode] = useState<'cyclical' | 'single'>('cyclical'); 

    return (
        <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
            
            {/* --- GŁÓWNY KONTENER FLEX --- */}
            <div style={{ 
                display: 'flex', 
                gap: '30px',              
                alignItems: 'flex-start', 
                flexWrap: 'wrap',         
                marginBottom: '40px'
            }}>

                {/* --- KOLUMNA LEWA: GENERATOR GRAFIKU --- */}
                <div style={{ 
                    flex: 1,                 // <--- ZMIANA: Równa waga (1)
                    minWidth: '400px',       // Minimalna szerokość, żeby nie ścisnąć formularza
                    padding: '25px', 
                    background: '#f8f9fa', 
                    border: '1px solid #e9ecef', 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50' }}>Zarządzanie Grafikiem</h3>
                    
                    {/* PRZYCISKI ZAKŁADEK */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #dee2e6', paddingBottom: '15px' }}>
                        <button 
                            onClick={() => setMode('cyclical')}
                            style={{ 
                                flex: 1,
                                padding: '10px', cursor: 'pointer', border: 'none', borderRadius: '6px',
                                background: mode === 'cyclical' ? '#3498db' : '#e9ecef', 
                                color: mode === 'cyclical' ? 'white' : '#495057',
                                fontWeight: 'bold', transition: 'all 0.2s'
                            }}
                        >
                            Cykliczne
                        </button>
                        <button 
                            onClick={() => setMode('single')}
                            style={{ 
                                flex: 1,
                                padding: '10px', cursor: 'pointer', border: 'none', borderRadius: '6px',
                                background: mode === 'single' ? '#3498db' : '#e9ecef', 
                                color: mode === 'single' ? 'white' : '#495057',
                                fontWeight: 'bold', transition: 'all 0.2s'
                            }}
                        >
                            Jednorazowe
                        </button>
                    </div>

                    {/* FORMULARZE */}
                    {mode === 'cyclical' ? <CyclicalScheduleForm /> : <SingleScheduleForm />}
                </div>

                {/* --- KOLUMNA PRAWA: NIEOBECNOŚĆ --- */}
                <div style={{ 
                    flex: 1,                 // <--- ZMIANA: Równa waga (1)
                    minWidth: '400px',       // Taka sama minimalna szerokość jak po lewej
                }}>
                   <AbsenceForm />
                </div>

            </div>

            {/* --- OPINIE --- */}
            {doctorId && <DoctorReviews doctorId={doctorId}/>}
        </div>
    );
};

export default DoctorPanel;