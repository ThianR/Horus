import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white">
            {/* Sidebar: fijo en desktop, drawer en mobile */}
            <Sidebar
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar mobile con botón hamburguesa */}
                <header className="lg:hidden sticky top-0 z-30 glass border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        aria-label="Abrir menú"
                    >
                        <Menu size={22} />
                    </button>
                    <span className="text-base font-bold text-gradient">Oculus Admin</span>
                </header>

                {/* Área de contenido */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
