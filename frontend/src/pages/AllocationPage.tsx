import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { AllocationResult } from '../types';
import { Truck, Sparkles, ArrowRight } from 'lucide-react';

const AllocationPage = () => {
  const [allocations, setAllocations] = useState<AllocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    client.getAllocationResults().then(res => {
      if (res.data.allocations.length > 0) {
        setAllocations(res.data.allocations);
        setHasRun(true);
      }
    });
  }, []);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const res = await client.runAllocation();
      setAllocations(res.data.allocations);
      setHasRun(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-navy-800 border border-primary/30 p-8 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center">
            <Sparkles className="mr-3 text-primary" size={32} />
            AI Resource Allocation
          </h2>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Our optimization engine uses Google OR-Tools to calculate the most efficient supply routes based on dynamic priority scores, current stock levels, and distance metrics.
          </p>
        </div>
        
        <button 
          onClick={runOptimization}
          disabled={loading}
          className="bg-primary hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-105 flex items-center disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
              Optimizing Routes...
            </>
          ) : (
            <>
              <Truck className="mr-2" />
              Generate Dispatch Plan
            </>
          )}
        </button>
      </div>

      {hasRun && (
        <div className="glass-card overflow-hidden">
          <div className="bg-navy-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-200">Dispatch Manifest</h3>
            <div className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full font-mono">
              {allocations.length} Routes Generated
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-900/50 text-slate-400 border-b border-slate-700/50">
                <tr>
                  <th className="p-4 font-medium tracking-wider uppercase text-xs">Origin Warehouse</th>
                  <th className="p-4 font-medium tracking-wider uppercase text-xs">Destination</th>
                  <th className="p-4 font-medium tracking-wider uppercase text-xs">Resource</th>
                  <th className="p-4 font-medium tracking-wider uppercase text-xs text-right">Quantity</th>
                  <th className="p-4 font-medium tracking-wider uppercase text-xs text-center">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {allocations.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{a.warehouse_name}</div>
                      <div className="text-xs text-slate-500 font-mono">WH-{a.warehouse_id}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <ArrowRight size={14} className="text-slate-500" />
                        <div>
                          <div className="font-semibold text-slate-200">{a.destination_name}</div>
                          <div className="text-xs text-slate-500 uppercase">{a.destination_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize font-medium text-slate-300">{a.resource_type.replace('_', ' ')}</td>
                    <td className="p-4 text-right font-mono font-bold text-primary">{a.quantity}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        a.priority_score > 75 ? 'bg-danger/20 text-danger' : 
                        a.priority_score > 50 ? 'bg-warning/20 text-warning' : 
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {a.priority_score.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                ))}
                {allocations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No critical shortages detected requiring dispatch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocationPage;
