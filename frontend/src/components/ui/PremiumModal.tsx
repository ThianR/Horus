import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface PremiumModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
    icon?: React.ReactNode;
}

const PremiumModal: React.FC<PremiumModalProps> = ({
    title,
    isOpen,
    onClose,
    children,
    maxWidth = 'max-w-2xl',
    icon
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`
        relative w-full ${maxWidth} glass rounded-[2rem] shadow-2xl overflow-hidden
        animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-out
      `}>
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50 flex items-center justify-between premium-gradient">
                    <div className="flex items-center gap-4 text-white">
                        {icon && (
                            <div className="bg-white/20 p-2.5 rounded-2xl">
                                {icon}
                            </div>
                        )}
                        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all duration-200 active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default PremiumModal;
