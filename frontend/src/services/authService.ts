import api from './api';

export interface User {
    id: number;
    username: string;
    rol: string;
    tourCompletado: boolean;
}

export const authService = {
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    completarTour: async (): Promise<void> => {
        await api.post('/auth/tour-completado');
    }
};
