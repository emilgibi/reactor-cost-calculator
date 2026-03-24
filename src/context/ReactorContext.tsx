import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  ReactorFormInput,
  ReactorAssumptions,
  ReactorCalculationResult,
  BackendResponse,
  CostItem,
  FabricationBreakdown,
  CostSummary,
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
  calculateCosts: (assumptionsOverride?: ReactorAssumptions) => void;
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
      type: 'Gate Anchor',
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

  const calculateCosts = useCallback((assumptionsOverride?: ReactorAssumptions) => {
    const a = assumptionsOverride || assumptions;
    const spec = inputs.Specification;
    const shellDiameter = spec.Shell.diameter;
    const scalingFactor = Math.pow(shellDiameter / 2150, 2);

    const materialWeight = {
      ss304: 3268.39 * scalingFactor,
      ss_pipe: 83.06 * scalingFactor,
      ms: 1084.42 * scalingFactor,
      ms_pipe: 3.98 * scalingFactor,
    };

    const ss304PlateCostTotal = materialWeight.ss304 * a.ss304PlateCost;
    const ss304PipeCostTotal = materialWeight.ss_pipe * a.ss304PipeCost;
    const msPlateCostTotal = materialWeight.ms * a.msPlateCost;
    const msPipeCostTotal = materialWeight.ms_pipe * a.msPipeCost;
    const ssLabourCostTotal = (materialWeight.ss304 + materialWeight.ss_pipe) * a.ssLabourCost;
    const msLabourCostTotal = (materialWeight.ms + materialWeight.ms_pipe) * a.msLabourCost;

    let broughtOutCost = a.bearingCost + a.flexibleCouplingCost + a.toughenedGlassCost;
    if (spec.Motor.type === 'Flameproof') {
      broughtOutCost += a.gearBoxCost + a.motorCost;
    }
    if (spec.MechanicalSeal.type === 'Single') {
      broughtOutCost += a.singleSealCost;
    } else if (spec.MechanicalSeal.type === 'Double') {
      broughtOutCost += a.doubleSealCost;
    }

    const dishPressingTotal = a.dishPressingCost * 972.2 * scalingFactor;
    const acidCleaningTotal = a.acidCleaningCost * 278.73 * scalingFactor;
    const mirrorFinishTotal = spec.Finish.type === 'Mirror' ? a.mirrorFinishCost * 26.18 * scalingFactor : 0;
    const limpetCost = spec.Shell.limpet ? 198503 * scalingFactor : 0;

    const fabricationCost =
      ss304PlateCostTotal + ss304PipeCostTotal + msPlateCostTotal + msPipeCostTotal +
      ssLabourCostTotal + msLabourCostTotal +
      limpetCost + a.consumableCost + a.hardwareCost + broughtOutCost +
      dishPressingTotal + a.machineCharges + a.agitatorAssemblyCost +
      acidCleaningTotal + mirrorFinishTotal + a.paintingCost + a.localTransportCost;

    const overheadAmount = (fabricationCost * a.overheadPercent) / 100;
    const profitAmount = ((fabricationCost + overheadAmount) * a.profitPercent) / 100;
    const grandTotal = fabricationCost + overheadAmount + profitAmount;

    const mkItem = (description: string, unit_rate: number | null, quantity: number | null, unit_type: string | null, total_cost: number): CostItem => ({
      description,
      unit_rate,
      quantity,
      unit_type,
      total_cost,
    });

    const fabrication_breakdown: FabricationBreakdown = {
      ss304_plate: mkItem('SS304 Plate', a.ss304PlateCost, materialWeight.ss304, 'kg', ss304PlateCostTotal),
      ss304_pipe: mkItem('SS304 Pipe', a.ss304PipeCost, materialWeight.ss_pipe, 'kg', ss304PipeCostTotal),
      ms_plate: mkItem('MS Plate', a.msPlateCost, materialWeight.ms, 'kg', msPlateCostTotal),
      ms_pipe: mkItem('MS Pipe', a.msPipeCost, materialWeight.ms_pipe, 'kg', msPipeCostTotal),
      ss_labour: mkItem('SS Labour', a.ssLabourCost, materialWeight.ss304 + materialWeight.ss_pipe, 'kg', ssLabourCostTotal),
      ms_labour: mkItem('MS Labour', a.msLabourCost, materialWeight.ms + materialWeight.ms_pipe, 'kg', msLabourCostTotal),
      limpet: mkItem('Limpet', null, null, null, limpetCost),
      consumable: mkItem('Consumables', null, null, null, a.consumableCost),
      hardware: mkItem('Hardware', null, null, null, a.hardwareCost),
      brought_out: mkItem('Brought Out Components', null, null, null, broughtOutCost),
      dish_pressing: mkItem('Dish Pressing', a.dishPressingCost, 972.2 * scalingFactor, 'sqm', dishPressingTotal),
      machine_charges: mkItem('Machine Charges', null, null, null, a.machineCharges),
      agitator_assembly: mkItem('Agitator Assembly', null, null, null, a.agitatorAssemblyCost),
      acid_cleaning: mkItem('Acid Cleaning', a.acidCleaningCost, 278.73 * scalingFactor, 'sqm', acidCleaningTotal),
      mirror_finish: mkItem('Mirror Finish', a.mirrorFinishCost, spec.Finish.type === 'Mirror' ? 26.18 * scalingFactor : 0, 'sqm', mirrorFinishTotal),
      painting: mkItem('Painting', null, null, null, a.paintingCost),
      local_transport: mkItem('Local Transport', null, null, null, a.localTransportCost),
    };

    const summary: CostSummary = {
      fabrication_cost: fabricationCost,
      overhead_percentage: a.overheadPercent,
      overhead_amount: overheadAmount,
      profit_percentage: a.profitPercent,
      profit_amount: profitAmount,
      grand_total: grandTotal,
    };

    setCalculationResult({
      success: true,
      message: 'Local calculation completed',
      results: { fabrication_breakdown, summary },
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