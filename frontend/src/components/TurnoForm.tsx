import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Clock } from 'lucide-react';
import { TurnoPlantilla, TurnoSegmento, TipoTurno } from '../services/turnoService';

interface TurnoFormProps {
    turno?: TurnoPlantilla;
    onCancel: () => void;
    onSave: (data: TurnoPlantilla) => Promise<void>;
}

const TurnoForm: React.FC<TurnoFormProps> = ({ turno, onCancel, onSave }) => {
    const [formData, setFormData] = useState<TurnoPlantilla>(
        turno || {
            codigo: '',
            nombre: '',
            tipoTurno: 'FIJO' as TipoTurno,
            esNocturno: false,
            minBreakMins: 30,
            maxBreakMins: 60,
            toleranciaEntradaMins: 15,
            toleranciaSalidaMins: 15,
            segmentos: [
                {
                    orden: 1,
                    horaEntrada: '08:00:00',
                    horaSalida: '17:00:00',
                    diaSiguienteSalida: false,
                    toleranciaTardanzaMins: 15,
                    toleranciaSalidaAnticipadaMins: 15
                }
            ]
        }
    );

    const [saving, setSaving] = useState(false);

    const addSegmento = () => {
        const lastSeg = formData.segmentos[formData.segmentos.length - 1];
        setFormData({
            ...formData,
            segmentos: [
                ...formData.segmentos,
                {
                    orden: formData.segmentos.length + 1,
                    horaEntrada: '08:00:00',
                    horaSalida: '17:00:00',
                    diaSiguienteSalida: false,
                    toleranciaTardanzaMins: 15,
                    toleranciaSalidaAnticipadaMins: 15
                }
            ]
        });
    };

    const removeSegmento = (index: number) => {
        if (formData.segmentos.length === 1) return;
        const newSegmentos = formData.segmentos.filter((_, i) => i !== index);
        // Actualizar órdenes
        const updatedSegmentos = newSegmentos.map((s, i) => ({ ...s, orden: i + 1 }));
        setFormData({ ...formData, segmentos: updatedSegmentos });
    };

    const updateSegmento = (index: number, field: keyof TurnoSegmento, value: any) => {
        const newSegmentos = [...formData.segmentos];
        if (field === 'horaEntrada' || field === 'horaSalida') {
            // Asegurar formato HH:mm:ss si viene solo HH:mm
            if (value.length === 5) value += ':00';
        }
        newSegmentos[index] = { ...newSegmentos[index], [field]: value };
        setFormData({ ...formData, segmentos: newSegmentos });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error('Error al guardar turno:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-700/50 flex items-center justify-between sticky top-0 bg-[#0f172a]/90 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Clock className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {turno ? 'Editar Plantilla de Turno' : 'Nueva Plantilla de Turno'}
                            </h2>
                            <p className="text-xs text-slate-400">Configure los horarios y reglas de cumplimiento.</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Información Básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">Código del Turno</label>
                            <input
                                required
                                type="text"
                                placeholder="Ej: TM-001"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-white"
                                value={formData.codigo}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">Nombre Descriptivo</label>
                            <input
                                required
                                type="text"
                                placeholder="Ej: Turno Mañana Fijo"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-white"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">Tipo de Turno</label>
                            <select
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-white appearance-none"
                                value={formData.tipoTurno}
                                onChange={(e) => setFormData({ ...formData, tipoTurno: e.target.value as TipoTurno })}
                            >
                                <option value="FIJO">Fijo</option>
                                <option value="FLEXIBLE">Flexible</option>
                                <option value="ABIERTO">Abierto</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-4 h-full pt-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.esNocturno}
                                        onChange={(e) => setFormData({ ...formData, esNocturno: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </div>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">¿Es Turno Nocturno?</span>
                            </label>
                        </div>
                    </div>

                    {/* Reglas de Break y Tolerancias */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-900/30 rounded-2xl border border-slate-700/30">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Min Break (min)</label>
                            <input
                                type="number"
                                className="w-full bg-transparent border-b border-slate-700 py-1 outline-none text-white focus:border-blue-500"
                                value={formData.minBreakMins}
                                onChange={(e) => setFormData({ ...formData, minBreakMins: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Max Break (min)</label>
                            <input
                                type="number"
                                className="w-full bg-transparent border-b border-slate-700 py-1 outline-none text-white focus:border-blue-500"
                                value={formData.maxBreakMins}
                                onChange={(e) => setFormData({ ...formData, maxBreakMins: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Tol. Entrada (min)</label>
                            <input
                                type="number"
                                className="w-full bg-transparent border-b border-slate-700 py-1 outline-none text-white focus:border-blue-500"
                                value={formData.toleranciaEntradaMins}
                                onChange={(e) => setFormData({ ...formData, toleranciaEntradaMins: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Tol. Salida (min)</label>
                            <input
                                type="number"
                                className="w-full bg-transparent border-b border-slate-700 py-1 outline-none text-white focus:border-blue-500"
                                value={formData.toleranciaSalidaMins}
                                onChange={(e) => setFormData({ ...formData, toleranciaSalidaMins: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Segmentos Horarios */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                Horarios y Segmentos
                                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-normal">
                                    {formData.segmentos.length}
                                </span>
                            </h3>
                            <button
                                type="button"
                                onClick={addSegmento}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                                <Plus size={16} />
                                Agregar Segmento
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.segmentos.map((seg, idx) => (
                                <div key={idx} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 group relative">
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">Entrada</label>
                                            <input
                                                type="time"
                                                step="1"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                                                value={seg.horaEntrada.substring(0, 8)}
                                                onChange={(e) => updateSegmento(idx, 'horaEntrada', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">Salida</label>
                                            <input
                                                type="time"
                                                step="1"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                                                value={seg.horaSalida.substring(0, 8)}
                                                onChange={(e) => updateSegmento(idx, 'horaSalida', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 h-10">
                                            <input
                                                type="checkbox"
                                                id={`next-day-${idx}`}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                                                checked={seg.diaSiguienteSalida}
                                                onChange={(e) => updateSegmento(idx, 'diaSiguienteSalida', e.target.checked)}
                                            />
                                            <label htmlFor={`next-day-${idx}`} className="text-xs text-slate-400">¿Sale el día siguiente?</label>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">Tardanza (m)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                                                value={seg.toleranciaTardanzaMins}
                                                onChange={(e) => updateSegmento(idx, 'toleranciaTardanzaMins', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">S. Antic. (m)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                                                value={seg.toleranciaSalidaAnticipadaMins}
                                                onChange={(e) => updateSegmento(idx, 'toleranciaSalidaAnticipadaMins', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeSegmento(idx)}
                                                disabled={formData.segmentos.length === 1}
                                                className={`p-2 rounded-lg transition-colors ${formData.segmentos.length === 1 ? 'text-slate-700 cursor-not-allowed' : 'text-red-400 hover:bg-red-500/20'}`}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-3/4 premium-gradient rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-10 sticky bottom-0 bg-[#0f172a]/90 backdrop-blur-md pb-4 z-10 border-t border-slate-700/30">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="premium-gradient text-white px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all font-bold disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={20} />
                            )}
                            {saving ? 'Guardando...' : 'Guardar Plantilla'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TurnoForm;
