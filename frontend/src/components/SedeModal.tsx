import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SedeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sede: any) => void;
    sede?: any;
}

const SedeModal = ({ isOpen, onClose, onSave, sede }: SedeModalProps) => {
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        codigoExterno: ''
    });

    useEffect(() => {
        if (sede) {
            setFormData({
                nombre: sede.nombre || '',
                direccion: sede.direccion || '',
                codigoExterno: sede.codigoExterno || ''
            });
        } else {
            setFormData({
                nombre: '',
                direccion: '',
                codigoExterno: ''
            });
        }
    }, [sede, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...sede, ...formData });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6">
                    {sede ? 'Editar Sede' : 'Nueva Sede'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Ej: Sede Central"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">
                            Dirección
                        </label>
                        <input
                            type="text"
                            value={formData.direccion}
                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Ej: Av. España 1234"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">
                            Código Externo
                        </label>
                        <input
                            type="text"
                            value={formData.codigoExterno}
                            onChange={(e) => setFormData({ ...formData, codigoExterno: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Ej: SC-001"
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 glass px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 premium-gradient px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            {sede ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SedeModal;
