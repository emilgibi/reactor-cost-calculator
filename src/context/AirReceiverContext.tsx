import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  AirReceiverFormInput,
  AirReceiverAssumptions,
  AirReceiverCalculationResult,
} from '../types/airReceiver';

export type { AirReceiverFormInput, AirReceiverAssumptions, AirReceiverCalculationResult };

interface AirReceiverContextType {
  inputs: AirReceiverFormInput;
  assumptions: AirReceiverAssumptions;
  calculationResult: AirReceiverCalculationResult | null;
  updateInputs: (newInputs: Partial<AirReceiverFormInput>) => void;
  updateAssumptions: (newAssumptions: Partial<AirReceiverAssumptions>) => void;
  calculateCosts: () => void;
  saveConfiguration: (name: string) => void;
  loadConfiguration: (name: string) => void;
  getSavedConfigurations: () => string[];
}

export const defaultInputs: AirReceiverFormInput = {
  Specification: {
    Shell: {
      moc: 'MS',
      diameter: 1200,
      height: 3000,
      thickness: 10,
    },
    Dish: {
      moc: 'MS',
      diameter: 1200,
      thickness: 10,
    },
    Nozzle: {
      moc: 'MS',
      count: 4,
    },
    Finish: {
      type: 'External',
    },
  },
  capacity: 20,
  designPressure: 10,
  testPressure: 15,
};

export const defaultAssumptions: AirReceiverAssumptions = {
  ss304PlateCost: 210,
  msPlateCost: 65,
  ss304PipeCost: 350,
  msPipeCost: 120,
  ssLabourCost: 28,
  msLabourCost: 17,
  ss304Density: 8,
  msDensity: 7.86,
  dishPressingCost: 20,
  machineCharges: 30000,
  paintingCost: 3000,
  localTransportCost: 20000,
  hardwareCost: 5000,
  overheadPercent: 10,
  profitPercent: 30,
  annualInflationRate: 5,
};

const AirReceiverContext = createContext<AirReceiverContextType | undefined>(undefined);

export function AirReceiverProvider({ children }: { children: React.ReactNode }) {
  const [inputs, setInputs] = useState<AirReceiverFormInput>(() => {
    try {
      const saved = localStorage.getItem('airreceiver_current_inputs');
      return saved ? JSON.parse(saved) : defaultInputs;
    } catch {
      return defaultInputs;
    }
  });
  const [assumptions, setAssumptions] = useState<AirReceiverAssumptions>(defaultAssumptions);
  const [calculationResult, setCalculationResult] = useState<AirReceiverCalculationResult | null>(null);

  const updateInputs = useCallback((newInputs: Partial<AirReceiverFormInput>) => {
    setInputs((prev) => {
      const updated = { ...prev, ...newInputs };
      localStorage.setItem('airreceiver_current_inputs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateAssumptions = useCallback((newAssumptions: Partial<AirReceiverAssumptions>) => {
    setAssumptions((prev) => ({ ...prev, ...newAssumptions }));
  }, []);

  const calculateCosts = useCallback(() => {
    const spec = inputs.Specification;
    const diameter = spec.Shell.diameter / 1000; // convert mm to m
    const height = spec.Shell.height / 1000;
    const thickness = spec.Shell.thickness / 1000;
    const pi = Math.PI;

    // Shell surface area
    const shellArea = pi * diameter * height;
    const dishArea = 2 * pi * Math.pow(diameter / 2, 2) * 0.7; // approx dish area

    const isSS = spec.Shell.moc.includes('SS');
    const density = isSS ? assumptions.ss304Density * 1000 : assumptions.msDensity * 1000;
    const plateCost = isSS ? assumptions.ss304PlateCost : assumptions.msPlateCost;
    const labourCost = isSS ? assumptions.ssLabourCost : assumptions.msLabourCost;

    const shellWeight = shellArea * thickness * density;
    const dishWeight = dishArea * (spec.Dish.thickness / 1000) * density;
    const totalWeight = shellWeight + dishWeight;

    const costBreakdown: { [key: string]: number } = {};

    const materialCost = totalWeight * plateCost;
    const labourTotal = totalWeight * labourCost;

    if (isSS) {
      costBreakdown['SS304 Plate'] = materialCost;
      costBreakdown['SS Labour'] = labourTotal;
    } else {
      costBreakdown['MS Plate'] = materialCost;
      costBreakdown['MS Labour'] = labourTotal;
    }

    const dishPressingTotal = assumptions.dishPressingCost * dishWeight;
    costBreakdown['Dish Pressing'] = dishPressingTotal;
    costBreakdown['Machine Charges'] = assumptions.machineCharges;
    costBreakdown['Hardware'] = assumptions.hardwareCost;
    costBreakdown['Painting'] = assumptions.paintingCost;
    costBreakdown['Local Transport'] = assumptions.localTransportCost;

    const totalMaterialCost = materialCost;
    const totalLabourCost = labourTotal;

    const fabricationCost =
      materialCost +
      labourTotal +
      dishPressingTotal +
      assumptions.machineCharges +
      assumptions.hardwareCost +
      assumptions.paintingCost +
      assumptions.localTransportCost;

    const overheadCost = (fabricationCost * assumptions.overheadPercent) / 100;
    costBreakdown['Overhead'] = overheadCost;

    const profitCost = ((fabricationCost + overheadCost) * assumptions.profitPercent) / 100;
    costBreakdown['Profit'] = profitCost;

    const grandTotal = fabricationCost + overheadCost + profitCost;

    setCalculationResult({
      materialWeight: { ss304: isSS ? totalWeight : 0, ms: isSS ? 0 : totalWeight },
      costBreakdown,
      totalMaterialCost,
      totalLabourCost,
      overheadCost,
      profitCost,
      grandTotal,
    });
  }, [inputs, assumptions]);

  const saveConfiguration = useCallback(
    (name: string) => {
      const configurations = JSON.parse(localStorage.getItem('airreceiver_configs') || '{}');
      configurations[name] = { inputs, assumptions };
      localStorage.setItem('airreceiver_configs', JSON.stringify(configurations));
    },
    [inputs, assumptions]
  );

  const loadConfiguration = useCallback((name: string) => {
    const configurations = JSON.parse(localStorage.getItem('airreceiver_configs') || '{}');
    if (configurations[name]) {
      setInputs(configurations[name].inputs);
      setAssumptions(configurations[name].assumptions);
    }
  }, []);

  const getSavedConfigurations = useCallback(() => {
    const configurations = JSON.parse(localStorage.getItem('airreceiver_configs') || '{}');
    return Object.keys(configurations);
  }, []);

  return (
    <AirReceiverContext.Provider
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
    </AirReceiverContext.Provider>
  );
}

export function useAirReceiver() {
  const context = useContext(AirReceiverContext);
  if (!context) {
    throw new Error('useAirReceiver must be used within AirReceiverProvider');
  }
  return context;
}
