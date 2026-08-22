import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const WRITE_ENABLED = process.env.WRITE_ENABLED === '1';

async function main() {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
    env: {
      ...process.env,
      FUXA_BASE_URL: 'http://localhost:1881',
      FUXA_WRITE_ENABLED: WRITE_ENABLED ? 'true' : 'false',
    },
  });
  const client = new Client({ name: 'e2e-write', version: '0.0.1' });
  await client.connect(transport);

  const device = {
    id: 'dev-air-compressor',
    name: 'Air Compressor',
    type: 'Simulation',
    enabled: true,
    property: {},
    tags: {
      pressure: { id: 'pressure', name: 'pressure', type: 'number', address: 'pressure' },
    },
  };

  console.log(`=== fuxa_add_device (writeEnabled=${WRITE_ENABLED}) ===`);
  const r = await client.callTool({
    name: 'fuxa_add_device',
    arguments: { device, approver: 'operator-1' },
  });
  console.log(text(r));

  await client.close();
}

function text(result) {
  return result.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('');
}

main().catch((e) => {
  console.error('E2E FAILED:', e);
  process.exit(1);
});
