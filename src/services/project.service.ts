import { FuxaClient } from '../adapters/fuxa/client.js';
import { NormalizedDevice } from '../adapters/fuxa/types.js';

export interface ProjectSummary {
  name: string;
  description?: string;
}

export interface DeviceSummary {
  id: string;
  name: string;
  type?: string;
  enabled?: boolean;
  tagCount: number;
}

export interface ProjectOverview {
  projects: ProjectSummary[];
  totalDevices: number;
  totalTags: number;
  devices: DeviceSummary[];
}

/**
 * Builds a compact overview of the FUXA project structure.
 */
export class ProjectService {
  private readonly client: FuxaClient;

  constructor(client: FuxaClient) {
    this.client = client;
  }

  async overview(): Promise<ProjectOverview> {
    const [projects, devices] = await Promise.all([
      this.client.listProjects(),
      this.client.listDevices(),
    ]);

    const totalTags = devices.reduce((sum, d) => sum + d.tagCount, 0);

    return {
      projects: projects.map((p) => ({
        name: p.name,
        description: p.description,
      })),
      totalDevices: devices.length,
      totalTags,
      devices: devices.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        enabled: d.enabled,
        tagCount: d.tagCount,
      })),
    };
  }

  async listDevices(): Promise<NormalizedDevice[]> {
    return this.client.listDevices();
  }
}
