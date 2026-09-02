import api from './api';
import { getPersistentDeviceId } from '../utils/deviceFingerprint';

export interface ValidacionDispositivo {
    id: number;
    nombre: string;
    sedeId: number;
    empresaId: number;
    tipo: string;
}

export const dispositivoAuthService = {
    validarDispositivoActual: async (): Promise<ValidacionDispositivo | null> => {
        try {
            const uuid = await getPersistentDeviceId();
            const response = await api.get(`/dispositivos/validar/${uuid}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }
};
