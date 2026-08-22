/**
 * MCP prompts guiding the model toward consistent, safe responses for common
 * industrial tasks. All prompts reference the read-only nature of the gateway.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface PromptMessage {
  role: 'user' | 'assistant';
  content: { type: 'text'; text: string };
}

export interface PromptDefinition {
  name: string;
  description: string;
  messages: PromptMessage[];
}

export function createPrompts(): PromptDefinition[] {
  return [
    {
      name: 'diagnose_alarm',
      description: 'Diagnose an active alarm using the read-only alarm analysis tool.',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Use the read-only alarm analysis tool to diagnose the reported alarm. Summarize the alarm, related device, and history, and suggest next steps. Do not write to the plant.',
          },
        },
      ],
    },
    {
      name: 'daily_report',
      description: 'Generate a daily operations report from read-only project and tag data.',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Use the read-only tools to gather project overview, tag states, and history summaries. Produce a concise daily operations report. Do not write to the plant.',
          },
        },
      ],
    },
    {
      name: 'maintenance_report',
      description: 'Generate a maintenance report using read-only equipment diagnosis.',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Use the read-only equipment diagnosis tool to assess equipment health. Produce a maintenance report with health, causes, and suggestions. Do not write to the plant.',
          },
        },
      ],
    },
  ];
}

/**
 * Register all prompts on the MCP server.
 */
export function registerPrompts(server: McpServer): void {
  for (const prompt of createPrompts()) {
    server.prompt(prompt.name, prompt.description, async () => ({
      messages: prompt.messages,
    }));
  }
}
