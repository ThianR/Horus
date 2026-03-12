import { useState } from 'react';
import { FileSpreadsheet, FileText, FileJson, Download, Calendar, Filter, AreaChart, PieChart, Cpu, Upload, Info } from 'lucide-react';
import { reporteService } from '../services/reporteService';
import { toast } from 'sonner';

const ReportesPage = () => {
    const [loading, setLoading] = useState<string | null>(null);

    const handleDownload = async (type: 'excel' | 'pdf' | 'csv' | 'dat') => {
        setLoading(type);
        try {
            if (type === 'excel') await reporteService.descargarExcel();
            else if (type === 'pdf') await reporteService.descargarPdf();
            else if (type === 'csv') await reporteService.descargarCsv();
            else if (type === 'dat') await reporteService.descargarDat();
            toast.success(`Reporte ${type.toUpperCase()} generado correctamente`);
        } catch (error) {
            console.error(error);
            toast.error(`Error al generar el reporte ${type.toUpperCase()}`);
        } finally {
            setLoading(null);
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading('import');
        try {
            const response = await reporteService.importarLogs(file);
            toast.success(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Error al importar el archivo de logs');
        } finally {
            setLoading(null);
            // Reset input
            event.target.value = '';
        }
    };

    const reportesDisponibles = [
        {
            id: 'excel',
            title: 'Reporte Mensual Detallado',
            description: 'Incluye hojas separadas por empleado, cálculos de horas extra y tardanzas exactas.',
            icon: <FileSpreadsheet className="text-emerald-400" size={32} />,
            ext: '.xlsx',
            color: 'emerald'
        },
        {
            id: 'pdf',
            title: 'Resumen de Asistencia PDF',
            description: 'Documento oficial con firma digital opcional para auditorías y revisiones rápidas.',
            icon: <FileText className="text-rose-400" size={32} />,
            ext: '.pdf',
            color: 'rose'
        },
        {
            id: 'csv',
            title: 'Exportación de Datos Crudos',
            description: 'Formato simple compatible con sistemas externos de nómina o bases de datos.',
            icon: <FileJson className="text-blue-400" size={32} />,
            ext: '.csv',
            color: 'blue'
        },
        {
            id: 'dat',
            title: 'Logs Transaccionales (ZKTeco)',
            description: 'Formato estándar compatible con ZKTime, Anviz y Hikvision para integración legacy.',
            icon: <Cpu className="text-amber-400" size={32} />,
            ext: '.dat',
            color: 'amber'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    Centro de Reportes
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20 font-mono uppercase tracking-widest">BI & Analytics</span>
                </h1>
                <p className="text-slate-400 mt-2">Genera informes detallados de asistencia y rendimiento biométrico.</p>
            </div>

            {/* Filtros Globales (UI Placeholder por ahora) */}
            <div className="glass p-6 rounded-3xl border border-white/5 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-blue-400" />
                    <span className="text-sm font-medium text-slate-300">Periodo: Marzo 2026</span>
                </div>
                <div className="h-4 w-px bg-slate-700 hidden md:block"></div>
                <div className="flex items-center gap-3">
                    <Filter size={18} className="text-slate-400" />
                    <span className="text-sm text-slate-400">Todo el Personal</span>
                </div>
                <button className="ml-auto text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">
                    Cambiar Filtros
                </button>
            </div>

            {/* Grid de Reportes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reportesDisponibles.map((reporte) => (
                    <div key={reporte.id} className="group relative flex flex-col p-8 rounded-[2rem] glass border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden">
                        {/* Decoración de fondo */}
                        <div className={`absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4`}>
                            {reporte.icon}
                        </div>

                        <div className={`w-14 h-14 rounded-2xl bg-slate-900/50 flex items-center justify-center mb-6 border border-white/5`}>
                            {reporte.icon}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{reporte.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            {reporte.description}
                        </p>

                        <button
                            onClick={() => handleDownload(reporte.id as any)}
                            disabled={loading !== null}
                            className={`mt-auto w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm tracking-wide transition-all
                                ${reporte.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white shadow-emerald-500/10' :
                                    reporte.color === 'rose' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white shadow-rose-500/10' :
                                        'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white shadow-blue-500/10'}
                                disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading === reporte.id ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    Generando...
                                </span>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Descargar {reporte.ext}
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Info Adicional / Analytics Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-8">
                    <div className="p-6 bg-blue-500/10 rounded-3xl border border-blue-500/20">
                        <AreaChart size={40} className="text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2">Análisis de Tendencias</h4>
                        <p className="text-slate-400 text-sm">Próximamente: Gráficos interactivos de puntualidad y ausentismo por departamento.</p>
                    </div>
                </div>
                <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-8">
                    <div className="p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20">
                        <PieChart size={40} className="text-amber-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2">Estatísticas Biométricas</h4>
                        <p className="text-slate-400 text-sm">Visualiza el accuracy de los dispositivos y tiempos de respuesta del motor IA.</p>
                    </div>
                </div>
            </div>

            {/* Sección de Importación Universal (Ingeniería Inversa) */}
            <div className="glass p-10 rounded-[2.5rem] border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Upload size={120} className="text-blue-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/20 uppercase tracking-widest">Ingeniería Inversa</span>
                            <h2 className="text-2xl font-bold text-white">Importador Universal de Logs</h2>
                        </div>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            Sincroniza marcaciones desde dispositivos físicos externos (ZKTeco, Hikvision, Dahua).
                            Sube archivos <code className="text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded">.dat</code> o <code className="text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded">.txt</code> para integrarlos automáticamente en el ecosistema Oculus.
                        </p>
                        <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                            <Info size={18} className="text-blue-400 mt-0.5" />
                            <p className="text-xs text-slate-500 leading-relaxed">
                                El sistema valida automáticamente los códigos de empleado y previene registros duplicados basados en el timestamp exacto del evento.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <label className={`relative group cursor-pointer ${loading === 'import' ? 'pointer-events-none opacity-50' : ''}`}>
                            <input
                                type="file"
                                className="hidden"
                                accept=".dat,.txt"
                                onChange={handleImport}
                            />
                            <div className="px-8 py-5 bg-blue-500 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all hover:scale-105 active:scale-95">
                                {loading === 'import' ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Upload size={20} />
                                )}
                                {loading === 'import' ? 'Procesando...' : 'Seleccionar Archivo'}
                            </div>
                        </label>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Formatos: .DAT, .TXT</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportesPage;
