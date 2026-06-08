import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Stethoscope, Home, Heart, Activity } from 'lucide-react';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string) => {
    setLoading(true);
    try {
      await login({ email: email, password: 'password123' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { name: 'Government Admin', email: 'admin@reliefgrid.com', icon: Shield, desc: 'Full system oversight' },
    { name: 'NGO Coordinator', email: 'ngo@reliefgrid.com', icon: Users, desc: 'Manage allocations & SOS' },
    { name: 'Hospital Staff', email: 'hospital@reliefgrid.com', icon: Stethoscope, desc: 'Update medical capacity' },
    { name: 'Shelter Manager', email: 'shelter@reliefgrid.com', icon: Home, desc: 'Report shelter status' },
    { name: 'Field Volunteer', email: 'volunteer@reliefgrid.com', icon: Heart, desc: 'Respond to localized SOS' },
  ];

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-6 relative overflow-y-auto">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="text-center mb-12 relative z-10">
        <div className="inline-flex items-center justify-center p-4 bg-navy-800 rounded-2xl border border-slate-700/50 shadow-2xl mb-6 shadow-primary/20">
          <Activity size={48} className="text-primary animate-pulse" />
        </div>
        <h1 className="text-5xl font-bold text-slate-100 tracking-tight mb-4">ReliefGrid</h1>
        <p className="text-xl text-slate-400 font-light tracking-wide max-w-lg mx-auto">
          AI-Powered Disaster Logistics Coordination Platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full relative z-10">
        {roles.map((role) => (
          <button
            key={role.name}
            disabled={loading}
            onClick={() => handleLogin(role.email)}
            className="glass-card p-6 text-left hover:-translate-y-2 hover:shadow-primary/30 hover:border-primary/50 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <role.icon size={32} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold text-slate-200 mb-2">{role.name}</h3>
            <p className="text-sm text-slate-400">{role.desc}</p>
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-primary font-medium tracking-wide">CLICK TO LOGIN</span>
              <span className="text-xs text-slate-500 font-mono">{role.email}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LoginPage;
