import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Map as MapIcon, Building2, HeartPulse, Warehouse, AlertTriangle, MessageSquare, BarChart3, Truck, Play, LogOut, Shield } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getNavLinks = () => {
    const role = user?.role || '';
    const commonLinks = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/map', label: 'Live Map', icon: MapIcon },
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    ];

    if (role === 'government_admin') {
      return [
        ...commonLinks,
        { path: '/shelters', label: 'Shelters', icon: Building2 },
        { path: '/hospitals', label: 'Hospitals', icon: HeartPulse },
        { path: '/warehouses', label: 'Warehouses', icon: Warehouse },
        { path: '/sos', label: 'SOS Requests', icon: AlertTriangle },
        { path: '/whatsapp', label: 'Comms Sim', icon: MessageSquare },
        { path: '/allocation', label: 'AI Allocation', icon: Truck },
        { path: '/simulation', label: 'Demo Sim', icon: Play },
      ];
    }
    if (role === 'ngo_coordinator') {
      return [
        ...commonLinks,
        { path: '/sos', label: 'SOS Requests', icon: AlertTriangle },
        { path: '/allocation', label: 'AI Allocation', icon: Truck },
        { path: '/simulation', label: 'Demo Sim', icon: Play },
      ];
    }
    if (role === 'hospital_staff') {
      return [
        ...commonLinks,
        { path: '/hospitals', label: 'Hospital Resources', icon: HeartPulse },
      ];
    }
    if (role === 'shelter_manager') {
      return [
        ...commonLinks,
        { path: '/shelters', label: 'Shelter Resources', icon: Building2 },
        { path: '/whatsapp', label: 'Comms Sim', icon: MessageSquare },
      ];
    }
    if (role === 'volunteer') {
      return [
        ...commonLinks,
        { path: '/sos', label: 'SOS Requests', icon: AlertTriangle },
      ];
    }
    return commonLinks;
  };

  return (
    <div className="w-64 h-full bg-navy-800/90 border-r border-slate-700/50 flex flex-col backdrop-blur-xl">
      <div className="p-6 flex items-center space-x-3 text-primary">
        <Shield size={32} className="text-primary" />
        <h1 className="text-2xl font-bold tracking-wider text-slate-100">ReliefGrid</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
        {getNavLinks().map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary/20 text-primary border-l-4 border-primary'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              }`
            }
          >
            <link.icon size={20} />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-700/50">
        <div className="flex items-center justify-between px-4 py-2 bg-navy-900 rounded-lg">
          <div>
            <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-danger transition-colors" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
