import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, CreditCard, Shield, Briefcase, Calendar } from 'lucide-react';
import { Empleado } from '../services/empleadoService';

interface EmpleadoFormProps {
    empleado?: Empleado;
    supervisores?: Empleado[];
    onSave: (data: Empleado) => void;
    onCancel: () => void;
}

const EmpleadoForm: React.FC<EmpleadoFormProps> = ({ empleado, supervisores = [], onSave, onCancel }) => {
    const [formData, setFormData] = useState<Empleado>({
        codigoEmpleado: '',
        nombreCompleto: '',
        numeroDocumento: '',
        email: '',
        estado: 'ACTIVO',
        ...empleado
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="glass w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom sm:zoom-in duration-300">
                <div className="p-6 border-b border-slate-700/50 flex items-center justify-between premium-gradient">
                    <div className="flex items-center gap-3 text-white">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <User size={24} />
                        </div>
                        <h2 className="text-xl font-bold">
                            {empleado ? 'Editar Empleado' : 'Nuevo Empleado'}
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Código de Empleado */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Briefcase size={16} /> Código de Empleado
                            </label>
                            <input
                                required
                                name="codigoEmpleado"
                                value={formData.codigoEmpleado}
                                onChange={handleChange}
                                placeholder="Ej: EMP-001"
                                className="w-full"
                            />
                        </div>

                        {/* DNI / Documento */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <CreditCard size={16} /> Número de Documento
                            </label>
                            <input
                                required
                                name="numeroDocumento"
                                value={formData.numeroDocumento}
                                onChange={handleChange}
                                placeholder="DNI o Pasaporte"
                                className="w-full"
                            />
                        </div>

                        {/* Nombre Completo */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <User size={16} /> Nombre Completo
                            </label>
                            <input
                                required
                                name="nombreCompleto"
                                value={formData.nombreCompleto}
                                onChange={handleChange}
                                placeholder="Nombres y Apellidos"
                                className="w-full"
                            />
                        </div>

                        {/* Email */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Mail size={16} /> Correo Electrónico
                            </label>
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="correo@empresa.com"
                                className="w-full"
                            />
                        </div>

                        {/* Estado */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Shield size={16} /> Estado del Empleado
                            </label>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className="w-full bg-slate-900/80 border border-slate-700/50 text-white p-3 rounded-xl outline-none focus:border-blue-500 transition-all appearance-none"
                            >
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                                <option value="LICENCIA">Licencia</option>
                            </select>
                        </div>

                        {/* Supervisor */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <User size={16} /> Supervisor Responsable
                            </label>
                            <select
                                name="supervisorId"
                                value={formData.supervisorId || ''}
                                onChange={handleChange}
                                className="w-full bg-slate-900/80 border border-slate-700/50 text-white p-3 rounded-xl outline-none focus:border-blue-500 transition-all appearance-none"
                            >
                                <option value="">Sin Supervisor (Nivel Superior)</option>
                                {supervisores
                                    .filter(s => s.id !== empleado?.id)
                                    .map(sup => (
                                        <option key={sup.id} value={sup.id}>
                                            {sup.nombreCompleto} ({sup.codigoEmpleado})
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-700/50 flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-slate-400 font-semibold hover:bg-slate-800 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 premium-gradient text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Save size={20} />
                            Guardar Empleado
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmpleadoForm;
