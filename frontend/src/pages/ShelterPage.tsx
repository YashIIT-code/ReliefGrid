import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { Shelter } from '../types';
import PriorityBadge from '../components/PriorityBadge';

const ShelterPage = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShelters = async () => {
    try {
      const res = await client.getShelters();
      setShelters(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  const handleUpdate = async (id: number, field: string, value: number) => {
    const updated = shelters.map(s => s.id === id ? { ...s, [field]: value } : s);
    setShelters(updated);
    try {
      const s = updated.find(s => s.id === id);
      await client.updateShelter(id, s);
      fetchShelters(); // refresh for new priority score
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Shelter Management</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {shelters.map(shelter => (
          <div key={shelter.id} className="glass-card p-6 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${shelter.priority_score > 70 ? 'bg-danger animate-pulse' : 'bg-primary'}`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-200">{shelter.name}</h3>
                <p className="text-sm text-slate-400 font-mono">ID: SHL-{shelter.id} • Lat: {shelter.lat} Lng: {shelter.lng}</p>
              </div>
              <PriorityBadge score={shelter.priority_score} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'People', field: 'people_count', val: shelter.people_count },
                { label: 'Food', field: 'food_stock', val: shelter.food_stock },
                { label: 'Water', field: 'water_stock', val: shelter.water_stock },
                { label: 'Medicine', field: 'medicine_stock', val: shelter.medicine_stock },
              ].map(item => (
                <div key={item.field} className="bg-navy-900 rounded-lg p-3 border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                  <input 
                    type="number" 
                    value={item.val}
                    onChange={(e) => handleUpdate(shelter.id, item.field, parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-lg font-mono text-slate-200 focus:outline-none focus:text-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShelterPage;
