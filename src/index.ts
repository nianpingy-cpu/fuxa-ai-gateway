import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { loadConfig } from './config.js';
import { FuxaClient } from './adapters/fuxa/client.js';
import { FetchTransport } from './adapters/fuxa/transport.js';
import { SocketIoValueWriter } from './adapters/fuxa/value-writer.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const transport = new FetchTransport();
  const valueWriter = new SocketIoValueWriter(config.baseUrl);
  const client = new FuxaClient(config, transport, valueWriter);
  const writeEnabled = (process.env['FUXA_WRITE_ENABLED'] ?? 'false').toLowerCase() === 'true';
  const server = createServer(client, { writeEnabled });
  const stdio = new StdioServerTransport();
  await server.connect(stdio);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Failed to start server: ${message}\n`);
  process.exit(1);
});
