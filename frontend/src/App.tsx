import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import KioscoPage from './pages/KioscoPage';
import EmpleadosPage from './pages/EmpleadosPage';
import HorariosPage from './pages/HorariosPage';
import { Toaster } from 'sonner';
import AdminLayout from './components/layout/AdminLayout';
import SedesDispositivosPage from './pages/SedesDispositivosPage';

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" theme="dark" richColors expand closeButton />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/admin/*"
                    element={
                        <AdminLayout>
                            <Routes>
                                <Route path="dashboard" element={<DashboardPage />} />
                                <Route path="empleados" element={<EmpleadosPage />} />
                                <Route path="horarios" element={<HorariosPage />} />
                                <Route path="sedes" element={<SedesDispositivosPage />} />
                                {/* Agregaremos más rutas aquí según el roadmap */}
                                <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                        </AdminLayout>
                    }
                />
                <Route path="/kiosco" element={<KioscoPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
