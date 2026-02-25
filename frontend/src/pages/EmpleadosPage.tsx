import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, UserPlus } from 'lucide-react';
import { empleadoService, Empleado } from '../services/empleadoService';
import EmpleadoForm from '../components/EmpleadoForm';

const EmpleadosPage = () => {
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | undefined>(undefined);

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestión de Empleados</h1>
                    <p className="text-slate-400">Administra el personal, sus legajos y accesos biométricos.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedEmpleado(undefined);
                        setShowForm(true);
                    }}
                    className="premium-gradient text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
                >
                    <UserPlus size={20} />
                    <span>Nuevo Empleado</span>
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

            <div className="glass rounded-2xl p-6">
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:border-blue-500 transition-all outline-none text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-700/50 text-slate-400 text-sm uppercase tracking-wider">
                                <th className="px-4 py-3 font-semibold">Código</th>
                                <th className="px-4 py-3 font-semibold">Nombre Completo</th>
                                <th className="px-4 py-3 font-semibold">DNI</th>
                                <th className="px-4 py-3 font-semibold">Email</th>
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
                                    <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors group">
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
                                                    <p className="font-medium text-white">{emp.nombreCompleto}</p>
                                                    <p className="text-xs text-slate-500">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-300">{emp.numeroDocumento}</td>
                                        <td className="px-4 py-4 text-slate-300">{emp.email}</td>
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
                                                    onClick={async () => {
                                                        if (confirm('¿Estás seguro de eliminar este empleado?')) {
                                                            await empleadoService.eliminar(emp.id!);
                                                            cargarEmpleados();
                                                        }
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
        </div>
    );
};

export default EmpleadosPage;
