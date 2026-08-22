import { FuxaTag, HttpTransport, NormalizedDevice, NormalizedTag, RawFuxaProject } from './types.js';

/**
 * FUXA tag endpoints. FUXA does not expose a standalone tag API; tags are
 * nested inside project devices. This module reads the project and extracts
 * tags.
 */
export class TagApi {
  private readonly transport: HttpTransport;
  private readonly baseUrl: string;

  constructor(transport: HttpTransport, baseUrl: string) {
    this.transport = transport;
    this.baseUrl = baseUrl;
  }

  async getProject(): Promise<RawFuxaProject> {
    return this.transport.request<RawFuxaProject>({
      method: 'GET',
      url: `${this.baseUrl}/api/project`,
    });
  }

  async listTags(): Promise<FuxaTag[]> {
    const raw = await this.getProject();
    return extractTags(raw);
  }

  async getTag(id: string): Promise<FuxaTag | undefined> {
    const tags = await this.listTags();
    return tags.find((t) => t.id === id);
  }
}

export function extractTags(raw: RawFuxaProject): FuxaTag[] {
  const tags: FuxaTag[] = [];
  const devices = raw.devices ?? {};
  for (const [deviceId, device] of Object.entries(devices)) {
    const deviceTags = device.tags ?? {};
    for (const [tagId, tag] of Object.entries(deviceTags)) {
      const t = (tag ?? {}) as { name?: string; unit?: string; description?: string };
      tags.push({
        id: tagId,
        name: t.name ?? tagId,
        unit: t.unit,
        deviceId,
        description: t.description,
      });
    }
  }
  return tags;
}

/**
 * Extract the normalized device tree (devices and their bound tags) from a
 * raw FUXA project. Unlike extractTags, this preserves the full device
 * structure so tools can surface all device information.
 */
export function extractDevices(raw: RawFuxaProject): NormalizedDevice[] {
  const devices = raw.devices ?? {};
  return Object.entries(devices).map(([id, device]) => {
    const tags: NormalizedTag[] = Object.entries(device.tags ?? {}).map(
      ([tagId, tag]) => {
        const t = (tag ?? {}) as {
          name?: string;
          type?: string;
          address?: string;
          unit?: string;
        };
        return {
          id: tagId,
          name: t.name ?? tagId,
          type: t.type,
          address: t.address,
          unit: t.unit,
        };
      },
    );
    return {
      id,
      name: device.name ?? id,
      type: device.type,
      enabled: device.enabled,
      tagCount: tags.length,
      tags,
    };
  });
}
