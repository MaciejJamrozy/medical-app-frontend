import React from 'react';

interface CartSummaryProps {
    count: number;
    onCheckout: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ count, onCheckout }) => {
    if (count === 0) return null;

    return (
        <div style={styles.container}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Podsumowanie</h3>
            <p style={{ margin: '0 0 20px 0', color: '#7f8c8d' }}>
                Liczba wizyt do opłacenia: <strong style={{ color: '#2c3e50' }}>{count}</strong>
            </p>
            <button 
                onClick={onCheckout}
                style={styles.checkoutBtn}
            >
                Potwierdzam z obowiązkiem zapłaty
            </button>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        marginTop: '30px', 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '8px', 
        textAlign: 'right',
        border: '1px solid #eee'
    },
    checkoutBtn: {
        padding: '12px 24px', 
        fontSize: '16px', 
        background: '#28a745', 
        color: 'white', 
        border: 'none', 
        cursor: 'pointer', 
        borderRadius: '6px',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(40, 167, 69, 0.3)'
    }
};

export default CartSummary;