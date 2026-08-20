import { FuxaClient } from '../adapters/fuxa/client.js';

export interface ProjectSummary {
  name: string;
  description?: string;
}

export interface ProjectOverview {
  projects: ProjectSummary[];
  totalTags: number;
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
    const [projects, tags] = await Promise.all([
      this.client.listProjects(),
      this.client.listTags(),
    ]);

    return {
      projects: projects.map((p) => ({
        name: p.name,
        description: p.description,
      })),
      totalTags: tags.length,
    };
  }
}
