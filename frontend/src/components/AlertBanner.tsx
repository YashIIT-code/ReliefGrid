import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AlertBannerProps {
  message: string;
  severity: 'critical' | 'warning' | 'info';
  onDismiss?: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ message, severity, onDismiss }) => {
  const bgStyles = {
    critical: 'bg-danger/20 border-danger/50 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse',
    warning: 'bg-warning/20 border-warning/50 text-amber-200',
    info: 'bg-primary/20 border-primary/50 text-blue-200'
  };

  const iconColors = {
    critical: 'text-danger',
    warning: 'text-warning',
    info: 'text-primary'
  };

  return (
    <div className={`w-full border-l-4 rounded-r-lg p-4 mb-6 flex items-start justify-between backdrop-blur-sm ${bgStyles[severity]} ${severity === 'critical' ? 'border-l-danger' : severity === 'warning' ? 'border-l-warning' : 'border-l-primary'}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className={`mt-0.5 ${iconColors[severity]}`} size={20} />
        <div>
          <h4 className="font-semibold uppercase tracking-wider text-sm mb-1 opacity-90">
            {severity === 'critical' ? 'Critical Alert' : severity === 'warning' ? 'Warning' : 'Information'}
          </h4>
          <p className="text-sm">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
