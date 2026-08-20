import { FuxaTag, HttpTransport } from './types.js';

/**
 * FUXA tag endpoints.
 */
export class TagApi {
  private readonly transport: HttpTransport;
  private readonly baseUrl: string;

  constructor(transport: HttpTransport, baseUrl: string) {
    this.transport = transport;
    this.baseUrl = baseUrl;
  }

  async listTags(): Promise<FuxaTag[]> {
    const response = await this.transport.request<{ data: FuxaTag[] }>({
      method: 'GET',
      url: `${this.baseUrl}/api/tags`,
    });
    return response.data;
  }

  async getTag(id: string): Promise<FuxaTag> {
    const response = await this.transport.request<{ data: FuxaTag }>({
      method: 'GET',
      url: `${this.baseUrl}/api/tags/${id}`,
    });
    return response.data;
  }
}
