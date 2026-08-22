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
import { DeviceWriteService } from './services/device-write.service.js';
import { DeviceValueWriteService } from './services/device-value-write.service.js';
import { registerPrompts } from './prompts/index.js';
import { MetricsService } from './monitoring/metrics.js';
import { ApprovalService } from './security/approval.js';
import { AuditLog } from './security/audit.js';

export const SERVER_NAME = 'fuxa-ai-gateway';
export const SERVER_VERSION = '0.1.0';

export interface ServerOptions {
  writeEnabled?: boolean;
}

/**
 * Create and configure the MCP server with its base tools.
 *
 * Tools delegate to services, which delegate to the FUXA adapter. No tool
 * calls HTTP directly. Write operations are disabled by default.
 */
export function createServer(client: FuxaClient, options: ServerOptions = {}): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerPrompts(server);

  const metrics = new MetricsService();
  const audit = new AuditLog();
  const approval = new ApprovalService(options.writeEnabled ?? false);

  const healthService = new HealthService(client);
  const projectService = new ProjectService(client);
  const tagSearchService = new TagSearchService(client);
  const historyService = new HistoryService(client);
  const comparisonService = new ComparisonService(client);
  const alarmService = new AlarmService(client);
  const diagnosisService = new DiagnosisService(client);
  const deviceWriteService = new DeviceWriteService(client, approval, audit);
  const deviceValueWriteService = new DeviceValueWriteService(client, approval, audit);

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
    'fuxa_list_devices',
    {
      title: 'FUXA List Devices',
      description:
        'List all FUXA devices with their bound tags. Read-only. Returns the full device tree including device id, name, type, enabled state, and each device\u2019s tags (id, name, type, address, unit).',
      inputSchema: z.object({}),
    },
    async () => {
      const devices = await projectService.listDevices();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(devices),
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

  server.registerTool(
    'fuxa_metrics',
    {
      title: 'FUXA Gateway Metrics',
      description:
        'Return gateway monitoring metrics in Prometheus text format. Read-only. Includes request count, latency, error count, and tool usage.',
      inputSchema: z.object({}),
    },
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: metrics.prometheusText(),
          },
        ],
      };
    },
  );

  server.registerTool(
    'fuxa_add_device',
    {
      title: 'FUXA Add Device',
      description:
        'Add a device to the FUXA project. WRITE operation. Disabled by default; requires write to be enabled and an approver. Records an audit entry.',
      inputSchema: {
        device: z
          .object({
            id: z.string().describe('Device id'),
            name: z.string().describe('Device name'),
            type: z.string().optional().describe('Device type'),
          })
          .passthrough(),
        approver: z.string().describe('Approver identity for the write operation'),
      },
    },
    async ({ device, approver }) => {
      const result = await deviceWriteService.addDevice(device, approver);
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
    'fuxa_write_tag_value',
    {
      title: 'FUXA Write Tag Value',
      description:
        'Write a runtime value to a tag bound to a device (e.g. set a pump on/off or a setpoint). WRITE operation. Disabled by default; requires write to be enabled and an approver. Records an audit entry.',
      inputSchema: {
        deviceId: z.string().describe('Device id that owns the tag'),
        tagId: z.string().describe('Tag id to write'),
        value: z.union([z.number(), z.string(), z.boolean()]).describe('Value to write'),
        approver: z.string().describe('Approver identity for the write operation'),
      },
    },
    async ({ deviceId, tagId, value, approver }) => {
      const result = await deviceValueWriteService.writeTagValue(
        deviceId,
        tagId,
        value,
        approver,
      );
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
