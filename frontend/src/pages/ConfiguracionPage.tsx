import React from 'react';
import { Download, FileSpreadsheet, FileText, Info } from 'lucide-react';
const ConfiguracionPage = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Configuración del Sistema</h1>
                <p className="text-slate-400">Gestiona las plantillas de datos y la identidad de tu organización en Horus.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ---------- Tarjeta: Empleados ---------- */}
                <div className="glass p-6 rounded-3xl border border-slate-700/50 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FileSpreadsheet size={120} className="text-emerald-400" />
                    </div>

                    <div className="flex items-start justify-between mb-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                                    <FileSpreadsheet size={24} className="text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Importación de Empleados</h2>
                            </div>
                            <p className="text-slate-400 text-sm">Estructura requerida para la carga masiva (Upsert) de RRHH.</p>
                        </div>
                        <a
                            href="/plantillas/plantilla_empleados.csv"
                            download
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 text-sm font-bold transition-all"
                        >
                            <Download size={16} />
                            Descargar CSV
                        </a>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50">
                            <h3 className="text-emerald-400 font-bold text-sm mb-3 flex items-center gap-2">
                                <Info size={16} /> Estructura de Columnas (Fila 1 = Cabecera)
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex gap-3 items-start">
                                    <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-emerald-300 w-32 shrink-0">Columna A</span>
                                    <div><strong>CodigoEmpresa</strong> (Requerido): Identificación fiscal (RUT/NIT/DNI) de la empresa. Se usa para asociar al empleado.</div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-emerald-300 w-32 shrink-0">Columna B</span>
                                    <div><strong>CodigoEmpleado</strong> (Requerido): Identificador único del empleado en su empresa. Si existe, lo actualizará.</div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-emerald-300 w-32 shrink-0">Columna C</span>
                                    <div><strong>NumeroDocumento</strong>: Cédula o DNI del empleado.</div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-emerald-300 w-32 shrink-0">Columna D</span>
                                    <div><strong>NombreCompleto</strong> (Requerido): Nombres y apellidos completos.</div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-emerald-300 w-32 shrink-0">Columna E</span>
                                    <div><strong>Email</strong>: Correo corporativo o personal.</div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-emerald-300 w-32 shrink-0">Columna F</span>
                                    <div><strong>CodigoSede</strong>: Identificador externo de la sede. Si no existe para la empresa, se creará.</div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-emerald-300 w-32 shrink-0">Columna G</span>
                                    <div><strong>NombreSede</strong>: Nombre descriptivo de la sede (se usa solo si la sede es nueva).</div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ---------- Tarjeta: Logs ZKTeco ---------- */}
                <div className="glass p-6 rounded-3xl border border-slate-700/50 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FileText size={120} className="text-blue-400" />
                    </div>

                    <div className="flex items-start justify-between mb-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
                                    <FileText size={24} className="text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Registros Biométricos</h2>
                            </div>
                            <p className="text-slate-400 text-sm">Formato universal transaccional compatible con ZKTeco.</p>
                        </div>
                        <a
                            href="/plantillas/plantilla_logs_biometricos.dat"
                            download
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 text-sm font-bold transition-all"
                        >
                            <Download size={16} />
                            Descargar .DAT
                        </a>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50">
                            <h3 className="text-blue-400 font-bold text-sm mb-3 flex items-center gap-2">
                                <Info size={16} /> Estructura (Sin Cabeceras, Separado por Tabulador)
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex gap-3 items-start">
                                    <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-blue-300 w-32 shrink-0">Columna 1</span>
                                    <div><strong>ID Usuario</strong>: Coincide con el CodigoEmpleado en Horus.</div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-blue-300 w-32 shrink-0">Columna 2</span>
                                    <div><strong>Fecha y Hora</strong>: Formato exacto <code>YYYY-MM-DD HH:mm:ss</code>.</div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-blue-300 w-32 shrink-0">Columna 3</span>
                                    <div><strong>Estado</strong>: <code>0</code> (Entrada) o <code>1</code> (Salida).</div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-blue-300 w-32 shrink-0">Columna 4</span>
                                    <div><strong>Tipo Verificación</strong>: <code>15</code> (Rostro), <code>1</code> (Huella), <code>4</code> (Tarjeta).</div>
                                </li>
                            </ul>

                            <div className="mt-4 p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-xs text-slate-400">
                                EMP-001\t2026-03-08 08:00:58\t0\t15<br />
                                EMP-001\t2026-03-08 17:00:58\t1\t15
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfiguracionPage;
