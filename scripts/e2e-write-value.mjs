import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Verifies the write-data-to-device capability (fuxa_write_tag_value).
// Controlled by WRITE_ENABLED: when false the write must be blocked, when true
// it must be allowed and delivered to FUXA.

const WRITE_ENABLED = (process.env.WRITE_ENABLED ?? 'false').toLowerCase() === 'true';

async function main() {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
    env: {
      ...process.env,
      FUXA_BASE_URL: 'http://localhost:1881',
      FUXA_WRITE_ENABLED: String(WRITE_ENABLED),
    },
  });
  const client = new Client({ name: 'e2e-write-value', version: '0.0.1' });
  await client.connect(transport);

  console.log('WRITE_ENABLED =', WRITE_ENABLED);
  console.log('=== fuxa_write_tag_value (dev-hex-1.supplyT = 88.5) ===');
  const r = await client.callTool({
    name: 'fuxa_write_tag_value',
    arguments: {
      deviceId: 'dev-hex-1',
      tagId: 'supplyT',
      value: 88.5,
      approver: 'engineering-lead',
    },
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
