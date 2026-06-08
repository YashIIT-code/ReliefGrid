import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapData } from '../types';

interface MapViewProps {
  data: MapData | null;
  height?: string;
  onMarkerClick?: (entityType: string, entity: any) => void;
}

const MapView: React.FC<MapViewProps> = ({ data, height = '400px', onMarkerClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      // Initialize map centered on Mumbai
      leafletMapRef.current = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([19.076, 72.878], 12);

      L.control.zoom({ position: 'bottomright' }).addTo(leafletMapRef.current);

      // Add CartoDB Dark Matter tiles for EOC look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(leafletMapRef.current);
    }

    const map = leafletMapRef.current;
    
    // Clear existing markers/layers (simplified for demo)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Polygon || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    if (!data) return;

    // Helper to create custom HTML markers
    const createMarkerIcon = (color: string, pulse: boolean = false) => {
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 ${pulse ? '15px' : '5px'} ${color}; ${pulse ? 'animation: pulse-critical 1.5s infinite;' : ''}"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
    };

    // Plot Shelters (Blue)
    data.shelters?.forEach(s => {
      const marker = L.marker([s.lat, s.lng], { icon: createMarkerIcon('#3b82f6', s.priority_score > 75) })
        .addTo(map).bindPopup(`<b>${s.name}</b><br>People: ${s.people_count}<br>Priority: ${s.priority_score.toFixed(0)}`);
      marker.on('click', () => onMarkerClick && onMarkerClick('shelter', s));
    });

    // Plot Hospitals (Red)
    data.hospitals?.forEach(h => {
      const marker = L.marker([h.lat, h.lng], { icon: createMarkerIcon('#ef4444', h.priority_score > 75) })
        .addTo(map).bindPopup(`<b>${h.name}</b><br>Beds: ${h.icu_beds}<br>Priority: ${h.priority_score.toFixed(0)}`);
      marker.on('click', () => onMarkerClick && onMarkerClick('hospital', h));
    });

    // Plot Warehouses (Green)
    data.warehouses?.forEach(w => {
      const marker = L.marker([w.lat, w.lng], { icon: createMarkerIcon('#22c55e') })
        .addTo(map).bindPopup(`<b>${w.name}</b><br>Vehicles: ${w.vehicles}`);
      marker.on('click', () => onMarkerClick && onMarkerClick('warehouse', w));
    });

    // Plot SOS (Orange Pulsing)
    data.sos_requests?.filter(s => s.status !== 'resolved').forEach(sos => {
      const marker = L.marker([sos.lat, sos.lng], { icon: createMarkerIcon('#f59e0b', true) })
        .addTo(map).bindPopup(`<b>SOS: ${sos.name}</b><br>${sos.description}`);
      marker.on('click', () => onMarkerClick && onMarkerClick('sos', sos));
    });

    // Plot Disaster Zones
    data.disaster_zones?.filter(z => z.active).forEach(z => {
      try {
        const bounds = JSON.parse(z.bounds_json);
        L.polygon(bounds, { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2 }).addTo(map).bindPopup(z.name);
      } catch (e) {}
    });

    // Plot Blocked Roads
    data.blocked_roads?.filter(r => r.active).forEach(r => {
      L.polyline([[r.start_lat, r.start_lng], [r.end_lat, r.end_lng]], { color: '#ef4444', weight: 4, dashArray: '5, 10' })
        .addTo(map).bindPopup(`Blocked: ${r.reason}`);
    });

  }, [data, onMarkerClick]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-700/50 shadow-lg" style={{ height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default MapView;
