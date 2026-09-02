import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Home } from 'lucide-react';
import axios from 'axios';
import HorusLogo from '../components/common/HorusLogo';
import eyeLogo from '../assets/eye.svg';
import { toast } from 'sonner';
import { getPersistentDeviceId } from '../utils/deviceFingerprint';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [hardwareId, setHardwareId] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const getHW = async () => {
            const id = await getPersistentDeviceId();
            setHardwareId(id);
        };
        getHW();
        
        if (localStorage.getItem('token')) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/login', {
                username,
                password
            });

            if (response.data.token) {
                await login(response.data.token);
                navigate('/admin/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
            console.error("Error de login:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#020617]">
            {/* Botón Volver al Home */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white z-20"
            >
                <Home size={16} />
                <span>Inicio</span>
            </button>

            {/* Fondo con watermark decorativo */}
            <div className="absolute top-[-10%] left-[-10%] opacity-[0.02] pointer-events-none select-none">
                <img src={eyeLogo} alt="" className="w-[600px] rotate-12" />
            </div>
            <div className="absolute bottom-[-5%] right-[-5%] opacity-[0.02] pointer-events-none select-none">
                <img src={eyeLogo} alt="" className="w-[500px] -rotate-12" />
            </div>

            <div className="glass p-8 rounded-3xl w-full max-w-md flex flex-col items-center relative z-10 shadow-2xl">
                <div className="mb-6">
                    <HorusLogo width={280} />
                </div>
                <p className="text-gray-400 mb-8 text-center text-sm">Sistema de Control de Asistencia Biométrico</p>

                <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5 focus-within:text-blue-400 transition-colors">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Usuario</label>
                        <input
                            type="text"
                            placeholder="Ingrese su usuario"
                            className="w-full"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 focus-within:text-blue-400 transition-colors">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="premium-gradient mt-2 py-4 text-white hover:opacity-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group transition-all rounded-2xl font-bold shadow-lg shadow-blue-500/20"
                    >
                        <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                        {loading ? 'Validando acceso...' : 'Ingresar al Sistema'}
                    </button>
                </form>

                {/* ID de Hardware para Depuración/Registro */}
                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 w-full">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID de Hardware Actual</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <code className="text-xs text-blue-400 font-mono break-all line-clamp-1">{hardwareId || 'Generando...'}</code>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(hardwareId);
                                toast.success('Hardware ID copiado al portapapeles');
                            }}
                            className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-gray-300 transition-all font-bold uppercase"
                        >
                            Copiar
                        </button>
                    </div>
                    <p className="text-[9px] text-gray-600 mt-2 leading-tight">
                        Si este dispositivo ya está registrado, verifique que el ID coincida en el panel de administración.
                    </p>
                </div>

                <div className="mt-10 text-[10px] text-gray-500 border-t border-white/5 pt-5 w-full text-center uppercase tracking-[0.2em]">
                    Horus Security &middot; Versión 1.0.0 &copy; 2026
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
