import { readFileSync } from 'fs';

const res = await fetch('http://localhost:1881/api/project');
const project = await res.json();
console.log('top-level keys:', Object.keys(project).join(', '));
console.log('version:', project.version, '| server:', JSON.stringify(project.server));

const devices = project.devices ?? {};
const deviceIds = Object.keys(devices);
console.log('\nDEVICE COUNT:', deviceIds.length);
for (const id of deviceIds) {
  const d = devices[id];
  const tagKeys = Object.keys(d.tags ?? {});
  console.log(`  - [${id}] name=${d.name} type=${d.type} enabled=${d.enabled} tags=${tagKeys.length}`);
  // show a sample tag structure
  if (tagKeys.length) {
    const first = d.tags[tagKeys[0]];
    console.log('      sample tag keys:', Object.keys(first ?? {}).join(','));
    console.log('      sample tag:', JSON.stringify(first).slice(0, 300));
  }
}

// total tags
let totalTags = 0;
for (const id of deviceIds) totalTags += Object.keys(devices[id].tags ?? {}).length;
console.log('\nTOTAL TAGS:', totalTags);
console.log('HMI views:', (project.hmi?.views ?? []).length);
