import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  ReactorFormInput,
  ReactorAssumptions,
  ReactorCalculationResult,
} from '../types/reactor';

export type { ReactorFormInput, ReactorAssumptions, ReactorCalculationResult };

interface ReactorContextType {
  inputs: ReactorFormInput;
  assumptions: ReactorAssumptions;
  calculationResult: ReactorCalculationResult | null;
  updateInputs: (newInputs: Partial<ReactorFormInput>) => void;
  updateAssumptions: (newAssumptions: Partial<ReactorAssumptions>) => void;
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

const ReactorContext = createContext<ReactorContextType | undefined>(undefined);

export function ReactorProvider({ children }: { children: React.ReactNode }) {
  const [inputs, setInputs] = useState<ReactorFormInput>(() => {
    try {
      const saved = localStorage.getItem('reactor_current_inputs');
      return saved ? JSON.parse(saved) : defaultInputs;
    } catch {
      return defaultInputs;
    }
  });
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
    // Scale based on shell diameter relative to the base 10KL reactor (2150mm diameter).
    // Square scaling is used since volume (and thus material weight) scales with the square of diameter.
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

  return (
    <ReactorContext.Provider
      value={{
        inputs,
        assumptions,
        calculationResult,
        updateInputs,
        updateAssumptions,
        calculateCosts,
        saveConfiguration,
        loadConfiguration,
        getSavedConfigurations,
      }}
    >
      {children}
    </ReactorContext.Provider>
  );
}

export function useReactor() {
  const context = useContext(ReactorContext);
  if (!context) {
    throw new Error('useReactor must be used within ReactorProvider');
  }
  return context;
}
