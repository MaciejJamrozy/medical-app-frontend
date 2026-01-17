import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import io, { Socket } from 'socket.io-client';
import type { 
    AuthResponse, User, Doctor, Slot, CartItem, 
    Rating, Absence, CyclicalScheduleData, ReservationFormData, 
    LoginCredentials, RegisterData, CreateDoctorData, AvailabilityData
} from '../types';

const API_URL = 'http://localhost:5001/api';

// Socket z typem
export const socket: Socket = io("http://localhost:5001");

// --- Auth Manager Variables ---
let memoryToken: string | null = null;
let memoryRefreshToken: string | null = null;
let memoryRole: string | null = null;
let memoryName: string | null = null;
let memoryUsername: string | null = null;

type AuthMode = 'LOCAL' | 'SESSION' | 'NONE';

const getStorageMode = (): AuthMode => {
    const pref = localStorage.getItem('auth_preference');
    if (pref) return pref as AuthMode;
    if (sessionStorage.getItem('token')) return 'SESSION';
    return 'LOCAL';
};

export const authManager = {
    setAuthData: (data: AuthResponse, mode: AuthMode) => {
        if (mode === 'NONE') localStorage.setItem('auth_preference', 'NONE'); 
        else localStorage.setItem('auth_preference', mode);

        // Czyścimy wszystko
        ['token', 'refreshToken', 'role', 'name', 'username'].forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        
        memoryToken = null;
        memoryRefreshToken = null;
        memoryRole = null;
        memoryName = null;
        memoryUsername = null;

        const storage = mode === 'LOCAL' ? localStorage : (mode === 'SESSION' ? sessionStorage : null);

        if (storage) {
            storage.setItem('token', data.accessToken);
            storage.setItem('refreshToken', data.refreshToken);
            storage.setItem('role', data.role);
            if (data.name) storage.setItem('name', data.name);
            if (data.username) storage.setItem('username', data.username);
        } else {
            memoryToken = data.accessToken;
            memoryRefreshToken = data.refreshToken;
            memoryRole = data.role;
            memoryName = data.name;
            memoryUsername = data.username;
        }
    },

    getAccessToken: (): string | null => {
        const mode = getStorageMode();
        if (mode === 'LOCAL') return localStorage.getItem('token');
        if (mode === 'SESSION') return sessionStorage.getItem('token');
        return memoryToken; 
    },

    getRefreshToken: (): string | null => {
        const mode = getStorageMode();
        if (mode === 'LOCAL') return localStorage.getItem('refreshToken');
        if (mode === 'SESSION') return sessionStorage.getItem('refreshToken');
        return memoryRefreshToken;
    },

    getRole: (): string | null => {
        const mode = getStorageMode();
        if (mode === 'LOCAL') return localStorage.getItem('role');
        if (mode === 'SESSION') return sessionStorage.getItem('role');
        return memoryRole;
    },

    getName: (): string | null => {
        const mode = getStorageMode();
        if (mode === 'LOCAL') return localStorage.getItem('name');
        if (mode === 'SESSION') return sessionStorage.getItem('name');
        return memoryName;
    },

    getUsername: (): string | null => {
        const mode = getStorageMode();
        if (mode === 'LOCAL') return localStorage.getItem('username');
        if (mode === 'SESSION') return sessionStorage.getItem('username');
        return memoryUsername;
    },

    clearAuth: () => {
        ['token', 'refreshToken', 'role', 'name', 'username'].forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.clear();
        });
        memoryToken = null; memoryRefreshToken = null; memoryRole = null; memoryName = null; memoryUsername = null;
    }
};

// --- AXIOS CONFIG ---
const apiInstance = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

apiInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = authManager.getAccessToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = authManager.getRefreshToken();
            
            if (!refreshToken) {
                authManager.clearAuth();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(`${API_URL}/auth/refresh`, { token: refreshToken });
                const { accessToken } = response.data;

                const currentMode = getStorageMode();
                if (currentMode === 'LOCAL') localStorage.setItem('token', accessToken);
                else if (currentMode === 'SESSION') sessionStorage.setItem('token', accessToken);
                else memoryToken = accessToken;

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiInstance(originalRequest);

            } catch (refreshError) {
                authManager.clearAuth();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Błąd połączenia';
        return Promise.reject(new Error(message));
    }
);

// --- API METHODS ---
export const api = {
    // Auth
    login: (credentials: LoginCredentials) => apiInstance.post<AuthResponse>('/auth/login', credentials),
    register: (userData: RegisterData) => apiInstance.post('/auth/register', userData),
    getAuthSettings: () => apiInstance.get<{ mode: AuthMode }>('/auth/settings'),
    logout: () => {
        const token = authManager.getRefreshToken();
        return apiInstance.post('/auth/logout', { token });
    },

    // Admin
    getAllUsers: () => apiInstance.get<User[]>('/admin/users').then(res => res.data),
    createDoctor: (data: CreateDoctorData) => apiInstance.post('/admin/doctors', data),
    toggleBan: (userId: number, isBanned: boolean) => apiInstance.put(`/admin/users/${userId}/ban`, { isBanned }),
    getAllRatings: () => apiInstance.get<Rating[]>('/admin/ratings').then(res => res.data),
    deleteRating: (id: number) => apiInstance.delete(`/admin/ratings/${id}`),
    updateAuthMode: (mode: AuthMode) => apiInstance.post('/admin/settings/auth-mode', { mode }),

    // Lekarz
    getDoctors: () => apiInstance.get<Doctor[]>('/doctors').then(res => res.data),
    getSchedule: (doctorId: number | string, from: string, to: string) => 
        apiInstance.get<Slot[]>(`/doctor/schedule?doctorId=${doctorId}&from=${from}&to=${to}`).then(res => res.data),
    addAvailability: (data: AvailabilityData) => apiInstance.post('/availability', data),
    generateCyclicalSchedule: (data: CyclicalScheduleData) => apiInstance.post('/availability/cyclical', data).then(res => res.data),
    getDoctorAppointments: () => apiInstance.get<Slot[]>('/doctor/my-appointments').then(res => res.data),
    addAbsence: (data: Absence) => apiInstance.post('/doctor/absence', data).then(res => res.data),
    getDoctorAbsences: (doctorId: number | string) => apiInstance.get<Absence[]>(`/doctor/${doctorId}/absences`).then(res => res.data),

    // Pacjent
    addToCart: (slotId: number, duration: number, details: ReservationFormData) => 
        apiInstance.post('/cart/add', { startSlotId: slotId, duration, details }),
    getCart: () => apiInstance.get<CartItem[]>('/cart').then(res => res.data),
    removeFromCart: (slotId: number) => apiInstance.delete(`/cart/${slotId}`),
    checkout: () => apiInstance.post('/cart/checkout'),
    getMyRatings: () => apiInstance.get<Rating[]>('/ratings').then(res => res.data),
    getMyAppointments: () => apiInstance.get<Slot[]>('/appointments/my').then(res => res.data),
    cancelAppointment: (slotId: number) => apiInstance.post(`/appointments/${slotId}/cancel`),
    
    // Oceny
    addRating: (data: { doctorId: number; stars: number; comment: string }) => apiInstance.post('/ratings', data),
    getDoctorRatings: (doctorId: number | string) => apiInstance.get<Rating[]>(`/doctors/${doctorId}/ratings`).then(res => res.data),
};