import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { AnalyticsSummary, SOSRequest, MapData } from '../types';
import StatsCard from '../components/StatsCard';
import MapView from '../components/MapView';
import SOSCard from '../components/SOSCard';
import { Building2, HeartPulse, Warehouse, AlertTriangle, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sumRes, mapRes, sosRes] = await Promise.all([
        client.getAnalyticsSummary(),
        client.getMapData(),
        client.getSOSRequests()
      ]);
      setSummary(sumRes.data);
      setMapData(mapRes.data);
      setSosRequests(sosRes.data.slice(0, 5)); // Top 5
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Overview Dashboard</h2>
          <p className="text-slate-400 mt-1">Welcome back, {user?.name}. Here is the current situation.</p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-navy-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition-colors">
          Refresh Data
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Active Shelters" value={summary?.total_shelters || 0} icon={Building2} variant="blue" />
        <StatsCard title="Hospitals" value={summary?.total_hospitals || 0} icon={HeartPulse} variant="blue" />
        <StatsCard title="Warehouses" value={summary?.total_warehouses || 0} icon={Warehouse} variant="green" />
        <StatsCard title="Active SOS" value={summary?.active_sos_requests || 0} icon={AlertTriangle} variant="red" />
        <StatsCard title="High Priority Alerts" value={summary?.high_priority_alerts || 0} icon={AlertTriangle} variant="amber" />
        <StatsCard title="Available Volunteers" value={summary?.available_volunteers || 0} icon={Users} variant="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Mini Map */}
        <div className="lg:col-span-2 glass-card p-4 flex flex-col h-[600px]">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Live Operations Map</h3>
          <div className="flex-1 rounded-xl overflow-hidden">
            <MapView data={mapData} height="100%" />
          </div>
        </div>

        {/* Right: Recent SOS */}
        <div className="glass-card p-4 flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Critical SOS Alerts</h3>
            <span className="px-2 py-1 bg-danger/20 text-danger rounded text-xs font-bold animate-pulse">LIVE</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {sosRequests.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No active SOS requests</p>
            ) : (
              sosRequests.map(req => <SOSCard key={req.id} request={req} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
