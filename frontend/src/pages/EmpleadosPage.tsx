import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, UserPlus, CalendarDays, X, UserCircle, ShieldCheck, UserMinus } from 'lucide-react';
import { empleadoService, Empleado } from '../services/empleadoService';
import { asistenciaService } from '../services/asistenciaService';
import { logger } from '../services/loggerService';
import { toast } from 'sonner';
import EmpleadoForm from '../components/EmpleadoForm';
import AsignacionHorarioModal from '../components/AsignacionHorarioModal';
import RegistroBiometricoModal from '../components/RegistroBiometricoModal';
import DiasSemanaBadge from '../components/DiasSemanaBadge';

const EmpleadosPage = () => {
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | undefined>(undefined);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showAsignarHorario, setShowAsignarHorario] = useState(false);
    const [showRegistroBiom, setShowRegistroBiom] = useState(false);

    useEffect(() => {
        cargarEmpleados();
    }, []);

    const cargarEmpleados = async () => {
        try {
            const data = await empleadoService.getTodos();
            setEmpleados(data);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmpleados = empleados.filter(emp =>
        emp.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.codigoEmpleado.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredEmpleados.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredEmpleados.map(e => e.id!));
        }
    };

    const toggleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleAsignacionMasiva = async (payload: { empleadoIds: number[], turnoId: number, diasSemana: string, fechaInicio: string }) => {
        try {
            await empleadoService.asignacionMasiva(payload);
            setSelectedIds([]); // Limpiar selección tras éxito
            setShowAsignarHorario(false);
            // Mostrar mensaje de éxito si hubiera toast
        } catch (error) {
            console.error('Error al asignar horarios:', error);
            alert('Hubo un error al realizar la asignación masiva.');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Gestión de Empleados</h1>
                    <p className="text-slate-400 text-sm sm:text-base">Administra el personal, sus legajos y accesos biométricos.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedEmpleado(undefined);
                        setShowForm(true);
                    }}
                    className="premium-gradient text-white px-3 sm:px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all whitespace-nowrap"
                >
                    <UserPlus size={20} />
                    <span className="hidden sm:inline">Nuevo Empleado</span>
                </button>
            </div>

            {showForm && (
                <EmpleadoForm
                    empleado={selectedEmpleado}
                    supervisores={empleados}
                    onCancel={() => setShowForm(false)}
                    onSave={async (data) => {
                        try {
                            if (selectedEmpleado?.id) {
                                await empleadoService.actualizar(selectedEmpleado.id, data);
                            } else {
                                await empleadoService.crear(data);
                            }
                            setShowForm(false);
                            cargarEmpleados();
                        } catch (error) {
                            console.error('Error al guardar:', error);
                        }
                    }}
                />
            )}

            <div className="glass rounded-2xl p-6 relative">
                {/* Bulk Actions Toolbar */}
                <div className={`absolute top-0 left-0 right-0 h-16 bg-blue-600/90 backdrop-blur-md rounded-t-2xl flex items-center justify-between px-3 sm:px-6 z-10 transition-transform origin-top ${selectedIds.length > 0 ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
                    <div className="flex items-center gap-2 sm:gap-3 text-white">
                        <button onClick={() => setSelectedIds([])} className="hover:bg-blue-700/50 p-1.5 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                        <span className="font-semibold text-sm sm:text-base">{selectedIds.length} sel.</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAsignarHorario(true)}
                            className="bg-white/20 hover:bg-white/30 text-white px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 transition-colors"
                        >
                            <CalendarDays size={16} />
                            <span className="hidden sm:inline">Asignar Horario Masivo</span>
                            <span className="sm:hidden">Asignar</span>
                        </button>
                    </div>
                </div>

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
                                <th className="px-4 py-3 w-10">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 focus:ring-blue-500 focus:ring-offset-slate-900 text-blue-500 cursor-pointer"
                                            checked={selectedIds.length === filteredEmpleados.length && filteredEmpleados.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </div>
                                </th>
                                <th className="px-4 py-3 font-semibold">Código</th>
                                <th className="px-4 py-3 font-semibold">Nombre Completo</th>
                                <th className="px-4 py-3 font-semibold">DNI</th>
                                <th className="px-4 py-3 font-semibold">Horario Actual</th>
                                <th className="px-4 py-3 font-semibold">Estado</th>
                                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500 italic">
                                        Cargando empleados...
                                    </td>
                                </tr>
                            ) : filteredEmpleados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500 italic">
                                        {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay empleados registrados.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredEmpleados.map((emp) => (
                                    <tr key={emp.id} className={`hover:bg-slate-800/30 transition-colors group ${selectedIds.includes(emp.id!) ? 'bg-blue-500/5' : ''}`}>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 focus:ring-blue-500 focus:ring-offset-slate-900 text-blue-500 cursor-pointer"
                                                    checked={selectedIds.includes(emp.id!)}
                                                    onChange={() => toggleSelectOne(emp.id!)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20">
                                                {emp.codigoEmpleado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
                                                    {emp.nombreCompleto.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-white">{emp.nombreCompleto}</p>
                                                        {emp.biometriaRegistrada && (
                                                            <div title="Rostro Registrado" className="text-emerald-400">
                                                                <ShieldCheck size={14} strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-300">{emp.numeroDocumento}</td>
                                        <td className="px-4 py-4">
                                            {emp.turnoActual ? (
                                                <div className="flex flex-col">
                                                    <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/20 whitespace-nowrap w-fit">
                                                        {emp.turnoActual}
                                                    </span>
                                                    <DiasSemanaBadge diasSeleccionados={emp.diasTurnoActual} />
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 text-xs italic">Sin Horario</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${emp.estado === 'ACTIVO'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : emp.estado === 'LICENCIA'
                                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${emp.estado === 'ACTIVO' ? 'bg-emerald-400' : emp.estado === 'LICENCIA' ? 'bg-amber-400' : 'bg-red-400'}`}></span>
                                                {emp.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setSelectedEmpleado(emp);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedEmpleado(emp);
                                                        setShowRegistroBiom(true);
                                                    }}
                                                    className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/10"
                                                    title={emp.biometriaRegistrada ? "Actualizar Rostro" : "Registrar Rostro (Biometría)"}
                                                >
                                                    <UserCircle size={18} />
                                                </button>
                                                {emp.biometriaRegistrada && (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const idParaBorrar = emp.id;
                                                            console.log("INICIANDO BORRADO DIRECTO PARA ID:", idParaBorrar);

                                                            toast.promise(asistenciaService.eliminarRostro(idParaBorrar!), {
                                                                loading: 'Eliminando registro facial...',
                                                                success: () => {
                                                                    logger.info(`Borrado completado con éxito para ${emp.nombreCompleto}`);
                                                                    cargarEmpleados();
                                                                    return `Registro facial de ${emp.nombreCompleto} eliminado.`;
                                                                },
                                                                error: (err) => {
                                                                    logger.error('Fallo en borrado biometría:', err);
                                                                    return 'Error al eliminar el registro facial.';
                                                                },
                                                            });
                                                        }}
                                                        className="p-2 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors border border-amber-500/10"
                                                        style={{ cursor: 'pointer', zIndex: 50 }}
                                                        title="Borrar Registro Facial"
                                                    >
                                                        <UserMinus size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        toast(`¿Deseas eliminar permanentemente a ${emp.nombreCompleto}?`, {
                                                            action: {
                                                                label: 'Eliminar',
                                                                onClick: async () => {
                                                                    try {
                                                                        await empleadoService.eliminar(emp.id!);
                                                                        toast.success('Empleado eliminado');
                                                                        cargarEmpleados();
                                                                    } catch (error) {
                                                                        toast.error('No se pudo eliminar al empleado');
                                                                    }
                                                                }
                                                            },
                                                            cancel: {
                                                                label: 'Cancelar',
                                                                onClick: () => { }
                                                            }
                                                        });
                                                    }}
                                                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors">
                                                    <MoreVertical size={18} />
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

            <AsignacionHorarioModal
                isOpen={showAsignarHorario}
                onClose={() => setShowAsignarHorario(false)}
                onSave={handleAsignacionMasiva}
                selectedIds={selectedIds}
            />

            {showRegistroBiom && selectedEmpleado && (
                <RegistroBiometricoModal
                    isOpen={showRegistroBiom}
                    onClose={() => {
                        setShowRegistroBiom(false);
                        setSelectedEmpleado(undefined);
                        cargarEmpleados();
                    }}
                    empleadoId={selectedEmpleado.id!}
                    nombreEmpleado={selectedEmpleado.nombreCompleto}
                />
            )}
        </div>
    );
};

export default EmpleadosPage;
