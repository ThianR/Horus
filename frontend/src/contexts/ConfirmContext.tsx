import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isAlert?: boolean;
}

interface ConfirmContextType {
    confirm: (options: string | ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
    const [resolver, setResolver] = useState<(value: boolean) => void>();

    const confirm = (opts: string | ConfirmOptions): Promise<boolean> => {
        if (typeof opts === 'string') {
            setOptions({ message: opts, type: 'warning' });
        } else {
            setOptions({ type: 'warning', ...opts });
        }
        setIsOpen(true);
        return new Promise((resolve) => {
            setResolver(() => resolve);
        });
    };

    const handleConfirm = () => {
        setIsOpen(false);
        if (resolver) resolver(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (resolver) resolver(false);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="glass-modal max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 rounded-[2rem] overflow-hidden transform animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4 mx-auto">
                                <AlertTriangle className="text-amber-400" size={24} />
                            </div>
                            <h3 className="text-xl font-black text-center text-white mb-2">
                                {options.title || 'Confirmar Acción'}
                            </h3>
                            <p className="text-slate-400 text-center text-sm mb-8">
                                {options.message}
                            </p>
                            <div className="flex gap-3">
                                {!options.isAlert && (
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-white/5 text-slate-300 rounded-xl font-bold transition-all text-sm"
                                    >
                                        {options.cancelText || 'Cancelar'}
                                    </button>
                                )}
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg ${
                                        options.type === 'danger'
                                            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
                                    }`}
                                >
                                    {options.confirmText || 'Aceptar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm debe usarse dentro de un ConfirmProvider');
    }
    return context;
};
