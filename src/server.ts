import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FuxaClient } from './adapters/fuxa/client.js';
import { HealthService } from './services/health.service.js';
import { ProjectService } from './services/project.service.js';
import { TagSearchService } from './services/tag-search.service.js';

export const SERVER_NAME = 'fuxa-ai-gateway';
export const SERVER_VERSION = '0.1.0';

/**
 * Create and configure the MCP server with its base tools.
 *
 * Tools delegate to services, which delegate to the FUXA adapter. No tool
 * calls HTTP directly.
 */
export function createServer(client: FuxaClient): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  const healthService = new HealthService(client);
  const projectService = new ProjectService(client);
  const tagSearchService = new TagSearchService(client);

  server.registerTool(
    'fuxa_health_check',
    {
      title: 'FUXA Health Check',
      description:
        'Check FUXA connectivity and gateway health. Read-only. Returns the current health status of the FUXA connection and the gateway.',
      inputSchema: z.object({}),
    },
    async () => {
      const status = await healthService.check();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(status),
          },
        ],
      };
    },
  );

  server.registerTool(
    'fuxa_project_overview',
    {
      title: 'FUXA Project Overview',
      description:
        'Summarize the FUXA project structure. Read-only. Returns an overview of the connected FUXA project.',
      inputSchema: z.object({}),
    },
    async () => {
      const overview = await projectService.overview();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(overview),
          },
        ],
      };
    },
  );

  server.registerTool(
    'fuxa_search_tags',
    {
      title: 'FUXA Tag Search',
      description:
        'Search FUXA tags by natural language. Read-only. Accepts a natural-language query such as "cooling pump temperature" and returns matching tags with device, variable, unit, and description.',
      inputSchema: {
        query: z.string().describe('Natural-language search query'),
      },
    },
    async ({ query }) => {
      const results = await tagSearchService.search(query);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results),
          },
        ],
      };
    },
  );

  return server;
}
