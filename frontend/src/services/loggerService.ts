import axios from 'axios';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

const sendLog = async (level: LogLevel, message: string) => {
    try {
        // Usamos axios directo para evitar loops con interceptores si los hubiera
        await axios.post('/api/logs', { level, message }, {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('No se pudo enviar el log al servidor:', e);
    }
};

export const logger = {
    info: (msg: string) => {
        console.log(msg);
        sendLog('INFO', msg);
    },
    warn: (msg: string) => {
        console.warn(msg);
        sendLog('WARN', msg);
    },
    error: (msg: string, err?: any) => {
        const fullMsg = err ? `${msg} | Error: ${JSON.stringify(err)}` : msg;
        console.error(fullMsg);
        sendLog('ERROR', fullMsg);
    }
};
