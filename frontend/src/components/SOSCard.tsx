import React from 'react';
import { SOSRequest } from '../types';
import PriorityBadge from './PriorityBadge';
import { HeartPulse, Droplets, Flame, AlertOctagon, HelpCircle, Navigation } from 'lucide-react';

interface SOSCardProps {
  request: SOSRequest;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'medical': return <HeartPulse className="text-danger" size={24} />;
    case 'food': return <Droplets className="text-warning" size={24} />;
    case 'rescue': return <Navigation className="text-primary" size={24} />;
    case 'fire': return <Flame className="text-orange-500" size={24} />;
    default: return <HelpCircle className="text-slate-400" size={24} />;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

const SOSCard: React.FC<SOSCardProps> = ({ request }) => {
  return (
    <div className="glass-card p-5 hover:border-slate-600 transition-colors group relative overflow-hidden">
      {/* Accent border top */}
      <div className={`absolute top-0 left-0 w-full h-1 ${request.priority_score > 75 ? 'bg-danger animate-pulse' : request.priority_score > 50 ? 'bg-warning' : 'bg-primary'}`}></div>
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-navy-900 rounded-lg border border-slate-700/50">
            {getCategoryIcon(request.category)}
          </div>
          <div>
            <h4 className="font-semibold text-slate-200">{request.name}</h4>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="capitalize">{request.category}</span>
              <span>•</span>
              <span>{formatTimeAgo(request.created_at || new Date().toISOString())}</span>
            </div>
          </div>
        </div>
        <PriorityBadge score={request.priority_score} />
      </div>
      
      <p className="text-sm text-slate-300 mb-4 line-clamp-2 leading-relaxed">
        {request.description}
      </p>

      <div className="flex justify-between items-center text-xs border-t border-slate-700/50 pt-3">
        <div className="flex text-amber-400">
          {[...Array(5)].map((_, i) => (
            <AlertOctagon key={i} size={14} className={i < request.severity ? 'fill-amber-500/20' : 'text-slate-600'} />
          ))}
        </div>
        <span className={`px-2 py-1 rounded-md capitalize font-medium ${
          request.status === 'pending' ? 'bg-warning/20 text-warning' :
          request.status === 'assigned' ? 'bg-primary/20 text-primary' :
          'bg-success/20 text-success'
        }`}>
          {request.status}
        </span>
      </div>
      
      {/* Tooltip for priority explanation */}
      {request.priority_explanation && (
        <div className="absolute inset-0 bg-navy-900/95 backdrop-blur-sm p-4 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <h5 className="text-xs uppercase tracking-wider text-slate-400 mb-2">AI Priority Analysis</h5>
          <p className="text-sm text-slate-200">{request.priority_explanation}</p>
        </div>
      )}
    </div>
  );
};

export default SOSCard;
