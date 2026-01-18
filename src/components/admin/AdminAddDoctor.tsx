import React, { useState } from 'react';
import { api } from '../../services/api';
import { SPECIALIZATIONS } from '../../utils/specializations';
import type { CreateDoctorData } from '../../types';

interface AdminAddDoctorProps {
    onDoctorAdded: () => void; // Callback do odświeżenia listy
}

const AdminAddDoctor: React.FC<AdminAddDoctorProps> = ({ onDoctorAdded }) => {
    const [doctorForm, setDoctorForm] = useState<CreateDoctorData>({
        name: '', username: '', password: '', specialization: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createDoctor(doctorForm);
            alert("Lekarz dodany!");
            setDoctorForm({ name: '', username: '', password: '', specialization: '' });
            onDoctorAdded(); // Wywołujemy odświeżenie w rodzicu
        } catch (err: unknown) {
            const error = err as Error;
            alert("Błąd: " + error.message);
        }
    };

    return (
        <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Dodaj Lekarza</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'stretch' }}>
                <input 
                    placeholder="Imię i Nazwisko" 
                    value={doctorForm.name} 
                    onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} 
                    required 
                    style={styles.input}
                />
                <input 
                    placeholder="Login (Email)" 
                    value={doctorForm.username} 
                    onChange={e => setDoctorForm({...doctorForm, username: e.target.value})} 
                    required 
                    style={styles.input}
                />
                
                <select
                    value={doctorForm.specialization}
                    onChange={e => setDoctorForm({...doctorForm, specialization: e.target.value})}
                    required
                    style={{...styles.input, background: 'white'}}
                >
                    <option value="" disabled>-- Specjalizacja --</option>
                    {SPECIALIZATIONS.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                    ))}
                </select>

                <input 
                    type="password" 
                    placeholder="Hasło" 
                    value={doctorForm.password} 
                    onChange={e => setDoctorForm({...doctorForm, password: e.target.value})} 
                    required 
                    style={styles.input}
                />
                <button type="submit" style={styles.btnAdd}>Dodaj</button>
            </form>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    sectionCard: { background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    sectionTitle: { margin: '0 0 15px 0', color: '#2d3748' },
    input: { padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0', flex: '1 1 200px', minWidth: '0', fontSize: '0.95rem' },
    btnAdd: { background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '10px 20px', fontWeight: 'bold', flex: '1 1 100px', transition: 'background 0.2s' },
};

export default AdminAddDoctor;