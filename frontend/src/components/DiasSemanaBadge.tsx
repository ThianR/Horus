import React from 'react';

interface DiasSemanaBadgeProps {
    diasSeleccionados?: string; // Formato: "LUN,MAR,MIE..."
}

const DIAS_MAP = [
    { key: 'LUN', label: 'L' },
    { key: 'MAR', label: 'M' },
    { key: 'MIE', label: 'M' },
    { key: 'JUE', label: 'J' },
    { key: 'VIE', label: 'V' },
    { key: 'SAB', label: 'S' },
    { key: 'DOM', label: 'D' }
];

const DiasSemanaBadge = ({ diasSeleccionados = "" }: DiasSemanaBadgeProps) => {
    const listaDias = diasSeleccionados.split(',').map(d => d.trim().toUpperCase());

    return (
        <div className="flex gap-1 mt-1">
            {DIAS_MAP.map((dia, index) => {
                const isSelected = listaDias.includes(dia.key);
                return (
                    <span
                        key={index}
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold transition-all border ${isSelected
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                : 'bg-slate-800/50 text-slate-600 border-slate-800'
                            }`}
                        title={dia.key}
                    >
                        {dia.label}
                    </span>
                );
            })}
        </div>
    );
};

export default DiasSemanaBadge;
