import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, User, LogOut, ChevronRight, Activity } from 'lucide-react';

interface Marcacion {
    uuid: string;
    timestampEvento: string;
    tipoEvento: string;
    metodoVerificacion: string;
    estadoProceso: string;
}

const MiPortalPage = () => {
    const { user } = useAuth();
    const [marcaciones, setMarcaciones] = useState<Marcacion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMarcaciones = async () => {
            try {
                const response = await api.get('/marcaciones/mis-marcaciones');
                setMarcaciones(response.data);
            } catch (error) {
                console.error("Error al obtener marcaciones:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMarcaciones();
    }, []);

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <User className="text-blue-500" size={32} />
                        Hola, {user?.username}
                    </h1>
                    <p className="text-slate-400 mt-1">Este es tu portal personal de asistencia.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Resumen Card */}
                <div className="glass rounded-2xl p-6 border border-slate-700/50 md:col-span-2">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="text-blue-400" />
                        Tus Últimas Marcaciones
                    </h2>
                    
                    {isLoading ? (
                        <div className="animate-pulse flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-slate-800/50 rounded-xl"></div>
                            ))}
                        </div>
                    ) : marcaciones.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Clock size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No tienes marcaciones recientes.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {marcaciones.slice(0, 5).map((m) => (
                                <div key={m.uuid} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${m.tipoEvento === 'ENTRADA' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            <LogOut size={20} className={m.tipoEvento === 'ENTRADA' ? 'rotate-180' : ''} />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{m.tipoEvento}</p>
                                            <p className="text-slate-400 text-sm flex items-center gap-2">
                                                <Calendar size={14} /> {formatDate(m.timestampEvento)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-white">{formatTime(m.timestampEvento)}</p>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{m.metodoVerificacion}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="glass rounded-2xl p-6 border border-slate-700/50 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Tu Horario</h2>
                        <p className="text-slate-400 mb-6">Tu turno asignado actualmente.</p>
                        
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                            <Clock size={32} className="text-blue-400 mx-auto mb-2" />
                            <p className="text-white font-medium">Turno Regular</p>
                            <p className="text-slate-300 font-bold text-lg">08:00 - 17:00</p>
                            <p className="text-slate-500 text-sm mt-1">Lun a Vie</p>
                        </div>
                    </div>
                    
                    <button className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors">
                        Ver Calendario Completo <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MiPortalPage;
