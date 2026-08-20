import { FuxaClient } from '../adapters/fuxa/client.js';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  gateway: string;
  fuxa: 'connected' | 'unavailable';
}

/**
 * Reports gateway and FUXA connectivity health.
 */
export class HealthService {
  private readonly client: FuxaClient;

  constructor(client: FuxaClient) {
    this.client = client;
  }

  async check(): Promise<HealthStatus> {
    try {
      await this.client.listProjects();
      return { status: 'ok', gateway: 'ready', fuxa: 'connected' };
    } catch {
      return { status: 'degraded', gateway: 'ready', fuxa: 'unavailable' };
    }
  }
}
