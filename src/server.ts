import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export const SERVER_NAME = 'fuxa-ai-gateway';
export const SERVER_VERSION = '0.1.0';

/**
 * Create and configure the MCP server with its base tools.
 *
 * Issue #3 will add the full tool set. This issue establishes the server
 * lifecycle and the first two tools.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  server.registerTool(
    'fuxa_health_check',
    {
      title: 'FUXA Health Check',
      description:
        'Check FUXA connectivity and gateway health. Read-only. Returns the current health status of the FUXA connection and the gateway.',
      inputSchema: z.object({}),
    },
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ status: 'ok', gateway: 'ready' }),
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
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ project: 'unknown', devices: 0, tags: 0 }),
          },
        ],
      };
    },
  );

  return server;
}
