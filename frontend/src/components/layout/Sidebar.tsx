import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MapPin,
  Settings,
  LogOut,
  Clock,
  Menu,
  X,
  Camera,
  FileBarChart,
  Building2,
  FileText,
  User
} from 'lucide-react';
import { useState } from 'react';

import eyeLogo from '../../assets/eye.svg';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { dispositivoAuthService } from '../../services/dispositivoService';

interface SidebarProps {
  /** Modo mobile: el sidebar actúa como overlay drawer */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = ({ mobileOpen = false, onMobileClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: <User size={20} />, label: 'Mi Portal', path: '/admin/mi-portal', roles: ['EMPLEADO', 'ADMIN', 'RRHH'] },
    { icon: <FileText size={20} />, label: 'Mis Solicitudes', path: '/admin/mis-solicitudes', roles: ['EMPLEADO', 'ADMIN', 'RRHH'] },
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard', roles: ['ADMIN', 'RRHH', 'SUPERVISOR', 'EMPLEADO'] },
    { icon: <Users size={20} />, label: 'Empleados', path: '/admin/empleados', roles: ['ADMIN', 'RRHH'] },
    { icon: <Clock size={20} />, label: 'Horarios', path: '/admin/horarios', roles: ['ADMIN', 'RRHH'] },
    { icon: <FileBarChart size={20} />, label: 'Reportes', path: '/admin/reportes', roles: ['ADMIN', 'RRHH'] },
    { icon: <Calendar size={20} />, label: 'Asistencias', path: '/admin/asistencias', roles: ['ADMIN', 'RRHH', 'SUPERVISOR'] },
    { icon: <Building2 size={20} />, label: 'Organización', path: '/admin/organizacion', roles: ['ADMIN'] },
    { icon: <Camera size={20} />, label: 'Horus Point', path: '/kiosco', roles: ['ADMIN', 'RRHH', 'SUPERVISOR'] },
    { icon: <Settings size={20} />, label: 'Configuración', path: '/admin/configuracion', roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.rol || ''));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = async (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path === '/kiosco') {
      e.preventDefault();
      const isAuthorized = await dispositivoAuthService.validarDispositivoActual();
      if (!isAuthorized) {
        toast.error("Equipo no registrado");
        return;
      }
      navigate('/kiosco');
      onMobileClose?.();
      return;
    }
    /* Al navegar en mobile cerramos el drawer */
    onMobileClose?.();
  };

  return (
    <>
      {/* Overlay oscuro en mobile cuando el menú está abierto */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 glass border-r border-slate-700/50 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:sticky lg:translate-x-0 lg:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-3">
            <img src={eyeLogo} alt="Logo" className="w-8 h-8 drop-shadow-[0_0_8px_rgba(33,243,255,0.4)]" />
            <span className="text-gradient">Horus Admin</span>
          </h1>
          {/* Botón cerrar solo visible en mobile */}
          <button
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
            onClick={onMobileClose}
          >
            <X size={22} />
          </button>
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              id={item.label === 'Organización' ? 'tour-menu-organizacion' : undefined}
              to={item.path}
              onClick={(e) => handleNavClick(e, item.path)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? 'premium-gradient text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Cerrar sesión */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
