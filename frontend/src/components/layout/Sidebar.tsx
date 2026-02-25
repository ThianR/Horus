import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MapPin, 
  Settings, 
  LogOut,
  Clock 
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Users size={20} />, label: 'Empleados', path: '/admin/empleados' },
    { icon: <Clock size={20} />, label: 'Horarios', path: '/admin/horarios' },
    { icon: <Calendar size={20} />, label: 'Asistencias', path: '/admin/asistencias' },
    { icon: <MapPin size={20} />, label: 'Sedes', path: '/admin/sedes' },
    { icon: <Settings size={20} />, label: 'Configuración', path: '/admin/configuracion' },
  ];

  return (
    <aside className="w-64 h-screen glass border-r border-slate-700/50 flex flex-col sticky top-0">
      <div className="p-6 border-b border-slate-700/50">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 premium-gradient rounded-lg flex items-center justify-center">
            <Clock size={18} className="text-white" />
          </div>
          <span className="text-gradient">Oculus Admin</span>
        </h1>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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

      <div className="p-4 border-t border-slate-700/50">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
