// src/types.ts

// 1. Role
export type UserRole = 'patient' | 'doctor' | 'admin';

// 2. Użytkownik (User)
export interface User {
    id: number;
    username: string;
    name: string;
    role: UserRole;
    specialization?: string; // Dla lekarzy
    isBanned?: boolean;
    tokenVersion?: number;
}

// 3. Odpowiedź z logowania (Auth)
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    role: UserRole;
    id: number;
    name: string;
    username: string;
    isBanned: boolean;
    authMode: 'LOCAL' | 'SESSION' | 'NONE';
}

// 4. Lekarz (uproszczony widok)
export interface Doctor {
    id: number;
    name: string;
    specialization: string;
}

// 5. Slot / Wizyta (Najważniejszy typ)
export interface Slot {
    id: number;
    doctorId: number;
    date: string;       // 'YYYY-MM-DD'
    time: string;       // 'HH:MM'
    status: 'free' | 'booked' | 'cancelled' | 'pending';
    visitType?: string; // Np. 'Pierwsza wizyta'
    
    // Dane pacjenta w slocie (dla lekarza)
    patientId?: number | null;
    patientName?: string;
    patientAge?: number | string;
    patientGender?: string;
    patientNotes?: string;

    // Relacje (z backendu przez include)
    Doctor?: Doctor;      
    Patient?: { username: string; name: string }; 
}

// 6. Element Koszyka
export interface CartItem {
    id: number;
    slotId: number;
    patientId: number;
    Slot?: Slot; // Zagnieżdżony slot z backendu
}

// 7. Ocena (Rating)
export interface Rating {
    id: number;
    doctorId: number;
    patientId: number;
    stars: number;
    comment: string;
    createdAt: string; // ISO date string
    Patient?: { name: string; username: string };
    Doctor?: { name: string; specialization: string };
}

// 8. Nieobecność (Absence)
export interface Absence {
    id?: number;
    doctorId?: number;
    date: string;
    reason: string;
}

// 9. Dane formularza rezerwacji (Modal)
export interface ReservationFormData {
    duration: number;
    visitType: string;
    patientName: string;
    patientAge: string | number;
    patientGender: string;
    notes: string;
    attachment?: File | null;
}

// 10. Dane do generatora cyklicznego (DoctorPanel)
export interface CyclicalScheduleData {
    startDate: string;
    endDate: string;
    weekDays: number[];
    timeRanges: { start: string; end: string }[];
}

// Do logowania
export interface LoginCredentials {
    username: string;
    password: string;
}

// Do rejestracji
export interface RegisterData {
    username: string;
    password: string;
    name: string;
}

// Do tworzenia lekarza (Admin)
export interface CreateDoctorData {
    name: string;
    username: string;
    password: string;
    specialization: string;
}

// Do dodawania dostępności (DoctorPanel)
export interface AvailabilityData {
    date: string;
    startTime: string;
    endTime: string;
}