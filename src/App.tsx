import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ReactorProvider } from './context/ReactorContext';
import { AirReceiverProvider } from './context/AirReceiverContext';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import ReactorInputPage from './pages/ReactorInputPage';
import ReactorOutputPage from './pages/ReactorOutputPage';
import AssumptionsPage from './pages/AssumptionsPage';
import AirReceiverInputPage from './pages/AirReceiverInputPage';
import AirReceiverOutputPage from './pages/AirReceiverOutputPage';
import AirReceiverAssumptionsPage from './pages/AirReceiverAssumptionsPage';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
  },
});

function AppShell() {
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '';
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {!isLanding && <Sidebar />}
      <Box component="main" sx={{ flex: 1, overflow: 'auto', p: isLanding ? 0 : 3 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/reactor/input" element={<ReactorInputPage />} />
          <Route path="/reactor/output" element={<ReactorOutputPage />} />
          <Route path="/reactor/assumptions" element={<AssumptionsPage />} />
          <Route path="/air-receiver/input" element={<AirReceiverInputPage />} />
          <Route path="/air-receiver/output" element={<AirReceiverOutputPage />} />
          <Route path="/air-receiver/assumptions" element={<AirReceiverAssumptionsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReactorProvider>
        <AirReceiverProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </AirReceiverProvider>
      </ReactorProvider>
    </ThemeProvider>
  );
}

export default App;
