const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

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
  view_mode: 'monthly' | 'yearly' | 'both';
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
 * Fetch forecast from backend with dual material support and view mode
 */
export async function getForecastFromBackend(
  baseCost: number,
  primaryMaterial: string,
  secondaryMaterial: string = 'MS',
  includeSecondary: boolean = false,
  viewMode: 'monthly' | 'yearly' | 'both' = 'yearly'
): Promise<DualMaterialForecastResponse | null> {
  try {
    const response = await fetch(`${backendUrl}/api/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_cost: baseCost,
        material_type: primaryMaterial,
        include_secondary_material: includeSecondary,
        secondary_material_type: secondaryMaterial,
        primary_cost_percentage: 100,
        secondary_cost_percentage: 0,
        view_mode: viewMode,
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
 * Fetch dual material forecast (for reactors with shell + limpet)
 */
export async function getDualMaterialForecast(
  baseCost: number,
  primaryMaterial: string,
  viewMode: 'monthly' | 'yearly' | 'both' = 'yearly',
  primaryPercentage: number = 70,
  secondaryPercentage: number = 30
): Promise<DualMaterialForecastResponse | null> {
  try {
    const response = await fetch(`${backendUrl}/api/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_cost: baseCost,
        material_type: primaryMaterial,
        include_secondary_material: true,
        secondary_material_type: 'MS', // Always MS for limpet
        primary_cost_percentage: primaryPercentage,
        secondary_cost_percentage: secondaryPercentage,
        view_mode: viewMode,
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
 * Transform yearly forecast response to chart data
 */
export function transformYearlyForecast(
  response: MaterialForecast
): ForecastDataPoint[] {
  return response.forecast
    .filter((item): item is YearlyForecastItem => 'year' in item) // ✅ TYPE GUARD
    .map((item) => ({
      year: `Year ${item.year}`,
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
 * Fallback: 5% annual inflation
 */
export function getLocalForecast(
  baseCost: number,
  inflationRate: number,
  months: boolean = false
): ForecastDataPoint[] {
  if (months) {
    // Monthly fallback
    return Array.from({ length: 60 }, (_, idx) => {
      const monthInflation = Math.pow(1 + inflationRate / 100, idx / 12);
      const cost = Math.round(baseCost * monthInflation);
      return {
        month: idx,
        date: `M${idx + 1}`,
        cost,
        costChange:
          idx === 0
            ? 0
            : Math.round(((cost - baseCost) / baseCost) * 100 * 100) / 100,
      };
    });
  } else {
    // Yearly fallback
    return Array.from({ length: 6 }, (_, year) => {
      const cost = Math.round(baseCost * Math.pow(1 + inflationRate / 100, year));
      return {
        year: `Year ${year}`,
        cost,
        costChange:
          year === 0
            ? 0
            : Math.round(((cost - baseCost) / baseCost) * 100 * 100) / 100,
      };
    });
  }
}