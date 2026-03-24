export interface AirReceiverSpecification {
  Shell: {
    moc: string;
    diameter: number;
    height: number;
    thickness: number;
  };
  Dish: {
    moc: string;
    diameter: number;
    thickness: number;
  };
  Nozzle: {
    moc: string;
    count: number;
  };
  Finish: {
    type: 'Internal' | 'External' | 'Both' | 'None';
  };
}

export interface AirReceiverFormInput {
  Specification: AirReceiverSpecification;
  NozzleSchedule: {  // ✅ ADD THIS
    NB_25: { count: number };
    NB_40: { count: number };
    NB_50: { count: number };
    NB_80: { count: number };
    NB_100: { count: number };
    NB_150: { count: number };
    NB_600: { count: number };
  };
  capacity: number;
  designPressure: number;
  testPressure: number;
}

export interface AirReceiverAssumptions {
  // Material Costs
  ss304PlateCost: number;
  ss304PipeCost: number;
  msPlateCost: number;        
  msPipeCost: number;         
  
  // Labour Costs
  ssLabourCost: number;
  msLabourCost: number;
  
  // Density Values
  ss304Density: number;
  msDensity: number;
  
  // Other Costs
  dishPressingPerSqm: number; 
  machineCharges: number;
  paintingCost: number;
  localTransportCost: number;
  hardwareCost: number;
  testingCost: number;        
  
  // Financial Percentages
  overheadPercent: number;
  profitPercent: number;
  annualInflationRate: number;
}

/** Structured assumptions format matching the backend API schema */
export interface AirReceiverStructuredAssumptions {
  MaterialCosts: {
    ss304PlateCost: number;
    ss304PipeCost: number;
    msPlateCost: number;
    msPipeCost: number;
  };
  LabourCosts: {
    ssLabourCost: number;
    msLabourCost: number;
  };
  DensityValues: {
    ss304Density: number;
    msDensity: number;
  };
  FinancialPercentages: {
    overhead: number;
    profit: number;
    inflationRate: number;
  };
  OtherCosts: {
    dishPressingPerSqm: number;
    machineCharges: number;
    paintingLumpsum: number;
    localTransportLumpsum: number;
    hardwareLumpsum: number;
  };
}

export interface AirReceiverCalculationResult {
  materialWeight: { ss304: number; ms: number };
  costBreakdown: { [key: string]: number };
  totalMaterialCost: number;
  totalLabourCost: number;
  overheadCost: number;
  profitCost: number;
  grandTotal: number;
}

/** Dummy backend response shape – ready for real API integration */
export interface AirReceiverBackendResponse {
  lineItems: Array<{
    name: string;
    unitRate: number;
    quantity: number;
    totalCost: number;
  }>;
  componentCostSummary: {
    materials: { cost: number; percentageOfGrandTotal: number };
    labour: { cost: number; percentageOfGrandTotal: number };
    consumables: { cost: number; percentageOfGrandTotal: number };
    servicesAndOthers: { cost: number; percentageOfGrandTotal: number };
    overhead: { cost: number; percentageOfGrandTotal: number };
    profit: { cost: number; percentageOfGrandTotal: number };
  };
  totals: {
    fabricationCost: number;
    overhead: number;
    profit: number;
    grandTotal: number;
  };
}
