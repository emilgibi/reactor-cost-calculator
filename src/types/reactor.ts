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
  Kl: number;
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
    hardware: number;
    consumables: number;
  };
}

export interface CostItem {
  description: string;
  unit_rate: number | null;
  quantity: number | null;
  unit_type: string | null;
  total_cost: number;
}

export interface FabricationBreakdown {
  [key: string]: CostItem | undefined;
  ss304_plate: CostItem;
  ss304_pipe: CostItem;
  ss316_plate?: CostItem;
  ss316_pipe?: CostItem;
  ms_plate: CostItem;
  ms_pipe: CostItem;
  ss_labour: CostItem;
  ms_labour: CostItem;
  limpet: CostItem;
  consumable: CostItem;
  hardware: CostItem;
  brought_out: CostItem;
  dish_pressing: CostItem;
  machine_charges: CostItem;
  agitator_assembly: CostItem;
  acid_cleaning: CostItem;
  mirror_finish: CostItem;
  painting: CostItem;
  local_transport: CostItem;
}

export interface CostSummary {
  fabrication_cost: number;
  overhead_percentage: number;
  overhead_amount: number;
  profit_percentage: number;
  profit_amount: number;
  grand_total: number;
}

export interface ReactorCalculationResults {
  fabrication_breakdown: FabricationBreakdown;
  summary: CostSummary;
  measurement_variation?: any;
  cost_variation?: any;
  category_breakup?: any;
}

export interface ReactorCalculationResult {
  success?: boolean;
  message?: string;
  results: ReactorCalculationResults;
}

/** Dummy backend response shape – kept for reference */
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
