import { describe, it, expect } from 'vitest';
import { MetricsService } from '../../src/monitoring/metrics.js';

describe('MetricsService', () => {
  it('tracks request count and tool usage', () => {
    const metrics = new MetricsService();
    metrics.track('fuxa_health_check', 5);
    metrics.track('fuxa_health_check', 10);
    metrics.track('fuxa_search_tags', 3);

    const summary = metrics.summary();
    expect(summary.requestCount).toBe(3);
    expect(summary.toolUsage['fuxa_health_check']).toBe(2);
    expect(summary.toolUsage['fuxa_search_tags']).toBe(1);
  });

  it('tracks errors', () => {
    const metrics = new MetricsService();
    metrics.track('fuxa_health_check', 5);
    metrics.recordError();
    expect(metrics.summary().errorCount).toBe(1);
  });

  it('tracks latency', () => {
    const metrics = new MetricsService();
    metrics.track('fuxa_health_check', 5);
    metrics.track('fuxa_health_check', 15);
    expect(metrics.summary().totalLatencyMs).toBe(20);
  });

  it('exports Prometheus text format', () => {
    const metrics = new MetricsService();
    metrics.track('fuxa_health_check', 5);
    const text = metrics.prometheusText();
    expect(text).toContain('fuxa_request_count');
    expect(text).toContain('fuxa_error_count');
  });
});
