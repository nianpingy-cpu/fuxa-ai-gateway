import { FuxaAlarm, HttpTransport } from './types.js';

/**
 * FUXA alarm endpoints.
 */
export class AlarmApi {
  private readonly transport: HttpTransport;
  private readonly baseUrl: string;

  constructor(transport: HttpTransport, baseUrl: string) {
    this.transport = transport;
    this.baseUrl = baseUrl;
  }

  async listActiveAlarms(): Promise<FuxaAlarm[]> {
    const response = await this.transport.request<{ data: FuxaAlarm[] }>({
      method: 'GET',
      url: `${this.baseUrl}/api/alarms/active`,
    });
    return response.data;
  }

  async getAlarm(id: string): Promise<FuxaAlarm> {
    const response = await this.transport.request<{ data: FuxaAlarm }>({
      method: 'GET',
      url: `${this.baseUrl}/api/alarms/${id}`,
    });
    return response.data;
  }
}
