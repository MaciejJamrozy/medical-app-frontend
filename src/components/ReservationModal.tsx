import React, { useState } from 'react';
import { authManager } from '../services/api'; 
import type { Slot, ReservationFormData } from '../types';

interface ReservationModalProps {
    slot: Slot | null;
    onClose: () => void;
    onConfirm: (slotId: number, formData: ReservationFormData) => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ slot, onClose, onConfirm }) => {
    const [formData, setFormData] = useState<ReservationFormData>({
        duration: 1, // 1 slot = 30min
        visitType: 'Pierwsza wizyta',
        patientName: authManager.getName() || '', 
        patientAge: '',
        patientGender: 'Mężczyzna',
        notes: ''
    });

    if (!slot) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(slot.id, formData);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
                <h3 style={{ marginTop: 0 }}>Rezerwacja wizyty</h3>
                <p><strong>Termin:</strong> {slot.date}, godz. {slot.time}</p>

                <form onSubmit={handleSubmit}>
                    {/* 1. Długość konsultacji */}
                    <div style={{ marginBottom: '10px' }}>
                        <label>Długość wizyty:</label>
                        <select 
                            value={formData.duration} 
                            onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                            style={{ width: '100%', padding: '5px' }}
                        >
                            <option value={1}>30 min (Standard)</option>
                            <option value={2}>60 min (Długa)</option>
                            <option value={3}>90 min (Bardzo długa)</option>
                        </select>
                        <small style={{ color: '#666' }}>System sprawdzi dostępność kolejnych slotów.</small>
                    </div>

                    {/* 2. Typ konsultacji */}
                    <div style={{ marginBottom: '10px' }}>
                        <label>Typ wizyty:</label>
                        <select 
                            value={formData.visitType}
                            onChange={e => setFormData({...formData, visitType: e.target.value})}
                            style={{ width: '100%', padding: '5px' }}
                        >
                            <option>Pierwsza wizyta</option>
                            <option>Wizyta kontrolna</option>
                            <option>Choroba przewlekła</option>
                            <option>Recepta</option>
                        </select>
                    </div>

                    {/* 3. Dane pacjenta */}
                    <div style={{ marginBottom: '10px' }}>
                        <label>Imię i Nazwisko:</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Wpisz dane pacjenta"
                            value={formData.patientName}
                            onChange={e => setFormData({...formData, patientName: e.target.value})}
                            style={{ width: '100%', padding: '5px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label>Wiek:</label>
                            <input 
                                type="number" 
                                required
                                value={formData.patientAge}
                                onChange={e => setFormData({...formData, patientAge: e.target.value})}
                                style={{ width: '100%', padding: '5px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Płeć:</label>
                            <select 
                                value={formData.patientGender}
                                onChange={e => setFormData({...formData, patientGender: e.target.value})}
                                style={{ width: '100%', padding: '5px' }}
                            >
                                <option>Mężczyzna</option>
                                <option>Kobieta</option>
                                <option>Inna</option>
                            </select>
                        </div>
                    </div>

                    {/* 4. Notatki */}
                    <div style={{ marginBottom: '15px' }}>
                        <label>Informacje dla lekarza:</label>
                        <textarea 
                            rows={3}
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            style={{ width: '100%', padding: '5px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '8px 15px', background: '#ccc', border: 'none', cursor: 'pointer' }}>Anuluj</button>
                        <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Zarezerwuj</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservationModal;