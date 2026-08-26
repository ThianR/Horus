import React, { useEffect, useState } from 'react';
import { 
    CalendarDays, 
    Edit, 
    Save,
    X,
    Clock,
    AlertCircle,
    UserCircle,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { asistenciaEditorService, AsistenciaDiaEditor, AsistenciaUpdateData } from '../services/asistenciaEditorService';

export default function AsistenciasPage() {
    const [asistencias, setAsistencias] = useState<AsistenciaDiaEditor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados del Modal
    const [editingAsistencia, setEditingAsistencia] = useState<AsistenciaDiaEditor | null>(null);
    const [formHoraEntrada, setFormHoraEntrada] = useState('');
    const [formHoraSalida, setFormHoraSalida] = useState('');
    const [formEstado, setFormEstado] = useState('');
    const [formIncidencias, setFormIncidencias] = useState('');

    useEffect(() => {
        cargarAsistencias();
    }, []);

    const cargarAsistencias = async () => {
        try {
            setIsLoading(true);
            const data = await asistenciaEditorService.getAsistenciasMensuales();
            setAsistencias(data);
        } catch (error: any) {
            toast.error(error.response?.data || "Error al cargar asistencias");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (asistencia: AsistenciaDiaEditor) => {
        setEditingAsistencia(asistencia);
        setFormHoraEntrada(asistencia.horaEntradaReal ? asistencia.horaEntradaReal.slice(0, 16) : '');
        setFormHoraSalida(asistencia.horaSalidaReal ? asistencia.horaSalidaReal.slice(0, 16) : '');
        setFormEstado(asistencia.estadoAsistencia);
        setFormIncidencias(asistencia.incidencias || '');
    };

    const handleSave = async () => {
        if (!editingAsistencia) return;
        
        try {
            const dataToUpdate: AsistenciaUpdateData = {
                estadoAsistencia: formEstado,
                incidencias: formIncidencias.trim() === '' ? null : formIncidencias,
            };
            
            // Solo mandamos si no están vacíos (o nullificamos si están vacíos)
            dataToUpdate.horaEntradaReal = formHoraEntrada ? `${formHoraEntrada}:00` : null;
            dataToUpdate.horaSalidaReal = formHoraSalida ? `${formHoraSalida}:00` : null;

            const toastId = toast.loading('Guardando cambios...');
            await asistenciaEditorService.actualizarAsistencia(editingAsistencia.id, dataToUpdate);
            toast.success('Asistencia actualizada correctamente', { id: toastId });
            
            setEditingAsistencia(null);
            cargarAsistencias();
        } catch (error: any) {
            toast.error(error.response?.data || "Error al actualizar asistencia");
        }
    };

    const formatTime = (isoString: string | null) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NORMAL': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'TARDANZA': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'FALTA': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'INCOMPLETO': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CalendarDays className="text-blue-500" />
                    Panel de Auditoría de Asistencias
                </h1>
                <p className="text-slate-400">
                    Administra, revisa y corrige las marcaciones del mes actual.
                </p>
            </div>

            {/* Tabla Principal */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider">
                                <th className="p-4 font-medium border-b border-slate-800">Fecha</th>
                                <th className="p-4 font-medium border-b border-slate-800">Empleado</th>
                                <th className="p-4 font-medium border-b border-slate-800">Turno</th>
                                <th className="p-4 font-medium border-b border-slate-800">Entrada / Salida</th>
                                <th className="p-4 font-medium border-b border-slate-800">Estado</th>
                                <th className="p-4 font-medium border-b border-slate-800 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                                            Cargando asistencias...
                                        </div>
                                    </td>
                                </tr>
                            ) : asistencias.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        No hay registros de asistencia para el mes actual.
                                    </td>
                                </tr>
                            ) : (
                                asistencias.map((a) => (
                                    <tr key={a.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 text-slate-300">
                                            {formatDate(a.fechaLaboral)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <UserCircle className="text-slate-500" size={18} />
                                                <div>
                                                    <div className="text-slate-200 font-medium">{a.empleado.nombreCompleto}</div>
                                                    <div className="text-slate-500 text-xs">ID: {a.empleado.documentoIdentidad}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm">
                                            {a.turnoAsignado ? a.turnoAsignado.nombre : 'Sin Turno'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 text-sm">
                                                <div className="flex items-center gap-2 text-emerald-400">
                                                    <Clock size={14} />
                                                    {formatTime(a.horaEntradaReal)}
                                                </div>
                                                <div className="flex items-center gap-2 text-rose-400">
                                                    <Clock size={14} />
                                                    {formatTime(a.horaSalidaReal)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(a.estadoAsistencia)}`}>
                                                    {a.estadoAsistencia}
                                                </span>
                                                {a.validadoPorSupervisor && (
                                                    <span className="flex items-center gap-1 text-[10px] text-blue-400 uppercase font-bold tracking-wider" title="Editado Manualmente por RRHH">
                                                        <CheckCircle2 size={12} /> Editado
                                                    </span>
                                                )}
                                                {a.incidencias && (
                                                    <span className="text-xs text-slate-500 max-w-[150px] truncate" title={a.incidencias}>
                                                        "{a.incidencias}"
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleEditClick(a)}
                                                className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-colors"
                                                title="Editar Asistencia"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Edición */}
            {editingAsistencia && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Edit size={20} className="text-blue-500" />
                                Modificar Asistencia
                            </h3>
                            <button onClick={() => setEditingAsistencia(null)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-start gap-3">
                                <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-blue-200 leading-relaxed">
                                    Estás editando el registro de <strong>{editingAsistencia.empleado.nombreCompleto}</strong> del día <strong>{formatDate(editingAsistencia.fechaLaboral)}</strong>. 
                                    Este cambio quedará registrado en auditoría.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 uppercase">Hora Entrada</label>
                                    <input 
                                        type="datetime-local" 
                                        value={formHoraEntrada}
                                        onChange={(e) => setFormHoraEntrada(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 uppercase">Hora Salida</label>
                                    <input 
                                        type="datetime-local" 
                                        value={formHoraSalida}
                                        onChange={(e) => setFormHoraSalida(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 uppercase">Estado de Asistencia</label>
                                <select 
                                    value={formEstado}
                                    onChange={(e) => setFormEstado(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                >
                                    <option value="NORMAL">Normal (Presente)</option>
                                    <option value="FALTA">Falta</option>
                                    <option value="TARDANZA">Tardanza</option>
                                    <option value="INCOMPLETO">Incompleto / Salida Anticipada</option>
                                    <option value="FERIADO">Feriado</option>
                                    <option value="LIBRE">Día Libre</option>
                                    <option value="REQUIERE_REVISION">Requiere Revisión</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 uppercase">Motivo / Incidencias</label>
                                <textarea 
                                    rows={3}
                                    value={formIncidencias}
                                    onChange={(e) => setFormIncidencias(e.target.value)}
                                    placeholder="Ej. Se presentó certificado médico, Omisión de marcado justificada, etc."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-800/30">
                            <button 
                                onClick={() => setEditingAsistencia(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                <Save size={16} />
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
