/**
 * Anomaly detection engine with three methods: Z-score, moving average, and
 * threshold. All methods are pure and unit-testable with synthetic data.
 */

export type Severity = 'none' | 'low' | 'medium' | 'high';

export interface AnomalyResult {
  anomalies: number[];
  severity: Severity;
}

export interface DetectOptions {
  zScoreThreshold: number;
  movingAverageWindow: number;
  movingAverageThreshold: number;
  min: number;
  max: number;
}

/**
 * Detects anomalies in a numeric series.
 */
export class AnomalyDetector {
  /**
   * Flags indices whose Z-score exceeds the threshold.
   */
  static zScore(values: number[], threshold: number): AnomalyResult {
    if (values.length === 0) {
      return { anomalies: [], severity: 'none' };
    }
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / values.length;
    const stddev = Math.sqrt(variance);
    if (stddev === 0) {
      return { anomalies: [], severity: 'none' };
    }
    const anomalies = values
      .map((v, i) => ({ v, i, z: Math.abs(v - mean) / stddev }))
      .filter((entry) => entry.z > threshold)
      .map((entry) => entry.i);
    return { anomalies, severity: severityFor(anomalies.length) };
  }

  /**
   * Flags indices whose value deviates from a rolling mean by more than the
   * absolute threshold.
   */
  static movingAverage(values: number[], window: number, threshold: number): AnomalyResult {
    if (values.length === 0 || window <= 0) {
      return { anomalies: [], severity: 'none' };
    }
    const anomalies: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - window);
      const end = i;
      const windowValues = values.slice(start, end);
      if (windowValues.length === 0) {
        continue;
      }
      const mean = windowValues.reduce((sum, v) => sum + v, 0) / windowValues.length;
      const value = values[i] ?? 0;
      if (Math.abs(value - mean) > threshold) {
        anomalies.push(i);
      }
    }
    return { anomalies, severity: severityFor(anomalies.length) };
  }

  /**
   * Flags indices whose value falls outside the fixed [min, max] range.
   */
  static threshold(values: number[], min: number, max: number): AnomalyResult {
    const anomalies = values
      .map((v, i) => ({ v, i }))
      .filter((entry) => entry.v < min || entry.v > max)
      .map((entry) => entry.i);
    return { anomalies, severity: severityFor(anomalies.length) };
  }

  /**
   * Combines all three methods and reports a single severity.
   */
  static detect(values: number[], options: DetectOptions): AnomalyResult {
    const z = AnomalyDetector.zScore(values, options.zScoreThreshold);
    const ma = AnomalyDetector.movingAverage(
      values,
      options.movingAverageWindow,
      options.movingAverageThreshold,
    );
    const th = AnomalyDetector.threshold(values, options.min, options.max);

    const combined = Array.from(new Set([...z.anomalies, ...ma.anomalies, ...th.anomalies]));
    return { anomalies: combined, severity: severityFor(combined.length) };
  }
}

function severityFor(count: number): Severity {
  if (count === 0) {
    return 'none';
  }
  if (count <= 2) {
    return 'low';
  }
  if (count <= 5) {
    return 'medium';
  }
  return 'high';
}
