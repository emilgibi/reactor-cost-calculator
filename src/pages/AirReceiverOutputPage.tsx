import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download as PrintIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAirReceiver } from '../context/AirReceiverContext';
import { exportUnifiedPDF } from '../utils/pdfGenerator';
import {
  getForecastFromBackend,
  transformForecastResponse,
  getLocalForecast,
  ForecastDataPoint,
  type MaterialInfo
} from '../utils/api';

const COLORS = ['#388e3c', '#1976d2', '#dc004e', '#f57c00', '#7b1fa2', '#0097a7'];

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AirReceiverOutputPage() {
  const { calculationResult, assumptions, inputs } = useAirReceiver();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [costForecastData, setCostForecastData] = useState<ForecastDataPoint[]>([]);
  const [materialInfo, setMaterialInfo] = useState<MaterialInfo | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  useEffect(() => {
    if (!calculationResult) {
      setCostForecastData([]);
      return;
    }
    const materialType = inputs.Specification?.Shell?.moc || 'SS304';
    const baseCost = calculationResult.grandTotal;
    let cancelled = false;
    setForecastLoading(true);
    setForecastError(null);
    getForecastFromBackend(baseCost, materialType).then((response) => {
      if (cancelled) return;
      if (response) {
        setCostForecastData(transformForecastResponse(response));
        setMaterialInfo({
          material_type: response.material_type,
          material_name: response.material_name,
          current_wpi: response.current_wpi,
          base_cost: response.base_cost,
        });
      } else {
        setCostForecastData(getLocalForecast(baseCost, assumptions.annualInflationRate));
        setForecastError('Backend unavailable – showing estimated forecast based on fixed inflation rate.');
      }
      setForecastLoading(false);
    });
    return () => { cancelled = true; };
  }, [calculationResult, inputs, assumptions.annualInflationRate]);

  const commodityScenarioData = useMemo(() => {
    if (!calculationResult) return [];
    const base = calculationResult.grandTotal;
    const cb = calculationResult.costBreakdown;
    const ss304 = cb['SS304 Plate'] || 0;
    const ms = cb['MS Plate'] || 0;
    const labour = (cb['SS Labour'] || 0) + (cb['MS Labour'] || 0);
    return [
      { scenario: '+10% SS304', baseValue: base, scenarioValue: base + ss304 * 0.1 },
      { scenario: '+10% MS', baseValue: base, scenarioValue: base + ms * 0.1 },
      { scenario: '+10% Labour', baseValue: base, scenarioValue: base + labour * 0.1 },
    ];
  }, [calculationResult]);

  const specScenarioData = useMemo(() => {
    if (!calculationResult) return [];
    const base = calculationResult.grandTotal;
    const matLabour = calculationResult.totalMaterialCost + calculationResult.totalLabourCost;
    return [
      { scenario: '+10% Diameter', baseValue: base, scenarioValue: base + matLabour * 0.08 },
      { scenario: '+10% Height', baseValue: base, scenarioValue: base + matLabour * 0.1 },
      { scenario: '+10% Thickness', baseValue: base, scenarioValue: base + matLabour * 0.1 },
    ];
  }, [calculationResult]);

  const pieData = useMemo(() => {
    if (!calculationResult) return [];
    const cb = calculationResult.costBreakdown;
    const groups: { [key: string]: number } = {
      'SS304 Material': cb['SS304 Plate'] || 0,
      'MS Material': cb['MS Plate'] || 0,
      'Labour': (cb['SS Labour'] || 0) + (cb['MS Labour'] || 0),
      'Services': (cb['Dish Pressing'] || 0) + (cb['Machine Charges'] || 0),
      'Overhead & Profit': (cb['Overhead'] || 0) + calculationResult.profitCost,
      'Other': (cb['Hardware'] || 0) + (cb['Painting'] || 0) + (cb['Local Transport'] || 0),
    };
    return Object.entries(groups)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [calculationResult]);

  const handleExportPDF = async () => {
    setExporting(true);
    await exportUnifiedPDF('airreceiver-pdf-export', 'AirReceiver-Cost-Analysis.pdf');
    setExporting(false);
  };

  if (!calculationResult) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          No calculation results yet. Please fill in the air receiver specifications and click "Calculate Costs".
        </Alert>
        <Button variant="contained" onClick={() => navigate('/air-receiver/input')}
          sx={{ background: 'linear-gradient(135deg, #388e3c, #1b5e20)' }}>
          Go to Input Page
        </Button>
      </Box>
    );
  }

  const summaryCards = [
    { label: 'Material Cost', value: formatCurrency(calculationResult.totalMaterialCost) },
    { label: 'Labour Cost', value: formatCurrency(calculationResult.totalLabourCost) },
    { label: 'Overhead', value: formatCurrency(calculationResult.overheadCost) },
    { label: 'Grand Total', value: formatCurrency(calculationResult.grandTotal), highlight: true },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Air Receiver Cost Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Shell: {inputs.Specification.Shell.moc} | Dia: {inputs.Specification.Shell.diameter} mm | Capacity: {inputs.capacity} KL
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<EditIcon />} variant="outlined" onClick={() => navigate('/air-receiver/input')}>
            Modify Inputs
          </Button>
          <Button
            startIcon={<PrintIcon />}
            variant="contained"
            onClick={handleExportPDF}
            disabled={exporting}
            sx={{ background: 'linear-gradient(135deg, #388e3c, #1b5e20)' }}
          >
            {exporting ? 'Exporting…' : 'Export PDF'}
          </Button>
        </Box>
      </Box>

      {/* Profit Modifier Slider removed — profit is fixed from backend calculation */}

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map(({ label, value, highlight }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Card sx={{ borderLeft: highlight ? '4px solid #388e3c' : '4px solid #e0e0e0', height: '100%' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: highlight ? '#388e3c' : 'inherit' }}>
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          TabIndicatorProps={{ style: { backgroundColor: '#388e3c' } }}
        >
          <Tab label="Calculation Breakdown" />
          <Tab label="Commodity Analysis" />
          <Tab label="5-Year Forecast" />
          <Tab label="Commodity Scenarios" />
          <Tab label="Specification Scenarios" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Cost Breakdown</Typography>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f1f8e9' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Component</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(calculationResult.costBreakdown)
                  .filter(([k, v]) => v > 0 && k !== 'Profit')
                  .map(([key, val]) => (
                    <TableRow key={key} hover>
                      <TableCell>{key}</TableCell>
                      <TableCell align="right">{formatCurrency(val)}</TableCell>
                    </TableRow>
                  ))}
                <TableRow hover>
                  <TableCell>Profit</TableCell>
                  <TableCell align="right">{formatCurrency(calculationResult.profitCost)}</TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
                  <TableCell sx={{ fontWeight: 700 }}>GRAND TOTAL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(calculationResult.grandTotal)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Cost Distribution</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={150} dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(1)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
              5-Year Cost Forecast {materialInfo ? `(WPI-based ML prediction for ${materialInfo.material_name})` : '(WPI-based ML prediction)'}
            </Typography>
            {materialInfo && (
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                Base Cost: ₹{(materialInfo.base_cost / 100000).toFixed(2)}L | 
                Material: {materialInfo.material_type} | 
                Current WPI: {materialInfo.current_wpi.toFixed(2)}
              </Typography>
            )}
            {forecastError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {forecastError}
              </Alert>
            )}
            {forecastLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">Fetching WPI-based forecast…</Typography>
                </Box>
                <Skeleton variant="rectangular" height={350} />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={costForecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend />
                  <Line type="monotone" dataKey="cost" stroke="#388e3c" strokeWidth={2} dot={{ r: 5 }} name="Projected Cost" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabPanel>

          {/* Tab 4: Commodity Scenarios – Table */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Commodity Scenarios (+10% price changes)</Typography>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f1f8e9' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Scenario</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Base Cost</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Scenario Cost (+10%)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Impact</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>% Change</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commodityScenarioData.map((row, idx) => {
                  const impact = row.scenarioValue - row.baseValue;
                  const pctChange = ((impact / row.baseValue) * 100).toFixed(2);
                  return (
                    <TableRow key={row.scenario} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                      <TableCell sx={{ fontWeight: 500 }}>{row.scenario}</TableCell>
                      <TableCell align="right">{formatCurrency(row.baseValue)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.scenarioValue)}</TableCell>
                      <TableCell align="right" sx={{ color: '#dc004e', fontWeight: 600 }}>+{formatCurrency(impact)}</TableCell>
                      <TableCell align="right" sx={{ color: '#dc004e', fontWeight: 600 }}>+{pctChange}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabPanel>

          {/* Tab 5: Specification Scenarios – Table */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Specification Scenarios (+10% dimension changes)</Typography>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f1f8e9' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Scenario</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Base Cost</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Scenario Cost (+10%)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Impact</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>% Change</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {specScenarioData.map((row, idx) => {
                  const impact = row.scenarioValue - row.baseValue;
                  const pctChange = ((impact / row.baseValue) * 100).toFixed(2);
                  return (
                    <TableRow key={row.scenario} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                      <TableCell sx={{ fontWeight: 500 }}>{row.scenario}</TableCell>
                      <TableCell align="right">{formatCurrency(row.baseValue)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.scenarioValue)}</TableCell>
                      <TableCell align="right" sx={{ color: '#388e3c', fontWeight: 600 }}>+{formatCurrency(impact)}</TableCell>
                      <TableCell align="right" sx={{ color: '#388e3c', fontWeight: 600 }}>+{pctChange}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabPanel>
        </Box>
      </Paper>

      {/* Hidden unified PDF export container */}
      <Box
        id="airreceiver-pdf-export"
        sx={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '210mm',
          background: 'white',
          p: 4,
          fontFamily: 'Roboto, Arial, sans-serif',
        }}
      >
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#1b5e20' }}>
          Air Receiver Cost Analysis Report
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Generated: {new Date().toLocaleString()} | Shell: {inputs.Specification.Shell.moc} |
          Dia: {inputs.Specification.Shell.diameter} mm
        </Typography>

        {/* Section 1 */}
        <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 700, color: '#388e3c', borderBottom: '2px solid #388e3c', pb: 0.5 }}>
          1. Calculation Breakdown
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
              <TableCell sx={{ fontWeight: 700 }}>Component</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(calculationResult.costBreakdown)
              .filter(([k, v]) => v > 0 && k !== 'Profit')
              .map(([key, val], i) => (
                <TableRow key={key} sx={{ backgroundColor: i % 2 === 0 ? '#fafafa' : 'white' }}>
                  <TableCell>{key}</TableCell>
                  <TableCell align="right">{formatCurrency(val)}</TableCell>
                </TableRow>
              ))}
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              <TableCell>Profit</TableCell>
              <TableCell align="right">{formatCurrency(calculationResult.profitCost)}</TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
              <TableCell sx={{ fontWeight: 700 }}>GRAND TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(calculationResult.grandTotal)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Section 2 */}
        <Typography variant="h5" sx={{ mt: 4, mb: 1, fontWeight: 700, color: '#388e3c', borderBottom: '2px solid #388e3c', pb: 0.5 }}>
          2. Commodity Analysis
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pieData.map((row, i) => (
              <TableRow key={row.name} sx={{ backgroundColor: i % 2 === 0 ? '#fafafa' : 'white' }}>
                <TableCell>{row.name}</TableCell>
                <TableCell align="right">{formatCurrency(row.value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Section 3 */}
        <Typography variant="h5" sx={{ mt: 4, mb: 1, fontWeight: 700, color: '#388e3c', borderBottom: '2px solid #388e3c', pb: 0.5 }}>
          3. 5-Year Forecast
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
              <TableCell sx={{ fontWeight: 700 }}>Year</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Projected Cost (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {costForecastData.map((row, i) => (
              <TableRow key={row.year} sx={{ backgroundColor: i % 2 === 0 ? '#fafafa' : 'white' }}>
                <TableCell>{row.year}</TableCell>
                <TableCell align="right">{formatCurrency(row.cost)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Section 4 */}
        <Typography variant="h5" sx={{ mt: 4, mb: 1, fontWeight: 700, color: '#388e3c', borderBottom: '2px solid #388e3c', pb: 0.5 }}>
          4. Commodity Scenarios
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
              <TableCell sx={{ fontWeight: 700 }}>Scenario</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Base Cost</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Scenario Cost (+10%)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Impact</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>% Change</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commodityScenarioData.map((row, idx) => {
              const impact = row.scenarioValue - row.baseValue;
              const pctChange = ((impact / row.baseValue) * 100).toFixed(2);
              return (
                <TableRow key={row.scenario} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                  <TableCell>{row.scenario}</TableCell>
                  <TableCell align="right">{formatCurrency(row.baseValue)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.scenarioValue)}</TableCell>
                  <TableCell align="right">+{formatCurrency(impact)}</TableCell>
                  <TableCell align="right">+{pctChange}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Section 5 */}
        <Typography variant="h5" sx={{ mt: 4, mb: 1, fontWeight: 700, color: '#388e3c', borderBottom: '2px solid #388e3c', pb: 0.5 }}>
          5. Specification Scenarios
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
              <TableCell sx={{ fontWeight: 700 }}>Scenario</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Base Cost</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Scenario Cost (+10%)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Impact</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>% Change</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {specScenarioData.map((row, idx) => {
              const impact = row.scenarioValue - row.baseValue;
              const pctChange = ((impact / row.baseValue) * 100).toFixed(2);
              return (
                <TableRow key={row.scenario} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                  <TableCell>{row.scenario}</TableCell>
                  <TableCell align="right">{formatCurrency(row.baseValue)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.scenarioValue)}</TableCell>
                  <TableCell align="right">+{formatCurrency(impact)}</TableCell>
                  <TableCell align="right">+{pctChange}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
