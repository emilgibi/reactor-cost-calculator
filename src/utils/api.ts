export const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// ========== INTERFACES ==========

export interface MonthlyForecastItem {
  month: number;
  date: string;
  wpiIndex: number;
  projectedCost: number;
  costChange: number;
}

export interface YearlyForecastItem {
  year: number;
  date: string;
  wpiIndex: number;
  projectedCost: number;
  costChange: number;
}

// ✅ UNION TYPE for both monthly and yearly
export type ForecastItemType = MonthlyForecastItem | YearlyForecastItem;

export interface MaterialForecast {
  success: boolean;
  material_type: string;
  material_name: string;
  base_cost: number;
  material_price: number;
  unit_price: number;
  current_wpi: number;
  forecast: ForecastItemType[]; // ✅ USE UNION TYPE
}

export interface DualMaterialForecastResponse {
  success: boolean;
  view_mode: 'yearly';
  primary_material: MaterialForecast;
  secondary_material?: MaterialForecast;
  total_base_cost: number;
}

export interface ForecastDataPoint {
  month?: number;
  year?: string;
  date?: string;
  cost: number;
  wpiIndex?: number;
  costChange?: number;
}

export interface MaterialInfo {
  material_type: string;
  material_name: string;
  current_wpi: number;
  base_cost: number;
}

// ========== API CALLS ==========

/**
 * Fetch forecast from backend with dual material support (always yearly)
 */
export async function getForecastFromBackend(
  materialPrice: number,
  primaryMaterial: string,
  secondaryMaterial: string = 'MS',
  includeSecondary: boolean = false
): Promise<DualMaterialForecastResponse | null> {
  try {
    const response = await fetch(`${backendUrl}/api/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_cost: materialPrice,
        material_type: primaryMaterial,
        include_secondary_material: includeSecondary,
        secondary_material_type: secondaryMaterial,
        primary_cost_percentage: 100,
        secondary_cost_percentage: 0,
        view_mode: 'yearly',
        months_ahead: 60,
      }),
    });

    if (!response.ok) {
      console.error(`Forecast request failed: ${response.status}`);
      return null;
    }

    return response.json() as Promise<DualMaterialForecastResponse>;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return null;
  }
}

/**
 * Fetch dual material forecast (for reactors with shell + limpet, always yearly)
 */
export async function getDualMaterialForecast(
  materialPrice: number,
  primaryMaterial: string,
  primaryPercentage: number = 70,
  secondaryPercentage: number = 30
): Promise<DualMaterialForecastResponse | null> {
  try {
    const response = await fetch(`${backendUrl}/api/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_cost: materialPrice,
        material_type: primaryMaterial,
        include_secondary_material: true,
        secondary_material_type: 'MS', // Always MS for limpet
        primary_cost_percentage: primaryPercentage,
        secondary_cost_percentage: secondaryPercentage,
        view_mode: 'yearly',
        months_ahead: 60,
      }),
    });

    if (!response.ok) {
      return null;
    }

    return response.json() as Promise<DualMaterialForecastResponse>;
  } catch (error) {
    console.error('Error fetching dual material forecast:', error);
    return null;
  }
}

/**
 * Fetch dual material forecast by making TWO independent backend calls —
 * one for the shell material and one for the limpet (MS).
 * This avoids the percentage-split logic on the backend that can produce
 * identical costs when either base_cost is zero.
 */
export async function getDualMaterialForecastSplit(
  shellCost: number,
  shellMaterial: string,
  limpetCost: number,
): Promise<{ shell: MaterialForecast | null; limpet: MaterialForecast | null }> {
  try {
    const [shellRes, limpetRes] = await Promise.all([
      fetch(`${backendUrl}/api/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_cost: shellCost,
          material_type: shellMaterial,
          include_secondary_material: false,
          secondary_material_type: 'MS',
          primary_cost_percentage: 100,
          secondary_cost_percentage: 0,
          view_mode: 'yearly',
          months_ahead: 60,
        }),
      }),
      fetch(`${backendUrl}/api/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_cost: limpetCost,
          material_type: 'MS',
          include_secondary_material: false,
          primary_cost_percentage: 100,
          secondary_cost_percentage: 0,
          view_mode: 'yearly',
          months_ahead: 60,
        }),
      }),
    ]);

    const shellData  = shellRes.ok  ? await shellRes.json()  : null;
    const limpetData = limpetRes.ok ? await limpetRes.json() : null;

    return {
      shell:  shellData?.primary_material  ?? null,
      limpet: limpetData?.primary_material ?? null,
    };
  } catch (error) {
    console.error('Error fetching split dual material forecast:', error);
    return { shell: null, limpet: null };
  }
}

/**
 * Transform yearly forecast response to chart data
 */
export function transformYearlyForecast(
  response: MaterialForecast
): ForecastDataPoint[] {
  return response.forecast
    .filter((item): item is YearlyForecastItem => 'year' in item) // ✅ TYPE GUARD
    .map((item) => ({
      year: `Year ${item.year}`,
      date: item.date,  // calendar year like "2026"
      cost: Math.round(item.projectedCost),
      wpiIndex: item.wpiIndex,
      costChange: item.costChange,
    }));
}

/**
 * Transform monthly forecast response to chart data
 */
export function transformMonthlyForecast(
  response: MaterialForecast
): ForecastDataPoint[] {
  return response.forecast
    .filter((item): item is MonthlyForecastItem => 'month' in item) // ✅ TYPE GUARD
    .map((item) => ({
      month: item.month,
      date: item.date,
      cost: Math.round(item.projectedCost),
      wpiIndex: item.wpiIndex,
      costChange: item.costChange,
    }));
}

/**
 * Fallback: 5% annual inflation (yearly only)
 */
export function getLocalForecast(
  baseCost: number,
  inflationRate: number
): ForecastDataPoint[] {
  const baseYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, year) => {
    const cost = Math.round(baseCost * Math.pow(1 + inflationRate / 100, year));
    return {
      year: `Year ${year}`,
      date: String(baseYear + year),
      cost,
      costChange:
        year === 0
          ? 0
          : Math.round(((cost - baseCost) / baseCost) * 100 * 100) / 100,
    };
  });
}