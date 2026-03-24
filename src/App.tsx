import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReactorProvider } from './context/ReactorContext';
import { AirReceiverProvider } from './context/AirReceiverContext';

// Import your pages
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import ReactorInputPage from './pages/ReactorInputPage';
import ReactorOutputPage from './pages/ReactorOutputPage';
import AirReceiverInputPage from './pages/AirReceiverInputPage';
import AirReceiverOutputPage from './pages/AirReceiverOutputPage';

function App() {
  return (
    <ReactorProvider>
      <AirReceiverProvider>
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Reactor Routes */}
            <Route path="/reactor/input" element={<ReactorInputPage />} />
            <Route path="/reactor/output" element={<ReactorOutputPage />} />
            
            {/* Air Receiver Routes */}
            <Route path="/air-receiver/input" element={<AirReceiverInputPage />} />
            <Route path="/air-receiver/output" element={<AirReceiverOutputPage />} />
          </Routes>
        </Router>
      </AirReceiverProvider>
    </ReactorProvider>
  );
}

export default App;