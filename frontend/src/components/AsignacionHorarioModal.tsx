import React, { useState, useEffect } from 'react';
import { X, CalendarDays, Check } from 'lucide-react';
import { turnoService, TurnoPlantilla } from '../services/turnoService';

interface AsignacionHorarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: { empleadoIds: number[], turnoId: number, diasSemana: string, fechaInicio: string }) => Promise<void>;
    selectedIds: number[];
}

const DIAS = [
    { value: 'LUN', label: 'Lunes' },
    { value: 'MAR', label: 'Martes' },
    { value: 'MIE', label: 'Miércoles' },
    { value: 'JUE', label: 'Jueves' },
    { value: 'VIE', label: 'Viernes' },
    { value: 'SAB', label: 'Sábado' },
    { value: 'DOM', label: 'Domingo' }
];

const AsignacionHorarioModal = ({ isOpen, onClose, onSave, selectedIds }: AsignacionHorarioModalProps) => {
    const [turnos, setTurnos] = useState<TurnoPlantilla[]>([]);
    const [turnoId, setTurnoId] = useState<number | ''>('');
    const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>(['LUN', 'MAR', 'MIE', 'JUE', 'VIE']);
    const [fechaInicio, setFechaInicio] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            cargarTurnos();
        }
    }, [isOpen]);

    const cargarTurnos = async () => {
        try {
            const data = await turnoService.getTodos();
            setTurnos(data);
        } catch (error) {
            console.error('Error cargando turnos', error);
        }
    };

    const toggleDia = (dia: string) => {
        if (diasSeleccionados.includes(dia)) {
            setDiasSeleccionados(diasSeleccionados.filter(d => d !== dia));
        } else {
            setDiasSeleccionados([...diasSeleccionados, dia]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!turnoId || diasSeleccionados.length === 0) return;

        setIsSaving(true);
        try {
            await onSave({
                empleadoIds: selectedIds,
                turnoId: Number(turnoId),
                diasSemana: diasSeleccionados.join(','),
                fechaInicio
            });
            onClose();
        } catch (error) {
            console.error('Error en asignación masiva', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700/50 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden relative animate-in slide-in-from-bottom sm:zoom-in duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <CalendarDays size={20} />
                            Asignación Masiva de Horario
                        </h2>
                        <p className="text-white/80 text-sm mt-1">Afectará a {selectedIds.length} empleado(s)</p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Turno / Plantilla Base *</label>
                        <select
                            required
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none transition-colors text-sm"
                            value={turnoId}
                            onChange={e => setTurnoId(e.target.value ? Number(e.target.value) : '')}
                        >
                            <option value="" disabled>Seleccione un turno de la lista...</option>
                            {turnos.map(t => (
                                <option key={t.id} value={t.id}>{t.nombre} ({t.tipoTurno})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Días Habituales de Trabajo *</label>
                        <div className="flex flex-wrap gap-2">
                            {DIAS.map(dia => {
                                const isSelected = diasSeleccionados.includes(dia.value);
                                return (
                                    <button
                                        key={dia.value}
                                        type="button"
                                        onClick={() => toggleDia(dia.value)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${isSelected
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {isSelected && <Check size={14} />}
                                            {dia.label}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha de Inicio de Vigencia *</label>
                        <input
                            required
                            type="date"
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none transition-colors text-sm"
                            value={fechaInicio}
                            onChange={e => setFechaInicio(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Si la fecha es futura, los cálculos usarán el horario anterior hasta que llegue este día.</p>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-700/50 mt-6">
                        <button type="button" disabled={isSaving} onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition disabled:opacity-50">Cancelar</button>
                        <button type="submit" disabled={isSaving || !turnoId || diasSeleccionados.length === 0} className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving ? 'Asignando...' : 'Aplicar a Selección'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AsignacionHorarioModal;
