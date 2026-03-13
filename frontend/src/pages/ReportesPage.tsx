import { useState, useEffect } from 'react';
import { 
    FileSpreadsheet, FileText, FileJson, Download, 
    Calendar, Filter, AreaChart, PieChart, Cpu, 
    Upload, Info, Search, MapPin, User, ChevronRight,
    ArrowUpRight, Clock, AlertCircle, CheckCircle2
} from 'lucide-react';
import { reporteService } from '../services/reporteService';
import { sedeService, Sede } from '../services/sedeService';
import empresaService from '../services/empresaService';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const ReportesPage = () => {
    const [loading, setLoading] = useState<string | null>(null);
    const [asistencias, setAsistencias] = useState<any[]>([]);
    const [sedes, setSedes] = useState<Sede[]>([]);
    
    const [empresaActual, setEmpresaActual] = useState<any>(null);
    const [filtros, setFiltros] = useState({
        inicio: new Date(new Date().setDate(1)).toISOString().split('T')[0], // Inicio de mes
        fin: new Date().toISOString().split('T')[0], // Hoy
        sedeId: '',
        empleadoId: '',
        busqueda: ''
    });

    useEffect(() => {
        cargarSedes();
        fetchAsistencias();
        cargarEmpresa();
    }, []);

    const cargarEmpresa = async () => {
        try {
            const data = await empresaService.getActual();
            setEmpresaActual(data);
        } catch (error) {}
    };

    const cargarSedes = async () => {
        try {
            const data = await sedeService.getAll();
            setSedes(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAsistencias = async () => {
        setLoading('fetching');
        try {
            const data = await reporteService.getAsistencias({
                inicio: filtros.inicio,
                fin: filtros.fin,
                sedeId: filtros.sedeId ? parseInt(filtros.sedeId) : undefined,
                empleadoId: filtros.empleadoId ? parseInt(filtros.empleadoId) : undefined
            });
            setAsistencias(data);
        } catch (error) {
            toast.error("Error al cargar registros");
        } finally {
            setLoading(null);
        }
    };

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
            fetchAsistencias();
        } catch (error) {
            toast.error('Error al importar el archivo de logs');
        } finally {
            setLoading(null);
            event.target.value = '';
        }
    };

    const handleCierreManual = async () => {
        if (!empresaActual?.id) return;
        
        const ok = window.confirm(`¿Estás seguro de cerrar el día ${filtros.fin}? Se procesarán las faltas para todos los empleados activos sin registro.`);
        if (!ok) return;

        setLoading('cierre');
        try {
            const res = await reporteService.ejecutarCierreManual(empresaActual.id, filtros.fin);
            toast.success(`${res.mensaje}: Se generaron ${res.registrosCreados} faltas.`);
            fetchAsistencias();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al ejecutar el cierre");
        } finally {
            setLoading(null);
        }
    };

    // Estadísticas calculadas
    const stats = {
        total: asistencias.length,
        presentes: asistencias.filter(a => a.horaEntradaReal).length,
        tardanzas: asistencias.filter(a => a.estadoAsistencia === 'TARDANZA').length,
        faltas: asistencias.filter(a => a.estadoAsistencia === 'FALTA').length
    };

    const filteredAsistencias = asistencias.filter(a => {
        const busqueda = filtros.busqueda.toLowerCase();
        const nombre = a.empleado?.nombreCompleto?.toLowerCase() || '';
        const codigo = a.empleado?.codigoEmpleado || '';
        
        return nombre.includes(busqueda) || codigo.includes(busqueda);
    });

    const limpiarFiltros = () => {
        setFiltros({
            inicio: new Date(new Date().setDate(1)).toISOString().split('T')[0],
            fin: new Date().toISOString().split('T')[0],
            sedeId: '',
            empleadoId: '',
            busqueda: ''
        });
        setTimeout(() => fetchAsistencias(), 100);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        Reportes de Asistencia
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 font-black uppercase tracking-widest">Analytics v2.0</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Visualiza y exporta el rendimiento de tu personal en tiempo real.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleCierreManual}
                        disabled={loading === 'cierre' || !empresaActual}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl border border-white/5 hover:bg-slate-700 hover:text-white transition-all group"
                        title="Procesar faltas del día seleccionado"
                    >
                        {loading === 'cierre' ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : <Lock size={18} />}
                        <span className="text-xs font-bold uppercase tracking-wider">Cerrar Día</span>
                    </button>
                    <button onClick={() => handleDownload('excel')} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all group">
                        <FileSpreadsheet size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider">Excel</span>
                    </button>
                    <button onClick={() => handleDownload('pdf')} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all group">
                        <FileText size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider">PDF</span>
                    </button>
                    <button onClick={() => handleDownload('dat')} className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all group">
                        <Cpu size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider">DAT (ZKT)</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Registros', value: stats.total, icon: <Calendar />, color: 'blue' },
                    { label: 'Presentes', value: stats.presentes, icon: <CheckCircle2 />, color: 'emerald' },
                    { label: 'Tardanzas', value: stats.tardanzas, icon: <Clock />, color: 'amber' },
                    { label: 'Faltas', value: stats.faltas, icon: <AlertCircle />, color: 'rose' }
                ].map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-${stat.color}-400`}>
                            {stat.icon}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filtros e Interacción */}
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex flex-wrap gap-6 items-end">
                    <div className="flex-1 min-w-[300px] space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Buscar Empleado / Código</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text" 
                                placeholder="Nombre completo o ID..."
                                className="form-input pl-12"
                                value={filtros.busqueda}
                                onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-64 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Fecha Inicio</label>
                        <input 
                            type="date" 
                            className="form-input"
                            value={filtros.inicio}
                            onChange={(e) => setFiltros({...filtros, inicio: e.target.value})}
                        />
                    </div>

                    <div className="w-full md:w-64 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Fecha Fin</label>
                        <input 
                            type="date" 
                            className="form-input"
                            value={filtros.fin}
                            onChange={(e) => setFiltros({...filtros, fin: e.target.value})}
                        />
                    </div>

                    <div className="w-full md:w-64 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Sede</label>
                        <select 
                            className="form-input cursor-pointer"
                            value={filtros.sedeId}
                            onChange={(e) => setFiltros({...filtros, sedeId: e.target.value})}
                        >
                            <option value="">Todas las Sedes</option>
                            {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                    </div>

                    <button 
                        onClick={fetchAsistencias}
                        disabled={loading === 'fetching'}
                        className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                        title="Filtrar"
                    >
                        <Filter size={20} />
                    </button>

                    <button 
                        onClick={limpiarFiltros}
                        disabled={loading === 'fetching'}
                        className="p-4 bg-white/5 text-slate-400 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
                        title="Limpiar Filtros"
                    >
                        <Search size={20} />
                    </button>
                </div>

                {/* Tabla de Resultados */}
                <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-black/20">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Empleado</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Fecha</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Horario</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Entrada</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Salida</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Tardanza</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading === 'fetching' ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                                        Consultando base de datos...
                                    </td>
                                </tr>
                            ) : filteredAsistencias.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-slate-500">
                                        No se encontraron registros para los filtros seleccionados.
                                    </td>
                                </tr>
                            ) : filteredAsistencias.map((asistencia) => (
                                <tr key={asistencia.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black border border-indigo-500/20">
                                                {asistencia.empleado.nombreCompleto.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{asistencia.empleado.nombreCompleto}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">{asistencia.empleado.codigoEmpleado}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                                        {asistencia.fechaLaboral}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-400 capitalize">
                                            {asistencia.turnoAsignado?.nombre || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`text-sm font-black ${asistencia.horaEntradaReal ? 'text-white' : 'text-slate-600'}`}>
                                                {asistencia.horaEntradaReal ? new Date(asistencia.horaEntradaReal).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                            </span>
                                            {asistencia.turnoAsignado?.segmentos?.[0]?.horaEntrada && (
                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                                                    Prog: {asistencia.turnoAsignado.segmentos[0].horaEntrada.substring(0, 5)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`text-sm font-black ${asistencia.horaSalidaReal ? 'text-white' : 'text-slate-600'}`}>
                                                {asistencia.horaSalidaReal ? new Date(asistencia.horaSalidaReal).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                            </span>
                                            {asistencia.turnoAsignado?.segmentos?.[0]?.horaSalida && (
                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                                                    Prog: {asistencia.turnoAsignado.segmentos[0].horaSalida.substring(0, 5)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border
                                            ${asistencia.estadoAsistencia === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                              asistencia.estadoAsistencia === 'TARDANZA' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                              asistencia.estadoAsistencia === 'FALTA' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                              'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                            {asistencia.estadoAsistencia}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {asistencia.minsTardanza > 0 ? (
                                            <span className="text-sm font-black text-amber-500">
                                                {asistencia.minsTardanza >= 60 
                                                    ? `+${(asistencia.minsTardanza / 60).toFixed(1)}h` 
                                                    : `+${asistencia.minsTardanza}m`}
                                            </span>
                                        ) : <span className="text-slate-600">--</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Importador Global */}
            <div className="glass p-10 rounded-[2.5rem] border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-110">
                    <Upload size={120} className="text-blue-400" />
                </div>
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-widest">Sincronización Legacy</span>
                            <h2 className="text-2xl font-black text-white">Importador Universal de Logs</h2>
                        </div>
                        <p className="text-slate-400 leading-relaxed mb-6 font-medium">
                            Sincroniza marcaciones desde terminales físicos externos (ZKTeco, Anviz, Dahua).
                            El sistema procesa archivos <code className="text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded">.dat</code> e integra las marcas automáticamente al motor de Oculus.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <label className={`relative group cursor-pointer ${loading === 'import' ? 'pointer-events-none opacity-50' : ''}`}>
                            <input type="file" className="hidden" accept=".dat,.txt" onChange={handleImport} />
                            <div className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-500/30 hover:bg-blue-500 transition-all hover:scale-105">
                                {loading === 'import' ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Upload size={20} />}
                                {loading === 'import' ? 'Sincronizando...' : 'Cargar Logs .DAT'}
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportesPage;
