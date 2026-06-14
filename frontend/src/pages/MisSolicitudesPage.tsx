import React, { useState, useEffect } from 'react';
import { solicitudService, SolicitudAusencia } from '../services/solicitudService';
import { Plus, Calendar, Clock, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MisSolicitudesPage = () => {
    const [solicitudes, setSolicitudes] = useState<SolicitudAusencia[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [tipo, setTipo] = useState('VACACIONES');
    const [motivo, setMotivo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    const cargarSolicitudes = async () => {
        try {
            const data = await solicitudService.getMisSolicitudes();
            setSolicitudes(data);
        } catch (error) {
            toast.error("Error al cargar las solicitudes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await solicitudService.crearSolicitud({
                fechaInicio,
                fechaFin,
                tipo,
                motivo
            });
            toast.success("Solicitud enviada correctamente");
            setIsModalOpen(false);
            setFechaInicio('');
            setFechaFin('');
            setMotivo('');
            cargarSolicitudes();
        } catch (error) {
            toast.error("Error al enviar la solicitud");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case 'APROBADA':
                return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle2 size={14}/> Aprobada</span>;
            case 'RECHAZADA':
                return <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle size={14}/> Rechazada</span>;
            default:
                return <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold flex items-center gap-1"><Clock size={14}/> Pendiente</span>;
        }
    };

    const getTipoLabel = (tipo: string) => {
        switch (tipo) {
            case 'VACACIONES': return 'Vacaciones';
            case 'LICENCIA_MEDICA': return 'Licencia Médica';
            case 'JUSTIFICACION_FALTA': return 'Justificación Falta';
            default: return 'Otro';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <FileText className="text-blue-500" size={32} />
                        Mis Solicitudes
                    </h1>
                    <p className="text-slate-400 mt-1">Gestiona tus permisos, vacaciones y licencias.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25"
                >
                    <Plus size={20} />
                    Nueva Solicitud
                </button>
            </div>

            <div className="glass rounded-2xl border border-slate-700/50 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                ) : solicitudes.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No tienes solicitudes registradas.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/50 border-b border-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-300">Tipo</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-300">Fechas</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-300">Motivo</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-300">Estado</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-300">Respuesta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {solicitudes.map((sol) => (
                                    <tr key={sol.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">
                                            {getTipoLabel(sol.tipo)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {sol.fechaInicio} al {sol.fechaFin}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 max-w-xs truncate" title={sol.motivo}>
                                            {sol.motivo}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(sol.estado)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm italic">
                                            {sol.comentarioRevisor || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Nueva Solicitud */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass border border-slate-700/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-700/50">
                            <h2 className="text-xl font-bold text-white">Solicitar Permiso</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Solicitud</label>
                                <select 
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="VACACIONES">Vacaciones</option>
                                    <option value="LICENCIA_MEDICA">Licencia Médica</option>
                                    <option value="JUSTIFICACION_FALTA">Justificación de Falta</option>
                                    <option value="OTRO">Otro</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Fecha Inicio</label>
                                    <input 
                                        type="date"
                                        required
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Fecha Fin</label>
                                    <input 
                                        type="date"
                                        required
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Motivo / Descripción</label>
                                <textarea 
                                    required
                                    rows={3}
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Explica brevemente el motivo de tu solicitud..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                                    Enviar Solicitud
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisSolicitudesPage;
