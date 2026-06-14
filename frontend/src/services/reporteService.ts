import api from './api';

export const reporteService = {
    descargarExcel: async () => {
        const response = await api.get('/reportes/asistencia.xlsx', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'reporte_asistencia.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    descargarPdf: async () => {
        const response = await api.get('/reportes/asistencia.pdf', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'reporte_asistencia.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    descargarCsv: async () => {
        const response = await api.get('/reportes/asistencia.csv', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'reporte_asistencia.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    descargarDat: async () => {
        const response = await api.get('/reportes/asistencia.dat', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'GLOG_001.dat');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    importarLogs: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/reportes/importar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    getAsistencias: async (filtros: { inicio?: string, fin?: string, sedeId?: number, empleadoId?: number }) => {
        const response = await api.get('/reportes', { params: filtros });
        return response.data;
    },

    ejecutarCierreManual: async (empresaId: number, fecha?: string) => {
        const response = await api.post(`/motor/cierre/${empresaId}`, null, {
            params: { fecha }
        });
        return response.data;
    },

    descargarNominaExcel: async (inicio: string, fin: string) => {
        const response = await api.get('/nomina/exportar-excel', {
            params: { inicio, fin },
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `nomina_${inicio}_al_${fin}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    getResumenNomina: async (inicio: string, fin: string) => {
        const response = await api.get('/nomina/resumen', {
            params: { inicio, fin }
        });
        return response.data;
    }
};
