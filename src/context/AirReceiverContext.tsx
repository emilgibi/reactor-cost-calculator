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

// Fallback SS304 constants used in the local calculateCosts function when the MOC is SS-based.
// These are fixed material properties, not user-configurable assumptions.
const SS304_DENSITY_G_CM3 = 8;
const SS304_PLATE_COST = 210;
const SS304_LABOUR_COST = 28;

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
  calculateCosts: (assumptionsOverride?: AirReceiverAssumptions) => void;
  setCalculationResult: (result: AirReceiverCalculationResult | null) => void;
  saveConfiguration: (name: string) => void;
  loadConfiguration: (name: string) => void;
  getSavedConfigurations: () => string[];
}

export const defaultInputs: AirReceiverFormInput = {
  Specification: {
    Shell: {
      moc: 'CS',
      diameter: 1200,
      height: 3000,
      thickness: 10,
    },
    Dish: {
      moc: 'CS',
      diameter: 1200,
      thickness: 10,
    },
    Finish: {
      type: 'Painting',
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
};

export const defaultAssumptions: AirReceiverAssumptions = {
  // Material Costs
  msPlateCost: 80,
  msPipeCost: 120,

  // Labour Costs
  msLabourCost: 30,

  // Density Values
  msDensity: 7.86,

  // Other Costs
  dishPressingPerSqm: 20,
  machineCharges: 0,
  paintingLumpsum: 25000,
  localTransportLumpsum: 35000,
  hardwareLumpsum: 2500,
  testingCost: 30000,

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

  const calculateCosts = useCallback((assumptionsOverride?: AirReceiverAssumptions) => {
    const a = assumptionsOverride || assumptions;
    const spec = inputs.Specification;
    const diameter = spec.Shell.diameter / 1000; // convert mm to m
    const height = spec.Shell.height / 1000;
    const thickness = spec.Shell.thickness / 1000;
    const pi = Math.PI;

    // Shell surface area
    const shellArea = pi * diameter * height;
    const dishArea = 2 * pi * Math.pow(diameter / 2, 2) * 0.7; // approx dish area

    const isSS = spec.Shell.moc.includes('SS');
    const density = isSS ? SS304_DENSITY_G_CM3 * 1000 : a.msDensity * 1000;
    const plateCost = isSS ? SS304_PLATE_COST : a.msPlateCost;
    const labourCost = isSS ? SS304_LABOUR_COST : a.msLabourCost;

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
    const dishPressingTotal = a.dishPressingPerSqm * dishWeight;

    const fabrication_breakdown: { [key: string]: AirReceiverCostItem } = {};

    if (isSS) {
      fabrication_breakdown['ss304_plate'] = mkItem('SS304 Plate', SS304_PLATE_COST, totalWeight, 'kg', materialCost);
      fabrication_breakdown['ss_labour'] = mkItem('SS Labour', SS304_LABOUR_COST, totalWeight, 'kg', labourTotal);
    } else {
      fabrication_breakdown['ms_plate'] = mkItem('MS Plate', a.msPlateCost, totalWeight, 'kg', materialCost);
      fabrication_breakdown['ms_labour'] = mkItem('MS Labour', a.msLabourCost, totalWeight, 'kg', labourTotal);
    }

    fabrication_breakdown['dish_pressing'] = mkItem('Dish Pressing', a.dishPressingPerSqm, dishWeight, 'kg', dishPressingTotal);
    fabrication_breakdown['machine_charges'] = mkItem('Machine Charges', null, null, null, a.machineCharges);
    fabrication_breakdown['hardware'] = mkItem('Hardware', null, null, null, a.hardwareLumpsum);
    fabrication_breakdown['painting'] = mkItem('Painting', null, null, null, a.paintingLumpsum);
    fabrication_breakdown['local_transport'] = mkItem('Local Transport', null, null, null, a.localTransportLumpsum);

    const fabricationCost =
      materialCost +
      labourTotal +
      dishPressingTotal +
      a.machineCharges +
      a.hardwareLumpsum +
      a.paintingLumpsum +
      a.localTransportLumpsum;

    const overheadAmount = (fabricationCost * a.overheadPercent) / 100;
    const profitAmount = ((fabricationCost + overheadAmount) * a.profitPercent) / 100;
    const grandTotal = fabricationCost + overheadAmount + profitAmount;

    const summary: AirReceiverCostSummary = {
      fabrication_cost: fabricationCost,
      overhead_percentage: a.overheadPercent,
      overhead_amount: overheadAmount,
      profit_percentage: a.profitPercent,
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