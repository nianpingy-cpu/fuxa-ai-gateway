import { FuxaClient } from '../adapters/fuxa/client.js';
import { HistoryAnalyzer, HistoryAnalysis } from '../analytics/analyzer.js';

export interface PeriodStats {
  mean: number;
  max: number;
  min: number;
}

export interface ComparisonResult {
  period1: PeriodStats;
  period2: PeriodStats;
  delta: PeriodStats;
}

/**
 * Compares two time periods (e.g. today vs yesterday) for a tag and reports
 * the statistics of each period plus the deltas between them.
 */
export class ComparisonService {
  private readonly client: FuxaClient;

  constructor(client: FuxaClient) {
    this.client = client;
  }

  async compare(
    tagId: string,
    from1: string,
    to1: string,
    from2: string,
    to2: string,
  ): Promise<ComparisonResult> {
    const [points1, points2] = await Promise.all([
      this.client.getHistory(tagId, from1, to1),
      this.client.getHistory(tagId, from2, to2),
    ]);

    const analysis1 = HistoryAnalyzer.analyze(points1);
    const analysis2 = HistoryAnalyzer.analyze(points2);

    const period1 = toStats(analysis1);
    const period2 = toStats(analysis2);

    return {
      period1,
      period2,
      delta: {
        mean: period2.mean - period1.mean,
        max: period2.max - period1.max,
        min: period2.min - period1.min,
      },
    };
  }
}

function toStats(analysis: HistoryAnalysis): PeriodStats {
  return { mean: analysis.mean, max: analysis.max, min: analysis.min };
}
