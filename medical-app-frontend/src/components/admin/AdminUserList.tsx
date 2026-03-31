import React, { useState } from 'react';
import type { User } from '../../types';

interface AdminUserListProps {
    users: User[];
    onToggleBan: (userId: number, currentStatus?: boolean) => void;
}

const AdminUserList: React.FC<AdminUserListProps> = ({ users, onToggleBan }) => {
    const [userRoleFilter, setUserRoleFilter] = useState<string>('all'); 
    const [isExpanded, setIsExpanded] = useState(true);

    const filteredUsers = userRoleFilter === 'all' 
        ? users 
        : users.filter(user => user.role === userRoleFilter);

    return (
        <div style={styles.sectionCard}>
            <div style={styles.headerRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h3 style={{ margin: 0, color: '#2c3e50' }}>Lista Użytkowników</h3>
                    <select 
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        style={styles.filterSelect}
                    >
                        <option value="all">Wszyscy</option>
                        <option value="doctor">Lekarze</option>
                        <option value="patient">Pacjenci</option>
                    </select>
                </div>

                <button onClick={() => setIsExpanded(!isExpanded)} style={styles.toggleBtn}>
                    {isExpanded ? '▼ Zwiń' : '▶ Rozwiń'}
                </button>
            </div>

            {isExpanded && (
                <div style={{ maxHeight: '500px', overflowY: 'auto', marginTop: '15px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                            <tr style={{ borderBottom: '2px solid #edf2f7', textAlign: 'left', color: '#718096', fontSize: '0.9rem' }}>
                                <th style={{ padding: '10px' }}>ID</th>
                                <th style={{ padding: '10px' }}>Imię</th>
                                <th style={{ padding: '10px' }}>Login</th>
                                <th style={{ padding: '10px' }}>Rola</th>
                                <th style={{ padding: '10px' }}>Status</th>
                                <th style={{ padding: '10px' }}>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                                    <td style={{ padding: '10px', color: '#718096' }}>{user.id}</td>
                                    <td style={{ padding: '10px', fontWeight: '500' }}>
                                        {user.name} 
                                        {user.role === 'doctor' && user.specialization && (
                                            <div style={{fontSize: '0.75em', color: '#718096', marginTop: '2px'}}>
                                                {user.specialization}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px' }}>{user.username}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ 
                                            background: user.role === 'admin' ? '#purple' : (user.role === 'doctor' ? '#e6fffa' : '#ebf8ff'),
                                            color: user.role === 'admin' ? 'purple' : (user.role === 'doctor' ? '#2c7a7b' : '#2b6cb0'),
                                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.75em', fontWeight: 'bold', textTransform: 'uppercase'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {user.isBanned ? 
                                            <span style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: '0.9rem' }}> BAN</span> : 
                                            <span style={{ color: '#38a169', fontSize: '0.9rem' }}>Aktywny</span>
                                        }
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {user.role === 'patient' && (
                                            <button 
                                                onClick={() => onToggleBan(user.id, user.isBanned)}
                                                style={{
                                                    ...styles.btnBan,
                                                    background: user.isBanned ? '#48bb78' : '#e53e3e'
                                                }}
                                            >
                                                {user.isBanned ? 'Odbanuj' : 'Zbanuj'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && <p style={{textAlign: 'center', color: '#cbd5e0', padding: '20px'}}>Brak użytkowników.</p>}
                </div>
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    sectionCard: { background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
    toggleBtn: { background: 'transparent', border: '1px solid #cbd5e0', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', color: '#718096', fontWeight: '600', fontSize: '0.85rem' },
    filterSelect: { padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', background: '#f7fafc', cursor: 'pointer', fontSize: '0.9rem', color: '#2d3748' },
    btnBan: { color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '6px 12px', fontSize: '0.85em', fontWeight: 'bold' },
};

export default AdminUserList;