import React from 'react';

interface AdminAuthSettingsProps {
    authMode: 'LOCAL' | 'SESSION' | 'NONE';
    onChangeMode: (mode: 'LOCAL' | 'SESSION' | 'NONE') => void;
}

const AdminAuthSettings: React.FC<AdminAuthSettingsProps> = ({ authMode, onChangeMode }) => {
    return (
        <div style={{ background: '#edf2f7', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #cbd5e0' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Ustawienia trybu logowania</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 'bold', color: '#4a5568' }}>Tryb sesji:</span>
                {(['LOCAL', 'SESSION', 'NONE'] as const).map(mode => (
                    <button
                        key={mode}
                        onClick={() => onChangeMode(mode)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: authMode === mode ? '#2b6cb0' : 'white',
                            color: authMode === mode ? 'white' : '#2d3748',
                            border: authMode === mode ? 'none' : '1px solid #cbd5e0',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        {mode}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminAuthSettings;