import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Input as InputIcon,
  BarChart as AnalysisIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Air as AirIcon,
  Biotech as ReactorIcon,
} from '@mui/icons-material';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const reactorItems = [
    { path: '/reactor/input', label: 'Input Specifications', icon: InputIcon },
    { path: '/reactor/output', label: 'Output & Analysis', icon: AnalysisIcon },
    { path: '/reactor/assumptions', label: 'Assumptions & Values', icon: SettingsIcon },
  ];

  const airReceiverItems = [
    { path: '/air-receiver/input', label: 'Input Specifications', icon: InputIcon },
    { path: '/air-receiver/output', label: 'Output & Analysis', icon: AnalysisIcon },
    { path: '/air-receiver/assumptions', label: 'Assumptions & Values', icon: SettingsIcon },
  ];

  return (
    <nav
      className={`sidebar${expanded ? ' expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="sidebar-brand">
        <h2>Engineering Cost<br />Calculator</h2>
        <span>Multi-Equipment Platform</span>
      </div>

      <div className="sidebar-nav">
        <div className="sidebar-section-label">
          <ReactorIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
          Reactor Calculator
        </div>
        {reactorItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.path}
              className={`sidebar-nav-item${isActive(item.path) ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon sx={{ fontSize: 20 }} />
              <span>{item.label}</span>
            </div>
          );
        })}

        <div className="sidebar-section-label" style={{ marginTop: 16 }}>
          <AirIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
          Air Receiver
        </div>
        {airReceiverItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.path}
              className={`sidebar-nav-item${isActive(item.path) ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon sx={{ fontSize: 20 }} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div
          className="sidebar-home-link"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          <HomeIcon sx={{ fontSize: 20 }} />
          <span>Back to Home</span>
        </div>
      </div>
    </nav>
  );
}
