import React, { useState } from 'react';
import { Container, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navigation from './components/Navigation';
import InputPage from './pages/InputPage';
import OutputPage from './pages/OutputPage';
import AssumptionsPage from './pages/AssumptionsPage';
import { ReactorProvider } from './context/ReactorContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState<'input' | 'output' | 'assumptions'>('input');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReactorProvider>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <Box component="main" sx={{ flex: 1, overflow: 'auto' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
              {currentPage === 'input' && <InputPage />}
              {currentPage === 'output' && <OutputPage />}
              {currentPage === 'assumptions' && <AssumptionsPage />}
            </Container>
          </Box>
        </Box>
      </ReactorProvider>
    </ThemeProvider>
  );
}

export default App;