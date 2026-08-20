import { DaqPoint, HttpTransport } from './types.js';

/**
 * FUXA DAQ (historical data) endpoints.
 */
export class DaqApi {
  private readonly transport: HttpTransport;
  private readonly baseUrl: string;

  constructor(transport: HttpTransport, baseUrl: string) {
    this.transport = transport;
    this.baseUrl = baseUrl;
  }

  async getHistory(tagId: string, from: string, to: string): Promise<DaqPoint[]> {
    const params = new URLSearchParams({ from, to });
    const response = await this.transport.request<{ data: DaqPoint[] }>({
      method: 'GET',
      url: `${this.baseUrl}/api/daq/${tagId}?${params.toString()}`,
    });
    return response.data;
  }
}
