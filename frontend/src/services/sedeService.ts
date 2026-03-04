import api from './api';

export interface ConfiguracionSede {
    toleranciaEntradaMinutos?: number;
    toleranciaSalidaMinutos?: number;
    timezone?: string;
    [key: string]: any;
}

export interface Sede {
    id: number;
    nombre: string;
    direccion: string;
    codigoExterno?: string;
    configuracionJson?: string;
    versionEmbeddings?: number;
    createdAt?: string;
    turnoDefecto?: {
        id: number;
        nombre: string;
        codigo: string;
    };
    diasTurnoDefecto?: string;
    turnoDefectoId?: number | null; // For form usage
}

export interface Dispositivo {
    id: number;
    uuidHardware: string;
    nombre: string;
    sede: {
        id: number;
        nombre: string;
    };
    tipo: 'KIOSCO' | 'CAMARA' | 'MOVIL';
    estado: 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO';
    ipAddress?: string;
    lastHeartbeat?: string;
}

export const sedeService = {
    getAll: async (): Promise<Sede[]> => {
        const response = await api.get('/sedes');
        return response.data;
    },
    getById: async (id: number): Promise<Sede> => {
        const response = await api.get(`/sedes/${id}`);
        return response.data;
    },
    create: async (sede: Partial<Sede>): Promise<Sede> => {
        const response = await api.post('/sedes', sede);
        return response.data;
    },
    update: async (id: number, sede: Partial<Sede>): Promise<Sede> => {
        const response = await api.put(`/sedes/${id}`, sede);
        return response.data;
    },
    asignarTurnoDefecto: async (id: number, turnoDefectoId: number | null, diasTurnoDefecto?: string): Promise<Sede> => {
        const response = await api.put(`/sedes/${id}/turno-defecto`, { turnoDefectoId, diasTurnoDefecto });
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/sedes/${id}`);
    },
    getDispositivosSede: async (sedeId: number): Promise<Dispositivo[]> => {
        const response = await api.get(`/sedes/${sedeId}/dispositivos`);
        return response.data;
    },
    addDispositivoSede: async (sedeId: number, dispositivo: Partial<Dispositivo>): Promise<Dispositivo> => {
        const response = await api.post(`/sedes/${sedeId}/dispositivos`, dispositivo);
        return response.data;
    }
};

export const dispositivoService = {
    getAll: async (): Promise<Dispositivo[]> => {
        const response = await api.get('/dispositivos');
        return response.data;
    },
    update: async (id: number, dispositivo: Partial<Dispositivo>): Promise<Dispositivo> => {
        const response = await api.put(`/dispositivos/${id}`, dispositivo);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/dispositivos/${id}`);
    }
};
