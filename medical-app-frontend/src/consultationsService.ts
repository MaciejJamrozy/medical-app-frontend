import axios from 'axios';
import type { Slot } from './types';

const LOCAL_DB_URL = 'http://localhost:3000';

export const consultationsService = {

    getDoctorSchedule: async (doctorId: number): Promise<Slot[]> => {
        try {
            const response = await axios.get<Slot[]>(
                `${LOCAL_DB_URL}/slots?doctorId=${doctorId}&_expand=doctors`
            );
            return response.data;
        } catch (error) {
            console.error("Błąd pobierania danych z pliku db.json", error);
            throw error;
        }
    },

    bookSlot: async (
        slotId: number, 
        patientId: number, 
        formData: { visitType: string; notes: string }
    ): Promise<Slot> => {
        const response = await axios.patch<Slot>(`${LOCAL_DB_URL}/slots/${slotId}`, {
            status: 'booked',
            patientId: patientId,
            visitType: formData.visitType,
            patientNotes: formData.notes
        });
        return response.data;
    },

    cancelSlot: async (slotId: number): Promise<Slot> => {
        const response = await axios.patch<Slot>(`${LOCAL_DB_URL}/slots/${slotId}`, {
            status: 'free',
            patientId: null,
            patientName: null,
            visitType: null,
            patientNotes: null
        });
        return response.data;
    }
};