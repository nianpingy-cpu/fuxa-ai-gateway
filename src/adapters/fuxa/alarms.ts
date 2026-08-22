import { FuxaAlarm, HttpTransport } from './types.js';

/**
 * FUXA alarm endpoints. GET /api/alarms returns the active alarms.
 */
export class AlarmApi {
  private readonly transport: HttpTransport;
  private readonly baseUrl: string;

  constructor(transport: HttpTransport, baseUrl: string) {
    this.transport = transport;
    this.baseUrl = baseUrl;
  }

  async listActiveAlarms(): Promise<FuxaAlarm[]> {
    const alarms = await this.transport.request<FuxaAlarm[]>({
      method: 'GET',
      url: `${this.baseUrl}/api/alarms`,
    });
    return Array.isArray(alarms) ? alarms : [];
  }

  async getAlarm(id: string): Promise<FuxaAlarm | undefined> {
    const alarms = await this.listActiveAlarms();
    return alarms.find((a) => a.id === id || a.name === id);
  }
}
