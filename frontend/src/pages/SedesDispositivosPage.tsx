import React, { useState, useEffect } from 'react';
import { MapPin, Server, Search, Plus, Trash2, Edit2, Play, Pause, AlertCircle, Settings2, Save, X } from 'lucide-react';
import { Sede, Dispositivo, sedeService, dispositivoService } from '../services/sedeService';
import { TurnoPlantilla, turnoService } from '../services/turnoService';
import DiasSemanaBadge from '../components/DiasSemanaBadge';
import { useConfirm } from '../contexts/ConfirmContext';

const SedesDispositivosPage = () => {
    const { confirm } = useConfirm();
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
    const [loadingSedes, setLoadingSedes] = useState(true);
    const [loadingDispositivos, setLoadingDispositivos] = useState(false);
    const [turnos, setTurnos] = useState<TurnoPlantilla[]>([]);

    const [selectedSedeId, setSelectedSedeId] = useState<number | null>(null);
    const [showSedeModal, setShowSedeModal] = useState(false);
    const [showDispositivoModal, setShowDispositivoModal] = useState(false);

    // Formularios
    const [sedeFormData, setSedeFormData] = useState<Partial<Sede>>({
        nombre: '',
        direccion: '',
        codigoExterno: '',
        turnoDefectoId: null,
        diasTurnoDefecto: 'LUN,MAR,MIE,JUE,VIE'
    });
    const [dispositivoFormData, setDispositivoFormData] = useState<Partial<Dispositivo>>({
        nombre: '',
        uuidHardware: '',
        tipo: 'KIOSCO',
        estado: 'INACTIVO',
        ipAddress: ''
    });

    useEffect(() => {
        cargarSedes();
        cargarTurnos();
    }, []);

    const cargarTurnos = async () => {
        try {
            const data = await turnoService.getTodos();
            setTurnos(data);
        } catch (error) {
            console.error('Error cargando turnos', error);
        }
    };

    useEffect(() => {
        if (selectedSedeId) {
            cargarDispositivos(selectedSedeId);
        } else {
            setDispositivos([]);
        }
    }, [selectedSedeId]);

    const cargarSedes = async () => {
        try {
            setLoadingSedes(true);
            const data = await sedeService.getAll();
            setSedes(data);
            if (data.length > 0 && !selectedSedeId) {
                setSelectedSedeId(data[0].id);
            }
        } catch (error) {
            console.error('Error cargando sedes:', error);
        } finally {
            setLoadingSedes(false);
        }
    };

    const cargarDispositivos = async (sedeId: number) => {
        try {
            setLoadingDispositivos(true);
            const data = await sedeService.getDispositivosSede(sedeId);
            setDispositivos(data);
        } catch (error) {
            console.error('Error cargando dispositivos:', error);
        } finally {
            setLoadingDispositivos(false);
        }
    };

    const handleSaveSede = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let savedSede;
            if (sedeFormData.id) {
                savedSede = await sedeService.update(sedeFormData.id, sedeFormData);
            } else {
                savedSede = await sedeService.create(sedeFormData);
            }
            // Guardar Turno por defecto con sus días
            await sedeService.asignarTurnoDefecto(
                savedSede.id,
                sedeFormData.turnoDefectoId ?? null,
                sedeFormData.diasTurnoDefecto
            );

            setShowSedeModal(false);
            cargarSedes();
        } catch (error) {
            console.error('Error guardando sede:', error);
        }
    };

    const handleDeleteSede = async (id: number) => {
        if (!(await confirm({ message: '¿Estás seguro de eliminar esta sede y sus dispositivos asociados?', type: 'danger' }))) return;
        try {
            await sedeService.delete(id);
            if (selectedSedeId === id) setSelectedSedeId(null);
            cargarSedes();
        } catch (error: any) {
            console.error('Error eliminando sede:', error);
            toast.error(error.response?.data?.mensaje || "Error al eliminar sede");
        }
    };

    const handleSaveDispositivo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSedeId) return;
        try {
            if (dispositivoFormData.id) {
                await dispositivoService.update(dispositivoFormData.id, dispositivoFormData);
            } else {
                await sedeService.addDispositivoSede(selectedSedeId, dispositivoFormData);
            }
            setShowDispositivoModal(false);
            cargarDispositivos(selectedSedeId);
        } catch (error) {
            console.error('Error guardando dispositivo:', error);
        }
    };

    const handleDeleteDispositivo = async (id: number) => {
        if (!(await confirm({ message: '¿Estás seguro de eliminar este dispositivo biométrico?', type: 'danger' }))) return;
        try {
            await dispositivoService.delete(id);
            if (selectedSedeId) cargarDispositivos(selectedSedeId);
        } catch (error: any) {
            console.error('Error eliminando dispositivo:', error);
            toast.error(error.response?.data?.mensaje || "Error al eliminar dispositivo");
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Cabecera general */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <MapPin className="text-blue-500" size={32} />
                        Infraestructura Física
                    </h1>
                    <p className="text-slate-400 mt-1">Gestión de Sedes Corporativas y Hardware Biométrico.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">

                {/* LISTADO DE SEDES */}
                <div className="lg:col-span-1 glass rounded-3xl p-4 sm:p-5 border border-white/5 flex flex-col h-auto lg:h-[700px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white">Sedes Activas</h2>
                        <button
                            onClick={() => { setSedeFormData({ nombre: '', direccion: '', codigoExterno: '', turnoDefectoId: null }); setShowSedeModal(true); }}
                            className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl transition-colors"
                            title="Nueva Sede"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {loadingSedes ? (
                            <p className="text-slate-500 text-sm text-center py-4">Cargando...</p>
                        ) : sedes.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-4">No hay sedes registradas.</p>
                        ) : (
                            sedes.map(sede => (
                                <div
                                    key={sede.id}
                                    onClick={() => setSelectedSedeId(sede.id)}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedSedeId === sede.id
                                        ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                        : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <h3 className={`font-semibold text-sm ${selectedSedeId === sede.id ? 'text-blue-400' : 'text-slate-200'}`}>
                                        {sede.nombre}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mt-1 truncate" title={sede.direccion}>{sede.direccion || 'Sin dirección'}</p>
                                    {sede.turnoDefecto && (
                                        <div className="mt-2 space-y-1">
                                            <div className="inline-block px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-lg border border-blue-500/20">
                                                Turno Defecto: {sede.turnoDefecto.nombre}
                                            </div>
                                            <DiasSemanaBadge diasSeleccionados={sede.diasTurnoDefecto} />
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-white/5">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSedeFormData({ ...sede, turnoDefectoId: sede.turnoDefecto?.id || null }); setShowSedeModal(true); }}
                                            className="text-slate-400 hover:text-blue-400 transition-colors tooltip" title="Editar"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteSede(sede.id); }}
                                            className="text-slate-400 hover:text-rose-400 transition-colors tooltip" title="Eliminar"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* AREA DE DISPOSITIVOS */}
                <div className="lg:col-span-3 glass rounded-3xl p-4 sm:p-6 border border-white/5 min-h-[400px] lg:h-[700px] flex flex-col">
                    {!selectedSedeId ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                            <Server size={48} className="text-slate-700" />
                            <p>Selecciona una Sede para visualizar sus dispositivos</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Server className="text-emerald-400" size={24} />
                                        Dispositivos Instalados
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">Sede: <span className="font-semibold text-slate-200">{sedes.find(s => s.id === selectedSedeId)?.nombre}</span></p>
                                </div>
                                <button
                                    onClick={() => { setDispositivoFormData({ nombre: '', uuidHardware: '', tipo: 'KIOSCO', estado: 'INACTIVO', ipAddress: '' }); setShowDispositivoModal(true); }}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                >
                                    <Plus size={16} /> Agregar HW
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {loadingDispositivos ? (
                                        <p className="text-slate-500 col-span-2 text-center py-10">Cargando dispositivos de la sede...</p>
                                    ) : dispositivos.length === 0 ? (
                                        <div className="col-span-2 text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5 border-dashed">
                                            <Server className="mx-auto text-slate-600 mb-3" size={32} />
                                            <p className="text-slate-400 text-sm">Esta sede no tiene hardware registrado.</p>
                                        </div>
                                    ) : (
                                        dispositivos.map(disp => (
                                            <div key={disp.id} className="bg-slate-900/60 rounded-2xl p-5 border border-white/5 hover:border-emerald-500/30 transition-all group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${disp.estado === 'ACTIVO' ? 'bg-emerald-500/20 text-emerald-400' : disp.estado === 'MANTENIMIENTO' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                                            <Server size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-white">{disp.nombre}</h3>
                                                            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">{disp.uuidHardware}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => { setDispositivoFormData(disp); setShowDispositivoModal(true); }}
                                                            className="p-1.5 text-slate-400 hover:text-blue-400" title="Configurar"
                                                        ><Edit2 size={14} /></button>
                                                        <button
                                                            onClick={() => handleDeleteDispositivo(disp.id)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-400" title="Quitar HW"
                                                        ><Trash2 size={14} /></button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mt-4 text-[11px]">
                                                    <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
                                                        <span className="text-slate-500 block mb-1">Tipo Equipo</span>
                                                        <span className="font-semibold text-slate-300">{disp.tipo}</span>
                                                    </div>
                                                    <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
                                                        <span className="text-slate-500 block mb-1">Estado de Red</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${disp.estado === 'ACTIVO' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                            <span className="font-semibold text-slate-300">{disp.ipAddress || 'Sin IP asignada'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5 col-span-2 flex justify-between">
                                                        <span className="text-slate-500">Último Latido (Pulsación):</span>
                                                        <span className="font-mono text-slate-400">{disp.lastHeartbeat ? new Date(disp.lastHeartbeat).toLocaleString() : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* MODAL SEDE */}
            {showSedeModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-700/50 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden relative animate-in slide-in-from-bottom sm:zoom-in duration-300">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <MapPin size={20} />
                                {sedeFormData.id ? 'Modificar Sede' : 'Registrar Sede'}
                            </h2>
                            <button onClick={() => setShowSedeModal(false)} className="text-white/70 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSede} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre de Sede</label>
                                <input
                                    required autoFocus type="text"
                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none transition-colors text-sm"
                                    value={sedeFormData.nombre || ''}
                                    onChange={e => setSedeFormData({ ...sedeFormData, nombre: e.target.value })}
                                    placeholder="Ej: Planta Baja / Sucursal Centro"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dirección (Opcional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none transition-colors text-sm"
                                    value={sedeFormData.direccion || ''}
                                    onChange={e => setSedeFormData({ ...sedeFormData, direccion: e.target.value })}
                                    placeholder="Calle principal #123"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Código Referencia ERP</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none transition-colors text-sm font-mono"
                                    value={sedeFormData.codigoExterno || ''}
                                    onChange={e => setSedeFormData({ ...sedeFormData, codigoExterno: e.target.value })}
                                    placeholder="SUC-010"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Turno por Defecto de Sede</label>
                                <select
                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none transition-colors text-sm"
                                    value={sedeFormData.turnoDefectoId || ''}
                                    onChange={e => setSedeFormData({ ...sedeFormData, turnoDefectoId: e.target.value ? Number(e.target.value) : null })}
                                >
                                    <option value="">Ninguno (Sin Turno Automático)</option>
                                    {turnos.map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre}</option>
                                    ))}
                                </select>
                                {sedeFormData.turnoDefectoId && (
                                    <div className="mt-3 bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Días Laborales (Shift)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(dia => {
                                                const isSelected = sedeFormData.diasTurnoDefecto?.split(',').includes(dia);
                                                return (
                                                    <button
                                                        key={dia}
                                                        type="button"
                                                        onClick={() => {
                                                            const currentDias = sedeFormData.diasTurnoDefecto?.split(',').filter(d => d) || [];
                                                            const nextDias = isSelected
                                                                ? currentDias.filter(d => d !== dia)
                                                                : [...currentDias, dia];
                                                            setSedeFormData({ ...sedeFormData, diasTurnoDefecto: nextDias.join(',') });
                                                        }}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${isSelected
                                                            ? 'bg-blue-500 text-white border-blue-400'
                                                            : 'bg-slate-700 text-slate-400 border-slate-600'
                                                            }`}
                                                    >
                                                        {dia}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                <p className="text-[10px] text-slate-500 leading-tight mt-1">
                                    Si un empleado que pertenece a esta Sede no tiene turno explícito asignado en sus legajos, usaremos este como default.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-700/50 mt-6">
                                <button type="button" onClick={() => setShowSedeModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition">Cancelar</button>
                                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition flex items-center justify-center gap-2">
                                    <Save size={16} /> Grabar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* MODAL DISPOSITIVO */}
            {showDispositivoModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-700/50 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden relative animate-in slide-in-from-bottom sm:zoom-in duration-300">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Server size={20} />
                                {dispositivoFormData.id ? 'Configurar Dispositivo' : 'Vincular Dispositivo'}
                            </h2>
                            <button onClick={() => setShowDispositivoModal(false)} className="text-white/70 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveDispositivo} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ID Hardware (UUID / MAC)</label>
                                    <input
                                        required type="text"
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none transition-colors text-sm font-mono uppercase"
                                        value={dispositivoFormData.uuidHardware || ''}
                                        onChange={e => setDispositivoFormData({ ...dispositivoFormData, uuidHardware: e.target.value })}
                                        placeholder="00:1A:2B:3C:4D:5E"
                                        disabled={!!dispositivoFormData.id} // El UUID asume la identidad de fábrica, de ideal no cambia.
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alias Comercial</label>
                                    <input
                                        required autoFocus type="text"
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none transition-colors text-sm"
                                        value={dispositivoFormData.nombre || ''}
                                        onChange={e => setDispositivoFormData({ ...dispositivoFormData, nombre: e.target.value })}
                                        placeholder="Torno Principal"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo Equipo</label>
                                    <select
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none transition-colors text-sm"
                                        value={dispositivoFormData.tipo || 'KIOSCO'}
                                        onChange={e => setDispositivoFormData({ ...dispositivoFormData, tipo: e.target.value as any })}
                                    >
                                        <option value="KIOSCO">Terminal Kiosco Biométrico</option>
                                        <option value="CAMARA">Cámara Reconocimiento IA</option>
                                        <option value="MOVIL">Tablet / Móvil Roving</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado en Red</label>
                                    <select
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none transition-colors text-sm"
                                        value={dispositivoFormData.estado || 'INACTIVO'}
                                        onChange={e => setDispositivoFormData({ ...dispositivoFormData, estado: e.target.value as any })}
                                    >
                                        <option value="ACTIVO">Operativo</option>
                                        <option value="INACTIVO">Desactivado / Falla</option>
                                        <option value="MANTENIMIENTO">En Mantenimiento</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">IP Address Estática (Opcional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none transition-colors text-sm font-mono"
                                    value={dispositivoFormData.ipAddress || ''}
                                    onChange={e => setDispositivoFormData({ ...dispositivoFormData, ipAddress: e.target.value })}
                                    placeholder="192.168.1.100"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-700/50 mt-6">
                                <button type="button" onClick={() => setShowDispositivoModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition">Cancelar</button>
                                <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 transition flex items-center justify-center gap-2">
                                    <Save size={16} /> Configurar HW
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SedesDispositivosPage;
