import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { useAirReceiver } from '../context/AirReceiverContext';
import { Save as SaveIcon, Download as DownloadIcon } from '@mui/icons-material';
import { AirReceiverFormInput } from '../types/airReceiver';

export default function AirReceiverInputPage() {
  const { inputs, updateInputs, saveConfiguration, loadConfiguration, getSavedConfigurations } =
    useAirReceiver();
  const navigate = useNavigate();
  const {assumptions, setCalculationResult } = useAirReceiver();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorPage, setErrorPage] = useState<string | null>(null);

  const spec = inputs.Specification;

  const setSpec = (partial: Partial<AirReceiverFormInput['Specification']>) => {
    updateInputs({ Specification: { ...spec, ...partial } });
  };

    const parseBackendError = (errData: any): string | null => {
      if (!errData) return null;
      if (typeof errData.detail === 'string') return errData.detail;
      if (Array.isArray(errData.detail)) {
        return errData.detail
          .map((e: any) => {
            const loc = Array.isArray(e.loc) ? e.loc.join(' → ') : '';
            return loc ? `${loc}: ${e.msg}` : e.msg;
          })
          .join('; ');
      }
      if (typeof errData === 'string') return errData;
      return JSON.stringify(errData);
    };

    const handleCalculate = async () => {
      try {
        setLoading(true);
        setErrorPage(null);
        
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        
        const payload = {
          Specification: {
            Shell: {
              moc: inputs.Specification?.Shell?.moc || 'CS',
              diameter: inputs.Specification?.Shell?.diameter || 2200,
              height: inputs.Specification?.Shell?.height || 4500,
              thickness: inputs.Specification?.Shell?.thickness || 12,
            },
            Dish: {
              moc: inputs.Specification?.Dish?.moc || 'CS',
              diameter: inputs.Specification?.Dish?.diameter || 2200,
              thickness: inputs.Specification?.Dish?.thickness || 8,
            },
            Finish: {
              type: inputs.Specification?.Finish?.type || 'Painting',
            },
          },
          NozzleSchedule: {
            NB_25: { count: inputs.NozzleSchedule?.NB_25?.count || 0 },
            NB_40: { count: inputs.NozzleSchedule?.NB_40?.count || 0 },
            NB_50: { count: inputs.NozzleSchedule?.NB_50?.count || 0 },
            NB_80: { count: inputs.NozzleSchedule?.NB_80?.count || 0 },
            NB_100: { count: inputs.NozzleSchedule?.NB_100?.count || 0 },
            NB_150: { count: inputs.NozzleSchedule?.NB_150?.count || 0 },
            NB_600: { count: inputs.NozzleSchedule?.NB_600?.count || 0 },
          },
          Assumptions: {
            MaterialCosts: {
              msPlateCost: assumptions.msPlateCost || 80,
              msPipeCost: assumptions.msPipeCost || 120,
            },
            LabourCosts: {
              msLabourCost: assumptions.msLabourCost || 30,
            },
            DensityValues: {
              msDensity: assumptions.msDensity || 7.86,
            },
            FinancialPercentages: {
              overhead: assumptions.overheadPercent || 10,
              profit: assumptions.profitPercent || 15,
            },
            OtherCosts: {
              dishPressingPerSqm: assumptions.dishPressingPerSqm || 20,
              testing: assumptions.testingCost || 30000,
              machineCharges: assumptions.machineCharges || 0,
              paintingLumpsum: assumptions.paintingLumpsum || 25000,
              localTransportLumpsum: assumptions.localTransportLumpsum || 35000,
              hardwareLumpsum: assumptions.hardwareLumpsum || 2500,
            },
          },
        };

        const response = await fetch(`${backendUrl}/analysis/air-receiver-calculation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          const errMsg = parseBackendError(errData) || `Request failed with status ${response.status}`;
          setErrorPage(errMsg);
          setLoading(false);
          return;
        }

        const result = await response.json();
        
        if (result.success) {
          const raw = result.results;

          // Map backend name keys to human-readable descriptions
          const nameToDescription: Record<string, string> = {
            ms_plate: 'MS Plate',
            ms_pipe: 'MS Pipe',
            ms_labour: 'MS Labour',
            consumable: 'Consumables',
            hardware: 'Hardware',
            hard_ware: 'Hardware',
            dish_pressing: 'Dish Pressing',
            machine_charges: 'Machine Charges',
            MC_charge: 'Machine Charges',
            testing: 'Testing',
            painting: 'Painting',
            local_transport: 'Local Transport',
            ss304_plate: 'SS304 Plate',
            ss304_pipe: 'SS304 Pipe',
            ss_labour: 'SS Labour',
          };

          // Build fabrication_breakdown from cost_breakup array
          const fabrication_breakdown: any = {};
          if (Array.isArray(raw.cost_breakup)) {
            for (const item of raw.cost_breakup) {
              const key = item.name;
              let normalizedKey = key;
              if (key === 'hard_ware') normalizedKey = 'hardware';
              if (key === 'MC_charge') normalizedKey = 'machine_charges';
              fabrication_breakdown[normalizedKey] = {
                description: nameToDescription[key] || key,
                unit_rate: item.unit_cost ?? null,
                quantity: item.quantity ?? null,
                unit_type: item.quantity != null ? 'kg' : null,
                total_cost: item.cost || 0,
              };
            }
          }

          // Ensure expected keys exist with zero defaults
          const expectedKeys = [
            'ms_plate', 'ms_pipe', 'ms_labour', 'consumable',
            'hardware', 'dish_pressing', 'machine_charges',
            'testing', 'painting', 'local_transport',
          ];
          for (const k of expectedKeys) {
            if (!fabrication_breakdown[k]) {
              fabrication_breakdown[k] = {
                description: nameToDescription[k] || k,
                unit_rate: null,
                quantity: null,
                unit_type: null,
                total_cost: 0,
              };
            }
          }

          // Build summary
          const summary = {
            fabrication_cost: raw.fabrication_cost || 0,
            overhead_percentage: assumptions.overheadPercent,
            overhead_amount: raw.overhead || 0,
            profit_percentage: assumptions.profitPercent,
            profit_amount: raw.profit || 0,
            grand_total: raw.grand_total || 0,
          };

          setCalculationResult({
            fabrication_breakdown,
            summary,
            measurement_variation: raw.measurement_variation,
            cost_variation: raw.cost_variation,
            category_breakup: raw.category_breakup,
          });
          navigate('/air-receiver/output');
        } else {
          setErrorPage(result.error && typeof result.error === 'string' ? result.error : result.error ? JSON.stringify(result.error) : 'Calculation failed');
        }
      } catch (err: any) {
        setErrorPage('Error: ' + (err.message || 'Unknown error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  const handleSave = () => {
    if (configName.trim()) {
      saveConfiguration(configName.trim());
      setConfigName('');
      setSaveDialogOpen(false);
    }
  };

  const handleLoad = (name: string) => {
    loadConfiguration(name);
    setLoadDialogOpen(false);
  };

  const mocOptions = ['CS', 'MS', 'SS304', 'SS316'];
  const finishTypes = ['Painting', 'Internal', 'External', 'Both', 'None'] as const;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Air Receiver Specifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            20 KL Air Receiver / Pressure Vessel Cost Calculator
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<SaveIcon />} variant="outlined" onClick={() => setSaveDialogOpen(true)}>
            Save
          </Button>
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => setLoadDialogOpen(true)}>
            Load
          </Button>
        </Box>
      </Box>

      {/* Shell Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#388e3c' }}>
          Shell
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>MOC</InputLabel>
              <Select
                label="MOC"
                value={spec.Shell.moc}
                onChange={(e) => setSpec({ Shell: { ...spec.Shell, moc: e.target.value } })}
              >
                {mocOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Diameter (mm)"
              type="number"
              value={spec.Shell.diameter}
              onChange={(e) => setSpec({ Shell: { ...spec.Shell, diameter: parseFloat(e.target.value) || 1200 } })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Height (mm)"
              type="number"
              value={spec.Shell.height}
              onChange={(e) => setSpec({ Shell: { ...spec.Shell, height: parseFloat(e.target.value) || 3000 } })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Thickness (mm)"
              type="number"
              value={spec.Shell.thickness}
              onChange={(e) => setSpec({ Shell: { ...spec.Shell, thickness: parseFloat(e.target.value) || 10 } })}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Dish Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#388e3c' }}>
          Dish Ends
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>MOC</InputLabel>
              <Select
                label="MOC"
                value={spec.Dish.moc}
                onChange={(e) => setSpec({ Dish: { ...spec.Dish, moc: e.target.value } })}
              >
                {mocOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Diameter (mm)"
              type="number"
              value={spec.Dish.diameter}
              onChange={(e) => setSpec({ Dish: { ...spec.Dish, diameter: parseFloat(e.target.value) || 1200 } })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Thickness (mm)"
              type="number"
              value={spec.Dish.thickness}
              onChange={(e) => setSpec({ Dish: { ...spec.Dish, thickness: parseFloat(e.target.value) || 10 } })}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Finish */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#388e3c' }}>
          Surface Finish
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Surface Finish</InputLabel>
              <Select
                label="Surface Finish"
                value={spec.Finish.type}
                onChange={(e) => setSpec({ Finish: { type: e.target.value as typeof finishTypes[number] } })}
              >
                {finishTypes.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Configuration Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[
              { label: 'Shell MOC', value: spec.Shell.moc },
              { label: 'Shell Dia × H', value: `${spec.Shell.diameter} × ${spec.Shell.height} mm` },
              { label: 'Shell Thickness', value: `${spec.Shell.thickness} mm` },
              { label: 'Finish', value: spec.Finish.type },
            ].map(({ label, value }) => (
              <Grid item xs={6} sm={4} md={2} key={label}>
                <Box sx={{ p: 1, backgroundColor: '#f1f8e9', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleCalculate}
          disabled={loading}
          sx={{ background: 'linear-gradient(135deg, #388e3c, #1b5e20)' }}
        >
          {loading ? 'Calculating...' : 'Calculate Costs'}
        </Button>
      </Box>

      {errorPage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorPage}
        </Alert>
      )}

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Configuration</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Configuration Name"
            fullWidth
            variant="outlined"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={loadDialogOpen} onClose={() => setLoadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Load Configuration</DialogTitle>
        <DialogContent>
          {getSavedConfigurations().length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>No saved configurations found.</Typography>
          ) : (
            <List sx={{ mt: 1 }}>
              {getSavedConfigurations().map((name) => (
                <ListItem key={name} disablePadding>
                  <ListItemButton onClick={() => handleLoad(name)}>
                    <ListItemText primary={name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
