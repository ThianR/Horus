import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { asistenciaService } from '../services/asistenciaService';

interface RegistroBiometricoModalProps {
    isOpen: boolean;
    onClose: () => void;
    empleadoId: number;
    nombreEmpleado: string;
}

const RegistroBiometricoModal: React.FC<RegistroBiometricoModalProps> = ({ isOpen, onClose, empleadoId, nombreEmpleado }) => {
    const [status, setStatus] = useState<'IDLE' | 'CAPTURING' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMessage, setErrorMessage] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isOpen) {
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

    const handleCapturaYRegistro = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setStatus('SAVING');
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
                        await asistenciaService.registrarRostro(empleadoId, blob);
                        setStatus('SUCCESS');
                        setTimeout(() => {
                            onClose();
                        }, 2000);
                    } catch (err: any) {
                        setErrorMessage(err.response?.data || "Error al registrar rostro.");
                        setStatus('ERROR');
                    }
                }
            }, 'image/jpeg', 0.9);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-lg glass rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Registrar Rostro</h3>
                        <p className="text-sm text-slate-400">{nombreEmpleado}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center">
                    <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden mb-6 border border-white/10">
                        {status !== 'SUCCESS' && (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        )}
                        <canvas ref={canvasRef} className="hidden" />

                        {status === 'SAVING' && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                <RefreshCw className="animate-spin text-blue-500 mb-2" size={40} />
                                <p className="font-medium">Procesando...</p>
                            </div>
                        )}

                        {status === 'SUCCESS' && (
                            <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                <CheckCircle size={60} className="text-white mb-2" />
                                <p className="text-xl font-bold">¡Rostro Registrado!</p>
                            </div>
                        )}

                        {status === 'ERROR' && (
                            <div className="absolute inset-0 bg-red-600/90 flex flex-col items-center justify-center p-6 text-center">
                                <AlertCircle size={40} className="mb-2" />
                                <p className="font-bold">Error</p>
                                <p className="text-sm opacity-90">{errorMessage}</p>
                                <button
                                    onClick={iniciarCamara}
                                    className="mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm font-bold"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {/* Guías de Rostro */}
                        {status === 'CAPTURING' && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-48 h-60 border-2 border-white/30 border-dashed rounded-[2.5rem]"></div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 w-full mb-6">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCapturaYRegistro}
                            disabled={status !== 'CAPTURING'}
                            className="flex-3 py-3 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Camera size={20} />
                            Capturar y Registrar
                        </button>
                    </div>

                    {/* Recomendaciones de Captura */}
                    <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/5">
                        <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                            <AlertCircle size={16} /> Indicaciones para un Registro Óptimo:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
                            <div className="flex gap-2 text-slate-300">
                                <span className="font-bold text-blue-500">1.</span>
                                <p><span className="text-white font-medium">Luz Frontal:</span> Evite sombras fuertes o contraluces potentes.</p>
                            </div>
                            <div className="flex gap-2 text-slate-300">
                                <span className="font-bold text-blue-500">2.</span>
                                <p><span className="text-white font-medium">Postura:</span> Mire al centro a la altura de sus ojos.</p>
                            </div>
                            <div className="flex gap-2 text-slate-300">
                                <span className="font-bold text-blue-500">3.</span>
                                <p><span className="text-white font-medium">Despejado:</span> Retire gafas de sol, mascarillas o bufandas.</p>
                            </div>
                            <div className="flex gap-2 text-slate-300">
                                <span className="font-bold text-blue-500">4.</span>
                                <p><span className="text-white font-medium">Cabeza Recta:</span> Evite inclinar o girar el rostro hacia los lados.</p>
                            </div>
                            <div className="flex gap-2 text-slate-300">
                                <span className="font-bold text-blue-500">5.</span>
                                <p><span className="text-white font-medium">Cambios:</span> Si cambia drásticamente de look (ej. barba larga), realice un nuevo registro.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistroBiometricoModal;
