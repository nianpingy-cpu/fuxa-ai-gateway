import { FuxaProject, HttpTransport } from './types.js';

/**
 * FUXA project endpoints.
 */
export class ProjectApi {
  private readonly transport: HttpTransport;
  private readonly baseUrl: string;

  constructor(transport: HttpTransport, baseUrl: string) {
    this.transport = transport;
    this.baseUrl = baseUrl;
  }

  async getProject(id: string): Promise<FuxaProject> {
    const response = await this.transport.request<{ data: FuxaProject }>({
      method: 'GET',
      url: `${this.baseUrl}/api/project/${id}`,
    });
    return response.data;
  }

  async listProjects(): Promise<FuxaProject[]> {
    const response = await this.transport.request<{ data: FuxaProject[] }>({
      method: 'GET',
      url: `${this.baseUrl}/api/projects`,
    });
    return response.data;
  }
}
