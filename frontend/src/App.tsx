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

import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" theme="dark" richColors expand closeButton />
            <Routes>
                <Route path="/" element={<WelcomePage />} />
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
                                    <Route path="organizacion" element={<OrganizacionPage />} />
                                    <Route path="configuracion" element={<ConfiguracionPage />} />
                                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                                </Routes>
                            </AdminLayout>
                        </ProtectedRoute>
                    }
                />
                <Route path="/kiosco" element={<KioscoPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
