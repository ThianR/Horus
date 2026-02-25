import axios from 'axios';

export interface DashboardStats {
    totalEmpleados: number;
    totalMarcacionesHoy: number;
    presentesHoy: number;
    tardanzasHoy: number;
    alertas: number;
}

export interface EventoReciente {
    id: string;
    empleadoNombre: string;
    codigoEmpleado: string;
    timestamp: string;
    tipo: 'ENTRADA' | 'SALIDA' | 'BREAK_IN' | 'BREAK_OUT';
    metodo: string;
    estado: string;
}

export interface AsistenciaHoy {
    id: number;
    empleado: {
        id: number;
        nombreCompleto: string;
        codigoEmpleado: string;
    };
    fechaLaboral: string;
    horaEntradaReal: string | null;
    horaSalidaReal: string | null;
    minsTardanza: number;
    estadoAsistencia: 'NORMAL' | 'FALTA' | 'TARDANZA' | 'INCOMPLETO' | 'FERIADO' | 'LIBRE' | 'REQUIERE_REVISION';
}

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await axios.get('/api/dashboard/stats');
        return response.data;
    },
    getEventosRecientes: async (): Promise<EventoReciente[]> => {
        const response = await axios.get('/api/dashboard/eventos-recientes');
        return response.data;
    },
    getAsistenciasHoy: async (): Promise<AsistenciaHoy[]> => {
        const response = await axios.get('/api/dashboard/asistencias-hoy');
        return response.data;
    }
};
