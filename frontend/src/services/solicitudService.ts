import api from './api';

export interface SolicitudAusencia {
    id: number;
    fechaInicio: string;
    fechaFin: string;
    tipo: 'VACACIONES' | 'LICENCIA_MEDICA' | 'JUSTIFICACION_FALTA' | 'OTRO';
    estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
    motivo: string;
    comentarioRevisor?: string;
    createdAt: string;
}

export interface SolicitudRequest {
    fechaInicio: string;
    fechaFin: string;
    tipo: string;
    motivo: string;
}

export const solicitudService = {
    getMisSolicitudes: async (): Promise<SolicitudAusencia[]> => {
        const response = await api.get('/solicitudes/mis-solicitudes');
        return response.data;
    },

    crearSolicitud: async (request: SolicitudRequest): Promise<SolicitudAusencia> => {
        const response = await api.post('/solicitudes', request);
        return response.data;
    },

    getTodasLasSolicitudes: async (): Promise<SolicitudAusencia[]> => {
        const response = await api.get('/solicitudes');
        return response.data;
    },

    actualizarEstado: async (id: number, estado: string, comentarioRevisor: string): Promise<SolicitudAusencia> => {
        const response = await api.put(`/solicitudes/${id}/estado`, { estado, comentarioRevisor });
        return response.data;
    }
};
