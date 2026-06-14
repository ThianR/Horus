import { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, Loader2, BrainCircuit, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { asistenciaService, MarcacionRespuesta } from '../services/asistenciaService';
import { toast } from 'sonner';

import eyeLogo from '../assets/eye.svg';

const KioscoPage = () => {
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date());
    const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMessage, setErrorMessage] = useState('');
    const [result, setResult] = useState<MarcacionRespuesta | null>(null);
    const [tipo, setTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
    const [isBiometricReady, setIsBiometricReady] = useState<boolean | null>(null);
    const [deviceDetails, setDeviceDetails] = useState<any>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const checkIntervalRef = useRef<any>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        iniciarCamara();
        verificarSaludBiometria();
        cargarDatosDispositivo();

        checkIntervalRef.current = setInterval(() => {
            if (isBiometricReady !== true) {
                verificarSaludBiometria(true); // silent true para no mostrar toasts repetitivos
            }
        }, 15000);

        return () => {
            clearInterval(timer);
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
            detenerCamara();
        };
    }, [isBiometricReady]);

    const verificarSaludBiometria = async (silent = false) => {
        if (!silent && isBiometricReady === null) {
            toast.info("Iniciando motor de reconocimiento facial...", {
                description: "Esto puede tardar un momento mientras los modelos de IA se cargan en memoria.",
                icon: <BrainCircuit className="text-blue-400" />,
                duration: 6000
            });
        }

        const isReady = await asistenciaService.checkPythonHealth();

        if (isReady) {
            if (isBiometricReady === false || isBiometricReady === null) {
                toast.success("Motor de IA listo", {
                    description: "El reconocimiento biométrico está activo y funcionando.",
                    icon: <CheckCircle className="text-emerald-400" />
                });
            }
            setIsBiometricReady(true);
        } else {
            if (isBiometricReady === true || isBiometricReady === null) {
                toast.error("Motor de IA no disponible", {
                    description: "El servicio de reconocimiento está apagado o en proceso de carga.",
                    duration: 8000
                });
            }
            setIsBiometricReady(false);
        }
    };

    const cargarDatosDispositivo = async () => {
        const { dispositivoAuthService } = await import('../services/dispositivoService');
        const data = await dispositivoAuthService.validarDispositivoActual();
        if (data) {
            setDeviceDetails(data);
        } else {
            toast.error("Equipo no registrado", { description: "Debe registrar esta terminal antes de usar el Kiosco." });
            navigate('/login');
        }
    };

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

        if (isBiometricReady === false) {
            toast.warning("Servicio no listo", {
                description: "Por favor espere a que el motor de IA termine de iniciar.",
            });
            return;
        }

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
                        const res = await asistenciaService.identificarRostro(
                            blob, 
                            tipo, 
                            deviceDetails?.sedeId || 1 // Fallback a 1 si no hay dispositivo (aunque App.tsx debería bloquear esto)
                        );
                        setResult(res);
                        setStatus('SUCCESS');
                        setTimeout(() => setStatus('IDLE'), 5000);
                    } catch (err: any) {
                        console.error("Error en marcación:", err);
                        const cleanError = err.response?.data?.message || err.response?.data || "Error al conectar con el servicio de biometría.";
                        setErrorMessage(cleanError);
                        setStatus('ERROR');

                        // Si es error de conexión, marcamos como no listo
                        if (err.code === 'ERR_NETWORK' || cleanError.includes('conexión') || cleanError.includes('connect')) {
                            setIsBiometricReady(false);
                        }

                        setTimeout(() => {
                            setStatus(prev => prev === 'ERROR' ? 'IDLE' : prev);
                        }, 5000);
                    }
                }
            }, 'image/jpeg', 0.9);
        }
    };

    const handleGoHome = () => {
        if (localStorage.getItem('token')) {
            navigate('/admin');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1e293b] via-[#020617] to-[#020617]">
            {/* Botón Volver (Premium) */}
            <button
                onClick={handleGoHome}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white z-20"
            >
                <Home size={16} />
                <span>Oculus Point (Inicio)</span>
            </button>

            {/* Indicador de Estado Superior (Premium) */}
            <div className="absolute top-6 right-6 flex items-center gap-3 px-4 py-2 rounded-full glass border border-white/5">
                <div className={`w-2.5 h-2.5 rounded-full ${isBiometricReady === true ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isBiometricReady === false ? 'bg-red-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
                    IA: {isBiometricReady === true ? 'Online' : isBiometricReady === false ? 'Offline / Cargando' : 'Verificando...'}
                </span>
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-16 w-full max-w-[1400px] z-10 px-4">
                
                {/* Lado Izquierdo: Control y Cámara */}
                <div className="flex-1 flex flex-col items-center w-full">
                    <div className="text-center mb-8 flex flex-col items-center">
                        <img src={eyeLogo} alt="Oculus Logo" className="w-20 lg:w-24 mb-4 drop-shadow-[0_0_15px_rgba(33,243,255,0.3)]" />
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-2">
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </h1>
                        <p className="text-gray-400 text-lg lg:text-xl">
                            {time.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>

                    <div className={`w-full max-w-2xl aspect-video glass rounded-[2rem] relative overflow-hidden flex items-center justify-center group cursor-pointer transition-all duration-500 ${isBiometricReady === false ? 'ring-2 ring-red-500/20' : 'hover:ring-2 hover:ring-blue-500/30'}`}
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
                            {status === 'IDLE' && isBiometricReady === true && (
                                <div className="flex flex-col items-center gap-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-blue-600 p-6 rounded-full shadow-lg shadow-blue-600/50">
                                        <Camera size={40} />
                                    </div>
                                    <p className="text-xl font-medium bg-black/50 px-6 py-2 rounded-full backdrop-blur-md">Presione para marcar {tipo.toLowerCase()}</p>
                                </div>
                            )}

                            {status === 'IDLE' && isBiometricReady !== true && (
                                <div className="flex flex-col items-center gap-4 text-white bg-black/60 inset-0 absolute items-center justify-center backdrop-blur-sm px-10 text-center">
                                    {isBiometricReady === false ? (
                                        <>
                                            <div className="bg-red-500/20 p-6 rounded-full border border-red-500/30 mb-2">
                                                <Loader2 size={40} className="text-red-400 animate-spin" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-red-100">Cargando Inteligencia Artificial</h3>
                                            <p className="text-gray-300 max-w-sm">El sistema de reconocimiento facial se está iniciando. Por favor, espere unos segundos...</p>
                                        </>
                                    ) : (
                                        <>
                                            <Loader2 size={40} className="text-blue-400 animate-spin mb-4" />
                                            <p className="text-xl font-medium">Verificando conexión biométrica...</p>
                                        </>
                                    )}
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
                                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-2 text-center uppercase tracking-tight">¡{tipo} Registrada!</h2>
                                <p className="text-2xl lg:text-3xl text-emerald-100 font-medium mb-6">{result.nombreEmpleado}</p>

                                <div className="flex flex-col items-center gap-4">
                                    <div className="px-8 py-3 rounded-2xl bg-black/20 text-white font-bold border border-white/10 text-xl">
                                        {new Date(result.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                    
                                    {result.fueraDeSede && result.mensajeAviso && (
                                        <div className="mt-4 px-6 py-4 bg-amber-500/20 border border-amber-400/50 rounded-xl text-amber-100 flex flex-col items-center text-center max-w-md animate-in slide-in-from-bottom-4">
                                            <AlertCircle size={24} className="text-amber-400 mb-2" />
                                            <p className="text-sm font-bold uppercase tracking-widest text-amber-300 mb-1">Advertencia de Cobertura</p>
                                            <p className="text-base">{result.mensajeAviso}</p>
                                        </div>
                                    )}
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
                            <div className="w-64 h-80 border-2 border-white/10 border-dashed rounded-[3rem]"></div>
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
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Sede Autorizada</span>
                            <div className="flex items-center gap-2 text-blue-400 font-bold bg-blue-400/5 px-4 py-1.5 rounded-full border border-blue-400/20">
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                {deviceDetails?.nombre || 'Sede Central'} - Online
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lado Derecho: Recomendaciones (Sidebar en Desktop) */}
                <div className="w-full lg:w-96 flex flex-col gap-6 lg:mt-32">
                    <div className="glass rounded-[2rem] p-8 border border-white/5 animate-in slide-in-from-right-8 duration-700">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                <AlertCircle className="text-blue-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-100">Guía de Marcación</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <span className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">01</span>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Luz Frontal</h4>
                                    <p className="text-sm text-slate-400">Evite estar a contraluz o tener sombras fuertes en el rostro.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <span className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">02</span>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Postura Recta</h4>
                                    <p className="text-sm text-slate-400">Mire directamente a la cámara a la altura de sus ojos.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <span className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">03</span>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Rostro Despejado</h4>
                                    <p className="text-sm text-slate-400">Retire gafas de sol, mascarillas o bufandas que cubran su cara.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <span className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">04</span>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Sin Inclinaciones</h4>
                                    <p className="text-sm text-slate-400">No incline ni gire la cabeza hacia los lados al marcar.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <span className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">05</span>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Cambio de Look</h4>
                                    <p className="text-sm text-slate-400 text-balance">Si cambia drásticamente (ej. mucha barba), solicite un nuevo registro.</p>
                                </div>
                            </div>
                        </div>
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
