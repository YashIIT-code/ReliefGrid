import React, { useEffect, useState } from 'react';
import { client } from '../api/client';
import { SOSRequest } from '../types';
import SOSCard from '../components/SOSCard';

const SOSPage = () => {
  const [requests, setRequests] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [cat, setCat] = useState('medical');
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState(3);

  const fetchSOS = async () => {
    try {
      const res = await client.getSOSRequests();
      setRequests(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOS();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.createSOSRequest({
        name,
        category: cat,
        description: desc,
        severity,
        lat: 19.08 + (Math.random() * 0.05), // Mock lat
        lng: 72.88 + (Math.random() * 0.05), // Mock lng
      });
      setName('');
      setDesc('');
      setSeverity(3);
      fetchSOS();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Submit Form */}
      <div className="glass-card p-6 h-fit">
        <h3 className="text-xl font-bold text-slate-200 mb-6">Dispatch SOS Request</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Reporter Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Category</label>
            <select value={cat} onChange={e => setCat(e.target.value)} className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-primary focus:outline-none">
              <option value="medical">Medical / Ambulance</option>
              <option value="food">Food & Water</option>
              <option value="rescue">Search & Rescue</option>
              <option value="fire">Fire Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Severity (1-5)</label>
            <input type="range" min="1" max="5" value={severity} onChange={e => setSeverity(parseInt(e.target.value))} className="w-full accent-primary" />
            <div className="text-right text-xs text-slate-400 mt-1">Level: {severity}</div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea required rows={4} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-primary focus:outline-none" />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors">
            Transmit SOS
          </button>
        </form>
      </div>

      {/* List */}
      <div className="lg:col-span-2 glass-card p-6 flex flex-col h-[80vh]">
        <h3 className="text-xl font-bold text-slate-200 mb-6">Active Emergency Queue</h3>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {loading ? (
            <p>Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-slate-500">No active requests.</p>
          ) : (
            requests.map(req => <SOSCard key={req.id} request={req} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default SOSPage;
