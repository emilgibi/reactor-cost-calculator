import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Tooltip,
} from '@mui/material';
import { useReactor } from '../context/ReactorContext';
import { Save as SaveIcon, Download as DownloadIcon, Info as InfoIcon } from '@mui/icons-material';

export default function InputPage() {
  const { inputs, updateInputs, calculateCosts, saveConfiguration, loadConfiguration, getSavedConfigurations } = useReactor();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [configName, setConfigName] = useState('');

  const handleSave = () => {
    if (configName.trim()) {
      saveConfiguration(configName);
      setConfigName('');
      setSaveDialogOpen(false);
    }
  };

  const handleLoad = (name: string) => {
    loadConfiguration(name);
    setLoadDialogOpen(false);
  };

  const handleCalculate = () => {
    calculateCosts();
  };

  const inputTooltips: { [key: string]: string } = {
    capacity: 'Reactor capacity in KL (1-10 KL). Specifications will scale proportionally.',
    shellDiameter: 'Outer diameter of the reactor shell in millimeters.',
    motorType: 'Choose between Flameproof or Non-Flameproof motor based on application.',
    motorCapacity: 'Motor capacity in HP. Scales based on reactor capacity.',
    sealType: 'Single seal (basic), Double seal (enhanced), or Gland type.',
    bladeType: 'Gate anchor for mixing, Turbine for dispersion.',
    limpetIncluded: 'Whether the reactor includes a limpet (jacketed) cooling system.',
    limpetOD: 'Outer diameter of the limpet coil in millimeters.',
    limpetPitch: 'Pitch (spacing) of limpet turns in millimeters.',
    finishType: 'Mirror finish for aesthetics/corrosion resistance, Normal for standard finish.',
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Reactor Specifications Input</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<SaveIcon />} variant="outlined" onClick={() => setSaveDialogOpen(true)}>
            Save Config
          </Button>
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => setLoadDialogOpen(true)}>
            Load Config
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Configuration */}
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                <Tooltip title={inputTooltips.capacity}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Capacity (KL) <InfoIcon sx={{ fontSize: 16 }} />
                  </span>
                </Tooltip>
              </Typography>
              <TextField
                type="number"
                value={inputs.capacity}
                onChange={(e) => updateInputs({ capacity: Math.min(10, Math.max(1, parseFloat(e.target.value) || 1)) })}
                inputProps={{ min: 1, max: 10, step: 0.1 }}
                variant="outlined"
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                <Tooltip title={inputTooltips.shellDiameter}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Shell Diameter (mm) <InfoIcon sx={{ fontSize: 16 }} />
                  </span>
                </Tooltip>
              </Typography>
              <TextField
                type="number"
                value={inputs.shellDiameter}
                onChange={(e) => updateInputs({ shellDiameter: parseFloat(e.target.value) || 2150 })}
                variant="outlined"
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                <Tooltip title={inputTooltips.motorType}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Motor Type <InfoIcon sx={{ fontSize: 16 }} />
                  </span>
                </Tooltip>
              </Typography>
              <Select value={inputs.motorType} onChange={(e) => updateInputs({ motorType: e.target.value as any })}>
                <MenuItem value="Flameproof">Flameproof</MenuItem>
                <MenuItem value="Non-Flameproof">Non-Flameproof</MenuItem>
              </Select>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                <Tooltip title={inputTooltips.motorCapacity}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Motor Capacity (HP) <InfoIcon sx={{ fontSize: 16 }} />
                  </span>
                </Tooltip>
              </Typography>
              <TextField
                type="number"
                value={inputs.motorCapacity}
                onChange={(e) => updateInputs({ motorCapacity: parseFloat(e.target.value) || 15 })}
                variant="outlined"
              />
            </Box>
          </Grid>

          {/* Seal & Blade Configuration */}
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                <Tooltip title={inputTooltips.sealType}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Mechanical Seal <InfoIcon sx={{ fontSize: 16 }} />
                  </span>
                </Tooltip>
              </Typography>
              <Select value={inputs.sealType} onChange={(e) => updateInputs({ sealType: e.target.value as any })}>
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Double">Double</MenuItem>
                <MenuItem value="Gland">Gland</MenuItem>
              </Select>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                <Tooltip title={inputTooltips.bladeType}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Blade Type <InfoIcon sx={{ fontSize: 16 }} />
                  </span>
                </Tooltip>
              </Typography>
              <Select value={inputs.bladeType} onChange={(e) => updateInputs({ bladeType: e.target.value as any })}>
                <MenuItem value="Gate anchor">Gate Anchor</MenuItem>
                <MenuItem value="Turbine">Turbine</MenuItem>
              </Select>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                <Tooltip title={inputTooltips.finishType}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Finish Type <InfoIcon sx={{ fontSize: 16 }} />
                  </span>
                </Tooltip>
              </Typography>
              <Select value={inputs.finishType} onChange={(e) => updateInputs({ finishType: e.target.value as any })}>
                <MenuItem value="Mirror">Mirror</MenuItem>
                <MenuItem value="Normal">Normal</MenuItem>
              </Select>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                <Tooltip title={inputTooltips.limpetIncluded}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Include Limpet <InfoIcon sx={{ fontSize: 16 }} />
                  </span>
                </Tooltip>
              </Typography>
              <FormControlLabel
                control={<Switch checked={inputs.limpetIncluded} onChange={(e) => updateInputs({ limpetIncluded: e.target.checked })} />}
                label={inputs.limpetIncluded ? 'Yes' : 'No'}
              />
            </Box>
          </Grid>

          {/* Limpet Configuration */}
          {inputs.limpetIncluded && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    <Tooltip title={inputTooltips.limpetOD}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        Limpet OD (mm) <InfoIcon sx={{ fontSize: 16 }} />
                      </span>
                    </Tooltip>
                  </Typography>
                  <TextField
                    type="number"
                    value={inputs.limpetOD}
                    onChange={(e) => updateInputs({ limpetOD: parseFloat(e.target.value) || 90 })}
                    variant="outlined"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    <Tooltip title={inputTooltips.limpetPitch}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        Limpet Pitch (mm) <InfoIcon sx={{ fontSize: 16 }} />
                      </span>
                    </Tooltip>
                  </Typography>
                  <TextField
                    type="number"
                    value={inputs.limpetPitch}
                    onChange={(e) => updateInputs({ limpetPitch: parseFloat(e.target.value) || 120 })}
                    variant="outlined"
                  />
                </Box>
              </Grid>
            </>
          )}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button variant="contained" size="large" onClick={handleCalculate}>
            Calculate Costs
          </Button>
          <Button variant="outlined" size="large" onClick={() => setSaveDialogOpen(true)}>
            Save Configuration
          </Button>
        </Box>
      </Paper>

      {/* Configuration Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Current Configuration Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Capacity
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {inputs.capacity} KL
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Motor
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {inputs.motorCapacity} HP {inputs.motorType}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Seal Type
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {inputs.sealType}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Limpet
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {inputs.limpetIncluded ? 'Included' : 'Excluded'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Save Configuration Dialog */}
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
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Configuration Dialog */}
      <Dialog open={loadDialogOpen} onClose={() => setLoadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Load Configuration</DialogTitle>
        <DialogContent>
          <List sx={{ mt: 2 }}>
            {getSavedConfigurations().map((name) => (
              <ListItem key={name} disablePadding>
                <ListItemButton onClick={() => handleLoad(name)}>
                  <ListItemText primary={name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}