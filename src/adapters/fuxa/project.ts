import { FuxaProject, HttpTransport, RawFuxaProject } from './types.js';

/**
 * FUXA project endpoints.
 *
 * FUXA exposes a single project. GET /api/project returns the full project
 * JSON, and POST /api/projectData applies targeted changes.
 */
export class ProjectApi {
  private readonly transport: HttpTransport;
  private readonly baseUrl: string;

  constructor(transport: HttpTransport, baseUrl: string) {
    this.transport = transport;
    this.baseUrl = baseUrl;
  }

  async getProject(): Promise<FuxaProject> {
    const raw = await this.transport.request<RawFuxaProject>({
      method: 'GET',
      url: `${this.baseUrl}/api/project`,
    });
    return normalizeProject(raw);
  }

  async listProjects(): Promise<FuxaProject[]> {
    return [await this.getProject()];
  }

  /**
   * Apply a targeted project change (e.g. add/remove a device).
   */
  async setProjectData(cmd: string, data: unknown): Promise<void> {
    await this.transport.request<unknown>({
      method: 'POST',
      url: `${this.baseUrl}/api/projectData`,
      body: { cmd, data },
    });
  }
}

function normalizeProject(raw: RawFuxaProject): FuxaProject {
  const name =
    raw.server && typeof raw.server === 'object'
      ? (raw.server as { name?: string }).name
      : undefined;
  return {
    id: 'project',
    name: name ?? 'FUXA Project',
    description: undefined,
    raw,
  };
}
