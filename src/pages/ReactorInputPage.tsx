import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  FormControlLabel,
  Select,
  MenuItem,
  Switch,
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
} from '@mui/material';
import { useReactor } from '../context/ReactorContext';
import { Save as SaveIcon, Download as DownloadIcon, Calculate as CalculateIcon } from '@mui/icons-material';
import { ReactorFormInput } from '../types/reactor';

export default function ReactorInputPage() {
  const {inputs, updateInputs, calculateCosts, saveConfiguration, loadConfiguration, getSavedConfigurations } =
    useReactor();
  const navigate = useNavigate();
  const {assumptions, setCalculationResult } = useReactor();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spec = inputs.Specification;
  const nozzle = inputs.NozzleSchedule;

  const setSpec = (partial: Partial<ReactorFormInput['Specification']>) => {
    updateInputs({ Specification: { ...spec, ...partial } });
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(`${backendUrl}/api/kl-reactor-calculation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Kl: 10, 
          Specification: inputs.Specification,
          NozzleSchedule: inputs.NozzleSchedule,
          Assumptions: {
            MaterialCosts: {
              SS304_Plate: assumptions.ss304PlateCost,
              SS304_Pipe: assumptions.ss304PipeCost,
              MS_Plate: assumptions.msPlateCost,
              MS_Pipe: assumptions.msPipeCost,
            },
            LabourCosts: {
              ssLabourCost: assumptions.ssLabourCost,
              msLabourCost: assumptions.msLabourCost,
            },
            DensityValues: {
              SS304: assumptions.ss304Density,
              MS: assumptions.msDensity,
            },
            BroughtOutComponents: {
              gearBox: assumptions.gearBoxCost,
              motor: assumptions.motorCost,
              bearing: assumptions.bearingCost,
              singleMechanicalSeal: assumptions.singleSealCost,
              flexibleCoupling: assumptions.flexibleCouplingCost,
              toughenedGlass: assumptions.toughenedGlassCost,
            },
            FinancialPercentages: {
              overhead: assumptions.overheadPercent,
              profit: assumptions.profitPercent,
              inflationRate: assumptions.annualInflationRate,
            },
            OtherCosts: {
              dishPressingPerSqm: assumptions.dishPressingCost,
              machineCharges: assumptions.machineCharges,
              agitatorAssembly: assumptions.agitatorAssemblyCost,
              acidCleaningPerSqm: assumptions.acidCleaningCost,
              mirrorFinishPerSqm: assumptions.mirrorFinishCost,
              paintingLumpsum: assumptions.paintingCost,
              localTransportLumpsum: assumptions.localTransportCost,
            },
          },
        }),
      });

      if (!response.ok) {
        setError('Calculation failed. Please check your inputs.');
        setLoading(false);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        setCalculationResult(result.results);
        navigate('/reactor/output');
      } else {
        setError(result.error || 'Calculation failed');
      }
    } catch (err: any) {
      setError('Error: ' + (err.message || 'Unknown error'));
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

  const restrictedMocOptions = ['SS304', 'SS316'];
  const sealTypes = ['Single', 'Double', 'Gland'] as const;
  const motorTypes = ['Flameproof', 'Non-Flameproof'] as const;
  const bladeTypes = ['Gate anchor', 'Turbine'] as const;
  const finishTypes = ['Mirror', 'Normal'] as const;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Reactor Specifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            10 KL Reactor Cost Calculator
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
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
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
                {restrictedMocOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Diameter (mm)"
              type="number"
              value={spec.Shell.diameter}
              onChange={(e) => setSpec({ Shell: { ...spec.Shell, diameter: parseFloat(e.target.value) || 2150 } })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Height (mm)"
              type="number"
              value={spec.Shell.height}
              onChange={(e) => setSpec({ Shell: { ...spec.Shell, height: parseFloat(e.target.value) || 2000 } })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Thickness (mm)"
              type="number"
              value={spec.Shell.thickness}
              onChange={(e) => setSpec({ Shell: { ...spec.Shell, thickness: parseFloat(e.target.value) || 8 } })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={spec.Shell.limpet}
                  onChange={(e) => setSpec({ Shell: { ...spec.Shell, limpet: e.target.checked } })}
                />
              }
              label="Limpet"
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Dish Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
          Dish
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
                {restrictedMocOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Diameter (mm)"
              type="number"
              value={spec.Dish.diameter}
              onChange={(e) => setSpec({ Dish: { ...spec.Dish, diameter: parseFloat(e.target.value) || 2150 } })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Thickness (mm)"
              type="number"
              value={spec.Dish.thickness}
              onChange={(e) => setSpec({ Dish: { ...spec.Dish, thickness: parseFloat(e.target.value) || 8 } })}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Mechanical Seal, Motor, Blade, Finish */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
          Drive & Sealing
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Mechanical Seal</InputLabel>
              <Select
                label="Mechanical Seal"
                value={spec.MechanicalSeal.type}
                onChange={(e) => setSpec({ MechanicalSeal: { type: e.target.value as typeof sealTypes[number] } })}
              >
                {sealTypes.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Motor Type</InputLabel>
              <Select
                label="Motor Type"
                value={spec.Motor.type}
                onChange={(e) => setSpec({ Motor: { type: e.target.value as typeof motorTypes[number] } })}
              >
                {motorTypes.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Blade Type</InputLabel>
              <Select
                label="Blade Type"
                value={spec.Blade.type}
                onChange={(e) => setSpec({ Blade: { type: e.target.value as typeof bladeTypes[number] } })}
              >
                {bladeTypes.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Finish Type</InputLabel>
              <Select
                label="Finish Type"
                value={spec.Finish.type}
                onChange={(e) => setSpec({ Finish: { type: e.target.value as typeof finishTypes[number] } })}
              >
                {finishTypes.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Shaft Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
          Shaft
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>MOC</InputLabel>
              <Select
                label="MOC"
                value={spec.Shaft.moc}
                onChange={(e) => setSpec({ Shaft: { ...spec.Shaft, moc: e.target.value } })}
              >
                {restrictedMocOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Diameter (mm)"
              type="number"
              value={spec.Shaft.diameter}
              onChange={(e) => setSpec({ Shaft: { ...spec.Shaft, diameter: parseFloat(e.target.value) || 75 } })}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Limpet Section - conditional */}
      {spec.Shell.limpet && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
            Limpet Coil
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <Typography variant="caption" color="text.secondary">MOC (Fixed)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>MS</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="OD Diameter (mm)"
                type="number"
                value={spec.Limpet.od_diameter}
                onChange={(e) =>
                  setSpec({ Limpet: { ...spec.Limpet, od_diameter: parseFloat(e.target.value) || 90 } })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Pitch Diameter (mm)"
                type="number"
                value={spec.Limpet.pitch_diameter}
                onChange={(e) =>
                  setSpec({ Limpet: { ...spec.Limpet, pitch_diameter: parseFloat(e.target.value) || 120 } })
                }
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Nozzle Schedule */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
          Nozzle Schedule
        </Typography>
        <Grid container spacing={2}>
          {[
            { key: 'Thermowell_25_NB', label: 'Thermowell 25 NB', hasMoc: true },
            { key: 'NB_25', label: 'NB 25', hasMoc: true },
            { key: 'NB_40', label: 'NB 40', hasMoc: true },
            { key: 'NB_50', label: 'NB 50', hasMoc: true },
            { key: 'NB_80', label: 'NB 80', hasMoc: true },
            { key: 'NB_100', label: 'NB 100', hasMoc: true },
            { key: 'NB_150', label: 'NB 150', hasMoc: true },
            { key: 'NB_600', label: 'NB 600 (Manhole)', hasMoc: true },
            { key: 'LightGlass_150_NB', label: 'Light Glass 150 NB', hasMoc: false },
            { key: 'SightGlass_150_NB', label: 'Sight Glass 150 NB', hasMoc: false },
          ].map(({ key, label, hasMoc }) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Card variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  {label}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {hasMoc && (
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>MOC</InputLabel>
                      <Select
                        label="MOC"
                        value={(nozzle as any)[key]?.moc || 'SS304'}
                        onChange={(e) =>
                          updateInputs({
                            NozzleSchedule: {
                              ...nozzle,
                              [key]: { ...(nozzle as any)[key], moc: e.target.value },
                            },
                          })
                        }
                      >
                        {['SS304', 'SS316', 'MS', 'SS/MS'].map((o) => (
                          <MenuItem key={o} value={o}>{o}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <TextField
                    size="small"
                    label="Count"
                    type="number"
                    sx={{ width: 80 }}
                    value={(nozzle as any)[key]?.count || 0}
                    inputProps={{ min: 0, max: 20 }}
                    onChange={(e) =>
                      updateInputs({
                        NozzleSchedule: {
                          ...nozzle,
                          [key]: {
                            ...(nozzle as any)[key],
                            count: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                  />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Summary & Calculate */}
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
              { label: 'Limpet', value: spec.Shell.limpet ? 'Yes' : 'No' },
              { label: 'Seal Type', value: spec.MechanicalSeal.type },
              { label: 'Motor', value: spec.Motor.type },
              { label: 'Blade', value: spec.Blade.type },
              { label: 'Finish', value: spec.Finish.type },
            ].map(({ label, value }) => (
              <Grid item xs={6} sm={3} key={label}>
                <Box sx={{ p: 1, backgroundColor: '#f5f7ff', borderRadius: 1 }}>
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
          sx={{ background: 'linear-gradient(135deg, #1976d2, #1565c0)' }}
        >
          {loading ? 'Calculating...' : 'Calculate Costs'}
        </Button>
        <Button variant="outlined" size="large" onClick={() => setSaveDialogOpen(true)}>
          Save Configuration
        </Button>
      </Box>

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
