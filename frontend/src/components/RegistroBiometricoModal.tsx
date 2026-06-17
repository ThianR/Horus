import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { asistenciaService } from '../services/asistenciaService';

interface RegistroBiometricoModalProps {
    isOpen: boolean;
    onClose: () => void;
    empleadoId: number;
    nombreEmpleado: string;
}

const PASOS_CAPTURA = [
    { id: 0, titulo: "Foto Frontal", instruccion: "Mire fijamente a la cámara." },
    { id: 1, titulo: "Perfil Izquierdo", instruccion: "Gire la cabeza ligeramente a la izquierda." },
    { id: 2, titulo: "Perfil Derecho", instruccion: "Gire la cabeza ligeramente a la derecha." }
];

const RegistroBiometricoModal: React.FC<RegistroBiometricoModalProps> = ({ isOpen, onClose, empleadoId, nombreEmpleado }) => {
    const [status, setStatus] = useState<'IDLE' | 'CAPTURING' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMessage, setErrorMessage] = useState('');
    const [pasoActual, setPasoActual] = useState(0);
    const [capturas, setCapturas] = useState<Blob[]>([]);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isOpen) {
            setPasoActual(0);
            setCapturas([]);
            iniciarCamara();
        } else {
            detenerCamara();
            setStatus('IDLE');
        }
    }, [isOpen]);

    const iniciarCamara = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setStatus('CAPTURING');
        } catch (err) {
            console.error("Error al acceder a la cámara:", err);
            setErrorMessage("No se pudo acceder a la cámara. Verifique los permisos.");
            setStatus('ERROR');
        }
    };

    const detenerCamara = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleCapturarPaso = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const nuevasCapturas = [...capturas, blob];
                    setCapturas(nuevasCapturas);
                    
                    if (pasoActual < 2) {
                        setPasoActual(pasoActual + 1);
                    } else {
                        // Ya tenemos las 3 fotos, enviar al servidor
                        enviarAlServidor(nuevasCapturas);
                    }
                }
            }, 'image/jpeg', 0.9);
        }
    };

    const enviarAlServidor = async (blobs: Blob[]) => {
        setStatus('SAVING');
        try {
            await asistenciaService.registrarRostro(empleadoId, blobs);
            setStatus('SUCCESS');
            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (err: any) {
            setErrorMessage(err.response?.data || "Error al registrar rostro. Intente nuevamente.");
            setStatus('ERROR');
            setCapturas([]); // Reiniciar si falla
            setPasoActual(0);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-lg glass rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Registro de Alta Precisión</h3>
                        <p className="text-sm text-slate-400">{nombreEmpleado}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center">
                    {/* Progreso de pasos */}
                    {status === 'CAPTURING' && (
                        <div className="w-full flex items-center justify-between mb-4">
                            {PASOS_CAPTURA.map((paso, index) => (
                                <div key={paso.id} className="flex flex-col items-center flex-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 transition-colors
                                        ${index < pasoActual ? 'bg-emerald-500 text-white' : 
                                          index === pasoActual ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' : 
                                          'bg-white/10 text-white/40'}`}>
                                        {index < pasoActual ? <CheckCircle size={16} /> : index + 1}
                                    </div>
                                    <span className={`text-[10px] sm:text-xs font-medium text-center
                                        ${index === pasoActual ? 'text-blue-400' : 'text-slate-500'}`}>
                                        {paso.titulo}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden mb-6 border border-white/10">
                        {status !== 'SUCCESS' && (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover ${status === 'SAVING' ? 'opacity-30 blur-sm' : ''}`}
                            />
                        )}
                        <canvas ref={canvasRef} className="hidden" />

                        {status === 'SAVING' && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                <RefreshCw className="animate-spin text-blue-500 mb-4" size={40} />
                                <p className="font-bold text-lg">Entrenando Modelo IA...</p>
                                <p className="text-sm text-slate-400">Guardando {capturas.length} muestras biométricas</p>
                            </div>
                        )}

                        {status === 'SUCCESS' && (
                            <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                <CheckCircle size={60} className="text-white mb-2" />
                                <p className="text-xl font-bold text-center px-4">¡Perfil Multi-Angular Completado!</p>
                            </div>
                        )}

                        {status === 'ERROR' && (
                            <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center p-6 text-center">
                                <AlertCircle size={40} className="mb-2 text-white" />
                                <p className="font-bold text-white text-lg mb-1">Error en Registro</p>
                                <p className="text-sm text-red-200 mb-6">{errorMessage}</p>
                                <button
                                    onClick={iniciarCamara}
                                    className="px-6 py-2 bg-white/20 hover:bg-white/30 transition-colors rounded-xl font-bold text-white shadow-lg"
                                >
                                    Reiniciar Proceso
                                </button>
                            </div>
                        )}

                        {/* Guías de Rostro */}
                        {status === 'CAPTURING' && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className={`w-48 h-60 border-2 border-dashed rounded-[2.5rem] transition-colors duration-500
                                    ${pasoActual === 0 ? 'border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 
                                      pasoActual === 1 ? 'border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 
                                      'border-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.3)]'}`}>
                                </div>
                            </div>
                        )}
                        
                        {/* Overlay de Instrucción */}
                        {status === 'CAPTURING' && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                <div className="bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-center animate-pulse">
                                    <p className="font-bold text-white">{PASOS_CAPTURA[pasoActual]?.instruccion}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 w-full mb-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCapturarPaso}
                            disabled={status !== 'CAPTURING'}
                            className={`flex-[2] py-3 px-6 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50
                                ${pasoActual === 2 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            <Camera size={20} />
                            {pasoActual === 2 ? 'Capturar y Finalizar' : `Capturar ${PASOS_CAPTURA[pasoActual]?.titulo}`}
                            {pasoActual < 2 && <ChevronRight size={18} />}
                        </button>
                    </div>

                    {/* Recomendaciones Minimalistas */}
                    <div className="w-full text-center text-xs text-slate-400 mt-2">
                        <p>Para mayor precisión, retire lentes de sol y mantenga buena iluminación.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistroBiometricoModal;
