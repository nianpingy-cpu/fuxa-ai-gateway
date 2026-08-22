// Direct FUXA write test: add a Simulation device with a tag.
const BASE = 'http://localhost:1881';

const device = {
  id: 'dev-cooling-pump',
  name: 'Cooling Pump',
  type: 'Simulation',
  enabled: true,
  property: {},
  tags: {
    temperature: { id: 'temperature', name: 'temperature', type: 'number', address: 'temperature' },
    pressure: { id: 'pressure', name: 'pressure', type: 'number', address: 'pressure' },
  },
};

async function main() {
  // 1. Read current project
  const before = await (await fetch(`${BASE}/api/project`)).json();
  console.log('devices before:', Object.keys(before.devices || {}));

  // 2. Add device
  const res = await fetch(`${BASE}/api/projectData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: 'set-device', data: device }),
  });
  console.log('write status:', res.status);
  if (!res.ok) {
    console.log('write body:', await res.text());
    process.exit(1);
  }

  // 3. Verify
  await new Promise((r) => setTimeout(r, 2000));
  const after = await (await fetch(`${BASE}/api/project`)).json();
  console.log('devices after:', Object.keys(after.devices || {}));
  if (after.devices && after.devices['dev-cooling-pump']) {
    console.log('ADDED SUCCESSFULLY:', after.devices['dev-cooling-pump'].name);
  }
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
