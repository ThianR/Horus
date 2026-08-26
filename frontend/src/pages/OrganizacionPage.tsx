import React, { useState, useEffect, useRef } from 'react';
import { 
    Building2, MapPin, Server, Plus, ChevronRight, 
    ArrowLeft, Edit2, Trash2, Save, X, Activity, Globe,
    ChevronDown, Check, Home, Info, Cpu, Fingerprint, AlertTriangle
} from 'lucide-react';
import { getPersistentDeviceId } from '../utils/deviceFingerprint';
import api from '../services/api';
import empresaService, { Empresa } from '../services/empresaService';
import { Sede, Dispositivo, sedeService, dispositivoService } from '../services/sedeService';
import { TurnoPlantilla, turnoService } from '../services/turnoService';
import { toast } from 'sonner';
import DiasSemanaBadge from '../components/DiasSemanaBadge';
import { useConfirm } from '../contexts/ConfirmContext';

// Componente de Selector Premium con Glassmorphism - MEJORADO CON FONDO DIFUMINADO OPACO
const PremiumSelect = ({ label, value, options, onChange, icon: Icon, placeholder = "Seleccionar..." }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt: any) => opt.value === value);

    return (
        <div className="space-y-1.5" ref={containerRef}>
            {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{label}</label>}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${
                        isOpen ? 'bg-white/15 border-blue-500/50 ring-2 ring-blue-500/10' : 'bg-slate-900/40 border-white/5 hover:bg-white/5'
                    }`}
                >
                    <div className="flex items-center gap-3 truncate">
                        {Icon && <Icon size={18} className={isOpen ? 'text-blue-400' : 'text-slate-400'} />}
                        <span className={`text-sm truncate ${selectedOption ? 'text-white font-medium' : 'text-slate-500'}`}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                    </div>
                    <ChevronDown size={18} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-[100] w-full mt-2 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl py-2 animate-in fade-in zoom-in-95 duration-200 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-xs text-slate-500 text-center italic">No hay opciones disponibles</div>
                        ) : (
                            options.map((opt: any) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/10 transition-colors text-sm ${
                                        value === opt.value ? 'bg-blue-500/20 text-blue-400 font-black' : 'text-slate-300'
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    {value === opt.value && <Check size={16} />}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const OrganizacionPage = () => {
    const { confirm } = useConfirm();
    // Estados de navegación
    const [view, setView] = useState<'empresas' | 'sedes' | 'dispositivos'>('empresas');
    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
    const [selectedSede, setSelectedSede] = useState<Sede | null>(null);

    // Estados de datos
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
    const [turnos, setTurnos] = useState<TurnoPlantilla[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados de Modales
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [showSedeModal, setShowSedeModal] = useState(false);
    const [showDispositivoModal, setShowDispositivoModal] = useState(false);

    // Datos de Formulario
    const [empresaForm, setEmpresaForm] = useState<Partial<Empresa>>({ nombre: '', identificacionFiscal: '', direccion: '', telefono: '', activo: true, cierreDiaAutomatico: false });
    const [sedeForm, setSedeForm] = useState<Partial<Sede>>({ nombre: '', direccion: '', codigoExterno: '', turnoDefectoId: null, diasTurnoDefecto: 'LUN,MAR,MIE,JUE,VIE' });
    const [dispositivoForm, setDispositivoForm] = useState<Partial<Dispositivo>>({ nombre: '', uuidHardware: '', tipo: 'KIOSCO', estado: 'INACTIVO', ipAddress: '' });

    useEffect(() => {
        cargarEmpresas();
        cargarTurnos();
    }, []);

    const cargarEmpresas = async () => {
        setLoading(true);
        try {
            const data = await empresaService.getAll();
            setEmpresas(data);
        } catch (error) {
            toast.error("Error al cargar empresas");
        } finally {
            setLoading(false);
        }
    };

    const cargarSedes = async (empresaId: number) => {
        setLoading(true);
        try {
            const data = await sedeService.getAll(empresaId);
            setSedes(data);
        } catch (error) {
            toast.error("Error al cargar sedes");
        } finally {
            setLoading(false);
        }
    };

    const cargarDispositivos = async (sedeId: number) => {
        setLoading(true);
        try {
            const data = await sedeService.getDispositivosSede(sedeId);
            setDispositivos(data);
        } catch (error) {
            toast.error("Error al cargar dispositivos");
        } finally {
            setLoading(false);
        }
    };

    const cargarTurnos = async () => {
        try {
            const data = await turnoService.getTodos();
            setTurnos(data);
        } catch (error) {}
    };

    // Navegación
    const handleSelectEmpresa = (emp: Empresa) => {
        setSelectedEmpresa(emp);
        setSedes([]); // Limpiar estado anterior inmediatamente
        cargarSedes(emp.id!);
        setView('sedes');
    };

    const handleSelectSede = (sede: Sede) => {
        setSelectedSede(sede);
        setDispositivos([]); // Limpiar estado anterior inmediatamente
        cargarDispositivos(sede.id);
        setView('dispositivos');
    };

    const backToEmpresas = () => {
        setSelectedEmpresa(null);
        setSelectedSede(null);
        setSedes([]); // Limpieza de seguridad
        setView('empresas');
        cargarEmpresas();
    };

    const backToSedes = () => {
        setSelectedSede(null);
        setDispositivos([]); // Limpieza de seguridad
        setView('sedes');
        if (selectedEmpresa) cargarSedes(selectedEmpresa.id!);
    };

    // Handlers de Guardado
    const saveEmpresa = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (empresaForm.id) await empresaService.update(empresaForm.id, empresaForm as Empresa);
            else await empresaService.crear(empresaForm as Empresa);
            toast.success("Empresa guardada");
            setShowEmpresaModal(false);
            cargarEmpresas();
        } catch (error) { toast.error("Error al guardar empresa"); }
    };

    const saveSede = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let savedSede;
            const params = selectedEmpresa ? { empresaId: selectedEmpresa.id } : {};
            
            if (sedeForm.id) savedSede = await sedeService.update(sedeForm.id, sedeForm);
            else {
                const response = await api.post('/sedes', sedeForm, { params });
                savedSede = response.data;
            }
            
            await sedeService.asignarTurnoDefecto(savedSede.id, sedeForm.turnoDefectoId ?? null, sedeForm.diasTurnoDefecto);
            
            toast.success("Sede guardada");
            setShowSedeModal(false);
            if (selectedEmpresa) cargarSedes(selectedEmpresa.id!);
        } catch (error) { toast.error("Error al guardar sede"); }
    };

    const capturarIdActual = async () => {
        try {
            const fingerprint = await getPersistentDeviceId();
            setDispositivoForm({ ...dispositivoForm, uuidHardware: fingerprint });
            toast.info("Identificador de hardware capturado desde tu navegador actual");
        } catch (error) {
            toast.error("No se pudo generar el identificador de hardware");
        }
    };

    const saveDispositivo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSede) return;
        try {
            if (dispositivoForm.id) await dispositivoService.update(dispositivoForm.id, dispositivoForm);
            else await sedeService.addDispositivoSede(selectedSede.id, dispositivoForm);
            
            toast.success("Dispositivo configurado");
            setShowDispositivoModal(false);
            cargarDispositivos(selectedSede.id);
        } catch (error) { 
            const errorData = (error as any).response?.data;
            if (errorData?.mensaje) {
                toast.error(errorData.mensaje);
            } else {
                toast.error("Error al guardar dispositivo"); 
            }
        }
    };

    const deleteEmpresa = async (id: number) => {
        if (!(await confirm({ message: "¿Está seguro de eliminar esta empresa? Se borrarán todas sus sedes y dispositivos asociados.", type: 'danger' }))) return;
        try {
            await empresaService.delete(id);
            toast.success("Empresa eliminada correctamente");
            cargarEmpresas();
        } catch (error: any) {
            toast.error(error.response?.data?.mensaje || "Error al eliminar empresa");
        }
    };

    const deleteSede = async (id: number) => {
        if (!(await confirm({ message: "¿Está seguro de eliminar esta sede?", type: 'danger' }))) return;
        try {
            await sedeService.delete(id);
            toast.success("Sede eliminada correctamente");
            if (selectedEmpresa) cargarSedes(selectedEmpresa.id!);
        } catch (error: any) {
            toast.error(error.response?.data?.mensaje || "Error al eliminar sede");
        }
    };

    const deleteDispositivo = async (id: number) => {
        if (!(await confirm({ message: "¿Está seguro de eliminar este dispositivo?", type: 'danger' }))) return;
        try {
            await dispositivoService.delete(id);
            toast.success("Dispositivo eliminado");
            if (selectedSede) cargarDispositivos(selectedSede.id);
        } catch (error: any) {
            toast.error(error.response?.data?.mensaje || "Error al eliminar dispositivo");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            
            {/* Breadcrumbs - Visualización de la Relación Jerárquica */}
            <div className="flex items-center gap-2 px-1 text-sm font-medium">
                <button 
                    onClick={backToEmpresas}
                    className={`flex items-center gap-1.5 transition-colors ${view === 'empresas' ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Home size={16} /> Empresas
                </button>
                
                {(view === 'sedes' || view === 'dispositivos') && (
                    <>
                        <ChevronRight size={14} className="text-slate-700" />
                        <button 
                            onClick={backToSedes}
                            disabled={view === 'sedes'}
                            className={`flex items-center gap-1.5 transition-colors ${view === 'sedes' ? 'text-emerald-400 font-bold underline underline-offset-4 decoration-2' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Building2 size={16} /> {selectedEmpresa?.nombre}
                        </button>
                    </>
                )}

                {view === 'dispositivos' && (
                    <>
                        <ChevronRight size={14} className="text-slate-700" />
                        <span className="flex items-center gap-1.5 text-purple-400 font-bold decoration-purple-500/50 underline-offset-4 decoration-2 underline">
                            <MapPin size={16} /> {selectedSede?.nombre}
                        </span>
                    </>
                )}
            </div>

            {/* Cabecera Corporativa */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    {view === 'empresas' && <Building2 size={120} className="text-blue-400" />}
                    {view === 'sedes' && <MapPin size={120} className="text-emerald-400" />}
                    {view === 'dispositivos' && <Server size={120} className="text-purple-400" />}
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        {(view === 'sedes' || view === 'dispositivos') && (
                            <button onClick={view === 'sedes' ? backToEmpresas : backToSedes} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-1.5">
                                <Globe size={14} /> Gestión de Infraestructura
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight leading-none">
                                {view === 'empresas' && "Empresas"}
                                {view === 'sedes' && "Sedes Corporativas"}
                                {view === 'dispositivos' && "Hardware Biométrico"}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    {view === 'empresas' && (
                        <button id="tour-btn-nueva-empresa" onClick={() => { setEmpresaForm({ nombre: '', identificacionFiscal: '', activo: true, cierreDiaAutomatico: false }); setShowEmpresaModal(true); }} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                            <Plus size={20} /> Nueva Empresa
                        </button>
                    )}
                    {view === 'sedes' && (
                        <button onClick={() => { setSedeForm({ nombre: '', direccion: '', turnoDefectoId: null }); setShowSedeModal(true); }} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                            <Plus size={20} /> Registrar Sede
                        </button>
                    )}
                    {view === 'dispositivos' && (
                        <button onClick={() => { setDispositivoForm({ nombre: '', uuidHardware: '', tipo: 'KIOSCO', estado: 'INACTIVO' }); setShowDispositivoModal(true); }} className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-95">
                            <Plus size={20} /> Vincular Terminal
                        </button>
                    )}
                </div>
            </div>

            {/* Grid de Contenido */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Globe size={24} className="text-blue-400 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-slate-400 font-bold text-lg animate-pulse tracking-widest uppercase">Sincronizando Sistema...</p>
                    </div>
                ) : (
                    <>
                        {view === 'empresas' && empresas.map(emp => (
                            <div key={emp.id} onClick={() => handleSelectEmpresa(emp)} className="glass-card group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all"></div>
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-5 bg-blue-500/10 rounded-3xl border border-blue-500/20 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                                            <Building2 size={40} className="text-blue-400" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); setEmpresaForm(emp); setShowEmpresaModal(true); }} className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all"><Edit2 size={18} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); deleteEmpresa(emp.id!); }} className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-tighter">{emp.nombre}</h3>
                                    <p className="text-sm font-mono text-slate-500 mb-6 flex items-center gap-2 font-black tracking-widest">
                                        <Info size={14} className="text-slate-700" /> {emp.identificacionFiscal || 'SIN RUC/NIT'}
                                    </p>
                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Estatus Legal</span>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${emp.activo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                {emp.activo ? 'Operativa' : 'Suspendida'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 tracking-widest">
                                            Gestionar <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {view === 'sedes' && sedes.map(sede => (
                            <div key={sede.id} onClick={() => handleSelectSede(sede)} className="glass-card group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all"></div>
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-5 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                                            <MapPin size={40} className="text-emerald-400" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); setSedeForm({ ...sede, turnoDefectoId: sede.turnoDefecto?.id || null }); setShowSedeModal(true); }} className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all"><Edit2 size={18} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); deleteSede(sede.id); }} className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-1 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{sede.nombre}</h3>
                                    <p className="text-xs text-slate-500 mb-6 flex items-center gap-2 italic font-bold">
                                        <Activity size={14} className="text-slate-700" /> {sede.direccion || 'UBICACIÓN NO DECLARADA'}
                                    </p>
                                    
                                    {sede.turnoDefecto && (
                                        <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5 transform group-hover:translate-y-[-5px] transition-transform">
                                            <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mb-2 flex justify-between">
                                                <span>Horario Corporativo</span>
                                                <div className="flex -space-x-1">
                                                    {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-emerald-500/50"></div>)}
                                                </div>
                                            </div>
                                            <div className="text-sm text-emerald-300 font-black mb-3 underline decoration-emerald-500/30 underline-offset-4">{sede.turnoDefecto.nombre}</div>
                                            <DiasSemanaBadge diasSeleccionados={sede.diasTurnoDefecto} />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            Corporación: <span className="text-emerald-400/80">{selectedEmpresa?.nombre}</span>
                                        </span>
                                        <ChevronRight size={20} className="text-emerald-500/40 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {view === 'dispositivos' && dispositivos.map(disp => (
                            <div key={disp.id} className="glass-card group relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full ${disp.estado === 'ACTIVO' ? 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-amber-500'}`}></div>
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-5 rounded-3xl border transition-all ${disp.estado === 'ACTIVO' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-slate-700/10 border-slate-700/20 text-slate-500'}`}>
                                            <Server size={40} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setDispositivoForm(disp); setShowDispositivoModal(true); }} className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all"><Edit2 size={18} /></button>
                                            <button onClick={() => deleteDispositivo(disp.id)} className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-black text-white mb-1 group-hover:text-purple-400 transition-colors uppercase tracking-tight">{disp.nombre}</h3>
                                    <div className="px-2 py-0.5 bg-black/40 rounded-md inline-block text-[10px] font-mono text-purple-500 mb-6 border border-purple-500/20 font-black">HW-ID: {disp.uuidHardware}</div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                                            <span className="text-[9px] text-slate-600 font-bold uppercase block mb-1">Tecnología</span>
                                            <span className="text-xs text-slate-300 font-black tracking-tight">{disp.tipo}</span>
                                        </div>
                                        <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                                            <span className="text-[9px] text-slate-600 font-bold uppercase block mb-1">Asignación IP</span>
                                            <span className="text-xs text-purple-300 font-mono font-black">{disp.ipAddress || 'DHCP-DYN'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${disp.estado === 'ACTIVO' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-amber-500'}`}></div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${disp.estado === 'ACTIVO' ? 'text-emerald-400' : 'text-amber-400'}`}>{disp.estado}</span>
                                        </div>
                                        <span className="text-[9px] text-slate-600 italic font-black uppercase tracking-tighter">Sede: {selectedSede?.nombre}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Modales con PremiumSelect y Diseño Refinado */}
            
            {/* Modal Empresa */}
            {showEmpresaModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020617]/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="glass-modal max-w-lg w-full scale-100 shadow-[0_35px_100px_-15px_rgba(0,0,0,0.8)] border border-white/10 rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-600/20 to-indigo-600/10">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3"><Building2 size={28} className="text-blue-400" /> {empresaForm.id ? 'Refinar' : 'Inaugurar'} Empresa</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1.5 ">Estructura Legal del Sistema</p>
                            </div>
                            <button onClick={() => setShowEmpresaModal(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"><X size={24} /></button>
                        </div>
                        <form onSubmit={saveEmpresa} className="p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Razón Social Corporativa</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input id="tour-org-nombre" required type="text" value={empresaForm.nombre} onChange={e => setEmpresaForm({...empresaForm, nombre: e.target.value})} className="form-input pl-12 font-black" placeholder="Ej: Horus Technologies S.A." />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Identificación Fiscal (RUC/NIT)</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input type="text" value={empresaForm.identificacionFiscal} onChange={e => setEmpresaForm({...empresaForm, identificacionFiscal: e.target.value})} className="form-input pl-12 font-mono tracking-widest" placeholder="Registro tributario oficial" />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => setEmpresaForm({...empresaForm, cierreDiaAutomatico: !empresaForm.cierreDiaAutomatico})}>
                                <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${empresaForm.cierreDiaAutomatico ? 'bg-blue-500 border-blue-500' : 'border-white/20'}`}>
                                    {empresaForm.cierreDiaAutomatico && <Check size={16} className="text-white" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-tight">Cierre de Día Automático</p>
                                    <p className="text-[10px] text-slate-500 font-bold italic">Procesar faltas cada medianoche (00:05 AM)</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowEmpresaModal(false)} className="flex-1 px-8 py-4 bg-slate-900 border border-white/5 text-slate-400 rounded-2xl font-black transition-all uppercase text-[10px] tracking-widest active:scale-95">Descartar</button>
                                <button id="tour-org-guardar" type="submit" className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-2 transition-all uppercase text-[10px] tracking-[0.15em] active:scale-95"><Save size={18} /> Formalizar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Sede */}
            {showSedeModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020617]/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="glass-modal max-w-lg w-full shadow-[0_35px_100px_-15px_rgba(0,0,0,0.8)] border border-white/10 rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-emerald-600/20 to-teal-600/10">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3"><MapPin size={28} className="text-emerald-400" /> {sedeForm.id ? 'Modificar' : 'Nueva'} Sucursal</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1.5">Impactando en: {selectedEmpresa?.nombre}</p>
                            </div>
                            <button onClick={() => setShowSedeModal(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"><X size={24} /></button>
                        </div>
                        <form onSubmit={saveSede} className="p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Denominación del Local</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input required type="text" value={sedeForm.nombre} onChange={e => setSedeForm({...sedeForm, nombre: e.target.value})} className="form-input pl-12 font-black" placeholder="Ej: Planta Principal Norte" />
                                </div>
                            </div>
                            
                            <PremiumSelect 
                                label="Turno Predeterminado de Sede"
                                icon={Activity}
                                value={sedeForm.turnoDefectoId}
                                placeholder="Elegir un turno de referencia..."
                                options={turnos.map((t:any) => ({ value: t.id, label: t.nombre }))}
                                onChange={(val:any) => setSedeForm({...sedeForm, turnoDefectoId: val})}
                            />
                            
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowSedeModal(false)} className="flex-1 px-8 py-4 bg-slate-900 border border-white/5 text-slate-400 rounded-2xl font-black transition-all uppercase text-[10px] tracking-widest active:scale-95">Regresar</button>
                                <button type="submit" className="flex-1 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-2 transition-all uppercase text-[10px] tracking-[0.15em] active:scale-95"><Save size={18} /> Vincular Sede</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Dispositivo */}
            {showDispositivoModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020617]/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="glass-modal max-w-lg w-full shadow-[0_35px_100px_-15px_rgba(0,0,0,0.8)] border border-white/10 rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-purple-600/20 to-fuchsia-600/10">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3"><Server size={28} className="text-purple-400" /> Configuración HW</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1.5">Terminal de {selectedSede?.nombre}</p>
                            </div>
                            <button onClick={() => setShowDispositivoModal(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"><X size={24} /></button>
                        </div>
                        <form onSubmit={saveDispositivo} className="p-8 space-y-6">
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-4 animate-in slide-in-from-top-4 duration-500">
                                <div className="p-3 bg-amber-500/20 rounded-xl h-fit">
                                    <Fingerprint className="text-amber-400" size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-amber-200 uppercase tracking-tight">Acerca de la Huella Digital (ID)</h4>
                                    <p className="text-[11px] text-amber-100/60 leading-relaxed italic">
                                        Este identificador se genera basándose en el hardware (GPU, CPU, Monitor) y software de este equipo. 
                                        Cambiar el navegador, formatear o sustituir componentes físicos requerirá un nuevo registro del terminal.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5 order-2 md:order-1">
                                    <div className="flex justify-between items-end mb-1 px-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hardware ID (Fingerprint)</label>
                                        {!dispositivoForm.id && (
                                            <button 
                                                type="button" 
                                                onClick={capturarIdActual}
                                                className="text-[10px] text-purple-400 hover:text-purple-300 font-black uppercase flex items-center gap-1 transition-colors"
                                            >
                                                <Cpu size={12} /> Auto-Detectar
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input 
                                            required 
                                            disabled={!!dispositivoForm.id} 
                                            type="text" 
                                            value={dispositivoForm.uuidHardware} 
                                            onChange={e => setDispositivoForm({...dispositivoForm, uuidHardware: e.target.value.toUpperCase()})} 
                                            className="form-input font-mono bg-black/40 border-purple-500/20 text-purple-400 focus:border-purple-500/60 disabled:opacity-50" 
                                            placeholder="Detecta o escribe el ID" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 order-1 md:order-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Alias del Terminal</label>
                                    <input required type="text" value={dispositivoForm.nombre} onChange={e => setDispositivoForm({...dispositivoForm, nombre: e.target.value})} className="form-input font-black" placeholder="Ej: Kiosco Recepción" />
                                </div>
                            </div>
                            
                            <PremiumSelect 
                                label="Tecnología Biométrica"
                                icon={Server}
                                placeholder="Seleccionar tipo de equipo..."
                                value={dispositivoForm.tipo}
                                options={[
                                    { value: 'KIOSCO', label: 'Terminal Kiosco Biométrico' },
                                    { value: 'CAMARA', label: 'Cámara Reconocimiento IA' },
                                    { value: 'MOVIL', label: 'Dispositivo Tablet/Móvil' }
                                ]}
                                onChange={(val:any) => setDispositivoForm({...dispositivoForm, tipo: val})}
                            />
                            
                            <PremiumSelect 
                                label="Estatus Operativo"
                                icon={Activity}
                                value={dispositivoForm.estado}
                                options={[
                                    { value: 'ACTIVO', label: 'Totalmente Operativo' },
                                    { value: 'INACTIVO', label: 'Desconectado / Inactivo' },
                                    { value: 'MANTENIMIENTO', label: 'En Revisión Técnica' }
                                ]}
                                onChange={(val:any) => setDispositivoForm({...dispositivoForm, estado: val})}
                            />

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowDispositivoModal(false)} className="flex-1 px-8 py-4 bg-slate-900 border border-white/5 text-slate-400 rounded-2xl font-black transition-all uppercase text-[10px] tracking-widest active:scale-95">Anular</button>
                                <button type="submit" className="flex-1 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black shadow-2xl shadow-purple-600/40 flex items-center justify-center gap-2 transition-all uppercase text-[10px] tracking-[0.15em] active:scale-95"><Save size={18} /> Sincronizar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizacionPage;
