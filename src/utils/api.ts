const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export interface ForecastItem {
  year: number;
  projectedCost: number;
  wpiIndex: number;
  costChange: number;
}

// ✅ UPDATED: Add material_type, material_name, and current_wpi
export interface ForecastResponse {
  success: boolean;
  material_type: string;
  material_name: string;
  current_wpi: number;
  base_cost: number;
  forecast: ForecastItem[];
}

export interface ForecastDataPoint {
  year: string;
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

/**
 * Fetches a 5-year WPI-based cost forecast from the backend ML API.
 * Returns null if the backend is unreachable or returns an error.
 */
export async function getForecastFromBackend(
  baseCost: number,
  materialType: string
): Promise<ForecastResponse | null> {
  try {
    const response = await fetch(`${backendUrl}/api/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_cost: baseCost,
        material_type: materialType,
        months_ahead: 60,
      }),
    });
    if (!response.ok) {
      return null;
    }
    return response.json() as Promise<ForecastResponse>;
  } catch {
    return null;
  }
}

/**
 * Converts a backend ForecastResponse into the array of data points used by
 * the forecast chart and table.
 */
export function transformForecastResponse(response: ForecastResponse): ForecastDataPoint[] {
  return response.forecast.map((item) => ({
    year: `Year ${item.year}`,
    cost: Math.round(item.projectedCost),
    wpiIndex: item.wpiIndex,
    costChange: item.costChange,
  }));
}

/**
 * Generates a simple local 5% inflation fallback when the backend is unavailable.
 */
export function getLocalForecast(baseCost: number, inflationRate: number): ForecastDataPoint[] {
  return Array.from({ length: 6 }, (_, year) => ({
    year: `Year ${year}`,
    cost: Math.round(baseCost * Math.pow(1 + inflationRate / 100, year)),
  }));
}