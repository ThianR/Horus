import { useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const KioscoPage = () => {
    const [time, setTime] = useState(new Date());
    const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleMaca = () => {
        setStatus('PROCESSING');
        setTimeout(() => {
            setStatus('SUCCESS');
            setTimeout(() => setStatus('IDLE'), 3000);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1e293b] via-[#020617] to-[#020617]">
            <div className="text-center mb-10">
                <h1 className="text-6xl font-bold tracking-tight mb-2">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h1>
                <p className="text-gray-400 text-xl">
                    {time.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>

            <div className="w-full max-w-2xl aspect-video glass rounded-[2rem] relative overflow-hidden flex items-center justify-center group cursor-pointer"
                onClick={status === 'IDLE' ? handleMaca : undefined}>

                {/* Simulación de Cámara */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    {status === 'IDLE' && (
                        <div className="flex flex-col items-center gap-4 text-white/50 animate-pulse">
                            <Camera size={80} />
                            <p className="text-xl font-medium">Posicione su rostro frente a la cámara</p>
                        </div>
                    )}
                </div>

                {/* Escáner Visual (Barrido) */}
                {status === 'PROCESSING' && (
                    <div className="absolute inset-0 z-10">
                        <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_#3b82f6] absolute top-0 animate-scan"></div>
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10">
                            <RefreshCw size={60} className="animate-spin text-blue-400" />
                        </div>
                    </div>
                )}

                {/* Pantalla Exito */}
                {status === 'SUCCESS' && (
                    <div className="absolute inset-0 z-20 bg-green-500/90 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        <CheckCircle size={100} className="mb-4" />
                        <h2 className="text-4xl font-bold">¡Bienvenido!</h2>
                        <p className="text-2xl mt-2">DNI 7485XXXX - Juan Pérez</p>
                        <div className="mt-8 px-6 py-2 rounded-full bg-white/20 font-bold">
                            ENTRADA REGISTRADA
                        </div>
                    </div>
                )}

                {/* Guías de Rostro */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-80 border-2 border-white/20 border-dashed rounded-[3rem]"></div>
                </div>
            </div>

            <div className="mt-12 flex gap-8">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Estado de Sede</span>
                    <div className="flex items-center gap-2 text-green-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        Sede Central - Online
                    </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Dipositivo</span>
                    <span className="font-bold">Kiosco-01</span>
                </div>
            </div>

            <style>{`
        @keyframes scan {
            0% { top: 0% }
            100% { top: 100% }
        }
        .animate-scan {
            animation: scan 2s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default KioscoPage;
