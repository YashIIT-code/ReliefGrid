import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { Hospital } from '../types';
import PriorityBadge from '../components/PriorityBadge';

const HospitalPage = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHospitals = async () => {
    try {
      const res = await client.getHospitals();
      setHospitals(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleUpdate = async (id: number, field: string, value: number) => {
    const updated = hospitals.map(h => h.id === id ? { ...h, [field]: value } : h);
    setHospitals(updated);
    try {
      const h = updated.find(h => h.id === id);
      await client.updateHospital(id, h);
      fetchHospitals();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Hospital Resources</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {hospitals.map(hospital => (
          <div key={hospital.id} className="glass-card p-6 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${hospital.priority_score > 70 ? 'bg-danger animate-pulse' : 'bg-primary'}`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-200">{hospital.name}</h3>
                <p className="text-sm text-slate-400 font-mono">ID: HOSP-{hospital.id}</p>
              </div>
              <PriorityBadge score={hospital.priority_score} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Oxygen', field: 'oxygen_available', val: hospital.oxygen_available },
                { label: 'Blood', field: 'blood_units', val: hospital.blood_units },
                { label: 'ICU Beds', field: 'icu_beds', val: hospital.icu_beds },
                { label: 'Ambulances', field: 'ambulances', val: hospital.ambulances },
              ].map(item => (
                <div key={item.field} className="bg-navy-900 rounded-lg p-3 border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                  <input 
                    type="number" 
                    value={item.val}
                    onChange={(e) => handleUpdate(hospital.id, item.field, parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-lg font-mono text-slate-200 focus:outline-none focus:text-primary"
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

export default HospitalPage;
