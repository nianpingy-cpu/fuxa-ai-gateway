import { FuxaClient } from '../adapters/fuxa/client.js';
import { DeviceGraph } from '../semantic/graph.js';

/**
 * Builds and queries the device relationship graph from FUXA data.
 *
 * Projects map to Plant nodes, tags map to Sensor nodes, and devices are
 * inferred from tag device references. A default root Plant is created when
 * no project data is present.
 */
export class DeviceGraphService {
  private readonly client: FuxaClient;

  constructor(client: FuxaClient) {
    this.client = client;
  }

  async build(): Promise<DeviceGraph> {
    const graph = new DeviceGraph();
    const [projects, tags] = await Promise.all([
      this.client.listProjects(),
      this.client.listTags(),
    ]);

    const rootId = projects[0]?.id ?? 'plant-root';
    graph.addNode({ id: rootId, name: projects[0]?.name ?? 'Plant', kind: 'plant' });

    const deviceIds = new Set<string>();
    for (const tag of tags) {
      if (tag.deviceId) {
        deviceIds.add(tag.deviceId);
      }
    }

    for (const deviceId of deviceIds) {
      graph.addNode({ id: deviceId, name: deviceId, kind: 'device' });
      graph.addEdge(rootId, deviceId);
    }

    for (const tag of tags) {
      graph.addNode({ id: tag.id, name: tag.name, kind: 'sensor' });
      if (tag.deviceId) {
        graph.addEdge(tag.deviceId, tag.id);
      } else {
        graph.addEdge(rootId, tag.id);
      }
    }

    return graph;
  }
}
