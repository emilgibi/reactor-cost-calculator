import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider } from '@mui/material';
import { Input as InputIcon, BarChart as AnalysisIcon, Settings as AssumptionsIcon } from '@mui/icons-material';

interface NavigationProps {
  currentPage: 'input' | 'output' | 'assumptions';
  setCurrentPage: (page: 'input' | 'output' | 'assumptions') => void;
}

export default function Navigation({ currentPage, setCurrentPage }: NavigationProps) {
  const pages = [
    { id: 'input', label: 'Input', icon: InputIcon, description: 'Enter reactor specifications' },
    { id: 'output', label: 'Output & Analysis', icon: AnalysisIcon, description: 'View cost breakdown & scenarios' },
    { id: 'assumptions', label: 'Assumptions & Values', icon: AssumptionsIcon, description: 'Configure cost assumptions' },
  ] as const;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: '#f5f5f5',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
          Reactor Cost Calculator
        </Typography>
        <Typography variant="caption" sx={{ color: '#666' }}>
          10 KL Reactor Capacity
        </Typography>
      </Box>
      <Divider />
      <List sx={{ pt: 2 }}>
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <ListItem key={page.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={currentPage === page.id}
                onClick={() => setCurrentPage(page.id)}
                sx={{
                  borderRadius: '8px',
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: '#e3f2fd',
                    '&:hover': {
                      backgroundColor: '#bbdefb',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon sx={{ color: currentPage === page.id ? '#1976d2' : 'inherit' }} />
                </ListItemIcon>
                <ListItemText
                  primary={page.label}
                  secondary={page.description}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}