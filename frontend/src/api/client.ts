import axios from 'axios';

const api = axios.create({
  baseURL: 'https://reliefgrid-backend.onrender.com',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const client = {
  login: (data: any) => api.post('/api/auth/login', data),
  getMapData: () => api.get('/api/map/data'),
  getShelters: () => api.get('/api/shelters/'),
  updateShelter: (id: number, data: any) => api.put(`/api/shelters/${id}`, data),
  getHospitals: () => api.get('/api/hospitals/'),
  updateHospital: (id: number, data: any) => api.put(`/api/hospitals/${id}`, data),
  getWarehouses: () => api.get('/api/warehouses/'),
  updateWarehouse: (id: number, data: any) => api.put(`/api/warehouses/${id}`, data),
  getSOSRequests: () => api.get('/api/sos/'),
  createSOSRequest: (data: any) => api.post('/api/sos/', data),
  updateSOSStatus: (id: number, status: string) => api.put(`/api/sos/${id}/status?status=${status}`),
  parseWhatsApp: (data: any) => api.post('/api/whatsapp/parse', data),
  getWhatsAppMessages: () => api.get('/api/whatsapp/messages'),
  getAnalyticsSummary: () => api.get('/api/analytics/summary'),
  getAnalyticsCharts: () => api.get('/api/analytics/charts'),
  runAllocation: () => api.post('/api/allocation/optimize'),
  getAllocationResults: () => api.get('/api/allocation/results'),
  startSimulation: () => api.post('/api/simulation/start'),
  getSimulationStatus: () => api.get('/api/simulation/status'),
  resetSimulation: () => api.post('/api/simulation/reset')
};
