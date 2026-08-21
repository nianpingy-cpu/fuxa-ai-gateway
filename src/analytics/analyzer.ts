import { DaqPoint } from '../adapters/fuxa/types.js';

export interface HistoryAnalysis {
  mean: number;
  max: number;
  min: number;
  trend: 'up' | 'down' | 'flat';
  anomaly: boolean;
}

const ANOMALY_THRESHOLD = 2;

/**
 * Summarizes historical data into compact statistics. Never returns raw
 * points, keeping responses small and model-friendly.
 */
export class HistoryAnalyzer {
  static analyze(points: DaqPoint[]): HistoryAnalysis {
    if (points.length === 0) {
      return { mean: 0, max: 0, min: 0, trend: 'flat', anomaly: false };
    }

    const values = points.map((p) => p.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const trend = computeTrend(values);
    const anomaly = detectAnomaly(values, mean);

    return { mean, max, min, trend, anomaly };
  }
}

function computeTrend(values: number[]): 'up' | 'down' | 'flat' {
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const delta = last - first;
  if (Math.abs(delta) < 1e-9) {
    return 'flat';
  }
  return delta > 0 ? 'up' : 'down';
}

function detectAnomaly(values: number[], mean: number): boolean {
  const variance = values.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / values.length;
  const stddev = Math.sqrt(variance);
  if (stddev === 0) {
    return false;
  }
  return values.some((v) => Math.abs(v - mean) / stddev > ANOMALY_THRESHOLD);
}
