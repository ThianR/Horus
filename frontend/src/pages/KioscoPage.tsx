import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, Loader2, BrainCircuit, Home, UserCheck, Hand } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { asistenciaService, MarcacionRespuesta } from '../services/asistenciaService';
import { toast } from 'sonner';

import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { playBeep, speakText, initAudioUtils } from '../utils/audioUtils';

import eyeLogo from '../assets/eye.svg';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos

const KioscoPage = () => {
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date());
    const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMessage, setErrorMessage] = useState('');
    const [result, setResult] = useState<MarcacionRespuesta | null>(null);
    const [tipo, setTipo] = useState<'ENTRADA' | 'SALIDA' | null>(null);
    const [isBiometricReady, setIsBiometricReady] = useState<boolean | null>(null);
    const isBiometricReadyRef = useRef<boolean>(false);
    const [deviceDetails, setDeviceDetails] = useState<any>(null);
    const [faceModel, setFaceModel] = useState<blazeface.BlazeFaceModel | null>(null);
    const faceModelRef = useRef<blazeface.BlazeFaceModel | null>(null);

    const tipoRef = useRef<'ENTRADA' | 'SALIDA' | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const debugRef = useRef<HTMLDivElement>(null);
    const checkIntervalRef = useRef<any>(null);
    
    // Referencias para la lógica continua
    const scanFrameRef = useRef<number>(0);
    const isProcessingRef = useRef<boolean>(false);
    const recentScansRef = useRef<Map<string, number>>(new Map());
    const inactivityTimerRef = useRef<any>(null);
    const lastScanTimeRef = useRef<number>(0);
    const hasSpokenPromptRef = useRef<boolean>(false);

    useEffect(() => {
        initAudioUtils();
        cargarModeloFace();
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
            if (scanFrameRef.current) cancelAnimationFrame(scanFrameRef.current);
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            detenerCamara();
        };
    }, []);

    // Reiniciar inactividad
    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }
        inactivityTimerRef.current = setTimeout(() => {
            tipoRef.current = null;
            setTipo(null);
            hasSpokenPromptRef.current = false;
        }, INACTIVITY_TIMEOUT_MS);
    }, []);

    useEffect(() => {
        if (tipo !== null) {
            resetInactivityTimer();
        }
    }, [tipo, resetInactivityTimer]);

    const cargarModeloFace = async () => {
        try {
            await tf.setBackend('webgl');
            const model = await blazeface.load();
            faceModelRef.current = model;
            setFaceModel(model);
            isBiometricReadyRef.current = true;
            setIsBiometricReady(true);
            toast.success("Motor de IA listo", { description: "El reconocimiento biométrico está activo y funcionando." });
        } catch (e) {
            console.error("Error al cargar modelo BlazeFace", e);
        }
    };

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
            isBiometricReadyRef.current = true;
        } else {
            if (isBiometricReady === true || isBiometricReady === null) {
                toast.error("Motor de IA no disponible", {
                    description: "El servicio de reconocimiento está apagado o en proceso de carga.",
                    duration: 8000
                });
            }
            setIsBiometricReady(false);
            isBiometricReadyRef.current = false;
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
                videoRef.current.onloadeddata = () => {
                    iniciarEscaneoContinuo();
                };
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

    const iniciarEscaneoContinuo = () => {
        const scan = async () => {
            if (!videoRef.current || !faceModelRef.current || isProcessingRef.current || !isBiometricReadyRef.current) {
                scanFrameRef.current = requestAnimationFrame(scan);
                return;
            }

            const now = Date.now();
            // Escanear cada 500ms para no saturar CPU local
            if (now - lastScanTimeRef.current < 500) {
                scanFrameRef.current = requestAnimationFrame(scan);
                return;
            }
            lastScanTimeRef.current = now;

            try {
                const predictions = await faceModelRef.current.estimateFaces(videoRef.current, false);
                
                if (predictions.length > 0) {
                    const face = predictions[0] as any;
                    const width = face.bottomRight[0] - face.topLeft[0];
                    const height = face.bottomRight[1] - face.topLeft[1];
                    const faceArea = width * height;
                    const videoArea = videoRef.current.videoWidth * videoRef.current.videoHeight;
                    
                    const ratio = faceArea / videoArea;
                    
                    if (debugRef.current) {
                        const porcentaje = (ratio * 100).toFixed(1);
                        debugRef.current.innerText = `Proximidad: ${porcentaje}% (Requerido: 15%)`;
                        if (ratio > 0.15) {
                            debugRef.current.className = "absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg transition-colors";
                            debugRef.current.innerText = `¡Rostro detectado! (${porcentaje}%)`;
                        } else {
                            debugRef.current.className = "absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-amber-400 text-sm font-semibold px-4 py-2 rounded-full shadow-lg transition-colors border border-amber-500/30";
                        }
                    }

                    // Si el rostro ocupa al menos el ~15% de la pantalla (distancia ideal para celulares y webcams)
                    if (ratio > 0.15) {
                        const currentTipo = tipoRef.current;
                        if (currentTipo === null) {
                            if (!hasSpokenPromptRef.current) {
                                hasSpokenPromptRef.current = true;
                                speakText("Por favor, seleccione Entrada o Salida en la pantalla.");
                            }
                        } else {
                            // Ejecutar marcacion automática
                            handleCapturaAutomatica(currentTipo);
                        }
                    }

                } else {
                    if (debugRef.current) {
                        debugRef.current.innerText = `Buscando rostro en cámara...`;
                        debugRef.current.className = "absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-slate-300 text-sm font-semibold px-4 py-2 rounded-full shadow-lg border border-white/10";
                    }
                }
            } catch (e) {
                console.error("Error en detección facial local", e);
            }

            scanFrameRef.current = requestAnimationFrame(scan);
        };
        scanFrameRef.current = requestAnimationFrame(scan);
    };

    const handleCapturaAutomatica = async (tipoActual: 'ENTRADA' | 'SALIDA') => {
        if (!videoRef.current || !canvasRef.current || isProcessingRef.current) return;
        
        isProcessingRef.current = true;
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
                            tipoActual, 
                            deviceDetails?.sedeId || 1
                        );
                        
                        const lastMarkTime = recentScansRef.current.get(res.nombreEmpleado);
                        const now = Date.now();
                        
                        if (lastMarkTime && (now - lastMarkTime < COOLDOWN_MS)) {
                            // Ignorar silenciosamente o mostrar un toast
                            toast.info(`Su marcación ya fue registrada recientemente, ${res.nombreEmpleado}`, { duration: 3000 });
                            setStatus('IDLE');
                            isProcessingRef.current = false;
                            return;
                        }

                        // Actualizar Cooldown y procesar exito
                        recentScansRef.current.set(res.nombreEmpleado, now);
                        setResult(res);
                        setStatus('SUCCESS');
                        resetInactivityTimer();
                        
                        // Feedback Auditivo
                        playBeep(tipoActual === 'ENTRADA' ? 'SUCCESS_ENTRADA' : 'SUCCESS_SALIDA');

                        // Pausa visual de 3 segundos
                        setTimeout(() => {
                            setStatus('IDLE');
                            isProcessingRef.current = false;
                        }, 3000);
                        
                    } catch (err: any) {
                        console.error("Error en marcación:", err);
                        const cleanError = err.response?.data?.message || err.response?.data || "Error al conectar con el servicio de biometría.";
                        
                        setErrorMessage(cleanError);
                        setStatus('ERROR');
                        playBeep('ERROR');

                        if (err.code === 'ERR_NETWORK' || cleanError.includes('conexión') || cleanError.includes('connect')) {
                            setIsBiometricReady(false);
                        }

                        setTimeout(() => {
                            setStatus(prev => prev === 'ERROR' ? 'IDLE' : prev);
                            isProcessingRef.current = false;
                        }, 3000);
                    }
                } else {
                    toast.error("Error al procesar la imagen de la cámara.");
                    isProcessingRef.current = false;
                    setStatus('IDLE');
                }
            }, 'image/jpeg', 0.9);
        } else {
            isProcessingRef.current = false;
            setStatus('IDLE');
        }
    };

    // Handler manual original (ahora opcional)
    const handleCaptura = () => {
        if (tipo !== null && status === 'IDLE' && !isProcessingRef.current) {
            handleCapturaAutomatica(tipo);
        }
    };

    const handleSeleccionarTipo = (t: 'ENTRADA' | 'SALIDA') => {
        // Al seleccionar, se activa el audio context si es requerido por el navegador
        initAudioUtils();
        tipoRef.current = t;
        setTipo(t);
        resetInactivityTimer();
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
                <span>Horus Point (Inicio)</span>
            </button>

            {/* Indicador de Estado Superior (Premium) */}
            <div className="absolute top-6 right-6 flex items-center gap-3 px-4 py-2 rounded-full glass border border-white/5">
                <div className={`w-2.5 h-2.5 rounded-full ${isBiometricReady === true && faceModel ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
                    IA: {isBiometricReady === true && faceModel ? 'Online (Auto-Scan)' : 'Cargando...'}
                </span>
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-16 w-full max-w-[1400px] z-10 px-4">
                
                {/* Lado Izquierdo: Control y Cámara */}
                <div className="flex-1 flex flex-col items-center w-full">
                    <div className="text-center mb-8 flex flex-col items-center">
                        <img src={eyeLogo} alt="Horus Logo" className="w-20 lg:w-24 mb-4 drop-shadow-[0_0_15px_rgba(33,243,255,0.3)]" />
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-2">
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </h1>
                        <p className="text-gray-400 text-lg lg:text-xl">
                            {time.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>

                    <div className={`w-full max-w-2xl aspect-video glass rounded-[2rem] relative overflow-hidden flex items-center justify-center group transition-all duration-500 ${isBiometricReady === false ? 'ring-2 ring-red-500/20' : tipo === null ? 'ring-2 ring-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'ring-2 ring-blue-500/30'}`}
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
                        <div className={`absolute inset-0 transition-all duration-500 flex items-center justify-center ${status === 'IDLE' && tipo !== null ? 'bg-black/10' : 'bg-black/40'}`}>
                            
                            {status === 'IDLE' && isBiometricReady === true && tipo === null && (
                                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 z-30">
                                    <div className="bg-amber-500/20 p-6 rounded-full border border-amber-500/30 mb-6 animate-pulse">
                                        <Hand size={50} className="text-amber-400" />
                                    </div>
                                    <h3 className="text-4xl font-bold text-white mb-4">Seleccione Tipo de Marcación</h3>
                                    <p className="text-xl text-gray-300">Por favor, toque <b className="text-blue-400">Entrada</b> o <b className="text-orange-400">Salida</b> en los botones inferiores para iniciar el reconocimiento.</p>
                                </div>
                            )}

                            {status === 'IDLE' && isBiometricReady !== true && (
                                <div className="flex flex-col items-center gap-4 text-white bg-black/60 inset-0 absolute justify-center backdrop-blur-sm px-10 text-center z-30">
                                    {isBiometricReady === false ? (
                                        <>
                                            <div className="bg-red-500/20 p-6 rounded-full border border-red-500/30 mb-2">
                                                <Loader2 size={40} className="text-red-400 animate-spin" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-red-100">Servicio No Disponible</h3>
                                            <p className="text-gray-300 max-w-sm">Verificando conexión con el motor IA...</p>
                                        </>
                                    ) : (
                                        <>
                                            <Loader2 size={40} className="text-blue-400 animate-spin mb-4" />
                                            <p className="text-xl font-medium">Iniciando Biometría...</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Escáner Visual (Barrido) */}
                        {status === 'PROCESSING' && (
                            <div className="absolute inset-0 z-10">
                                <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_#3b82f6] absolute top-0 animate-scan"></div>
                                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm">
                                    <UserCheck size={60} className="animate-pulse text-white drop-shadow-lg" />
                                </div>
                            </div>
                        )}

                        {/* Pantalla Exito */}
                        {status === 'SUCCESS' && result && (
                            <div className="absolute inset-0 z-20 bg-emerald-600/95 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 backdrop-blur-md">
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
                            <div className="absolute inset-0 z-20 bg-red-600/95 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 backdrop-blur-md p-8 text-center">
                                <AlertCircle size={100} className="mb-6 text-white" />
                                <h2 className="text-4xl font-bold text-white mb-4">Error de Reconocimiento</h2>
                                <p className="text-2xl text-red-100 max-w-md">{errorMessage}</p>
                            </div>
                        )}

                        {/* Guías de Rostro */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className={`w-64 h-80 border-2 rounded-[40px] transition-colors duration-500 ${
                                tipo === null ? 'border-orange-500/80 border-dashed animate-pulse' : 'border-white/20 border-dashed'
                            }`}></div>
                        </div>
                        
                        {/* Feedback Visual de Proximidad */}
                        <div 
                            ref={debugRef}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-slate-300 text-sm font-semibold px-4 py-2 rounded-full shadow-lg border border-white/10 transition-colors"
                        >
                            Iniciando cámara...
                        </div>
                    </div>

                    <div className="mt-12 flex flex-wrap justify-center gap-8">
                        <div className="flex flex-col items-center gap-1 relative z-40">
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Tipo de Marcación</span>
                            <div className={`flex p-1 rounded-xl border transition-all ${tipo === null ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse' : 'bg-slate-900/80 border-slate-700/50'}`}>
                                <button
                                    onClick={() => handleSeleccionarTipo('ENTRADA')}
                                    className={`px-8 py-3 rounded-lg text-lg font-bold transition-all ${tipo === 'ENTRADA' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                                >
                                    Entrada
                                </button>
                                <button
                                    onClick={() => handleSeleccionarTipo('SALIDA')}
                                    className={`px-8 py-3 rounded-lg text-lg font-bold transition-all ${tipo === 'SALIDA' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/50 scale-105' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
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
                <div className="w-full lg:w-96 flex flex-col gap-6 lg:mt-32 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="glass rounded-[2rem] p-8 border border-white/5 animate-in slide-in-from-right-8 duration-700">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                <RefreshCw className="text-blue-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-100">Modo Continuo</h3>
                        </div>

                        <div className="space-y-6">
                            <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                Este Kiosco opera en modo Touchless (sin contacto). Asegúrese de haber seleccionado el modo Entrada o Salida.
                            </p>
                            
                            <div className="flex gap-4">
                                <span className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">01</span>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Acérquese</h4>
                                    <p className="text-sm text-slate-400">Párese frente a la cámara hasta que la caja sea visible.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <span className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">02</span>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Espere el Tono</h4>
                                    <p className="text-sm text-slate-400">Al escuchar el Bip, su marcación se registrará automáticamente.</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 mt-6 pt-6 border-t border-white/10">
                                <AlertCircle className="text-amber-400 shrink-0 mt-1" size={20} />
                                <p className="text-xs text-amber-200/70">Si varias personas marcan el mismo estado de forma seguida, no es necesario volver a tocar la pantalla.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
        </div>
    );
};

export default KioscoPage;
