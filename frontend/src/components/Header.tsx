import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="h-16 border-b border-slate-700/50 bg-navy-800/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-slate-200 tracking-wide">
          Emergency Operations Center
        </h2>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-slate-400 font-mono text-sm border border-slate-700 bg-navy-900/50 px-3 py-1 rounded-md">
          {time.toISOString().replace('T', ' ').substring(0, 19)} UTC
        </div>
        
        <div className="relative">
          <Bell className="text-slate-400 hover:text-slate-200 cursor-pointer" size={20} />
          {/* Mock alert indicator */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
          </span>
        </div>

        <div className="flex items-center space-x-3 pl-4 border-l border-slate-700/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold text-sm">
            {user ? getInitials(user.name) : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
