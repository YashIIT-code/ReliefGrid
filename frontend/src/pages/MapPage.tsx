import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { MapData } from '../types';
import MapView from '../components/MapView';
import AlertBanner from '../components/AlertBanner';

const MapPage = () => {
  const [data, setData] = useState<MapData | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>('');

  const fetchMapData = async () => {
    try {
      const res = await client.getMapData();
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkerClick = (type: string, entity: any) => {
    setSelectedType(type);
    setSelectedEntity(entity);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-100">Live Operations Map</h2>
      </div>

      <div className="flex-1 flex gap-4 h-full overflow-hidden">
        {/* Main Map */}
        <div className="flex-1 h-full glass-card overflow-hidden">
          <MapView data={data} height="100%" onMarkerClick={handleMarkerClick} />
        </div>

        {/* Info Panel */}
        <div className="w-80 glass-card p-4 overflow-y-auto flex flex-col">
          <h3 className="text-lg font-semibold border-b border-slate-700 pb-3 mb-4">Entity Details</h3>
          
          {selectedEntity ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 uppercase">{selectedType}</span>
                <h4 className="text-xl font-bold text-primary">{selectedEntity.name}</h4>
              </div>
              
              {selectedType === 'shelter' && (
                <>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-navy-900 p-2 rounded">
                      <div className="text-slate-400 text-xs">People</div>
                      <div className="font-mono text-lg">{selectedEntity.people_count}</div>
                    </div>
                    <div className="bg-navy-900 p-2 rounded">
                      <div className="text-slate-400 text-xs">Food</div>
                      <div className="font-mono text-lg">{selectedEntity.food_stock}</div>
                    </div>
                  </div>
                  {selectedEntity.priority_score > 70 && (
                    <AlertBanner severity="warning" message="High priority shelter. Supply drop needed." />
                  )}
                </>
              )}

              {selectedType === 'hospital' && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-navy-900 p-2 rounded">
                    <div className="text-slate-400 text-xs">ICU Beds</div>
                    <div className="font-mono text-lg text-danger">{selectedEntity.icu_beds}</div>
                  </div>
                  <div className="bg-navy-900 p-2 rounded">
                    <div className="text-slate-400 text-xs">Oxygen</div>
                    <div className="font-mono text-lg">{selectedEntity.oxygen_available}</div>
                  </div>
                </div>
              )}

              {selectedType === 'sos' && (
                <div className="bg-navy-900 p-3 rounded space-y-2">
                  <div className="text-sm text-slate-300">{selectedEntity.description}</div>
                  <div className="text-xs text-amber-400 uppercase font-bold">Severity: {selectedEntity.severity}/5</div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-center">
              Click any marker on the map to view detailed telemetry.
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-slate-700">
            <h4 className="text-xs uppercase text-slate-400 mb-2">Map Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div><span>Shelter</span></div>
              <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div><span>Hospital</span></div>
              <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div><span>Warehouse</span></div>
              <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-[0_0_8px_#f59e0b]"></div><span>Active SOS</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
