import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { User, Rating } from '../types';
import { AxiosError } from 'axios';

import AdminAuthSettings from '../components/admin/AdminAuthSettings';
import AdminAddDoctor from '../components/admin/AdminAddDoctor';
import AdminUserList from '../components/admin/AdminUserList';
import AdminRatingsList from '../components/admin/AdminRatingsList';

const AdminPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [authMode, setAuthMode] = useState<'LOCAL' | 'SESSION' | 'NONE'>('LOCAL');

    const fetchData = useCallback(async () => {
        try {
            const [usersData, ratingsData] = await Promise.all([
                api.getAllUsers(),
                api.getAllRatings()
            ]);
            setUsers(usersData);
            
            const sortedRatings = ratingsData.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
            setRatings(sortedRatings);
        } catch (err: unknown) {
            console.error("Błąd pobierania danych:", err);
        }
    }, []);

    useEffect(() => {
        const initData = async () => {
            await fetchData();
        };

        initData();
        
        api.getAuthSettings()
            .then(res => setAuthMode(res.data.mode))
            .catch(console.error);
            
    }, [fetchData]);

    const handleChangeAuthMode = async (newMode: 'LOCAL' | 'SESSION' | 'NONE') => {
        try {
            await api.updateAuthMode(newMode);
            setAuthMode(newMode);
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            alert("Błąd zmiany trybu: " + (error.response?.data?.message || error.message));
        }
    };

    const handleToggleBan = async (userId: number, currentStatus?: boolean) => {
        const newStatus = !currentStatus;
        if (!window.confirm(`Czy na pewno chcesz ${newStatus ? 'ZBANOWAĆ' : 'ODBANOWAĆ'} tego użytkownika?`)) return;

        try {
            await api.toggleBan(userId, newStatus);
            setUsers(users.map(u => u.id === userId ? { ...u, isBanned: newStatus } : u));
        } catch (err: unknown) {
            const error = err as Error;
            alert("Błąd zmiany statusu: " + error.message);
        }
    };

    const handleDeleteRating = async (ratingId: number) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tę opinię?")) return;
        try {
            await api.deleteRating(ratingId);
            setRatings(ratings.filter(r => r.id !== ratingId));
        } catch (err: unknown) {
            const error = err as Error;
            alert("Błąd usuwania opinii: " + error.message);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
            <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                Panel Administratora
            </h1>

            {/* KOMPONENT 1: USTAWIENIA AUTH */}
            <AdminAuthSettings 
                authMode={authMode} 
                onChangeMode={handleChangeAuthMode} 
            />

            {/* KOMPONENT 2: DODAWANIE LEKARZA */}
            <AdminAddDoctor 
                onDoctorAdded={fetchData} 
            />

            {/* KOMPONENT 3: LISTA UŻYTKOWNIKÓW */}
            <AdminUserList 
                users={users} 
                onToggleBan={handleToggleBan} 
            />

            {/* KOMPONENT 4: LISTA OPINII */}
            <AdminRatingsList 
                ratings={ratings} 
                onDeleteRating={handleDeleteRating} 
            />
        </div>
    );
};

export default AdminPage;