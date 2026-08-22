/**
 * In-memory monitoring metrics in Prometheus style. Tracks request count,
 * latency, error count, and per-tool usage.
 */

export interface MetricsSummary {
  requestCount: number;
  errorCount: number;
  totalLatencyMs: number;
  toolUsage: Record<string, number>;
}

export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalLatencyMs = 0;
  private readonly toolUsage = new Map<string, number>();

  /**
   * Record a tool invocation with its latency in milliseconds.
   */
  track(tool: string, latencyMs: number): void {
    this.requestCount += 1;
    this.totalLatencyMs += latencyMs;
    this.toolUsage.set(tool, (this.toolUsage.get(tool) ?? 0) + 1);
  }

  recordError(): void {
    this.errorCount += 1;
  }

  summary(): MetricsSummary {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      totalLatencyMs: this.totalLatencyMs,
      toolUsage: Object.fromEntries(this.toolUsage),
    };
  }

  /**
   * Export metrics in Prometheus text exposition format.
   */
  prometheusText(): string {
    const s = this.summary();
    const lines: string[] = [];
    lines.push('# HELP fuxa_request_count Total tool requests.');
    lines.push('# TYPE fuxa_request_count counter');
    lines.push(`fuxa_request_count ${s.requestCount}`);
    lines.push('# HELP fuxa_error_count Total tool errors.');
    lines.push('# TYPE fuxa_error_count counter');
    lines.push(`fuxa_error_count ${s.errorCount}`);
    lines.push('# HELP fuxa_latency_ms_total Total tool latency in ms.');
    lines.push('# TYPE fuxa_latency_ms_total counter');
    lines.push(`fuxa_latency_ms_total ${s.totalLatencyMs}`);
    lines.push('# HELP fuxa_tool_usage Per-tool invocation count.');
    lines.push('# TYPE fuxa_tool_usage counter');
    for (const [tool, count] of Object.entries(s.toolUsage)) {
      lines.push(`fuxa_tool_usage{tool="${tool}"} ${count}`);
    }
    return lines.join('\n');
  }
}
