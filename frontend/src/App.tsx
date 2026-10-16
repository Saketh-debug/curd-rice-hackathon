import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSim } from '@/lib/sim/store';

// Landing Page
import LandingPage from './pages/LandingPage';
import Docs from './pages/Docs';

// Client Portal (Portal A)
import ClientLayout from './features/client/layouts/ClientLayout';
import ClientDashboard from './features/client/pages/Dashboard';
import CommandCenter from './features/client/pages/CommandCenter';
import AutomationStatus from './features/client/pages/AutomationStatus';
import ThreatMap from './features/client/pages/ThreatMap';
import EventStream from './features/client/pages/EventStream';
import PassWindowStatus from './features/client/pages/PassWindowStatus';

// Admin Portal (Portal B)
import AdminLayout from './features/admin/layouts/AdminLayout';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import IncidentReview from './features/admin/pages/IncidentReview';
import PolicyConfig from './features/admin/pages/PolicyConfig';
import DecisionTimeline from './features/admin/pages/DecisionTimeline';
import ComplianceReports from './features/admin/pages/ComplianceReports';
import ModelBenchmark from './features/admin/pages/ModelBenchmark';

function App() {
  useEffect(() => {
    const timer = setInterval(() => {
      useSim.getState().tick();
    }, 2000);
    return () => clearInterval(timer);
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page & Docs */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<Docs />} />

        {/* Client Portal Routes */}
        <Route path="/client/*" element={
          <ClientLayout>
            <Routes>
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="command-center" element={<CommandCenter />} />
              <Route path="passes" element={<PassWindowStatus />} />
              <Route path="automation" element={<AutomationStatus />} />
              <Route path="map" element={<ThreatMap />} />
              <Route path="threat-map" element={<ThreatMap />} />
              <Route path="events" element={<EventStream />} />
              <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
            </Routes>
          </ClientLayout>
        } />

        {/* Admin Portal Routes */}
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="queue" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="benchmark" element={<ModelBenchmark />} />
              <Route path="incidents/review/:id" element={<IncidentReview />} />
              <Route path="incidents" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="compliance" element={<ComplianceReports />} />
              <Route path="policy" element={<PolicyConfig />} />
              <Route path="settings" element={<PolicyConfig />} />
              <Route path="timeline" element={<DecisionTimeline />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
