import { FuxaClient } from '../adapters/fuxa/client.js';
import { HistoryAnalyzer } from '../analytics/analyzer.js';

export interface EquipmentDiagnosis {
  health: 'healthy' | 'warning' | 'critical';
  causes: string[];
  suggestions: string[];
}

/**
 * Diagnoses equipment by combining current state, history, and alarms.
 */
export class DiagnosisService {
  private readonly client: FuxaClient;

  constructor(client: FuxaClient) {
    this.client = client;
  }

  async diagnose(deviceId: string): Promise<EquipmentDiagnosis> {
    const [tags, alarms] = await Promise.all([
      this.client.listTags(),
      this.client.listActiveAlarms(),
    ]);

    const deviceTags = tags.filter((t) => t.deviceId === deviceId);
    const deviceAlarms = alarms.filter((a) => a.deviceId === deviceId);

    const causes: string[] = [];
    let anomalyCount = 0;

    for (const tag of deviceTags) {
      const points = await this.client.getHistory(
        tag.id,
        '2026-01-01T00:00:00Z',
        '2026-01-02T00:00:00Z',
      );
      const analysis = HistoryAnalyzer.analyze(points);
      if (analysis.anomaly) {
        anomalyCount += 1;
        causes.push(`Anomalous reading on tag ${tag.name}`);
      }
    }

    for (const alarm of deviceAlarms) {
      causes.push(`Active alarm: ${alarm.name}`);
    }

    const health = determineHealth(deviceAlarms.length, anomalyCount);
    const suggestions = buildSuggestions(health);

    return { health, causes, suggestions };
  }
}

function determineHealth(
  alarmCount: number,
  anomalyCount: number,
): 'healthy' | 'warning' | 'critical' {
  if (alarmCount > 0) {
    return 'critical';
  }
  if (anomalyCount > 0) {
    return 'warning';
  }
  return 'healthy';
}

function buildSuggestions(health: 'healthy' | 'warning' | 'critical'): string[] {
  if (health === 'healthy') {
    return ['No action required. Equipment operating normally.'];
  }
  if (health === 'warning') {
    return ['Investigate anomalous readings.', 'Monitor equipment closely.'];
  }
  return ['Address active alarms immediately.', 'Inspect the equipment on site.'];
}
