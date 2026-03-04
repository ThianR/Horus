import api from './api';

export interface MarcacionRespuesta {
    nombreEmpleado: string;
    fecha: string;
    tipo: string;
}

export const asistenciaService = {
    identificarRostro: async (fotoBlob: Blob, tipo: 'ENTRADA' | 'SALIDA' = 'ENTRADA'): Promise<MarcacionRespuesta> => {
        const formData = new FormData();
        formData.append('foto', fotoBlob, 'captura.jpg');
        formData.append('tipo', tipo);

        const response = await api.post('/marcaciones/identificar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    registrarRostro: async (empleadoId: number, fotoBlob: Blob): Promise<string> => {
        const formData = new FormData();
        formData.append('foto', fotoBlob, 'registro.jpg');

        const response = await api.post(`/biometria/registrar/${empleadoId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    eliminarRostro: async (empleadoId: number): Promise<string> => {
        const response = await api.delete(`/biometria/${empleadoId}`);
        return response.data;
    }
};
