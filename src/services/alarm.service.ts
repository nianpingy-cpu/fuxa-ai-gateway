import { FuxaClient } from '../adapters/fuxa/client.js';
import { HistoryAnalyzer } from '../analytics/analyzer.js';

export interface AlarmDiagnosis {
  alarm: {
    id: string;
    name: string;
    severity?: string;
    message?: string;
  };
  device?: string;
  relatedTags: string[];
  history: {
    mean: number;
    max: number;
    min: number;
    trend: 'up' | 'down' | 'flat';
    anomaly: boolean;
  };
  diagnosis: string;
}

/**
 * Walks Alarm -> Device -> Related Tags -> History -> Diagnosis to produce an
 * alarm analysis.
 */
export class AlarmService {
  private readonly client: FuxaClient;

  constructor(client: FuxaClient) {
    this.client = client;
  }

  async analyze(alarmId: string): Promise<AlarmDiagnosis> {
    const alarm = await this.client.getAlarm(alarmId);
    if (!alarm) {
      throw new Error(`Alarm not found: ${alarmId}`);
    }
    const relatedTags: string[] = [];
    if (alarm.tagId) {
      relatedTags.push(alarm.tagId);
    }

    let history: AlarmDiagnosis['history'] = {
      mean: 0,
      max: 0,
      min: 0,
      trend: 'flat',
      anomaly: false,
    };
    if (alarm.tagId) {
      const tag = await this.client.getTag(alarm.tagId);
      if (tag) {
        const points = await this.client.getHistory(
          alarm.tagId,
          '2026-01-01T00:00:00Z',
          '2026-01-02T00:00:00Z',
        );
        history = HistoryAnalyzer.analyze(points);
      }
    }

    const diagnosis = buildDiagnosis(alarm.name, history);

    return {
      alarm: {
        id: alarm.id,
        name: alarm.name,
        severity: alarm.severity,
        message: alarm.message,
      },
      device: alarm.deviceId,
      relatedTags,
      history,
      diagnosis,
    };
  }
}

function buildDiagnosis(
  alarmName: string,
  history: { trend: 'up' | 'down' | 'flat'; anomaly: boolean; max: number },
): string {
  if (history.anomaly) {
    return `${alarmName}: anomalous reading detected (max ${history.max}). Investigate the related device.`;
  }
  if (history.trend === 'up') {
    return `${alarmName}: value trending upward. Monitor closely.`;
  }
  return `${alarmName}: no clear anomaly in history. Review device state.`;
}
