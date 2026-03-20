import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Grid,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { useReactor } from '../context/ReactorContext';
import { ExpandMore as ExpandMoreIcon, Save as SaveIcon, Refresh as ResetIcon } from '@mui/icons-material';
import { ReactorAssumptions } from '../types/reactor';

export default function AssumptionsPage() {
  const { assumptions, updateAssumptions, calculateCosts } = useReactor();
  const navigate = useNavigate();
  const [localAssumptions, setLocalAssumptions] = useState<ReactorAssumptions>({ ...assumptions });
  const [toastOpen, setToastOpen] = useState(false);

  const handleChange = (key: keyof ReactorAssumptions, value: string) => {
    setLocalAssumptions((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleApply = () => {
    updateAssumptions(localAssumptions);
    calculateCosts();
    setToastOpen(true);
    setTimeout(() => navigate('/reactor/output'), 1200);
  };

  const handleReset = () => {
    setLocalAssumptions({ ...assumptions });
  };

  const field = (key: keyof ReactorAssumptions, label: string, prefix = '₹', suffix = '') => (
    <Grid item xs={12} sm={6} md={4} key={key}>
      <TextField
        fullWidth
        label={label}
        type="number"
        value={localAssumptions[key]}
        onChange={(e) => handleChange(key, e.target.value)}
        InputProps={{
          startAdornment: prefix ? <span style={{ marginRight: 4, color: '#666' }}>{prefix}</span> : undefined,
          endAdornment: suffix ? <span style={{ marginLeft: 4, color: '#666' }}>{suffix}</span> : undefined,
        }}
        size="small"
      />
    </Grid>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Reactor Assumptions & Values
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure cost rates and parameters for reactor calculations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<ResetIcon />} variant="outlined" onClick={handleReset}>
            Reset
          </Button>
          <Button startIcon={<SaveIcon />} variant="contained" onClick={handleApply}>
            Apply & Recalculate
          </Button>
        </Box>
      </Box>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Material Costs (per KG)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {field('ss304PlateCost', 'SS304 Plate Cost')}
            {field('ss304PipeCost', 'SS304 Pipe Cost')}
            {field('msPlateCost', 'MS Plate Cost')}
            {field('msPipeCost', 'MS Pipe Cost')}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Labour Costs (per KG)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {field('ssLabourCost', 'SS Labour Cost')}
            {field('msLabourCost', 'MS Labour Cost')}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Density Values (g/cm³)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {field('ss304Density', 'SS304 Density', '', ' g/cm³')}
            {field('msDensity', 'MS Density', '', ' g/cm³')}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Brought-Out Components</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {field('gearBoxCost', 'Gear Box')}
            {field('motorCost', 'Motor')}
            {field('bearingCost', 'Bearing')}
            {field('singleSealCost', 'Single Mechanical Seal')}
            {field('doubleSealCost', 'Double Mechanical Seal')}
            {field('flexibleCouplingCost', 'Flexible Coupling')}
            {field('toughenedGlassCost', 'Toughened Glass (per piece)')}
            {field('hardwareCost', 'Hardware')}
            {field('consumableCost', 'Consumables')}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Service Costs</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {field('dishPressingCost', 'Dish Pressing (per kg)')}
            {field('machineCharges', 'Machine Charges')}
            {field('agitatorAssemblyCost', 'Agitator Assembly')}
            {field('acidCleaningCost', 'Acid Cleaning (per kg)')}
            {field('mirrorFinishCost', 'Mirror Finish (per sqm)')}
            {field('paintingCost', 'Painting')}
            {field('localTransportCost', 'Local Transport')}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Financial Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {field('overheadPercent', 'Overhead %', '', '%')}
            {field('profitPercent', 'Profit %', '', '%')}
            {field('annualInflationRate', 'Annual Inflation Rate', '', '%')}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={handleReset} startIcon={<ResetIcon />}>
          Reset to Current
        </Button>
        <Button variant="contained" onClick={handleApply} startIcon={<SaveIcon />}>
          Apply Changes & Recalculate
        </Button>
      </Box>

      <Snackbar
        open={toastOpen}
        autoHideDuration={2000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setToastOpen(false)} sx={{ width: '100%' }}>
          Assumptions applied! Navigating to Output & Analysis…
        </Alert>
      </Snackbar>
    </Box>
  );
}
