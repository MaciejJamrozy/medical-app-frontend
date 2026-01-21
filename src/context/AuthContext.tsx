import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { authManager, api } from '../services/api';
import type { AuthResponse, UserRole } from '../types';

// Typ dla obiektu User przechowywanego w stanie
// (Możemy użyć tego samego co w types.ts, ale AuthContext przechowuje tylko część danych z tokena)
interface AuthUser {
    token: string;
    role: UserRole;
    id: number;
    name: string | null;
    username: string | null;
}

// Typ tego, co zwraca useAuth()
interface AuthContextType {
    user: AuthUser | null;
    login: (authData: AuthResponse, authMode: 'LOCAL' | 'SESSION' | 'NONE') => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const token = authManager.getAccessToken();
        const role = authManager.getRole() as UserRole;
        const idStr = localStorage.getItem('userId');
        const name = authManager.getName();
        const username = authManager.getUsername();

        if (token && idStr) {
            return { 
                token, 
                role, 
                id: parseInt(idStr), 
                name, 
                username 
            };
        }
        return null;
    });

    const login = (authData: AuthResponse, authMode: 'LOCAL' | 'SESSION' | 'NONE') => {
        authManager.setAuthData(authData, authMode);
        localStorage.setItem('userId', String(authData.id));
        setUser({ 
            token: authData.accessToken, 
            role: authData.role,
            id: authData.id,
            name: authData.name,
            username: authData.username
        });
    };

    const logout = () => {
        authManager.clearAuth();
        localStorage.removeItem('userId');
        setUser(null);
        api.logout().catch(console.error);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};