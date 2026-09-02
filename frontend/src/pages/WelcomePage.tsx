import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, LayoutDashboard, Fingerprint } from 'lucide-react';
import HorusLogo from '../components/common/HorusLogo';
import eyeLogo from '../assets/eye.svg';

const WelcomePage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/admin');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1e293b] via-[#020617] to-[#020617]">
            {/* Fondo con watermark decorativo */}
            <div className="absolute top-[-10%] left-[-10%] opacity-[0.03] pointer-events-none select-none">
                <img src={eyeLogo} alt="" className="w-[800px] rotate-12" />
            </div>
            <div className="absolute bottom-[-5%] right-[-5%] opacity-[0.03] pointer-events-none select-none">
                <img src={eyeLogo} alt="" className="w-[600px] -rotate-12" />
            </div>

            {/* Logo Central con Animación al Hover */}
            <div className="mb-16 z-10 scale-125 md:scale-150 transition-transform hover:scale-[1.6] duration-500">
                <HorusLogo width={350} />
            </div>

            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 z-10 px-4">
                {/* Opción Kiosco */}
                <button
                    onClick={() => navigate('/kiosco')}
                    className="group relative flex flex-col items-center p-10 rounded-[2.5rem] glass border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-500 shadow-2xl hover:shadow-blue-500/10 overflow-hidden text-left"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                        <Fingerprint size={120} className="text-blue-400" />
                    </div>

                    <div className="p-6 bg-blue-600/20 rounded-3xl mb-6 shadow-inner border border-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 self-center">
                        <Camera size={48} className="text-blue-400" />
                    </div>

                    <h2 className="text-3xl font-bold mb-3 tracking-tight group-hover:text-blue-300 transition-colors self-center">Horus Point</h2>
                    <p className="text-gray-400 text-center text-sm leading-relaxed max-w-[250px] self-center">
                        Punto de acceso biométrico para empleados. Registro de entrada y salida vía reconocimiento facial.
                    </p>

                    <div className="mt-8 px-6 py-2 rounded-full border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all self-center">
                        Acceder al punto
                    </div>
                </button>

                {/* Opción Admin */}
                <button
                    onClick={() => navigate('/login')}
                    className="group relative flex flex-col items-center p-10 rounded-[2.5rem] glass border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-500 shadow-2xl hover:shadow-emerald-500/10 overflow-hidden text-left"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity text-emerald-400">
                        <LayoutDashboard size={120} />
                    </div>

                    <div className="p-6 bg-emerald-600/20 rounded-3xl mb-6 shadow-inner border border-emerald-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 self-center">
                        <ShieldCheck size={48} className="text-emerald-400" />
                    </div>

                    <h2 className="text-3xl font-bold mb-3 tracking-tight group-hover:text-emerald-300 transition-colors self-center">Gestión Admin</h2>
                    <p className="text-gray-400 text-center text-sm leading-relaxed max-w-[250px] self-center">
                        Portal exclusivo para administradores. Gestión de personal, horarios y reportes.
                    </p>

                    <div className="mt-8 px-6 py-2 rounded-full border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest group-hover:bg-emerald-600 group-hover:text-white transition-all self-center">
                        Iniciar Sesión
                    </div>
                </button>
            </div>

            {/* Footer Minimalista */}
            <div className="mt-20 text-[10px] text-gray-500 uppercase tracking-[0.3em] font-medium z-10 flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
                Horus Visionary Systems Lab &middot; 2026
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
            </div>
        </div>
    );
};

export default WelcomePage;
