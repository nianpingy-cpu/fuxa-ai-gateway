import { describe, it, expect } from 'vitest';
import { HistoryAnalyzer } from '../../src/analytics/analyzer.js';
import { DaqPoint } from '../../src/adapters/fuxa/types.js';

function points(values: number[]): DaqPoint[] {
  return values.map((value, i) => ({
    timestamp: `2026-01-01T00:${String(i).padStart(2, '0')}:00Z`,
    value,
  }));
}

describe('HistoryAnalyzer', () => {
  it('computes mean, max, and min', () => {
    const result = HistoryAnalyzer.analyze(points([10, 20, 30, 40]));
    expect(result.mean).toBe(25);
    expect(result.max).toBe(40);
    expect(result.min).toBe(10);
  });

  it('computes an upward trend', () => {
    const result = HistoryAnalyzer.analyze(points([10, 20, 30, 40]));
    expect(result.trend).toBe('up');
  });

  it('computes a downward trend', () => {
    const result = HistoryAnalyzer.analyze(points([40, 30, 20, 10]));
    expect(result.trend).toBe('down');
  });

  it('computes a flat trend', () => {
    const result = HistoryAnalyzer.analyze(points([20, 20, 20, 20]));
    expect(result.trend).toBe('flat');
  });

  it('flags an anomaly when a value deviates significantly', () => {
    const result = HistoryAnalyzer.analyze(points([10, 10, 10, 10, 10, 100, 10, 10, 10, 10]));
    expect(result.anomaly).toBe(true);
  });

  it('handles an empty series without crashing', () => {
    const result = HistoryAnalyzer.analyze([]);
    expect(result.mean).toBe(0);
    expect(result.max).toBe(0);
    expect(result.min).toBe(0);
    expect(result.trend).toBe('flat');
    expect(result.anomaly).toBe(false);
  });
});
