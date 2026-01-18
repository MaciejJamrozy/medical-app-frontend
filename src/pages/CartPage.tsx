import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import type { CartItem } from '../types';

// Import nowych komponentów
import CartTable from '../components/cart/CartTable';
import CartSummary from '../components/cart/CartSummary';

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
            // Optymistyczna aktualizacja (szybsza niż reload)
            setCartItems(prev => prev.filter(item => item.slotId !== slotId));
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

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Ładowanie koszyka...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: "'Segoe UI', sans-serif" }}>
            <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', color: '#2c3e50' }}>
                Twój Koszyk
            </h2>

            <CartTable 
                items={cartItems} 
                onRemove={handleRemove} 
            />

            <CartSummary 
                count={cartItems.length} 
                onCheckout={handleCheckout} 
            />
        </div>
    );
};

export default CartPage;