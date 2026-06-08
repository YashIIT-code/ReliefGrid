import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { Warehouse } from '../types';

const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWarehouses = async () => {
    try {
      const res = await client.getWarehouses();
      setWarehouses(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleUpdate = async (id: number, field: string, value: number) => {
    const updated = warehouses.map(w => w.id === id ? { ...w, [field]: value } : w);
    setWarehouses(updated);
    try {
      const w = updated.find(w => w.id === id);
      await client.updateWarehouse(id, w);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Logistics Hubs</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {warehouses.map(warehouse => (
          <div key={warehouse.id} className="glass-card p-6 border-l-4 border-l-success">
            <h3 className="text-xl font-bold text-slate-200 mb-6">{warehouse.name}</h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Food', field: 'food_supply', val: warehouse.food_supply },
                { label: 'Water', field: 'water_supply', val: warehouse.water_supply },
                { label: 'Blankets', field: 'blankets', val: warehouse.blankets },
                { label: 'Medicine', field: 'medicine', val: warehouse.medicine },
                { label: 'Vehicles', field: 'vehicles', val: warehouse.vehicles },
              ].map(item => (
                <div key={item.field} className="bg-navy-900 rounded-lg p-3 border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                  <input 
                    type="number" 
                    value={item.val}
                    onChange={(e) => handleUpdate(warehouse.id, item.field, parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-lg font-mono text-slate-200 focus:outline-none focus:text-success"
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

export default WarehousePage;
