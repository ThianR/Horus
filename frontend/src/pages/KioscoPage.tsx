import { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react';
import { asistenciaService, MarcacionRespuesta } from '../services/asistenciaService';
import { toast } from 'sonner';

const KioscoPage = () => {
    const [time, setTime] = useState(new Date());
    const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMessage, setErrorMessage] = useState('');
    const [result, setResult] = useState<MarcacionRespuesta | null>(null);
    const [tipo, setTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        iniciarCamara();
        return () => {
            clearInterval(timer);
            detenerCamara();
        };
    }, []);

    const iniciarCamara = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error al acceder a la cámara:", err);
            const msg = "No se pudo acceder a la cámara. Verifique los permisos.";
            setErrorMessage(msg);
            toast.error(msg);
            setStatus('ERROR');
        }
    };

    const detenerCamara = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleCaptura = async () => {
        if (!videoRef.current || !canvasRef.current || status !== 'IDLE') return;

        setStatus('PROCESSING');
        setErrorMessage('');

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
                if (blob) {
                    try {
                        const res = await asistenciaService.identificarRostro(blob, tipo);
                        setResult(res);
                        setStatus('SUCCESS');
                        setTimeout(() => setStatus('IDLE'), 5000);
                    } catch (err: any) {
                        console.error("Error en marcación:", err);
                        setErrorMessage(err.response?.data || "Error al identificar el rostro.");
                        setStatus('ERROR');
                        setTimeout(() => {
                            setStatus(prev => prev === 'ERROR' ? 'IDLE' : prev);
                        }, 4000);
                    }
                }
            }, 'image/jpeg', 0.9);
        }
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
                onClick={handleCaptura}>

                {/* Video Real */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
                />

                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay de Estado */}
                <div className={`absolute inset-0 transition-all duration-500 flex items-center justify-center ${status === 'IDLE' ? 'bg-black/20' : 'bg-black/40'}`}>
                    {status === 'IDLE' && (
                        <div className="flex flex-col items-center gap-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-blue-500 p-6 rounded-full shadow-lg shadow-blue-500/50">
                                <Camera size={40} />
                            </div>
                            <p className="text-xl font-medium bg-black/50 px-6 py-2 rounded-full backdrop-blur-md">Presione para marcar {tipo.toLowerCase()}</p>
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
                {status === 'SUCCESS' && result && (
                    <div className="absolute inset-0 z-20 bg-emerald-600/95 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 backdrop-blur-md">
                        <div className="bg-white/20 p-8 rounded-full mb-6">
                            <CheckCircle size={100} className="text-white" />
                        </div>
                        <h2 className="text-5xl font-bold text-white mb-2 text-center uppercase tracking-tight">¡{tipo} Registrada!</h2>
                        <p className="text-3xl text-emerald-100 font-medium mb-10">{result.nombreEmpleado}</p>

                        <div className="flex gap-4">
                            <div className="px-8 py-3 rounded-2xl bg-black/20 text-white font-bold border border-white/10">
                                {new Date(result.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Pantalla Error */}
                {status === 'ERROR' && (
                    <div className="absolute inset-0 z-20 bg-red-600/95 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 backdrop-blur-md p-8 text-center">
                        <AlertCircle size={100} className="mb-6 text-white" />
                        <h2 className="text-4xl font-bold text-white mb-4">Error al marcar</h2>
                        <p className="text-2xl text-red-100 max-w-md">{errorMessage}</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); setStatus('IDLE'); }}
                            className="mt-10 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Guías de Rostro */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-80 border-2 border-white/20 border-dashed rounded-[3rem]"></div>
                </div>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Tipo de Marcación</span>
                    <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700/50">
                        <button
                            onClick={() => setTipo('ENTRADA')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tipo === 'ENTRADA' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Entrada
                        </button>
                        <button
                            onClick={() => setTipo('SALIDA')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tipo === 'SALIDA' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Salida
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Sede</span>
                    <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        Sede Central - Online
                    </div>
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
