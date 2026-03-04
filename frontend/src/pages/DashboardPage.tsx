import { useState, useEffect } from 'react';
import { Users, Clock, AlertCircle, CheckCircle2, Search, ArrowUpRight, Activity, Calendar } from 'lucide-react';
import { dashboardService, DashboardStats, EventoReciente, AsistenciaHoy } from '../services/dashboardService';

const DashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [eventos, setEventos] = useState<EventoReciente[]>([]);
    const [asistencias, setAsistencias] = useState<AsistenciaHoy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        cargarDatos();
        // Polling cada 30 segundos
        const interval = setInterval(cargarDatos, 30000);
        return () => clearInterval(interval);
    }, []);

    const cargarDatos = async () => {
        try {
            const [statsData, eventosData, asistenciasData] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getEventosRecientes(),
                dashboardService.getAsistenciasHoy()
            ]);
            setStats(statsData);
            setEventos(eventosData);
            setAsistencias(asistenciasData);
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAsistencias = asistencias.filter(a =>
        a.empleado.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.empleado.codigoEmpleado.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '--:--';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header con Título Dinámico */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        Dashboard de Asistencia
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20 font-mono uppercase">En Vivo</span>
                    </h1>
                    <p className="text-slate-400 mt-1">Supervisión en tiempo real del personal y eventos biométricos.</p>
                </div>
                <div className="flex items-center gap-3 glass px-4 py-2 rounded-2xl border border-white/5">
                    <Calendar size={18} className="text-blue-400" />
                    <span className="text-sm font-medium text-slate-300">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Stats Grid - Premium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        icon: <Users className="text-blue-400" size={24} />,
                        label: 'Total Personal',
                        value: stats?.totalEmpleados || 0,
                        color: 'from-blue-500/20 to-indigo-500/20',
                        border: 'border-blue-500/20'
                    },
                    {
                        icon: <Activity className="text-emerald-400" size={24} />,
                        label: 'Presentes Hoy',
                        value: stats?.presentesHoy || 0,
                        color: 'from-emerald-500/20 to-teal-500/20',
                        border: 'border-emerald-500/20'
                    },
                    {
                        icon: <Clock className="text-amber-400" size={24} />,
                        label: 'Tardanzas',
                        value: stats?.tardanzasHoy || 0,
                        color: 'from-amber-500/20 to-orange-500/20',
                        border: 'border-amber-500/20',
                        alert: (stats?.tardanzasHoy || 0) > 0
                    },
                    {
                        icon: <AlertCircle className="text-rose-400" size={24} />,
                        label: 'Alertas',
                        value: stats?.alertas || 0,
                        color: 'from-rose-500/20 to-pink-500/20',
                        border: 'border-rose-500/20',
                        alert: (stats?.alertas || 0) > 0
                    }
                ].map((stat, idx) => (
                    <div key={idx} className={`glass p-6 rounded-3xl border ${stat.border} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <div className="relative flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-900/50 rounded-2xl border border-white/5">
                                {stat.icon}
                            </div>
                            {stat.alert && (
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Listado de Asistencias del Día */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass rounded-3xl p-6 border border-white/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <CheckCircle2 className="text-emerald-400" size={20} />
                                Personal en Planta
                            </h3>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Filtrar empleados..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-xs outline-none focus:border-blue-500 text-white !pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-700/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                                        <th className="px-4 py-3">Empleado</th>
                                        <th className="px-4 py-3">Entrada</th>
                                        <th className="px-4 py-3">Salida</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3 text-right">Tardanza</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {loading ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-slate-500 italic">Cargando datos de hoy...</td></tr>
                                    ) : filteredAsistencias.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-slate-500 italic">No hay registros de asistencia para hoy.</td></tr>
                                    ) : (
                                        filteredAsistencias.map((a) => (
                                            <tr key={a.id} className="group hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-white/5">
                                                            {a.empleado.codigoEmpleado}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-200">{a.empleado.nombreCompleto}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 font-mono text-xs text-slate-400">{formatTime(a.horaEntradaReal)}</td>
                                                <td className="px-4 py-4 font-mono text-xs text-slate-400">{formatTime(a.horaSalidaReal)}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${a.estadoAsistencia === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        a.estadoAsistencia === 'TARDANZA' ? 'bg-amber-500/10 text-amber-400' :
                                                            'bg-rose-500/10 text-rose-400'
                                                        }`}>
                                                        {a.estadoAsistencia}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    {a.minsTardanza > 0 && (
                                                        <span className="text-xs text-rose-400 font-medium">+{a.minsTardanza}m</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Feed de Eventos Recientes */}
                <div className="space-y-4">
                    <div className="glass rounded-3xl p-6 border border-white/5 h-full">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className="text-blue-400" size={20} />
                            Actividad Reciente
                        </h3>
                        <div className="space-y-6">
                            {loading ? (
                                <p className="text-center text-slate-500 italic py-10">Cargando eventos...</p>
                            ) : eventos.length === 0 ? (
                                <p className="text-center text-slate-500 italic py-10">Sin actividad reciente.</p>
                            ) : (
                                eventos.map((e, idx) => (
                                    <div key={e.id} className="relative pl-6 border-l border-slate-800 group">
                                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{formatTime(e.timestamp)}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${e.tipo === 'ENTRADA' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {e.tipo}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-200 truncate">{e.empleadoNombre}</p>
                                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                                            <ArrowUpRight size={12} className="text-slate-600" />
                                            <span>vía {e.metodo.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {!loading && eventos.length > 0 && (
                            <button className="w-full mt-8 py-3 text-xs font-bold text-blue-400 hover:bg-blue-500/10 rounded-2xl transition-all border border-blue-500/20">
                                Ver Todo el Historial
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
