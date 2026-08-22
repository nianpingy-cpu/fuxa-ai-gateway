import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FuxaClient } from './adapters/fuxa/client.js';
import { HealthService } from './services/health.service.js';
import { ProjectService } from './services/project.service.js';
import { TagSearchService } from './services/tag-search.service.js';
import { HistoryService } from './services/history.service.js';
import { ComparisonService } from './services/comparison.service.js';
import { AlarmService } from './services/alarm.service.js';
import { DiagnosisService } from './services/diagnosis.service.js';
import { registerPrompts } from './prompts/index.js';

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

  registerPrompts(server);

  const healthService = new HealthService(client);
  const projectService = new ProjectService(client);
  const tagSearchService = new TagSearchService(client);
  const historyService = new HistoryService(client);
  const comparisonService = new ComparisonService(client);
  const alarmService = new AlarmService(client);
  const diagnosisService = new DiagnosisService(client);

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

  server.registerTool(
    'fuxa_analyze_history',
    {
      title: 'FUXA History Analysis',
      description:
        'Analyze historical data for a tag. Read-only. Returns a compact summary with mean, max, min, trend, and anomaly. Aggregates data rather than returning raw points.',
      inputSchema: {
        tagId: z.string().describe('Tag id to analyze'),
        from: z.string().describe('Start time (ISO 8601)'),
        to: z.string().describe('End time (ISO 8601)'),
      },
    },
    async ({ tagId, from, to }) => {
      const analysis = await historyService.analyze(tagId, from, to);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysis),
          },
        ],
      };
    },
  );

  server.registerTool(
    'fuxa_compare_periods',
    {
      title: 'FUXA Period Comparison',
      description:
        'Compare two time periods (e.g. today vs yesterday) for a tag. Read-only. Returns statistics for each period and the deltas between them.',
      inputSchema: {
        tagId: z.string().describe('Tag id to compare'),
        from1: z.string().describe('Start of first period (ISO 8601)'),
        to1: z.string().describe('End of first period (ISO 8601)'),
        from2: z.string().describe('Start of second period (ISO 8601)'),
        to2: z.string().describe('End of second period (ISO 8601)'),
      },
    },
    async ({ tagId, from1, to1, from2, to2 }) => {
      const result = await comparisonService.compare(tagId, from1, to1, from2, to2);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  server.registerTool(
    'fuxa_alarm_analysis',
    {
      title: 'FUXA Alarm Analysis',
      description:
        'Analyze an alarm. Read-only. Walks Alarm -> Device -> Related Tags -> History -> Diagnosis and returns a diagnosis.',
      inputSchema: {
        alarmId: z.string().describe('Alarm id to analyze'),
      },
    },
    async ({ alarmId }) => {
      const result = await alarmService.analyze(alarmId);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  server.registerTool(
    'fuxa_diagnose_equipment',
    {
      title: 'FUXA Equipment Diagnosis',
      description:
        'Diagnose equipment health. Read-only. Combines current state, history, and alarms to return health, causes, and suggestions.',
      inputSchema: {
        deviceId: z.string().describe('Device id to diagnose'),
      },
    },
    async ({ deviceId }) => {
      const result = await diagnosisService.diagnose(deviceId);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  return server;
}
