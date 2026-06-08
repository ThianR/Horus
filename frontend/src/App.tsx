import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import KioscoPage from './pages/KioscoPage';
import EmpleadosPage from './pages/EmpleadosPage';
import HorariosPage from './pages/HorariosPage';
import { Toaster } from 'sonner';
import AdminLayout from './components/layout/AdminLayout';
import OrganizacionPage from './pages/OrganizacionPage';
import WelcomePage from './pages/WelcomePage';
import ReportesPage from './pages/ReportesPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import AsistenciasPage from './pages/AsistenciasPage';

import ProtectedRoute from './components/auth/ProtectedRoute';
import { dispositivoAuthService } from './services/dispositivoService';
import { Globe, Shield } from 'lucide-react';

import { ConfirmProvider } from './contexts/ConfirmContext';

function App() {
    const [isValidating, setIsValidating] = useState(true);
    const [isDeviceAuthorized, setIsDeviceAuthorized] = useState(false);

    useEffect(() => {
        const checkDevice = async () => {
            const result = await dispositivoAuthService.validarDispositivoActual();
            setIsDeviceAuthorized(!!result);
            setIsValidating(false);
        };
        checkDevice();
    }, []);

    if (isValidating) {
        return (
            <div className="h-screen w-screen bg-[#020617] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shield size={32} className="text-blue-400 animate-pulse" />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-xl font-black text-white tracking-widest uppercase">Oculus Secure Boot</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Verificando Identidad del Hardware...</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <ConfirmProvider>
            <Toaster position="top-right" theme="dark" richColors expand closeButton />
            <Routes>
                {/* Ruta raíz condicional */}
                <Route path="/" element={
                    isDeviceAuthorized ? <WelcomePage /> : <Navigate to="/login" replace />
                } />
                
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute>
                            <AdminLayout>
                                <Routes>
                                    <Route path="dashboard" element={<DashboardPage />} />
                                    <Route path="empleados" element={<EmpleadosPage />} />
                                    <Route path="horarios" element={<HorariosPage />} />
                                    <Route path="reportes" element={<ReportesPage />} />
                                    <Route path="asistencias" element={<AsistenciasPage />} />
                                    <Route path="organizacion" element={<OrganizacionPage />} />
                                    <Route path="configuracion" element={<ConfiguracionPage />} />
                                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                                </Routes>
                            </AdminLayout>
                        </ProtectedRoute>
                    }
                />
                <Route path="/kiosco" element={
                    isDeviceAuthorized ? <KioscoPage /> : <Navigate to="/login" replace />
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </ConfirmProvider>
        </BrowserRouter>
    );
}

export default App;
