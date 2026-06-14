import { useState, useEffect } from 'react';
import { Lock, Cpu, KeyRound, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ActivacionPage() {
    const [hwid, setHwid] = useState('Cargando...');
    const [token, setToken] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch HWID
        api.get('/licencia/estado').then(res => {
            setHwid(res.data.hardwareId);
            setMensaje(res.data.mensaje);
            if (res.data.valida) {
                navigate('/login');
            }
        }).catch(err => {
            // It will return 402 if invalid, we catch the response anyway
            if (err.response?.data?.hwid) {
                setHwid(err.response.data.hwid);
                setMensaje(err.response.data.mensaje);
            }
        });
    }, [navigate]);

    const handleActivar = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/licencia/activar', { token });
            toast.success("¡Software Activado Correctamente!");
            // Reload page or navigate to login
            setTimeout(() => window.location.href = '/login', 1500);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al activar la licencia");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="glass max-w-2xl w-full rounded-3xl p-8 md:p-12 border border-slate-800 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                        <Lock size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Oculus <span className="text-rose-500">Bloqueado</span></h1>
                    <p className="text-slate-400 text-lg">{mensaje || 'La licencia actual ha expirado o no es válida para este servidor.'}</p>
                </div>

                <div className="space-y-8">
                    {/* HWID Section */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <Cpu size={100} />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-2">Hardware ID de este Servidor</h2>
                        <div className="flex items-center gap-4">
                            <code className="flex-1 bg-black/50 text-emerald-400 p-4 rounded-xl font-mono text-xl text-center border border-emerald-500/20 select-all">
                                {hwid}
                            </code>
                        </div>
                        <p className="text-sm text-slate-400 mt-4 flex items-center gap-2">
                            <ShieldAlert size={16} className="text-amber-500"/>
                            Copia este código y envíaselo a tu proveedor para obtener una llave válida.
                        </p>
                    </div>

                    {/* Activation Form */}
                    <form onSubmit={handleActivar} className="space-y-4">
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest text-slate-500 mb-2">
                                Llave de Activación (Token)
                            </label>
                            <textarea
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                rows={4}
                                required
                                placeholder="Pega aquí el contenido de oculus.lic o el token enviado por tu proveedor..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !token.trim()}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <KeyRound size={20} />
                                    Activar Software
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
