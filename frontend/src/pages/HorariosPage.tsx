import { useState, useEffect } from 'react';
import { Plus, Search, Clock, Edit2, Trash2, CalendarCheck } from 'lucide-react';
import { turnoService, TurnoPlantilla } from '../services/turnoService';
import TurnoForm from '../components/TurnoForm';
import { useConfirm } from '../contexts/ConfirmContext';
import { toast } from 'sonner';

const HorariosPage = () => {
    const { confirm } = useConfirm();
    const [turnos, setTurnos] = useState<TurnoPlantilla[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedTurno, setSelectedTurno] = useState<TurnoPlantilla | undefined>(undefined);

    useEffect(() => {
        cargarTurnos();
    }, []);

    const cargarTurnos = async () => {
        try {
            const data = await turnoService.getTodos();
            setTurnos(data);
        } catch (error) {
            console.error('Error al cargar turnos:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTurnos = turnos.filter(turno =>
        turno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turno.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestión de Horarios</h1>
                    <p className="text-slate-400">Define plantillas de turnos y reglas de asistencia.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedTurno(undefined);
                        setShowForm(true);
                    }}
                    className="premium-gradient text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
                >
                    <Plus size={20} />
                    <span>Nuevo Turno</span>
                </button>
            </div>

            {showForm && (
                <TurnoForm
                    turno={selectedTurno}
                    onCancel={() => setShowForm(false)}
                    onSave={async (data) => {
                        try {
                            if (selectedTurno?.id) {
                                await turnoService.actualizar(selectedTurno.id, data);
                            } else {
                                await turnoService.crear(data);
                            }
                            setShowForm(false);
                            cargarTurnos();
                        } catch (error) {
                            console.error('Error al guardar:', error);
                        }
                    }}
                />
            )}

            <div className="glass rounded-2xl p-6">
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:border-blue-500 transition-all outline-none text-white !pl-12"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-700/50 text-slate-400 text-sm uppercase tracking-wider">
                                <th className="px-4 py-3 font-semibold">Código</th>
                                <th className="px-4 py-3 font-semibold">Definición</th>
                                <th className="px-4 py-3 font-semibold">Tipo</th>
                                <th className="px-4 py-3 font-semibold">Horario (Segmentos)</th>
                                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500 italic">
                                        Cargando plantillas de horarios...
                                    </td>
                                </tr>
                            ) : filteredTurnos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500 italic">
                                        {searchTerm ? 'No se encontraron resultados.' : 'No hay turnos registrados.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredTurnos.map((turno) => (
                                    <tr key={turno.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-4 py-4">
                                            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20">
                                                {turno.codigo}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm">
                                                    <Clock size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{turno.nombre}</p>
                                                    <p className="text-xs text-slate-500">{turno.esNocturno ? ' Nocturno' : ' Diurno'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${turno.tipoTurno === 'FIJO' ? 'bg-emerald-500/20 text-emerald-400' :
                                                turno.tipoTurno === 'FLEXIBLE' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {turno.tipoTurno}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                {turno.segmentos.map((seg, idx) => (
                                                    <div key={idx} className="text-sm text-slate-300 flex items-center gap-2">
                                                        <CalendarCheck size={14} className="text-slate-500" />
                                                        {seg.horaEntrada.substring(0, 5)} - {seg.horaSalida.substring(0, 5)}
                                                        {seg.diaSiguienteSalida && <span className="text-[10px] bg-red-500/20 text-red-400 px-1 rounded">+1d</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTurno(turno);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (await confirm({ message: '¿Eliminar esta plantilla de turno?', type: 'danger' })) {
                                                            try {
                                                                await turnoService.eliminar(turno.id!);
                                                                toast.success('Plantilla de turno eliminada');
                                                                cargarTurnos();
                                                            } catch (error: any) {
                                                                toast.error(error.response?.data?.mensaje || 'Error al eliminar la plantilla de turno');
                                                            }
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HorariosPage;
