/**
 * Oculus Device Fingerprinting Utility
 * Genera un identificador único basado en características de hardware y software del navegador.
 */

export const generateDeviceFingerprint = async (): Promise<string> => {
    const components: string[] = [];

    // 1. Información básica del navegador/SO
    components.push(navigator.userAgent);
    components.push(navigator.language);
    components.push(screen.colorDepth.toString());
    components.push(`${screen.width}x${screen.height}`);
    components.push(new Date().getTimezoneOffset().toString());
    components.push((navigator as any).hardwareConcurrency?.toString() || "0");

    // 2. Canvas Fingerprinting (GPU Rendering peculiarities)
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            canvas.width = 200;
            canvas.height = 50;
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText("Oculus-ID-Check", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("Oculus-ID-Check", 4, 17);
            components.push(canvas.toDataURL());
        }
    } catch (e) {}

    // 3. WebGL Vendor/Renderer (Hardware exacto de GPU)
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
        if (gl) {
            const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                components.push((gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
                components.push((gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
            }
        }
    } catch (e) {}

    // Concatenar y hashear
    const str = components.join('|');
    return hashString(str);
};

/**
 * Función de hashing compatible con contextos no seguros (HTTP por IP)
 */
async function hashString(str: string): Promise<string> {
    // Intentar usar SubtleCrypto (SHA-256) si está disponible (Contextos Seguros/Localhost)
    if (window.crypto && window.crypto.subtle) {
        try {
            const msgUint8 = new TextEncoder().encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return `OC-HW-${hashHex.substring(0, 16).toUpperCase()}`;
        } catch (e) {
            console.warn("Error usando SubtleCrypto, usando fallback:", e);
        }
    }

    // Fallback: Algoritmo de hash simple para contextos HTTP (no seguros)
    // Esto permite que funcione por IP en redes locales sin HTTPS
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a entero de 32 bits
    }
    
    // Convertir a hexadecimal positivo y formatear como ID de Oculus
    const hashHex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    return `OC-HW-IP-${hashHex}`;
}

/**
 * Obtiene el ID del dispositivo persistente (del localStorage o lo genera de nuevo)
 */
export const getPersistentDeviceId = async (): Promise<string> => {
    let devId = localStorage.getItem('oculus_device_id');
    if (!devId) {
        devId = await generateDeviceFingerprint();
        localStorage.setItem('oculus_device_id', devId);
    }
    return devId;
};
