import { DaqPoint, HttpTransport } from './types.js';

/**
 * FUXA DAQ (historical data) endpoints.
 *
 * Real FUXA: GET /api/daq?query={"sids":[...],"from":..,"to":..} returns an
 * array of per-sid point arrays.
 */
export class DaqApi {
  private readonly transport: HttpTransport;
  private readonly baseUrl: string;

  constructor(transport: HttpTransport, baseUrl: string) {
    this.transport = transport;
    this.baseUrl = baseUrl;
  }

  async getHistory(tagId: string, from: string, to: string): Promise<DaqPoint[]> {
    const query = JSON.stringify({ sids: [tagId], from, to });
    const params = new URLSearchParams({ query });
    const response = await this.transport.request<DaqPoint[][]>({
      method: 'GET',
      url: `${this.baseUrl}/api/daq?${params.toString()}`,
    });
    return response[0] ?? [];
  }
}
