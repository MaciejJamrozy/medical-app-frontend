import React from 'react';
import { SPECIALIZATIONS } from '../../utils/specializations';

interface DoctorFilterBarProps {
    selectedSpec: string;
    onSelectSpec: (spec: string) => void;
}

const DoctorFilterBar: React.FC<DoctorFilterBarProps> = ({ selectedSpec, onSelectSpec }) => {
    return (
        <div style={{ 
            marginBottom: '30px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' 
        }}>
            <button 
                onClick={() => onSelectSpec('Wszystkie')}
                style={{
                    ...styles.btn,
                    ...(selectedSpec === 'Wszystkie' ? styles.btnActive : styles.btnInactive)
                }}
            >
                Wszystkie
            </button>

            {SPECIALIZATIONS.map(spec => (
                <button 
                    key={spec}
                    onClick={() => onSelectSpec(spec)}
                    style={{
                        ...styles.btn,
                        ...(selectedSpec === spec ? styles.btnActive : styles.btnInactive)
                    }}
                >
                    {spec}
                </button>
            ))}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    btn: {
        padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
        fontWeight: 'bold', transition: 'all 0.3s'
    },
    btnActive: {
        background: '#3498db', color: 'white'
    },
    btnInactive: {
        background: '#ecf0f1', color: '#2c3e50'
    }
};

export default DoctorFilterBar;