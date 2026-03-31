import React, { useState } from 'react';

interface RatingFormProps {
    onSubmit: (stars: number, comment: string) => void;
    onCancel: () => void;
}

const RatingForm: React.FC<RatingFormProps> = ({ onSubmit, onCancel }) => {
    const [stars, setStars] = useState(5);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(stars, comment);
    };

    return (
        <div style={styles.ratingCard}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>⭐ Wystaw opinię</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <select 
                    value={stars} 
                    onChange={e => setStars(parseInt(e.target.value))}
                    style={styles.select}
                >
                    <option value="5">5 - Rewelacja</option>
                    <option value="4">4 - Dobrze</option>
                    <option value="3">3 - Przeciętnie</option>
                    <option value="2">2 - Słabo</option>
                    <option value="1">1 - Tragicznie</option>
                </select>
                <textarea 
                    placeholder="Twój komentarz..." 
                    value={comment} 
                    onChange={e => setComment(e.target.value)} 
                    style={styles.textarea}
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onCancel} style={styles.btnCancel}>Anuluj</button>
                    <button type="submit" style={styles.btnSubmit}>Wyślij</button>
                </div>
            </form>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    ratingCard: { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', marginBottom: '40px', border: '1px solid #e2e8f0' },
    select: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1rem' },
    textarea: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' },
    btnSubmit: { background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
    btnCancel: { background: '#edf2f7', color: '#4a5568', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
};

export default RatingForm;