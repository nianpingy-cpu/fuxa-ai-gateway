// Test adding dev-feed-pump directly to isolate the 400.
const BASE = 'http://localhost:1881';

const device = {
  id: 'dev-feed-pump',
  name: 'Feed Pump',
  type: 'Simulation',
  enabled: true,
  property: {},
  tags: {
    flow: { id: 'flow', name: 'flow', type: 'number', address: 'flow' },
  },
};

async function main() {
  const res = await fetch(`${BASE}/api/projectData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: 'set-device', data: device }),
  });
  console.log('status:', res.status);
  console.log('body:', await res.text());
}

main().catch((e) => {
  console.error('FAILED:', e.message);
});
