export interface ReactorSpecification {
  Shell: {
    moc: string;
    diameter: number;
    height: number;
    thickness: number;
    limpet: boolean;
  };
  Dish: {
    moc: string;
    diameter: number;
    thickness: number;
  };
  MechanicalSeal: {
    type: 'Single' | 'Double' | 'Gland';
  };
  Motor: {
    type: 'Flameproof' | 'Non-Flameproof';
  };
  Shaft: {
    moc: string;
    diameter: number;
  };
  Blade: {
    type: 'Gate Anchor' | 'Turbine';
  };
  Limpet: {
    od_diameter: number;
    pitch_diameter: number;
  };
  Finish: {
    type: 'Mirror' | 'Normal';
  };
}

export interface NozzleSchedule {
  Thermowell_25_NB: { moc: string; count: number };
  NB_25: { moc: string; count: number };
  NB_40: { moc: string; count: number };
  NB_50: { moc: string; count: number };
  NB_80: { moc: string; count: number };
  NB_100: { moc: string; count: number };
  NB_150: { moc: string; count: number };
  NB_600: { moc: string; count: number };
  LightGlass_150_NB: { count: number };
  SightGlass_150_NB: { count: number };
}

export interface ReactorFormInput {
  Specification: ReactorSpecification;
  NozzleSchedule: NozzleSchedule;
}

export interface ReactorAssumptions {
  ss304PlateCost: number;
  ss304PipeCost: number;
  msPlateCost: number;
  msPipeCost: number;
  ssLabourCost: number;
  msLabourCost: number;
  ss304Density: number;
  msDensity: number;
  gearBoxCost: number;
  motorCost: number;
  bearingCost: number;
  singleSealCost: number;
  doubleSealCost: number;
  flexibleCouplingCost: number;
  toughenedGlassCost: number;
  hardwareCost: number;
  consumableCost: number;
  dishPressingCost: number;
  machineCharges: number;
  agitatorAssemblyCost: number;
  acidCleaningCost: number;
  mirrorFinishCost: number;
  paintingCost: number;
  localTransportCost: number;
  overheadPercent: number;
  profitPercent: number;
  annualInflationRate: number;
}

/** Structured assumptions format matching the backend API schema */
export interface StructuredAssumptions {
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
  BroughtOutComponents: {
    gearBox: number;
    motor: number;
    bearing: number;
    singleMechanicalSeal: number;
    doubleMechanicalSeal: number;
    flexibleCoupling: number;
    toughenedGlass: number;
  };
  FinancialPercentages: {
    overhead: number;
    profit: number;
    inflationRate: number;
  };
  OtherCosts: {
    dishPressingPerSqm: number;
    machineCharges: number;
    agitatorAssembly: number;
    acidCleaningPerSqm: number;
    mirrorFinishPerSqm: number;
    paintingLumpsum: number;
    localTransportLumpsum: number;
  };
}

export interface ReactorCalculationResults {
  grand_total: number;
  cost_breakdown: { [key: string]: number };
  total_material_cost: number;
  total_labour_cost: number;
  overhead_cost: number;
  profit_cost: number;
  material_weight?: {
    ss304: number;
    ss_pipe: number;
    ms: number;
    ms_pipe: number;
  };
}

export interface ReactorCalculationResult {
  success?: boolean;
  message?: string;
  results: ReactorCalculationResults;
}

/** Dummy backend response shape – ready for real API integration */
export interface BackendResponse {
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
