import axios from 'axios';

export type TipoTurno = 'FIJO' | 'FLEXIBLE' | 'ABIERTO';

export interface TurnoSegmento {
    id?: number;
    orden: number;
    horaEntrada: string; // HH:mm:ss
    horaSalida: string;   // HH:mm:ss
    diaSiguienteSalida: boolean;
    toleranciaTardanzaMins: number;
    toleranciaSalidaAnticipadaMins: number;
}

export interface TurnoPlantilla {
    id?: number;
    codigo: string;
    nombre: string;
    tipoTurno: TipoTurno;
    esNocturno: boolean;
    minBreakMins: number;
    maxBreakMins: number;
    toleranciaEntradaMins: number;
    toleranciaSalidaMins: number;
    segmentos: TurnoSegmento[];
}

export const turnoService = {
    getTodos: async (): Promise<TurnoPlantilla[]> => {
        const response = await axios.get('/api/turnos');
        return response.data;
    },
    getPorId: async (id: number): Promise<TurnoPlantilla> => {
        const response = await axios.get(`/api/turnos/${id}`);
        return response.data;
    },
    crear: async (turno: TurnoPlantilla): Promise<TurnoPlantilla> => {
        const response = await axios.post('/api/turnos', turno);
        return response.data;
    },
    actualizar: async (id: number, turno: TurnoPlantilla): Promise<TurnoPlantilla> => {
        const response = await axios.put(`/api/turnos/${id}`, turno);
        return response.data;
    },
    eliminar: async (id: number): Promise<void> => {
        await axios.delete(`/api/turnos/${id}`);
    }
};
