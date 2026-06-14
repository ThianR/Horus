import api from './api';

export interface AsistenciaDiaEditor {
    id: number;
    empleado: {
        id: number;
        nombreCompleto: string;
        documentoIdentidad: string;
    };
    fechaLaboral: string;
    horaEntradaReal: string | null;
    horaSalidaReal: string | null;
    estadoAsistencia: string;
    incidencias: string | null;
    validadoPorSupervisor: boolean;
    turnoAsignado: {
        nombre: string;
    } | null;
}

export interface AsistenciaUpdateData {
    horaEntradaReal?: string | null;
    horaSalidaReal?: string | null;
    estadoAsistencia?: string;
    incidencias?: string | null;
}

export const asistenciaEditorService = {
    getAsistenciasMensuales: async (): Promise<AsistenciaDiaEditor[]> => {
        const response = await api.get('/asistencias');
        return response.data;
    },

    actualizarAsistencia: async (id: number, data: AsistenciaUpdateData): Promise<AsistenciaDiaEditor> => {
        const response = await api.put(`/asistencias/${id}`, data);
        return response.data;
    }
};
