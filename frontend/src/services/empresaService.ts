import api from './api';

export interface Empresa {
  id?: number;
  nombre: string;
  identificacionFiscal: string;
  direccion: string;
  telefono: string;
  activo: boolean;
}

const empresaService = {
  getActual: async (): Promise<Empresa> => {
    const response = await api.get('/empresas/actual');
    return response.data;
  },

  getAll: async (): Promise<Empresa[]> => {
    const response = await api.get('/empresas');
    return response.data;
  },

  update: async (id: number, empresa: Empresa): Promise<Empresa> => {
    const response = await api.put(`/empresas/${id}`, empresa);
    return response.data;
  },

  crear: async (empresa: Empresa): Promise<Empresa> => {
    const response = await api.post('/empresas', empresa);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/empresas/${id}`);
  }
};

export default empresaService;
