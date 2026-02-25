import axios from 'axios';

export interface Empleado {
    id?: number;
    codigoEmpleado: string;
    nombreCompleto: string;
    numeroDocumento: string;
    email: string;
    estado: 'ACTIVO' | 'INACTIVO' | 'LICENCIA';
    createdAt?: string;
    usuarioId?: number;
    supervisorId?: number;
}

const API_URL = '/api/empleados';

export const empleadoService = {
    getTodos: async () => {
        const response = await axios.get<Empleado[]>(API_URL);
        return response.data;
    },

    getPorId: async (id: number) => {
        const response = await axios.get<Empleado>(`${API_URL}/${id}`);
        return response.data;
    },

    crear: async (empleado: Empleado) => {
        const response = await axios.post<Empleado>(API_URL, empleado);
        return response.data;
    },

    actualizar: async (id: number, empleado: Empleado) => {
        const response = await axios.put<Empleado>(`${API_URL}/${id}`, empleado);
        return response.data;
    },

    eliminar: async (id: number) => {
        await axios.delete(`${API_URL}/${id}`);
    }
};
