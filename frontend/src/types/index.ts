export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Shelter {
  id: number;
  name: string;
  lat: number;
  lng: number;
  people_count: number;
  food_stock: number;
  water_stock: number;
  blankets: number;
  medicine_stock: number;
  contact_name?: string;
  priority_score: number;
}

export interface Hospital {
  id: number;
  name: string;
  lat: number;
  lng: number;
  oxygen_available: number;
  blood_units: number;
  icu_beds: number;
  ambulances: number;
  contact_name?: string;
  priority_score: number;
}

export interface Warehouse {
  id: number;
  name: string;
  lat: number;
  lng: number;
  food_supply: number;
  water_supply: number;
  blankets: number;
  medicine: number;
  vehicles: number;
}

export interface SOSRequest {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: string;
  description: string;
  severity: number;
  status: string;
  priority_score: number;
  priority_explanation?: string;
  created_at: string;
}

export interface DisasterZone {
  id: number;
  name: string;
  zone_type: string;
  bounds_json: string;
  severity: number;
  active: boolean;
}

export interface BlockedRoad {
  id: number;
  name: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  reason: string;
  active: boolean;
}

export interface Volunteer {
  id: number;
  name: string;
  lat: number;
  lng: number;
  available: boolean;
  skills?: string;
  phone?: string;
}

export interface AllocationResult {
  warehouse_id: number;
  warehouse_name: string;
  destination_id: number;
  destination_name: string;
  destination_type: string;
  resource_type: string;
  quantity: number;
  vehicle_id: number;
  priority_score: number;
}

export interface MapData {
  shelters: Shelter[];
  hospitals: Hospital[];
  warehouses: Warehouse[];
  volunteers: Volunteer[];
  disaster_zones: DisasterZone[];
  blocked_roads: BlockedRoad[];
  sos_requests: SOSRequest[];
}

export interface AnalyticsSummary {
  total_shelters: number;
  total_hospitals: number;
  total_warehouses: number;
  active_sos_requests: number;
  high_priority_alerts: number;
  available_volunteers: number;
  total_people_affected: number;
  resources_delivered: number;
}

export interface ChartData {
  requests_by_category: Record<string, number>;
  resource_shortages: { name: string; type: string; shortage_pct: number }[];
  priority_distribution: { critical: number; high: number; medium: number; low: number };
}

export interface SimulationStep {
  step_number: number;
  title: string;
  description: string;
  timestamp: string;
  data: any;
}

export interface SimulationState {
  running: boolean;
  current_step: number;
  steps: SimulationStep[];
  completed: boolean;
}
