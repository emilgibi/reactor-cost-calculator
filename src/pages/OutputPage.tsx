import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { useReactor } from '../context/ReactorContext';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download as PrintIcon } from '@mui/icons-material';

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function OutputPage() {
  const { calculationResult, assumptions, inputs } = useReactor();
  const [tabValue, setTabValue] = React.useState(0);

  const costForecastData = useMemo(() => {
    if (!calculationResult) return [];
    const data = [];
    const baseTotal = calculationResult.grandTotal;
    for (let year = 0; year <= 5; year++) {
      const inflationFactor = Math.pow(1 + assumptions.annualInflationRate / 100, year);
      data.push({
        year: `Year ${year}`,
        cost: Math.round(baseTotal * inflationFactor),
      });
    }
    return data;
  }, [calculationResult, assumptions]);

  const commodityScenarioData = useMemo(() => {
    if (!calculationResult) return [];
    const baseTotal = calculationResult.grandTotal;
    return [
      {
        scenario: 'Base',
        cost: baseTotal,
      },
      {
        scenario: '+10% SS304',
        cost: baseTotal + (calculationResult.costBreakdown['SS304 Plate'] || 0) * 0.1 + (calculationResult.costBreakdown['SS304 Pipe'] || 0) * 0.1,
      },
      {
        scenario: '+10% MS',
        cost: baseTotal + (calculationResult.costBreakdown['MS Plate'] || 0) * 0.1 + (calculationResult.costBreakdown['MS Pipe'] || 0) * 0.1,
      },
      {
        scenario: '+10% Labour',
        cost:
          baseTotal +
          (calculationResult.costBreakdown['SS Labour'] || 0) * 0.1 +
          (calculationResult.costBreakdown['MS Labour'] || 0) * 0.1,
      },
    ];
  }, [calculationResult]);

  const specScenarioData = useMemo(() => {
    if (!calculationResult) return [];
    const baseTotal = calculationResult.grandTotal;
    return [
      {
        scenario: 'Base',
        cost: baseTotal,
        percent: 0,
      },
      {
        scenario: '+10% Shell Dia',
        cost: baseTotal * 1.08,
        percent: 8,
      },
      {
        scenario: '+10% Motor Cap',
        cost: baseTotal * 1.05,
        percent: 5,
      },
      {
        scenario: '+10% Blade Spec',
        cost: baseTotal * 1.03,
        percent: 3,
      },
    ];
  }, [calculationResult]);

  const COLORS = ['#1976d2', '#dc004e', '#ff9800', '#4caf50', '#9c27b0'];

  if (!calculationResult) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="textSecondary">
          Please calculate costs from the Input page first
        </Typography>
      </Box>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Output & Analysis</Typography>
        <Button startIcon={<PrintIcon />} variant="contained" onClick={handlePrint}>
          Print Report
        </Button>
      </Box>

      {/* Summary Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1976d2', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" variant="subtitle2" sx={{ opacity: 0.8 }}>
                Total Material Cost
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ₹ {(calculationResult.totalMaterialCost / 100000).toFixed(2)}L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#dc004e', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" variant="subtitle2" sx={{ opacity: 0.8 }}>
                Overhead & Profit
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ₹ {(((calculationResult.overheadCost + calculationResult.profitCost) / 100000).toFixed(2))}L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#4caf50', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" variant="subtitle2" sx={{ opacity: 0.8 }}>
                Grand Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ₹ {(calculationResult.grandTotal / 100000).toFixed(2)}L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#ff9800', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" variant="subtitle2" sx={{ opacity: 0.8 }}>
                Cost per KL
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ₹ {(calculationResult.grandTotal / inputs.capacity / 100000).toFixed(2)}L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Calculation Breakdown" />
          <Tab label="Commodity Analysis" />
          <Tab label="5-Year Forecast" />
          <Tab label="Commodity Scenarios" />
          <Tab label="Specification Scenarios" />
        </Tabs>

        {/* Tab 1: Calculation Breakdown */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Material Weight Summary
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Material</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Weight (KG)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>SS304 Plate</TableCell>
                      <TableCell align="right">{calculationResult.materialWeight.ss304.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>SS304 Pipe</TableCell>
                      <TableCell align="right">{calculationResult.materialWeight.ssPipe.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>MS Plate</TableCell>
                      <TableCell align="right">{calculationResult.materialWeight.ms.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>MS Pipe</TableCell>
                      <TableCell align="right">{calculationResult.materialWeight.msPipe.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Cost Breakdown Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #eee' }}>
                    <Typography>Material Cost:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>₹ {(calculationResult.totalMaterialCost / 100000).toFixed(2)}L</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #eee' }}>
                    <Typography>Labour Cost:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>₹ {(calculationResult.totalLabourCost / 100000).toFixed(2)}L</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #eee' }}>
                    <Typography>Overhead ({assumptions.overheadPercent}%):</Typography>
                    <Typography sx={{ fontWeight: 600 }}>₹ {(calculationResult.overheadCost / 100000).toFixed(2)}L</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '2px solid #333' }}>
                    <Typography>Profit ({assumptions.profitPercent}%):</Typography>
                    <Typography sx={{ fontWeight: 600 }}>₹ {(calculationResult.profitCost / 100000).toFixed(2)}L</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>Grand Total:</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.2em', color: '#1976d2' }}>
                      ₹ {(calculationResult.grandTotal / 100000).toFixed(2)}L
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Detailed Cost Breakdown
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Component</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Cost (₹)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        % of Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(calculationResult.costBreakdown).map(([component, cost]: [string, number]) => (
                      <TableRow key={component}>
                        <TableCell>{component}</TableCell>
                        <TableCell align="right">₹ {cost.toFixed(2)}</TableCell>
                        <TableCell align="right">{((cost / calculationResult.grandTotal) * 100).toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Commodity Analysis */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Cost Contribution by Commodity
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(calculationResult.costBreakdown)
                        .filter(([, cost]) => cost > 0)
                        .slice(0, 8)
                        .map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${((value / calculationResult.grandTotal) * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Commodity Rates & Impact
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Commodity</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Rate
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Contribution
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>SS304 Plate</TableCell>
                      <TableCell align="right">₹ {assumptions.ss304PlateCost}/kg</TableCell>
                      <TableCell align="right">{((calculationResult.costBreakdown['SS304 Plate'] / calculationResult.grandTotal) * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>MS Plate</TableCell>
                      <TableCell align="right">₹ {assumptions.msPlateCost}/kg</TableCell>
                      <TableCell align="right">{((calculationResult.costBreakdown['MS Plate'] / calculationResult.grandTotal) * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Labour (SS)</TableCell>
                      <TableCell align="right">₹ {assumptions.ssLabourCost}/kg</TableCell>
                      <TableCell align="right">{((calculationResult.costBreakdown['SS Labour'] / calculationResult.grandTotal) * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Labour (MS)</TableCell>
                      <TableCell align="right">₹ {assumptions.msLabourCost}/kg</TableCell>
                      <TableCell align="right">{((calculationResult.costBreakdown['MS Labour'] / calculationResult.grandTotal) * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: 5-Year Forecast */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              5-Year Cost Forecast (Annual Inflation: {assumptions.annualInflationRate}%)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={costForecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => `₹ ${(value as number / 100000).toFixed(2)}L`} />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#1976d2" strokeWidth={2} name="Projected Cost" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
            <Table sx={{ mt: 3 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Year</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Projected Cost (₹)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Increase from Base
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {costForecastData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.year}</TableCell>
                    <TableCell align="right">₹ {(row.cost / 100000).toFixed(2)}L</TableCell>
                    <TableCell align="right">
                      {(((row.cost - calculationResult.grandTotal) / calculationResult.grandTotal) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </TabPanel>

        {/* Tab 4: Commodity Scenarios */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Impact of 10% Commodity Price Change
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={commodityScenarioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" angle={-45} height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹ ${(value as number / 100000).toFixed(2)}L`} />
                    <Bar dataKey="cost" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Scenario Details
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Scenario</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Total Cost
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Difference
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {commodityScenarioData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.scenario}</TableCell>
                        <TableCell align="right">₹ {(row.cost / 100000).toFixed(2)}L</TableCell>
                        <TableCell align="right">
                          {row.scenario === 'Base' ? '—' : `₹ ${((row.cost - calculationResult.grandTotal) / 100000).toFixed(2)}L`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 5: Specification Scenarios */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Impact of 10% Specification Change
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={specScenarioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" angle={-45} height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹ ${(value as number / 100000).toFixed(2)}L`} />
                    <Bar dataKey="cost" fill="#dc004e" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Specification Change Impact
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Specification</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        New Cost
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        % Change
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {specScenarioData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.scenario}</TableCell>
                        <TableCell align="right">₹ {(row.cost / 100000).toFixed(2)}L</TableCell>
                        <TableCell align="right">
                          {row.percent === 0 ? '—' : `+${row.percent.toFixed(1)}%`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}