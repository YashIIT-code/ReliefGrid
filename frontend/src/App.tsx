import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import ShelterPage from './pages/ShelterPage';
import HospitalPage from './pages/HospitalPage';
import WarehousePage from './pages/WarehousePage';
import SOSPage from './pages/SOSPage';
import WhatsAppPage from './pages/WhatsAppPage';
import AllocationPage from './pages/AllocationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SimulationPage from './pages/SimulationPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><Layout><MapPage /></Layout></ProtectedRoute>} />
      <Route path="/shelters" element={<ProtectedRoute><Layout><ShelterPage /></Layout></ProtectedRoute>} />
      <Route path="/hospitals" element={<ProtectedRoute><Layout><HospitalPage /></Layout></ProtectedRoute>} />
      <Route path="/warehouses" element={<ProtectedRoute><Layout><WarehousePage /></Layout></ProtectedRoute>} />
      <Route path="/sos" element={<ProtectedRoute><Layout><SOSPage /></Layout></ProtectedRoute>} />
      <Route path="/whatsapp" element={<ProtectedRoute><Layout><WhatsAppPage /></Layout></ProtectedRoute>} />
      <Route path="/allocation" element={<ProtectedRoute><Layout><AllocationPage /></Layout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Layout><AnalyticsPage /></Layout></ProtectedRoute>} />
      <Route path="/simulation" element={<ProtectedRoute><Layout><SimulationPage /></Layout></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
