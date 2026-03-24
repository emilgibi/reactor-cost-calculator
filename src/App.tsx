import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ReactorProvider } from './context/ReactorContext';
import { AirReceiverProvider } from './context/AirReceiverContext';

// Import your pages
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import ReactorInputPage from './pages/ReactorInputPage';
import ReactorOutputPage from './pages/ReactorOutputPage';
import AssumptionsPage from './pages/AssumptionsPage';
import AirReceiverInputPage from './pages/AirReceiverInputPage';
import AirReceiverOutputPage from './pages/AirReceiverOutputPage';
import AirReceiverAssumptionsPage from './pages/AirReceiverAssumptionsPage';

function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!isLanding && <Sidebar />}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: isLanding ? 0 : '24px 32px',
        }}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Reactor Routes */}
          <Route path="/reactor/input" element={<ReactorInputPage />} />
          <Route path="/reactor/output" element={<ReactorOutputPage />} />
          <Route path="/reactor/assumptions" element={<AssumptionsPage />} />

          {/* Air Receiver Routes */}
          <Route path="/air-receiver/input" element={<AirReceiverInputPage />} />
          <Route path="/air-receiver/output" element={<AirReceiverOutputPage />} />
          <Route path="/air-receiver/assumptions" element={<AirReceiverAssumptionsPage />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ReactorProvider>
      <AirReceiverProvider>
        <Router>
          <AppLayout />
        </Router>
      </AirReceiverProvider>
    </ReactorProvider>
  );
}

export default App;