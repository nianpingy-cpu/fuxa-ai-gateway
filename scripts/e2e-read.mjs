import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
    env: {
      ...process.env,
      FUXA_BASE_URL: 'http://localhost:1881',
    },
  });
  const client = new Client({ name: 'e2e-test', version: '0.0.1' });
  await client.connect(transport);

  console.log('=== fuxa_health_check ===');
  let r = await client.callTool({ name: 'fuxa_health_check', arguments: {} });
  console.log(text(r));

  console.log('=== fuxa_project_overview ===');
  r = await client.callTool({ name: 'fuxa_project_overview', arguments: {} });
  console.log(text(r));

  console.log('=== fuxa_list_devices ===');
  r = await client.callTool({ name: 'fuxa_list_devices', arguments: {} });
  console.log(text(r));

  console.log('=== fuxa_search_tags ===');
  r = await client.callTool({ name: 'fuxa_search_tags', arguments: { query: 'temp' } });
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
