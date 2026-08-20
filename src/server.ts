import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FuxaClient } from './adapters/fuxa/client.js';
import { HealthService } from './services/health.service.js';
import { ProjectService } from './services/project.service.js';

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

  return server;
}
