import { FuxaClient } from '../adapters/fuxa/client.js';
import { HistoryAnalyzer, HistoryAnalysis } from '../analytics/analyzer.js';

/**
 * Fetches historical data and returns a compact analysis summary.
 */
export class HistoryService {
  private readonly client: FuxaClient;

  constructor(client: FuxaClient) {
    this.client = client;
  }

  async analyze(tagId: string, from: string, to: string): Promise<HistoryAnalysis> {
    const points = await this.client.getHistory(tagId, from, to);
    return HistoryAnalyzer.analyze(points);
  }
}
