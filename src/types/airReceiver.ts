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
  capacity: number;
  designPressure: number;
  testPressure: number;
}

export interface AirReceiverAssumptions {
  ss304PlateCost: number;
  msPlateCost: number;
  ss304PipeCost: number;
  msPipeCost: number;
  ssLabourCost: number;
  msLabourCost: number;
  ss304Density: number;
  msDensity: number;
  dishPressingCost: number;
  machineCharges: number;
  paintingCost: number;
  localTransportCost: number;
  hardwareCost: number;
  overheadPercent: number;
  profitPercent: number;
  annualInflationRate: number;
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
