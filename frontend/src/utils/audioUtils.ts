export const playBeep = (type: 'SUCCESS_ENTRADA' | 'SUCCESS_SALIDA' | 'ERROR') => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'SUCCESS_ENTRADA') {
            // Tono agudo y ascendente
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);

        } else if (type === 'SUCCESS_SALIDA') {
            // Tono grave y descendente
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.4);

        } else if (type === 'ERROR') {
            // Tono de error grave
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
            
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
            
            // Segundo beep de error
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(150, audioCtx.currentTime + 0.15);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            
            gain2.gain.setValueAtTime(0, audioCtx.currentTime + 0.15);
            gain2.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.2);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
            
            osc2.start(audioCtx.currentTime + 0.15);
            osc2.stop(audioCtx.currentTime + 0.45);
        }
    } catch (e) {
        console.error('Error al reproducir audio sintético:', e);
    }
};

export const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
        // Cancelar si ya hay algo hablando
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Intentar encontrar una voz natural en español
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(v => v.lang.startsWith('es'));
        if (spanishVoice) {
            utterance.voice = spanishVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
};

export const initAudioUtils = () => {
    // Para precargar voces en algunos navegadores
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
    }
};
