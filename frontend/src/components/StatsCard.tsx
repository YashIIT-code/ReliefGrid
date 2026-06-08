import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'red' | 'amber' | 'green';
}

const variantStyles = {
  blue: 'text-primary bg-primary/10 border-primary/20',
  red: 'text-danger bg-danger/10 border-danger/20',
  amber: 'text-warning bg-warning/10 border-warning/20',
  green: 'text-success bg-success/10 border-success/20',
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon: Icon, variant = 'blue' }) => {
  const styles = variantStyles[variant];

  return (
    <div className="stat-card">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 font-medium text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-100 font-mono tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg border ${styles}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
