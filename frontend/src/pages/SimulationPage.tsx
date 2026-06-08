import { useState, useEffect } from 'react';
import { client } from '../api/client';
import { SimulationState } from '../types';
import { Play, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

const SimulationPage = () => {
  const [state, setState] = useState<SimulationState>({ running: false, current_step: 0, steps: [], completed: false });
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await client.getSimulationStatus();
      setState(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    let interval: any;
    if (state.running) {
      interval = setInterval(fetchStatus, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.running]);

  const startSimulation = async () => {
    setLoading(true);
    try {
      const res = await client.startSimulation();
      setState(res.data.state);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = async () => {
    setLoading(true);
    try {
      await client.resetSimulation();
      await fetchStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center p-8 glass-card border-b-4 border-b-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <AlertTriangle size={48} className="mx-auto text-primary mb-4" />
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Disaster Scenario Demo</h2>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
          This simulation injects a cascading failure scenario (flood, infrastructure damage, hospital shortages) into the live database to demonstrate the AI Priority Engine and OR-Tools Allocation in action.
        </p>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={startSimulation}
            disabled={loading || state.running || state.completed}
            className="bg-danger hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-danger/30 transition-all flex items-center disabled:opacity-50"
          >
            <Play className="mr-2" size={20} /> INJECT SCENARIO
          </button>
          <button 
            onClick={resetSimulation}
            disabled={loading}
            className="bg-navy-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center"
          >
            <RotateCcw className="mr-2" size={20} /> Reset
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-slate-200 mb-6">Execution Timeline</h3>
        
        {state.steps.length === 0 ? (
          <div className="text-center text-slate-500 py-12">System idle. Ready to execute scenario.</div>
        ) : (
          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
            {state.steps.map((step, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-navy-900 bg-success text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle2 size={20} />
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-4 rounded-xl border-l-4 border-l-success">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-bold text-slate-200">Step {step.step_number}: {step.title}</h4>
                    <span className="text-xs text-slate-500 font-mono">{new Date(step.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{step.description}</p>
                  <div className="bg-navy-900 p-2 rounded text-xs font-mono text-primary overflow-x-auto">
                    {JSON.stringify(step.data)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationPage;
