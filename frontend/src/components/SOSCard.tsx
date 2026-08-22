import React, { useState } from 'react';
import { SOSRequest } from '../types';
import PriorityBadge from './PriorityBadge';
import { HeartPulse, Droplets, Flame, AlertOctagon, HelpCircle, Navigation } from 'lucide-react';

interface SOSCardProps {
  request: SOSRequest;
  onUpdateStatus?: (id: number, status: string) => Promise<void>;
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

const SOSCard: React.FC<SOSCardProps> = ({ request, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleStatusClick = async (newStatus: string) => {
    if (!onUpdateStatus) return;
    
    const label = newStatus === 'completed' ? 'Completed' : newStatus === 'not_completed' ? 'Not Completed' : 'Pending';
    if (!window.confirm(`Update this SOS request to ${label}?`)) {
      return;
    }

    setIsUpdating(true);
    setStatusMsg(null);
    try {
      await onUpdateStatus(request.id, newStatus);
      setStatusMsg({ type: 'success', text: 'Updated successfully' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Update failed' });
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="glass-card flex flex-col hover:border-slate-600 transition-colors group relative overflow-hidden h-full">
      {/* Accent border top */}
      <div className={`absolute top-0 left-0 w-full h-1 z-20 ${request.priority_score > 75 ? 'bg-danger animate-pulse' : request.priority_score > 50 ? 'bg-warning' : 'bg-primary'}`}></div>
      
      <div className="p-5 flex-1 relative z-10">
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
        
        <p className="text-sm text-slate-300 mb-2 line-clamp-2 leading-relaxed">
          {request.description}
        </p>

        {/* Logistics snapshot */}
        <section aria-label="Logistics snapshot" className="mb-4 pt-3 border-t border-slate-700/50">
          <h5 className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">Logistics Snapshot</h5>
          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-400">Affected people</dt>
              <dd className="text-slate-200 font-medium">
                {request.affected_people != null ? request.affected_people.toLocaleString() : 'Not recorded'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Distance to impact</dt>
              <dd className="text-slate-200 font-medium">
                {request.distance_from_impact_km != null ? `${request.distance_from_impact_km.toFixed(1)} km` : 'Unavailable'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Nearest warehouse</dt>
              <dd className="text-slate-200 font-medium">
                {request.nearest_warehouse_name ?? 'Unavailable'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Estimated delivery</dt>
              <dd className="text-slate-200 font-medium">
                {request.estimated_delivery_minutes != null ? `${request.estimated_delivery_minutes} minutes` : 'Unavailable'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Food stock</dt>
              <dd className="text-slate-200 font-medium">
                {request.food_stock_status ? (
                  <>
                    <span className={
                      request.food_stock_status === 'ADEQUATE' ? 'text-emerald-400' :
                      request.food_stock_status === 'LOW' ? 'text-amber-400' :
                      'text-red-400'
                    }>{request.food_stock_status}</span>
                    {request.food_stock_units != null ? ` — ${request.food_stock_units.toLocaleString()} units` : ''}
                  </>
                ) : 'Unavailable'}
              </dd>
            </div>
          </dl>
        </section>

        {/* Tooltip for priority explanation */}
        {request.priority_explanation && (
          <div className="absolute inset-0 bg-navy-900/95 backdrop-blur-sm p-4 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
            <h5 className="text-xs uppercase tracking-wider text-slate-400 mb-2">AI Priority Analysis</h5>
            <p className="text-sm text-slate-200">{request.priority_explanation}</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-slate-700/50 bg-navy-900/40 relative z-30">
        <div className="flex justify-between items-center text-xs mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <AlertOctagon key={i} size={14} className={i < request.severity ? 'fill-amber-500/20' : 'text-slate-600'} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            <span className={`px-2 py-1 rounded-md capitalize font-medium ${
              request.status === 'pending' ? 'bg-warning/20 text-warning' :
              request.status === 'completed' ? 'bg-success/20 text-success' :
              request.status === 'not_completed' ? 'bg-danger/20 text-danger' :
              'bg-primary/20 text-primary'
            }`}>
              {request.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {request.status === 'pending' && (
            <>
              <button 
                onClick={() => handleStatusClick('completed')}
                disabled={isUpdating}
                aria-label={`Mark SOS request ${request.id} as completed`}
                className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/50 text-xs py-2 rounded transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                Mark Completed
              </button>
              <button 
                onClick={() => handleStatusClick('not_completed')}
                disabled={isUpdating}
                aria-label={`Mark SOS request ${request.id} as not completed`}
                className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 text-xs py-2 rounded transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Mark Not Completed
              </button>
            </>
          )}
          {request.status === 'completed' && (
            <>
              <button 
                onClick={() => handleStatusClick('not_completed')}
                disabled={isUpdating}
                aria-label={`Mark SOS request ${request.id} as not completed`}
                className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 text-xs py-2 rounded transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Mark Not Completed
              </button>
              <button 
                onClick={() => handleStatusClick('pending')}
                disabled={isUpdating}
                aria-label={`Reset SOS request ${request.id} to pending`}
                className="flex-1 bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 border border-slate-600/50 text-xs py-2 rounded transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Reset to Pending
              </button>
            </>
          )}
          {request.status === 'not_completed' && (
            <>
              <button 
                onClick={() => handleStatusClick('completed')}
                disabled={isUpdating}
                aria-label={`Mark SOS request ${request.id} as completed`}
                className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/50 text-xs py-2 rounded transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                Mark Completed
              </button>
              <button 
                onClick={() => handleStatusClick('pending')}
                disabled={isUpdating}
                aria-label={`Reset SOS request ${request.id} to pending`}
                className="flex-1 bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 border border-slate-600/50 text-xs py-2 rounded transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Reset to Pending
              </button>
            </>
          )}
        </div>

        {statusMsg && (
          <div className={`mt-3 text-xs font-medium text-center ${statusMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
            {statusMsg.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default SOSCard;
