import api from './api';

export interface MarcacionRespuesta {
    nombreEmpleado: string;
    fecha: string;
    tipo: string;
    fueraDeSede?: boolean;
    mensajeAviso?: string;
}

export interface HealthStatus {
    status: string;
    service: string;
    model?: string;
}

export const asistenciaService = {
    checkPythonHealth: async (): Promise<boolean> => {
        try {
            // El backend tiene un proxy o el servicio está en 8001
            // Intentamos llamar a través del backend para evitar problemas de CORS directos si existieran
            // O directamente si está configurado en el backend
            const response = await api.get('/biometria/health');
            return response.data.status === 'ok';
        } catch (err) {
            return false;
        }
    },

    identificarRostro: async (fotoBlob: Blob, tipo: 'ENTRADA' | 'SALIDA' = 'ENTRADA', sedeId?: number): Promise<MarcacionRespuesta> => {
        const formData = new FormData();
        formData.append('foto', fotoBlob, 'captura.jpg');
        formData.append('tipo', tipo);
        if (sedeId) {
            formData.append('sedeId', sedeId.toString());
        }

        const response = await api.post('/marcaciones/identificar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    registrarRostro: async (empleadoId: number, fotosBlobs: Blob[]): Promise<string> => {
        const formData = new FormData();
        fotosBlobs.forEach((blob, index) => {
            formData.append('fotos', blob, `registro_${index}.jpg`);
        });

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
