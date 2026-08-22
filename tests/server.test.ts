import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { FuxaClient } from '../src/adapters/fuxa/client.js';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

function createMockClient(): FuxaClient {
  return {
    listProjects: vi.fn(async () => [{ id: 'p1', name: 'Demo Plant' }]),
    listDevices: vi.fn(async () => [
      {
        id: 'd1',
        name: 'Cooling Pump',
        type: 'internal',
        enabled: true,
        tagCount: 2,
        tags: [
          { id: 't1', name: 'temperature', type: 'number', address: 'temp', unit: 'C' },
          { id: 't2', name: 'pressure', type: 'number', address: 'press', unit: 'bar' },
        ],
      },
    ]),
    listTags: vi.fn(async () => [
      {
        id: 't1',
        name: 'temperature',
        unit: 'C',
        deviceId: 'd1',
        description: 'Cooling pump temperature',
      },
      {
        id: 't2',
        name: 'pressure',
        unit: 'bar',
        deviceId: 'd1',
        description: 'Cooling pump pressure',
      },
    ]),
    getHistory: vi.fn(async () => [
      { timestamp: '2026-01-01T00:00:00Z', value: 10 },
      { timestamp: '2026-01-01T00:01:00Z', value: 20 },
      { timestamp: '2026-01-01T00:02:00Z', value: 30 },
    ]),
  } as unknown as FuxaClient;
}

describe('MCP server', () => {
  let server: Server;
  let client: Client;

  beforeEach(async () => {
    const mcpServer = createServer(createMockClient());
    server = mcpServer.server;
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    await server.connect(serverSide);
    client = new Client({ name: 'test-client', version: '0.0.1' });
    await client.connect(clientSide);
  });

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  it('creates a server instance with a name and version', () => {
    const mcpServer = createServer(createMockClient());
    expect(mcpServer).toBeDefined();
    expect(mcpServer.server).toBeDefined();
  });

  it('registers the base health check tool', async () => {
    const tools = await client.listTools();
    const names = tools.tools.map((t) => t.name);
    expect(names).toContain('fuxa_health_check');
  });

  it('registers the project overview tool', async () => {
    const tools = await client.listTools();
    const names = tools.tools.map((t) => t.name);
    expect(names).toContain('fuxa_project_overview');
  });

  it('executes the health check tool', async () => {
    const result = await client.callTool({ name: 'fuxa_health_check', arguments: {} });
    const text = result.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('');
    expect(text).toContain('ok');
  });

  it('executes the project overview tool with real data', async () => {
    const result = await client.callTool({ name: 'fuxa_project_overview', arguments: {} });
    const text = result.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('');
    expect(text).toContain('Demo Plant');
  });

  it('registers the tag search tool', async () => {
    const tools = await client.listTools();
    const names = tools.tools.map((t) => t.name);
    expect(names).toContain('fuxa_search_tags');
  });

  it('executes the tag search tool with a natural-language query', async () => {
    const result = await client.callTool({
      name: 'fuxa_search_tags',
      arguments: { query: 'cooling pump temperature' },
    });
    const text = result.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('');
    expect(text).toContain('temperature');
  });

  it('registers the history analysis tool', async () => {
    const tools = await client.listTools();
    const names = tools.tools.map((t) => t.name);
    expect(names).toContain('fuxa_analyze_history');
  });

  it('executes the history analysis tool', async () => {
    const result = await client.callTool({
      name: 'fuxa_analyze_history',
      arguments: { tagId: 't1', from: '2026-01-01T00:00:00Z', to: '2026-01-01T00:03:00Z' },
    });
    const text = result.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('');
    expect(text).toContain('"mean":20');
  });

  it('registers the list devices tool', async () => {
    const tools = await client.listTools();
    const names = tools.tools.map((t) => t.name);
    expect(names).toContain('fuxa_list_devices');
  });

  it('executes the list devices tool', async () => {
    const result = await client.callTool({ name: 'fuxa_list_devices', arguments: {} });
    const text = result.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('');
    expect(text).toContain('Cooling Pump');
    expect(text).toContain('"tagCount":2');
  });

  it('registers the write tag value tool', async () => {
    const tools = await client.listTools();
    const names = tools.tools.map((t) => t.name);
    expect(names).toContain('fuxa_write_tag_value');
  });

  it('blocks the write tag value tool by default', async () => {
    const result = await client.callTool({
      name: 'fuxa_write_tag_value',
      arguments: {
        deviceId: 'd1',
        tagId: 't1',
        value: 42.5,
        approver: 'lead',
      },
    });
    const text = result.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('');
    expect(text).toContain('"allowed":false');
  });
});
