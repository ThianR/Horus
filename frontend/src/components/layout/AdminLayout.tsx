import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
}

import eyeLogo from '../../assets/eye.svg';
import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext';
import { HelpCircle } from 'lucide-react';

const TopbarHelpButton = () => {
    const { startTour } = useOnboarding();
    return (
        <button
            onClick={startTour}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ml-auto"
            title="Iniciar Guía Interactiva"
        >
            <HelpCircle size={22} />
        </button>
    );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <OnboardingProvider>
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
                    <img src={eyeLogo} alt="Logo" className="w-6 h-6 hidden lg:block" />
                    <span className="text-base font-bold text-gradient lg:hidden">Oculus Admin</span>
                    <TopbarHelpButton />
                </header>

                {/* Área de contenido */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
                    {/* Marca de agua de fondo */}
                    <div className="fixed bottom-[-10%] right-[-5%] opacity-[0.03] pointer-events-none select-none z-0">
                        <img src={eyeLogo} alt="" className="w-[500px]" />
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
        </OnboardingProvider>
    );
};

export default AdminLayout;
