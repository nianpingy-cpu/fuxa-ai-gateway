import {
  DaqPoint,
  FuxaAlarm,
  FuxaConfig,
  FuxaProject,
  FuxaTag,
  HttpRequestOptions,
  HttpTransport,
} from './types.js';
import { FuxaAuth } from './auth.js';
import { ProjectApi } from './project.js';
import { TagApi } from './tags.js';
import { AlarmApi } from './alarms.js';
import { DaqApi } from './daq.js';

/**
 * FUXA API client. All HTTP access to FUXA goes through this adapter so that
 * business logic and tools never call HTTP directly.
 *
 * The client composes focused endpoint modules (project, tags, alarms, daq)
 * and an auth module, wiring them to a single transport that injects the
 * appropriate authentication headers on every request.
 */
export class FuxaClient {
  private readonly auth: FuxaAuth;
  private readonly projectApi: ProjectApi;
  private readonly tagApi: TagApi;
  private readonly alarmApi: AlarmApi;
  private readonly daqApi: DaqApi;

  constructor(config: FuxaConfig, transport: HttpTransport) {
    const baseUrl = config.baseUrl.replace(/\/$/, '');
    this.auth = new FuxaAuth(transport, baseUrl, {
      apiKey: config.apiKey,
      username: config.username,
      password: config.password,
    });

    const authedTransport: HttpTransport = {
      request: async <T>(options: HttpRequestOptions): Promise<T> => {
        const headers = await this.auth.ensureHeaders();
        return transport.request<T>({ ...options, headers: { ...headers, ...options.headers } });
      },
    };

    this.projectApi = new ProjectApi(authedTransport, baseUrl);
    this.tagApi = new TagApi(authedTransport, baseUrl);
    this.alarmApi = new AlarmApi(authedTransport, baseUrl);
    this.daqApi = new DaqApi(authedTransport, baseUrl);
  }

  getProject(id: string): Promise<FuxaProject> {
    return this.projectApi.getProject(id);
  }

  listProjects(): Promise<FuxaProject[]> {
    return this.projectApi.listProjects();
  }

  listTags(): Promise<FuxaTag[]> {
    return this.tagApi.listTags();
  }

  getTag(id: string): Promise<FuxaTag> {
    return this.tagApi.getTag(id);
  }

  listActiveAlarms(): Promise<FuxaAlarm[]> {
    return this.alarmApi.listActiveAlarms();
  }

  getAlarm(id: string): Promise<FuxaAlarm> {
    return this.alarmApi.getAlarm(id);
  }

  getHistory(tagId: string, from: string, to: string): Promise<DaqPoint[]> {
    return this.daqApi.getHistory(tagId, from, to);
  }
}
