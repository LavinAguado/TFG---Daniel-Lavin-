import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  FolderIcon, 
  ListBulletIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Pacientes', path: '/pacientes', icon: UserGroupIcon },
    { name: 'Citas', path: '/citas', icon: CalendarIcon },
    { name: 'Entrenamientos', path: '/entrenamientos', icon: DocumentTextIcon },
    { name: 'Ejercicios', path: '/ejercicios', icon: ListBulletIcon },
    { name: 'Archivos', path: '/archivos', icon: FolderIcon },
  ];

  if (user && user.rol === 'superadmin') {
    menuItems.push({ name: 'SuperAdmin', path: '/superadmin', icon: ShieldCheckIcon });
  }

  return (
    <div className="flex flex-col w-64 bg-[#111827] border-r border-slate-800/50 h-screen sticky top-0 shadow-lg shadow-black/20">
      <div className="p-6">
        <h1 className="text-2xl font-black text-blue-500 tracking-tight">TheraTrack</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Gestión Deportiva Profesional</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-500 shadow-sm shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
