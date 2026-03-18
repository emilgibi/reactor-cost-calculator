import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography } from '@mui/material';
import { Biotech as ReactorIcon, Air as AirIcon } from '@mui/icons-material';
import '../styles/LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      <div className="landing-header">
        <Typography variant="h1" component="h1">
          Engineering Cost Calculator
        </Typography>
        <Typography variant="h6" component="p">
          Accurate cost estimation for industrial equipment fabrication.
          Select a calculator to get started.
        </Typography>
      </div>

      <div className="landing-cards">
        {/* Reactor Cost Calculator */}
        <div className="calculator-card">
          <Box
            className="card-icon"
            sx={{ background: 'linear-gradient(135deg, #1976d2, #1a237e)' }}
          >
            <ReactorIcon sx={{ color: 'white', fontSize: 40 }} />
          </Box>
          <h2>Reactor Cost Calculator</h2>
          <span className="capacity-badge">10 KL Reactor</span>
          <p>
            Estimate fabrication costs for stainless steel and mild steel reactors.
            Includes shell, dish, limpet, agitator, motor, and nozzle schedule costing.
          </p>
          <Button
            variant="contained"
            size="large"
            className="get-started-btn"
            onClick={() => navigate('/reactor/input')}
            sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
          >
            Get Started
          </Button>
        </div>

        {/* Air Receiver Calculator */}
        <div className="calculator-card">
          <Box
            className="card-icon"
            sx={{ background: 'linear-gradient(135deg, #388e3c, #1b5e20)' }}
          >
            <AirIcon sx={{ color: 'white', fontSize: 40 }} />
          </Box>
          <h2>Air Receiver Calculator</h2>
          <span className="capacity-badge" style={{ background: '#e8f5e9', color: '#388e3c' }}>
            20 KL Vessel
          </span>
          <p>
            Calculate fabrication costs for pressure vessels and air receivers.
            Includes shell, dish, nozzles and surface finish costing with design pressure inputs.
          </p>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/air-receiver/input')}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              px: 4,
              background: 'linear-gradient(135deg, #388e3c, #1b5e20)',
              '&:hover': { opacity: 0.9 },
            }}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
