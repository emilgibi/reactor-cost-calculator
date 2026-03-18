import React, { useMemo, useState } from 'react';
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
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
import { exportToPDF } from '../utils/pdfGenerator';

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

  const costForecastData = useMemo(() => {
    if (!calculationResult) return [];
    return Array.from({ length: 6 }, (_, year) => ({
      year: `Year ${year}`,
      cost: Math.round(calculationResult.grandTotal * Math.pow(1 + assumptions.annualInflationRate / 100, year)),
    }));
  }, [calculationResult, assumptions]);

  const commodityScenarioData = useMemo(() => {
    if (!calculationResult) return [];
    const base = calculationResult.grandTotal;
    const cb = calculationResult.costBreakdown;
    const ss304 = (cb['SS304 Plate'] || 0);
    const ms = (cb['MS Plate'] || 0);
    const labour = (cb['SS Labour'] || 0) + (cb['MS Labour'] || 0);
    return [
      { scenario: 'Base', cost: base },
      { scenario: '+10% SS304', cost: base + ss304 * 0.1 },
      { scenario: '+10% MS', cost: base + ms * 0.1 },
      { scenario: '+10% Labour', cost: base + labour * 0.1 },
    ];
  }, [calculationResult]);

  const specScenarioData = useMemo(() => {
    if (!calculationResult) return [];
    const base = calculationResult.grandTotal;
    const matLabour = calculationResult.totalMaterialCost + calculationResult.totalLabourCost;
    return [
      { scenario: 'Base', cost: base },
      { scenario: '+10% Diameter', cost: base + matLabour * 0.08 },
      { scenario: '+10% Height', cost: base + matLabour * 0.1 },
      { scenario: '+10% Thickness', cost: base + matLabour * 0.1 },
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
      'Overhead & Profit': (cb['Overhead'] || 0) + (cb['Profit'] || 0),
      'Other': (cb['Hardware'] || 0) + (cb['Painting'] || 0) + (cb['Local Transport'] || 0),
    };
    return Object.entries(groups)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [calculationResult]);

  const handleExportPDF = async () => {
    setExporting(true);
    await exportToPDF('airreceiver-output-content', 'AirReceiver-Cost-Analysis.pdf');
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

        <Box sx={{ p: 3 }} id="airreceiver-output-content">
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
                  .filter(([, v]) => v > 0)
                  .map(([key, val]) => (
                    <TableRow key={key} hover>
                      <TableCell>{key}</TableCell>
                      <TableCell align="right">{formatCurrency(val)}</TableCell>
                    </TableRow>
                  ))}
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
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              5-Year Cost Forecast ({assumptions.annualInflationRate}% annual inflation)
            </Typography>
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
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Commodity Scenarios (+10% changes)</Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={commodityScenarioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" />
                <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="cost" name="Total Cost">
                  {commodityScenarioData.map((_, i) => <Cell key={i} fill={i === 0 ? '#388e3c' : '#dc004e'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Specification Scenarios (+10% changes)</Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={specScenarioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" />
                <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="cost" name="Total Cost">
                  {specScenarioData.map((_, i) => <Cell key={i} fill={i === 0 ? '#388e3c' : '#1976d2'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}
