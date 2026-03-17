import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ReactorInputs {
  capacity: number;
  shellDiameter: number;
  dishType: 'SS304' | 'MS';
  thickness: number;
  motorType: 'Flameproof' | 'Non-Flameproof';
  motorCapacity: number;
  sealType: 'Single' | 'Double' | 'Gland';
  bladeType: 'Gate anchor' | 'Turbine';
  limpetIncluded: boolean;
  limpetOD: number;
  limpetPitch: number;
  finishType: 'Mirror' | 'Normal';
}

export interface Assumptions {
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

export interface CalculationResult {
  materialWeight: {
    ss304: number;
    ssPipe: number;
    ms: number;
    msPipe: number;
  };
  costBreakdown: {
    [key: string]: number;
  };
  totalMaterialCost: number;
  totalLabourCost: number;
  overheadCost: number;
  profitCost: number;
  grandTotal: number;
}

interface ReactorContextType {
  inputs: ReactorInputs;
  assumptions: Assumptions;
  calculationResult: CalculationResult | null;
  updateInputs: (newInputs: Partial<ReactorInputs>) => void;
  updateAssumptions: (newAssumptions: Partial<Assumptions>) => void;
  calculateCosts: () => void;
  saveConfiguration: (name: string) => void;
  loadConfiguration: (name: string) => void;
  getSavedConfigurations: () => string[];
}

const defaultInputs: ReactorInputs = {
  capacity: 10,
  shellDiameter: 2150,
  dishType: 'SS304',
  thickness: 8,
  motorType: 'Flameproof',
  motorCapacity: 15,
  sealType: 'Single',
  bladeType: 'Gate anchor',
  limpetIncluded: true,
  limpetOD: 90,
  limpetPitch: 120,
  finishType: 'Mirror',
};

const defaultAssumptions: Assumptions = {
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
  const [inputs, setInputs] = useState<ReactorInputs>(defaultInputs);
  const [assumptions, setAssumptions] = useState<Assumptions>(defaultAssumptions);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

  const updateInputs = useCallback((newInputs: Partial<ReactorInputs>) => {
    setInputs((prev) => ({ ...prev, ...newInputs }));
  }, []);

  const updateAssumptions = useCallback((newAssumptions: Partial<Assumptions>) => {
    setAssumptions((prev) => ({ ...prev, ...newAssumptions }));
  }, []);

  const calculateCosts = useCallback(() => {
    const scalingFactor = inputs.capacity === 10 ? 1 : 0.3 + (inputs.capacity - 1) * 0.078;

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

    if (inputs.motorType === 'Flameproof') {
      costBreakdown['Gear Box'] = assumptions.gearBoxCost;
      costBreakdown['Motor (Flameproof)'] = assumptions.motorCost;
    }

    costBreakdown['Bearing'] = assumptions.bearingCost;

    if (inputs.sealType === 'Single') {
      costBreakdown['Single Mechanical Seal'] = assumptions.singleSealCost;
    } else if (inputs.sealType === 'Double') {
      costBreakdown['Double Mechanical Seal'] = assumptions.doubleSealCost;
    }

    costBreakdown['Flexible Coupling'] = assumptions.flexibleCouplingCost;
    costBreakdown['Toughened Glass'] = assumptions.toughenedGlassCost;

    totalMaterialCost +=
      assumptions.gearBoxCost +
      assumptions.motorCost +
      assumptions.bearingCost +
      (inputs.sealType === 'Double' ? assumptions.doubleSealCost : assumptions.singleSealCost) +
      assumptions.flexibleCouplingCost +
      assumptions.toughenedGlassCost;

    costBreakdown['Hardware'] = assumptions.hardwareCost;
    costBreakdown['Consumables'] = assumptions.consumableCost;
    costBreakdown['Dish Pressing'] = assumptions.dishPressingCost * 972.2 * scalingFactor;
    costBreakdown['Machine Charges'] = assumptions.machineCharges;
    costBreakdown['Agitator Assembly'] = assumptions.agitatorAssemblyCost;
    costBreakdown['Acid Cleaning'] = assumptions.acidCleaningCost * 278.73 * scalingFactor;
    costBreakdown['Mirror Finish'] = inputs.finishType === 'Mirror' ? assumptions.mirrorFinishCost * 26.18 * scalingFactor : 0;
    costBreakdown['Painting'] = assumptions.paintingCost;
    costBreakdown['Local Transport'] = assumptions.localTransportCost;

    const otherCosts =
      assumptions.hardwareCost +
      assumptions.consumableCost +
      (assumptions.dishPressingCost * 972.2 * scalingFactor) +
      assumptions.machineCharges +
      assumptions.agitatorAssemblyCost +
      (assumptions.acidCleaningCost * 278.73 * scalingFactor) +
      (inputs.finishType === 'Mirror' ? assumptions.mirrorFinishCost * 26.18 * scalingFactor : 0) +
      assumptions.paintingCost +
      assumptions.localTransportCost;

    const fabricationCost = totalMaterialCost + otherCosts;

    if (inputs.limpetIncluded) {
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