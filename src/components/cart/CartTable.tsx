import React from 'react';
import type { CartItem } from '../../types';

interface CartTableProps {
    items: CartItem[];
    onRemove: (slotId: number) => void;
}

const CartTable: React.FC<CartTableProps> = ({ items, onRemove }) => {
    if (items.length === 0) {
        return <p>Koszyk jest pusty. Wybierz termin w kalendarzu.</p>;
    }

    return (
        <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '12px' }}>Lekarz</th>
                        <th style={{ padding: '12px' }}>Data</th>
                        <th style={{ padding: '12px' }}>Godzina</th>
                        <th style={{ padding: '12px' }}>Akcja</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.slotId} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>
                                <span style={{ fontWeight: '500', color: '#2c3e50' }}>
                                    {item.Slot?.Doctor?.name || 'Lekarz'} 
                                </span>
                                <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                                    {item.Slot?.Doctor?.specialization}
                                </div>
                            </td>
                            <td style={{ padding: '12px' }}>{item.Slot?.date}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.Slot?.time}</td>
                            <td style={{ padding: '12px' }}>
                                <button 
                                    onClick={() => onRemove(item.slotId)}
                                    style={styles.removeBtn}
                                >
                                    Usuń
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    removeBtn: {
        background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e',
        padding: '6px 12px', cursor: 'pointer', borderRadius: '4px',
        fontWeight: '500', transition: 'all 0.2s'
    }
};

export default CartTable;