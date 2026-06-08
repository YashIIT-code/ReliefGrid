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
  login: (data: any) => api.post('/auth/login', data),
  getMapData: () => api.get('/map/data'),
  getShelters: () => api.get('/shelters/'),
  updateShelter: (id: number, data: any) => api.put(`/shelters/${id}`, data),
  getHospitals: () => api.get('/hospitals/'),
  updateHospital: (id: number, data: any) => api.put(`/hospitals/${id}`, data),
  getWarehouses: () => api.get('/warehouses/'),
  updateWarehouse: (id: number, data: any) => api.put(`/warehouses/${id}`, data),
  getSOSRequests: () => api.get('/sos/'),
  createSOSRequest: (data: any) => api.post('/sos/', data),
  updateSOSStatus: (id: number, status: string) => api.put(`/sos/${id}/status?status=${status}`),
  parseWhatsApp: (data: any) => api.post('/whatsapp/parse', data),
  getWhatsAppMessages: () => api.get('/whatsapp/messages'),
  getAnalyticsSummary: () => api.get('/analytics/summary'),
  getAnalyticsCharts: () => api.get('/analytics/charts'),
  runAllocation: () => api.post('/allocation/optimize'),
  getAllocationResults: () => api.get('/allocation/results'),
  startSimulation: () => api.post('/simulation/start'),
  getSimulationStatus: () => api.get('/simulation/status'),
  resetSimulation: () => api.post('/simulation/reset')
};
