import api from './api';

export interface Empleado {
    id?: number;
    codigoEmpleado: string;
    nombreCompleto: string;
    numeroDocumento: string;
    email: string;
    estado: 'ACTIVO' | 'INACTIVO' | 'LICENCIA';
    turnoActual?: string;
    diasTurnoActual?: string;
    createdAt?: string;
    usuarioId?: number;
    supervisorId?: number;
    biometriaRegistrada?: boolean;
    empresa?: any;
    sedeId?: number;
    sedeActual?: string;
    rolSistema?: string;
}

export const empleadoService = {
    getTodos: async () => {
        const response = await api.get<Empleado[]>('/empleados');
        return response.data;
    },

    getPorId: async (id: number) => {
        const response = await api.get<Empleado>(`/empleados/${id}`);
        return response.data;
    },

    crear: async (empleado: Empleado) => {
        const response = await api.post<Empleado>('/empleados', empleado);
        return response.data;
    },

    actualizar: async (id: number, empleado: Empleado) => {
        const response = await api.put<Empleado>(`/empleados/${id}`, empleado);
        return response.data;
    },

    eliminar: async (id: number) => {
        await api.delete(`/empleados/${id}`);
    },

    asignacionMasiva: async (payload: { empleadoIds: number[], turnoId: number, diasSemana: string, fechaInicio: string }) => {
        const response = await api.post('/empleados/asignacion-masiva', payload);
        return response.data;
    },

    importarMasivo: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/empleados/importar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};
