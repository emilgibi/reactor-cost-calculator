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
import { Tooltip } from '@mui/material';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const reactorItems = [
    { path: '/reactor/input', label: 'Input Specifications', abbrev: 'RIN', icon: InputIcon },
    { path: '/reactor/output', label: 'Output & Analysis', abbrev: 'RAA', icon: AnalysisIcon },
    { path: '/reactor/assumptions', label: 'Assumptions & Values', abbrev: 'RAV', icon: SettingsIcon },
  ];

  const airReceiverItems = [
    { path: '/air-receiver/input', label: 'Input Specifications', abbrev: 'AIN', icon: InputIcon },
    { path: '/air-receiver/output', label: 'Output & Analysis', abbrev: 'AAA', icon: AnalysisIcon },
    { path: '/air-receiver/assumptions', label: 'Assumptions & Values', abbrev: 'AAV', icon: SettingsIcon },
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
          <span className="sidebar-label-text">Reactor Calculator</span>
          <span className="sidebar-label-abbrev">RCC</span>
        </div>
        {reactorItems.map((item) => {
          const Icon = item.icon;
          return (
            <Tooltip key={item.path} title={expanded ? '' : item.label} placement="right" arrow>
              <div
                className={`sidebar-nav-item${isActive(item.path) ? ' active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon sx={{ fontSize: 20, flexShrink: 0 }} />
                <span className="sidebar-item-full">{item.label}</span>
                <span className="sidebar-item-abbrev">{item.abbrev}</span>
              </div>
            </Tooltip>
          );
        })}

        <div className="sidebar-section-label" style={{ marginTop: 16 }}>
          <AirIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
          <span className="sidebar-label-text">Air Receiver</span>
          <span className="sidebar-label-abbrev">ARC</span>
        </div>
        {airReceiverItems.map((item) => {
          const Icon = item.icon;
          return (
            <Tooltip key={item.path} title={expanded ? '' : item.label} placement="right" arrow>
              <div
                className={`sidebar-nav-item${isActive(item.path) ? ' active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon sx={{ fontSize: 20, flexShrink: 0 }} />
                <span className="sidebar-item-full">{item.label}</span>
                <span className="sidebar-item-abbrev">{item.abbrev}</span>
              </div>
            </Tooltip>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <Tooltip title={expanded ? '' : 'Back to Home'} placement="right" arrow>
          <div
            className="sidebar-home-link"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <HomeIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            <span className="sidebar-item-full">Back to Home</span>
            <span className="sidebar-item-abbrev">🏠</span>
          </div>
        </Tooltip>
      </div>
    </nav>
  );
}
