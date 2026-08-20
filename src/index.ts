import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { loadConfig } from './config.js';
import { FuxaClient } from './adapters/fuxa/client.js';
import { FetchTransport } from './adapters/fuxa/transport.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const transport = new FetchTransport();
  const client = new FuxaClient(config, transport);
  const server = createServer(client);
  const stdio = new StdioServerTransport();
  await server.connect(stdio);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Failed to start server: ${message}\n`);
  process.exit(1);
});
