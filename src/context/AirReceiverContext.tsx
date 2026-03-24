import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  AirReceiverFormInput,
  AirReceiverAssumptions,
  AirReceiverCalculationResult,
  AirReceiverBackendResponse,
  AirReceiverCostItem,
  AirReceiverCostSummary,
} from '../types/airReceiver';

export type { AirReceiverFormInput, AirReceiverAssumptions, AirReceiverCalculationResult };

// Dummy backend response – represents the expected API response structure.
// TODO: Replace with real API call when backend is ready.
export const dummyBackendData: AirReceiverBackendResponse = {
  lineItems: [
    { name: 'SS 304 Plate', unitRate: 210, quantity: 1850.00, totalCost: 388500.00 },
    { name: 'SS Labour', unitRate: 28, quantity: 1850.00, totalCost: 51800.00 },
    { name: 'Dish Pressing', unitRate: 20, quantity: 450.00, totalCost: 9000.00 },
    { name: 'Machine Charges', unitRate: 1, quantity: 30000, totalCost: 30000.00 },
    { name: 'Hardware', unitRate: 1, quantity: 5000, totalCost: 5000.00 },
    { name: 'Painting', unitRate: 1, quantity: 3000, totalCost: 3000.00 },
    { name: 'Local Transport', unitRate: 1, quantity: 20000, totalCost: 20000.00 },
  ],
  componentCostSummary: {
    materials: { cost: 388500.00, percentageOfGrandTotal: 56.32 },
    labour: { cost: 51800.00, percentageOfGrandTotal: 7.51 },
    consumables: { cost: 0, percentageOfGrandTotal: 0 },
    servicesAndOthers: { cost: 67000.00, percentageOfGrandTotal: 9.72 },
    overhead: { cost: 50730.00, percentageOfGrandTotal: 7.36 },
    profit: { cost: 131397.00, percentageOfGrandTotal: 19.05 },
  },
  totals: {
    fabricationCost: 507300.00,
    overhead: 50730.00,
    profit: 167409.00,
    grandTotal: 725439.00,
  },
};

interface AirReceiverContextType {
  inputs: AirReceiverFormInput;
  assumptions: AirReceiverAssumptions;
  calculationResult: AirReceiverCalculationResult | null;
  updateInputs: (newInputs: Partial<AirReceiverFormInput>) => void;
  updateAssumptions: (newAssumptions: Partial<AirReceiverAssumptions>) => void;
  calculateCosts: () => void;
  setCalculationResult: (result: AirReceiverCalculationResult | null) => void;
  saveConfiguration: (name: string) => void;
  loadConfiguration: (name: string) => void;
  getSavedConfigurations: () => string[];
}

export const defaultInputs: AirReceiverFormInput = {
  Specification: {
    Shell: {
      moc: 'SS304',
      diameter: 1200,
      height: 3000,
      thickness: 10,
    },
    Dish: {
      moc: 'SS304',
      diameter: 1200,
      thickness: 10,
    },
    Nozzle: {
      moc: 'SS304',
      count: 4,
    },
    Finish: {
      type: 'External',
    },
  },
  NozzleSchedule: {
    NB_25: { count: 4 },
    NB_40: { count: 3 },
    NB_50: { count: 3 },
    NB_80: { count: 2 },
    NB_100: { count: 0 },
    NB_150: { count: 0 },
    NB_600: { count: 1 },
  },
  capacity: 20,
  designPressure: 10,
  testPressure: 15,
};

export const defaultAssumptions: AirReceiverAssumptions = {
  // Material Costs
  ss304PlateCost: 210,
  ss304PipeCost: 350,
  msPlateCost: 80,           // ✅ ADD THIS
  msPipeCost: 120,           // ✅ ADD THIS
  
  // Labour Costs
  ssLabourCost: 28,
  msLabourCost: 30,
  
  // Density Values
  ss304Density: 8,
  msDensity: 7.86,
  
  // Other Costs
  dishPressingPerSqm: 20,    // ✅ ADD THIS
  machineCharges: 0,
  paintingCost: 25000,
  localTransportCost: 35000,
  hardwareCost: 2500,
  testingCost: 30000,        // ✅ ADD THIS
  
  // Financial Percentages
  overheadPercent: 10,
  profitPercent: 15,
  annualInflationRate: 5,
};

const AirReceiverContext = createContext<AirReceiverContextType | undefined>(undefined);

export function AirReceiverProvider({ children }: { children: React.ReactNode }) {
  const [inputs, setInputs] = useState<AirReceiverFormInput>(defaultInputs);
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

    const mkItem = (description: string, unit_rate: number | null, quantity: number | null, unit_type: string | null, total_cost: number): AirReceiverCostItem => ({
      description,
      unit_rate,
      quantity,
      unit_type,
      total_cost,
    });

    const materialCost = totalWeight * plateCost;
    const labourTotal = totalWeight * labourCost;
    const dishPressingTotal = assumptions.dishPressingPerSqm * dishWeight;

    const fabrication_breakdown: { [key: string]: AirReceiverCostItem } = {};

    if (isSS) {
      fabrication_breakdown['ss304_plate'] = mkItem('SS304 Plate', assumptions.ss304PlateCost, totalWeight, 'kg', materialCost);
      fabrication_breakdown['ss_labour'] = mkItem('SS Labour', assumptions.ssLabourCost, totalWeight, 'kg', labourTotal);
    } else {
      fabrication_breakdown['ms_plate'] = mkItem('MS Plate', assumptions.msPlateCost, totalWeight, 'kg', materialCost);
      fabrication_breakdown['ms_labour'] = mkItem('MS Labour', assumptions.msLabourCost, totalWeight, 'kg', labourTotal);
    }

    fabrication_breakdown['dish_pressing'] = mkItem('Dish Pressing', assumptions.dishPressingPerSqm, dishWeight, 'kg', dishPressingTotal);
    fabrication_breakdown['machine_charges'] = mkItem('Machine Charges', null, null, null, assumptions.machineCharges);
    fabrication_breakdown['hardware'] = mkItem('Hardware', null, null, null, assumptions.hardwareCost);
    fabrication_breakdown['painting'] = mkItem('Painting', null, null, null, assumptions.paintingCost);
    fabrication_breakdown['local_transport'] = mkItem('Local Transport', null, null, null, assumptions.localTransportCost);

    const fabricationCost =
      materialCost +
      labourTotal +
      dishPressingTotal +
      assumptions.machineCharges +
      assumptions.hardwareCost +
      assumptions.paintingCost +
      assumptions.localTransportCost;

    const overheadAmount = (fabricationCost * assumptions.overheadPercent) / 100;
    const profitAmount = ((fabricationCost + overheadAmount) * assumptions.profitPercent) / 100;
    const grandTotal = fabricationCost + overheadAmount + profitAmount;

    const summary: AirReceiverCostSummary = {
      fabrication_cost: fabricationCost,
      overhead_percentage: assumptions.overheadPercent,
      overhead_amount: overheadAmount,
      profit_percentage: assumptions.profitPercent,
      profit_amount: profitAmount,
      grand_total: grandTotal,
    };

    setCalculationResult({ fabrication_breakdown, summary });
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
        setCalculationResult,
        saveConfiguration,
        loadConfiguration,
        getSavedConfigurations,
      }}
    >
      {children}
    </AirReceiverContext.Provider>
  );
}

export function useAirReceiver(): AirReceiverContextType {
  const context = useContext(AirReceiverContext);
  if (!context) {
    throw new Error('useAirReceiver must be used within AirReceiverProvider');
  }
  return context;
}