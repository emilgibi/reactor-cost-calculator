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
  Finish: {
    type: 'Painting' | 'Internal' | 'External' | 'Both' | 'None';
  };
}

export interface AirReceiverFormInput {
  Specification: AirReceiverSpecification;
  NozzleSchedule: {
    NB_25: { count: number };
    NB_40: { count: number };
    NB_50: { count: number };
    NB_80: { count: number };
    NB_100: { count: number };
    NB_150: { count: number };
    NB_600: { count: number };
  };
}

export interface AirReceiverAssumptions {
  // Material Costs
  msPlateCost: number;
  msPipeCost: number;

  // Labour Costs
  msLabourCost: number;

  // Density Values
  msDensity: number;

  // Other Costs
  dishPressingPerSqm: number;
  machineCharges: number;
  paintingLumpsum: number;
  localTransportLumpsum: number;
  hardwareLumpsum: number;
  testingCost: number;

  // Financial Percentages
  overheadPercent: number;
  profitPercent: number;
  annualInflationRate: number;
}

/** Structured assumptions format matching the backend API schema */
export interface AirReceiverStructuredAssumptions {
  MaterialCosts: {
    msPlateCost: number;
    msPipeCost: number;
  };
  LabourCosts: {
    msLabourCost: number;
  };
  DensityValues: {
    msDensity: number;
  };
  FinancialPercentages: {
    overhead: number;
    profit: number;
  };
  OtherCosts: {
    dishPressingPerSqm: number;
    machineCharges: number;
    paintingLumpsum: number;
    localTransportLumpsum: number;
    hardwareLumpsum: number;
    testing: number;
  };
}

export interface AirReceiverCostItem {
  description: string;
  unit_rate: number | null;
  quantity: number | null;
  unit_type: string | null;
  total_cost: number;
}

export interface AirReceiverCostSummary {
  fabrication_cost: number;
  overhead_percentage: number;
  overhead_amount: number;
  profit_percentage: number;
  profit_amount: number;
  grand_total: number;
}

export interface AirReceiverCalculationResult {
  fabrication_breakdown: { [key: string]: AirReceiverCostItem };
  summary: AirReceiverCostSummary;
  measurement_variation?: any;
  cost_variation?: any;
  category_breakup?: Record<string, number>;
}

/** Dummy backend response shape – kept for reference */
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
