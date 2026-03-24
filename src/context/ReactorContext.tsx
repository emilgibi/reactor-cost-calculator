import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  ReactorFormInput,
  ReactorAssumptions,
  ReactorCalculationResult,
  BackendResponse,
} from '../types/reactor';

export type { ReactorFormInput, ReactorAssumptions, ReactorCalculationResult };

export const dummyBackendData: BackendResponse = {
  lineItems: [
    { name: 'SS 304 Plate', unitRate: 210, quantity: 3268.39, totalCost: 686361.22 },
    { name: 'SS 304 Pipe', unitRate: 350, quantity: 83.06, totalCost: 29071.00 },
    { name: 'MS Plate', unitRate: 65, quantity: 1084.42, totalCost: 70487.30 },
    { name: 'MS Pipe', unitRate: 120, quantity: 3.98, totalCost: 477.01 },
    { name: 'SS Labour', unitRate: 28, quantity: 3351.45, totalCost: 93840.60 },
    { name: 'MS Labour', unitRate: 17, quantity: 1088.40, totalCost: 18502.80 },
    { name: 'Gear Box', unitRate: 115000, quantity: 1, totalCost: 115000.00 },
    { name: 'Motor (Flameproof)', unitRate: 90000, quantity: 1, totalCost: 90000.00 },
    { name: 'Bearing', unitRate: 20000, quantity: 1, totalCost: 20000.00 },
    { name: 'Single Mechanical Seal', unitRate: 80000, quantity: 1, totalCost: 80000.00 },
    { name: 'Flexible Coupling', unitRate: 12500, quantity: 1, totalCost: 12500.00 },
    { name: 'Toughened Glass', unitRate: 1000, quantity: 1, totalCost: 1000.00 },
    { name: 'Hardware', unitRate: 1, quantity: 2500, totalCost: 2500.00 },
    { name: 'Consumables', unitRate: 1, quantity: 12500, totalCost: 12500.00 },
    { name: 'Dish Pressing', unitRate: 20, quantity: 972.2, totalCost: 19444.00 },
    { name: 'Machine Charges', unitRate: 1, quantity: 50000, totalCost: 50000.00 },
    { name: 'Agitator Assembly', unitRate: 1, quantity: 7500, totalCost: 7500.00 },
    { name: 'Acid Cleaning', unitRate: 20, quantity: 278.73, totalCost: 5574.60 },
    { name: 'Mirror Finish', unitRate: 1200, quantity: 26.18, totalCost: 31416.00 },
    { name: 'Painting', unitRate: 1, quantity: 3000, totalCost: 3000.00 },
    { name: 'Local Transport', unitRate: 1, quantity: 35000, totalCost: 35000.00 },
    { name: 'Limpet', unitRate: 1, quantity: 198503, totalCost: 198503.00 },
  ],
  componentCostSummary: {
    materials: { cost: 786396.53, percentageOfGrandTotal: 33.64 },
    labour: { cost: 112343.28, percentageOfGrandTotal: 4.81 },
    consumables: { cost: 66597.70, percentageOfGrandTotal: 2.85 },
    servicesAndOthers: { cost: 668933.46, percentageOfGrandTotal: 28.63 },
    overhead: { cost: 163427.10, percentageOfGrandTotal: 6.99 },
    profit: { cost: 539309.42, percentageOfGrandTotal: 23.08 },
  },
  totals: {
    fabricationCost: 1634270.97,
    overhead: 163427.10,
    profit: 539309.42,
    grandTotal: 2337007.48,
  },
};

interface ReactorContextType {
  inputs: ReactorFormInput;
  assumptions: ReactorAssumptions;
  calculationResult: ReactorCalculationResult | null;
  updateInputs: (newInputs: Partial<ReactorFormInput>) => void;
  updateAssumptions: (newAssumptions: Partial<ReactorAssumptions>) => void;
  setCalculationResult: (result: ReactorCalculationResult | null) => void; // ✅ KEEP THIS
  calculateCosts: () => void;
  saveConfiguration: (name: string) => void;
  loadConfiguration: (name: string) => void;
  getSavedConfigurations: () => string[];
}

export const defaultInputs: ReactorFormInput = {
  Specification: {
    Shell: {
      moc: 'SS304',
      diameter: 2150,
      height: 2000,
      thickness: 8,
      limpet: true,
    },
    Dish: {
      moc: 'SS304',
      diameter: 2150,
      thickness: 8,
    },
    MechanicalSeal: {
      type: 'Single',
    },
    Motor: {
      type: 'Flameproof',
    },
    Shaft: {
      moc: 'SS304',
      diameter: 75,
    },
    Blade: {
      type: 'Gate anchor',
    },
    Limpet: {
      od_diameter: 90,
      pitch_diameter: 120,
    },
    Finish: {
      type: 'Mirror',
    },
  },
  NozzleSchedule: {
    Thermowell_25_NB: { moc: 'SS304', count: 1 },
    NB_25: { moc: 'SS304', count: 2 },
    NB_40: { moc: 'SS304', count: 1 },
    NB_50: { moc: 'SS304', count: 2 },
    NB_80: { moc: 'SS304', count: 1 },
    NB_100: { moc: 'SS304', count: 1 },
    NB_150: { moc: 'SS304', count: 1 },
    NB_600: { moc: 'SS/MS', count: 1 },
    LightGlass_150_NB: { count: 1 },
    SightGlass_150_NB: { count: 1 },
  },
};

export const defaultAssumptions: ReactorAssumptions = {
  ss304PlateCost: 210,
  ss304PipeCost: 350,
  msPlateCost: 65,
  msPipeCost: 120,
  ssLabourCost: 28,
  msLabourCost: 17,
  ss304Density: 8,
  msDensity: 7.86,
  gearBoxCost: 115000,
  motorCost: 90000,
  bearingCost: 20000,
  singleSealCost: 80000,
  doubleSealCost: 280000,
  flexibleCouplingCost: 12500,
  toughenedGlassCost: 1000,
  hardwareCost: 2500,
  consumableCost: 12500,
  dishPressingCost: 20,
  machineCharges: 50000,
  agitatorAssemblyCost: 7500,
  acidCleaningCost: 20,
  mirrorFinishCost: 1200,
  paintingCost: 3000,
  localTransportCost: 35000,
  overheadPercent: 10,
  profitPercent: 30,
  annualInflationRate: 5,
};

// ✅ CREATE REACTOR CONTEXT
const ReactorContext = createContext<ReactorContextType | undefined>(undefined);

export function ReactorProvider({ children }: { children: React.ReactNode }) {
  // ✅ ALL useState CALLS INSIDE THE PROVIDER FUNCTION
  const [inputs, setInputs] = useState<ReactorFormInput>(defaultInputs);
  const [assumptions, setAssumptions] = useState<ReactorAssumptions>(defaultAssumptions);
  const [calculationResult, setCalculationResult] = useState<ReactorCalculationResult | null>(null);

  const updateInputs = useCallback((newInputs: Partial<ReactorFormInput>) => {
    setInputs((prev) => {
      const updated = { ...prev, ...newInputs };
      localStorage.setItem('reactor_current_inputs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateAssumptions = useCallback((newAssumptions: Partial<ReactorAssumptions>) => {
    setAssumptions((prev) => ({ ...prev, ...newAssumptions }));
  }, []);

  const calculateCosts = useCallback(() => {
    const spec = inputs.Specification;
    const shellDiameter = spec.Shell.diameter;
    const scalingFactor = Math.pow(shellDiameter / 2150, 2);

    const materialWeight = {
      ss304: 3268.39 * scalingFactor,
      ssPipe: 83.06 * scalingFactor,
      ms: 1084.42 * scalingFactor,
      msPipe: 3.98 * scalingFactor,
    };

    const costBreakdown: { [key: string]: number } = {};
    const ss304PleateCost = materialWeight.ss304 * assumptions.ss304PlateCost;
    const ss304PipeCost = materialWeight.ssPipe * assumptions.ss304PipeCost;
    const msPlateCost = materialWeight.ms * assumptions.msPlateCost;
    const msPipeCost = materialWeight.msPipe * assumptions.msPipeCost;

    costBreakdown['SS304 Plate'] = ss304PleateCost;
    costBreakdown['SS304 Pipe'] = ss304PipeCost;
    costBreakdown['MS Plate'] = msPlateCost;
    costBreakdown['MS Pipe'] = msPipeCost;

    let totalMaterialCost = ss304PleateCost + ss304PipeCost + msPlateCost + msPipeCost;

    const ssLabourCost = (materialWeight.ss304 + materialWeight.ssPipe) * assumptions.ssLabourCost;
    const msLabourCost = (materialWeight.ms + materialWeight.msPipe) * assumptions.msLabourCost;
    costBreakdown['SS Labour'] = ssLabourCost;
    costBreakdown['MS Labour'] = msLabourCost;
    totalMaterialCost += ssLabourCost + msLabourCost;

    if (spec.Motor.type === 'Flameproof') {
      costBreakdown['Gear Box'] = assumptions.gearBoxCost;
      costBreakdown['Motor (Flameproof)'] = assumptions.motorCost;
      totalMaterialCost += assumptions.gearBoxCost + assumptions.motorCost;
    }

    costBreakdown['Bearing'] = assumptions.bearingCost;
    totalMaterialCost += assumptions.bearingCost;

    if (spec.MechanicalSeal.type === 'Single') {
      costBreakdown['Single Mechanical Seal'] = assumptions.singleSealCost;
      totalMaterialCost += assumptions.singleSealCost;
    } else if (spec.MechanicalSeal.type === 'Double') {
      costBreakdown['Double Mechanical Seal'] = assumptions.doubleSealCost;
      totalMaterialCost += assumptions.doubleSealCost;
    }

    costBreakdown['Flexible Coupling'] = assumptions.flexibleCouplingCost;
    costBreakdown['Toughened Glass'] = assumptions.toughenedGlassCost;
    totalMaterialCost += assumptions.flexibleCouplingCost + assumptions.toughenedGlassCost;

    costBreakdown['Hardware'] = assumptions.hardwareCost;
    costBreakdown['Consumables'] = assumptions.consumableCost;
    costBreakdown['Dish Pressing'] = assumptions.dishPressingCost * 972.2 * scalingFactor;
    costBreakdown['Machine Charges'] = assumptions.machineCharges;
    costBreakdown['Agitator Assembly'] = assumptions.agitatorAssemblyCost;
    costBreakdown['Acid Cleaning'] = assumptions.acidCleaningCost * 278.73 * scalingFactor;
    costBreakdown['Mirror Finish'] =
      spec.Finish.type === 'Mirror' ? assumptions.mirrorFinishCost * 26.18 * scalingFactor : 0;
    costBreakdown['Painting'] = assumptions.paintingCost;
    costBreakdown['Local Transport'] = assumptions.localTransportCost;

    const otherCosts =
      assumptions.hardwareCost +
      assumptions.consumableCost +
      assumptions.dishPressingCost * 972.2 * scalingFactor +
      assumptions.machineCharges +
      assumptions.agitatorAssemblyCost +
      assumptions.acidCleaningCost * 278.73 * scalingFactor +
      (spec.Finish.type === 'Mirror' ? assumptions.mirrorFinishCost * 26.18 * scalingFactor : 0) +
      assumptions.paintingCost +
      assumptions.localTransportCost;

    const fabricationCost = totalMaterialCost + otherCosts;

    if (spec.Shell.limpet) {
      const limpetCost = 198503 * scalingFactor;
      costBreakdown['Limpet'] = limpetCost;
      totalMaterialCost += limpetCost;
    }

    const overheadCost = (fabricationCost * assumptions.overheadPercent) / 100;
    costBreakdown['Overhead'] = overheadCost;

    const profitCost = ((fabricationCost + overheadCost) * assumptions.profitPercent) / 100;
    costBreakdown['Profit'] = profitCost;

    const grandTotal = fabricationCost + overheadCost + profitCost;

    setCalculationResult({
      materialWeight,
      costBreakdown,
      totalMaterialCost,
      totalLabourCost: ssLabourCost + msLabourCost,
      overheadCost,
      profitCost,
      grandTotal,
    });
  }, [inputs, assumptions]);

  const saveConfiguration = useCallback(
    (name: string) => {
      const configurations = JSON.parse(localStorage.getItem('reactor_configs') || '{}');
      configurations[name] = { inputs, assumptions };
      localStorage.setItem('reactor_configs', JSON.stringify(configurations));
    },
    [inputs, assumptions]
  );

  const loadConfiguration = useCallback((name: string) => {
    const configurations = JSON.parse(localStorage.getItem('reactor_configs') || '{}');
    if (configurations[name]) {
      setInputs(configurations[name].inputs);
      setAssumptions(configurations[name].assumptions);
    }
  }, []);

  const getSavedConfigurations = useCallback(() => {
    const configurations = JSON.parse(localStorage.getItem('reactor_configs') || '{}');
    return Object.keys(configurations);
  }, []);

  // ✅ USE CORRECT INTERFACE
  const value: ReactorContextType = {
    inputs,
    assumptions,
    calculationResult,
    updateInputs,
    updateAssumptions,
    calculateCosts,
    setCalculationResult,
    saveConfiguration,
    loadConfiguration,
    getSavedConfigurations,
  };

  // ✅ USE CORRECT CONTEXT
  return (
    <ReactorContext.Provider value={value}>
      {children}
    </ReactorContext.Provider>
  );
}

// ✅ CORRECT HOOK NAME
export function useReactor(): ReactorContextType {
  const context = useContext(ReactorContext);
  if (!context) {
    throw new Error('useReactor must be used within ReactorProvider');
  }
  return context;
}