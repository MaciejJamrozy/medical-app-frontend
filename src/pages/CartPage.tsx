import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import type { CartItem } from '../types';

const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const loadCart = () => {
        api.getCart()
            .then(data => {
                setCartItems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };
    
    useEffect(() => {
        loadCart();
    }, []);


    const handleRemove = async (slotId: number) => {
        if (!window.confirm("Usunąć z koszyka?")) return;
        try {
            await api.removeFromCart(slotId);
            loadCart(); // Odśwież listę
        } catch (err: unknown) {
            const error = err as Error;
            alert(error.message || "Błąd usuwania");
        }
    };

    const handleCheckout = async () => {
        try {
            await api.checkout();
            alert("Rezerwacja potwierdzona! Dziękujemy.");
            navigate('/appointments'); 
        } catch (err: unknown) {
            const error = err as Error;
            alert(error.message || "Błąd rezerwacji");
        }
    };

    if (loading) return <p>Ładowanie koszyka...</p>;

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
            <h2>Twój Koszyk</h2>

            {cartItems.length === 0 ? (
                <p>Koszyk jest pusty. Wybierz termin w kalendarzu.</p>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#eee', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Lekarz</th>
                                <th>Data</th>
                                <th>Godzina</th>
                                <th>Akcja</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map(item => (
                                <tr key={item.slotId} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '10px' }}>
                                        {item.Slot?.Doctor?.name || 'Lekarz'} 
                                        <small> ({item.Slot?.Doctor?.specialization})</small>
                                    </td>
                                    <td>{item.Slot?.date}</td>
                                    <td>{item.Slot?.time}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleRemove(item.slotId)}
                                            style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                                        >
                                            Usuń
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: '30px', textAlign: 'right' }}>
                        <h3>Podsumowanie</h3>
                        <p>Liczba wizyt: {cartItems.length}</p>
                        <button 
                            onClick={handleCheckout}
                            style={{ padding: '10px 20px', fontSize: '16px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                        >
                            Potwierdzam z obowiązkiem zapłaty
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;