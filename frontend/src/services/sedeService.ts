import axios from 'axios';

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

const API_URL = '/api/sedes';

export const sedeService = {
    getAll: async (): Promise<Sede[]> => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    getById: async (id: number): Promise<Sede> => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },
    create: async (sede: Partial<Sede>): Promise<Sede> => {
        const response = await axios.post(API_URL, sede);
        return response.data;
    },
    update: async (id: number, sede: Partial<Sede>): Promise<Sede> => {
        const response = await axios.put(`${API_URL}/${id}`, sede);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/${id}`);
    },
    getDispositivosSede: async (sedeId: number): Promise<Dispositivo[]> => {
        const response = await axios.get(`${API_URL}/${sedeId}/dispositivos`);
        return response.data;
    },
    addDispositivoSede: async (sedeId: number, dispositivo: Partial<Dispositivo>): Promise<Dispositivo> => {
        const response = await axios.post(`${API_URL}/${sedeId}/dispositivos`, dispositivo);
        return response.data;
    }
};

export const dispositivoService = {
    getAll: async (): Promise<Dispositivo[]> => {
        const response = await axios.get('/api/dispositivos');
        return response.data;
    },
    update: async (id: number, dispositivo: Partial<Dispositivo>): Promise<Dispositivo> => {
        const response = await axios.put(`/api/dispositivos/${id}`, dispositivo);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await axios.delete(`/api/dispositivos/${id}`);
    }
};
