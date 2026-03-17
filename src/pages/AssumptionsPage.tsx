import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import { useReactor } from '../context/ReactorContext';
import { ExpandMore as ExpandMoreIcon, Info as InfoIcon } from '@mui/icons-material';

export default function AssumptionsPage() {
  const { assumptions, updateAssumptions, calculateCosts } = useReactor();
  const [localAssumptions, setLocalAssumptions] = useState(assumptions);

  const handleChange = (key: keyof typeof assumptions, value: any) => {
    setLocalAssumptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    updateAssumptions(localAssumptions);
    calculateCosts();
  };

  const handleReset = () => {
    setLocalAssumptions(assumptions);
  };

  const tooltips: { [key: string]: string } = {
    ss304PlateCost: 'Cost per kilogram of SS304 plate material (₹/kg)',
    ss304PipeCost: 'Cost per kilogram of SS304 pipe material (₹/kg)',
    msPlateCost: 'Cost per kilogram of MS (Mild Steel) plate material (₹/kg)',
    msPipeCost: 'Cost per kilogram of MS pipe material (₹/kg)',
    ssLabourCost: 'Labour cost per kilogram for SS304 fabrication (₹/kg)',
    msLabourCost: 'Labour cost per kilogram for MS fabrication (₹/kg)',
    ss304Density: 'Density of SS304 material (g/cm³)',
    msDensity: 'Density of Mild Steel (g/cm³)',
    gearBoxCost: 'Cost of gearbox assembly (₹)',
    motorCost: 'Cost of motor (₹)',
    bearingCost: 'Cost of bearing assembly (₹)',
    singleSealCost: 'Cost of single mechanical seal (₹)',
    doubleSealCost: 'Cost of double mechanical seal (₹)',
    flexibleCouplingCost: 'Cost of flexible coupling (₹)',
    toughenedGlassCost: 'Cost of toughened glass (₹)',
    hardwareCost: 'Hardware costs per unit (₹)',
    consumableCost: 'Consumable costs (welding, cutting, etc.) (₹)',
    dishPressingCost: 'Cost per unit for dish pressing operation (₹)',
    machineCharges: 'Fixed machine charges for fabrication (₹)',
    agitatorAssemblyCost: 'Cost for agitator assembly (₹)',
    acidCleaningCost: 'Cost per unit for acid cleaning (₹)',
    mirrorFinishCost: 'Cost per unit area for mirror finish (₹/sqm)',
    paintingCost: 'Fixed cost for painting (₹)',
    localTransportCost: 'Fixed cost for local transport (₹)',
    overheadPercent: 'Overhead as % of fabrication cost',
    profitPercent: 'Profit margin as % of total cost',
    annualInflationRate: 'Expected annual inflation rate for commodity prices (%)',
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Assumptions & Values</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={handleReset}>
            Reset to Current
          </Button>
          <Button variant="contained" onClick={handleApply}>
            Apply Changes & Recalculate
          </Button>
        </Box>
      </Box>

      {/* Material Costs Section */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Material Costs (per KG)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.ss304PlateCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  SS304 Plate <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"
                value={localAssumptions.ss304PlateCost}
                onChange={(e) => handleChange('ss304PlateCost', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 1 }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.ss304PipeCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  SS304 Pipe <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"
                value={localAssumptions.ss304PipeCost}
                onChange={(e) => handleChange('ss304PipeCost', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 1 }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.msPlateCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  MS Plate <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"
                value={localAssumptions.msPlateCost}
                onChange={(e) => handleChange('msPlateCost', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 1 }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.msPipeCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  MS Pipe <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"
                value={localAssumptions.msPipeCost}
                onChange={(e) => handleChange('msPipeCost', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 1 }}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Labour Costs Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Labour Costs (per KG)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Tooltip title={tooltips.ssLabourCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  SS Labour <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"
                value={localAssumptions.ssLabourCost}
                onChange={(e) => handleChange('ssLabourCost', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 1 }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Tooltip title={tooltips.msLabourCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  MS Labour <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"
                value={localAssumptions.msLabourCost}
                onChange={(e) => handleChange('msLabourCost', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 1 }}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Density Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Material Densities (g/cm³)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Tooltip title={tooltips.ss304Density}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  SS304 Density <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"
                value={localAssumptions.ss304Density}
                onChange={(e) => handleChange('ss304Density', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 0.1 }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Tooltip title={tooltips.msDensity}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  MS Density <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.msDensity}
                onChange={(e) => handleChange('msDensity', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 0.1 }}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Brought Out Costs Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Brought Out Costs (₹)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.gearBoxCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Gear Box <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.gearBoxCost}
                onChange={(e) => handleChange('gearBoxCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.motorCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Motor <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.motorCost}
                onChange={(e) => handleChange('motorCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.bearingCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Bearing <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.bearingCost}
                onChange={(e) => handleChange('bearingCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.singleSealCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Single Seal <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.singleSealCost}
                onChange={(e) => handleChange('singleSealCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.doubleSealCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Double Seal <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.doubleSealCost}
                onChange={(e) => handleChange('doubleSealCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.flexibleCouplingCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Flexible Coupling <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.flexibleCouplingCost}
                onChange={(e) => handleChange('flexibleCouplingCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.toughenedGlassCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Toughened Glass <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.toughenedGlassCost}
                onChange={(e) => handleChange('toughenedGlassCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Other Costs Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Other Costs (₹)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.hardwareCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Hardware <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.hardwareCost}
                onChange={(e) => handleChange('hardwareCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.consumableCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Consumables <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.consumableCost}
                onChange={(e) => handleChange('consumableCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.dishPressingCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Dish Pressing <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.dishPressingCost}
                onChange={(e) => handleChange('dishPressingCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.machineCharges}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Machine Charges <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.machineCharges}
                onChange={(e) => handleChange('machineCharges', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.agitatorAssemblyCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Agitator Assembly <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.agitatorAssemblyCost}
                onChange={(e) => handleChange('agitatorAssemblyCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.acidCleaningCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Acid Cleaning <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.acidCleaningCost}
                onChange={(e) => handleChange('acidCleaningCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.mirrorFinishCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Mirror Finish <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.mirrorFinishCost}
                onChange={(e) => handleChange('mirrorFinishCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.paintingCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Painting <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.paintingCost}
                onChange={(e) => handleChange('paintingCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip title={tooltips.localTransportCost}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Local Transport <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.localTransportCost}
                onChange={(e) => handleChange('localTransportCost', parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Overhead & Profit Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Overhead & Profit (%)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Tooltip title={tooltips.overheadPercent}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Overhead Percent <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.overheadPercent}
                onChange={(e) => handleChange('overheadPercent', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 0.1 }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Tooltip title={tooltips.profitPercent}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Profit Percent <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.profitPercent}
                onChange={(e) => handleChange('profitPercent', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 0.1 }}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Forecast Assumptions */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Forecast Assumptions
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Tooltip title={tooltips.annualInflationRate}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Annual Inflation Rate (%) <InfoIcon sx={{ fontSize: 14 }} />
                </Typography>
              </Tooltip>
              <TextField
                fullWidth
                type="number"              
                value={localAssumptions.annualInflationRate}
                onChange={(e) => handleChange('annualInflationRate', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 0.1 }}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Scaling Assumptions Information */}
      <Paper sx={{ p: 3, mt: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Scaling Assumptions
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
              <TableCell sx={{ fontWeight: 600 }}>Capacity (KL)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Scaling Factor
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell align="right">0.378</TableCell>
              <TableCell>30% base + 7.8% increment</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2</TableCell>
              <TableCell align="right">0.456</TableCell>
              <TableCell>30% base + 15.6% increment</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>5</TableCell>
              <TableCell align="right">0.612</TableCell>
              <TableCell>30% base + 31.2% increment</TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: '#bbdefb' }}>
              <TableCell sx={{ fontWeight: 600 }}>10</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                1.000
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Base reactor (100%)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#666' }}>
          <strong>Formula:</strong> For capacity &lt; 10 KL: Scaling Factor = 0.3 + (Capacity - 1) × 0.078
        </Typography>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" size="large" onClick={handleReset}>
          Reset to Current
        </Button>
        <Button variant="contained" size="large" onClick={handleApply}>
          Apply Changes & Recalculate
        </Button>
      </Box>
    </Box>
  );
}