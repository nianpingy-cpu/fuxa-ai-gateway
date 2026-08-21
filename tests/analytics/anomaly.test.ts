import { describe, it, expect } from 'vitest';
import { AnomalyDetector } from '../../src/analytics/anomaly.js';

describe('AnomalyDetector.zScore', () => {
  it('flags a point that deviates significantly from the mean', () => {
    const values = [10, 10, 10, 10, 10, 100, 10, 10, 10, 10];
    const result = AnomalyDetector.zScore(values, 2);
    expect(result.anomalies).toContain(5);
  });

  it('does not flag a normal series', () => {
    const values = [10, 11, 10, 12, 10, 11, 10, 12];
    const result = AnomalyDetector.zScore(values, 2);
    expect(result.anomalies).toHaveLength(0);
  });

  it('handles a constant series without crashing', () => {
    const result = AnomalyDetector.zScore([5, 5, 5, 5], 2);
    expect(result.anomalies).toHaveLength(0);
  });
});

describe('AnomalyDetector.movingAverage', () => {
  it('flags a point that deviates from the rolling mean', () => {
    const values = [10, 10, 10, 10, 10, 100, 10, 10, 10, 10];
    const result = AnomalyDetector.movingAverage(values, 3, 2);
    expect(result.anomalies).toContain(5);
  });

  it('does not flag a normal series', () => {
    const values = [10, 11, 10, 12, 10, 11, 10, 12];
    const result = AnomalyDetector.movingAverage(values, 3, 2);
    expect(result.anomalies).toHaveLength(0);
  });
});

describe('AnomalyDetector.threshold', () => {
  it('flags points outside the range', () => {
    const values = [10, 20, 30, 100, 5];
    const result = AnomalyDetector.threshold(values, 0, 50);
    expect(result.anomalies).toContain(3);
  });

  it('does not flag points within the range', () => {
    const values = [10, 20, 30, 40];
    const result = AnomalyDetector.threshold(values, 0, 50);
    expect(result.anomalies).toHaveLength(0);
  });
});

describe('AnomalyDetector.detect', () => {
  it('combines methods and reports severity', () => {
    const values = [10, 10, 10, 10, 10, 100, 10, 10, 10, 10];
    const result = AnomalyDetector.detect(values, {
      zScoreThreshold: 2,
      movingAverageWindow: 3,
      movingAverageThreshold: 2,
      min: 0,
      max: 50,
    });
    expect(result.anomalies.length).toBeGreaterThan(0);
    expect(result.severity).toBeDefined();
  });

  it('reports no anomalies for a normal series', () => {
    const values = [10, 11, 10, 12, 10, 11, 10, 12];
    const result = AnomalyDetector.detect(values, {
      zScoreThreshold: 2,
      movingAverageWindow: 3,
      movingAverageThreshold: 2,
      min: 0,
      max: 50,
    });
    expect(result.anomalies).toHaveLength(0);
    expect(result.severity).toBe('none');
  });
});
