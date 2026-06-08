import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { ChartData, AnalyticsSummary } from '../types';
import StatsCard from '../components/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShieldAlert, UserCheck, Package, Building } from 'lucide-react';

const AnalyticsPage = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.getAnalyticsSummary(),
      client.getAnalyticsCharts()
    ]).then(([sumRes, chartsRes]) => {
      setSummary(sumRes.data);
      setCharts(chartsRes.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading || !summary || !charts) return <div className="p-8 text-center text-slate-500">Processing Analytics...</div>;

  // Format data for charts
  const categoryData = Object.entries(charts.requests_by_category).map(([name, count]) => ({ name, count }));
  
  const priorityData = [
    { name: 'Critical', value: charts.priority_distribution.critical, color: '#ef4444' },
    { name: 'High', value: charts.priority_distribution.high, color: '#f97316' },
    { name: 'Medium', value: charts.priority_distribution.medium, color: '#f59e0b' },
    { name: 'Low', value: charts.priority_distribution.low, color: '#22c55e' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Analytics & Intelligence</h2>
      
      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total People Affected" value={summary.total_people_affected.toLocaleString()} icon={UserCheck} variant="amber" />
        <StatsCard title="Critical Nodes" value={summary.high_priority_alerts} icon={ShieldAlert} variant="red" />
        <StatsCard title="Resources Delivered" value={summary.resources_delivered.toLocaleString()} icon={Package} variant="green" />
        <StatsCard title="Active Facilities" value={summary.total_shelters + summary.total_hospitals} icon={Building} variant="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="glass-card p-6 h-96 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">SOS Requests by Category</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} className="capitalize" />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="glass-card p-6 h-96 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Network Priority Distribution</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Resource Shortages */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Predicted Resource Shortages (Next 24h)</h3>
          <div className="space-y-4">
            {charts.resource_shortages.map(rs => (
              <div key={rs.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 font-medium">{rs.name}</span>
                  <span className={rs.type === 'critical' ? 'text-danger' : rs.type === 'high' ? 'text-warning' : 'text-primary'}>
                    {rs.shortage_pct}% Deficit
                  </span>
                </div>
                <div className="w-full bg-navy-900 rounded-full h-2.5 border border-slate-700">
                  <div 
                    className={`h-2.5 rounded-full ${rs.type === 'critical' ? 'bg-danger' : rs.type === 'high' ? 'bg-warning' : 'bg-primary'}`} 
                    style={{ width: `${rs.shortage_pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
