import { readFileSync } from 'fs';

// Reproduce a realistic heat-exchange station (换热站监控系统) project in FUXA,
// matching the devices/tags shown in the live dashboard screenshot.
// Uses the proven set-device command via /api/projectData.

const BASE = process.env.FUXA_BASE_URL ?? 'http://localhost:1881';

function tag(id, name, type = 'number', address, unit) {
  const t = { id, name, type, address: address ?? id };
  if (unit) t.unit = unit;
  return t;
}

// Devices: [id, name, type, {tagId: tag}]
// 'internal' is a valid FUXA device type (no external hardware needed).
const devices = {
  'dev-mp-1': { id: 'dev-mp-1', name: 'NO.1补水泵', type: 'internal', enabled: true,
    tags: {
      onoff: tag('onoff', '运行状态', 'bool', 'onoff'),
      freq: tag('freq', '补水泵频率', 'number', 'freq', 'Hz'),
      cur: tag('cur', '补水泵电流', 'number', 'cur', 'A'),
      energy: tag('energy', '补水泵耗电', 'number', 'energy', 'KWh'),
    } },
  'dev-mp-2': { id: 'dev-mp-2', name: 'NO.2补水泵', type: 'internal', enabled: true,
    tags: {
      onoff: tag('onoff', '运行状态', 'bool', 'onoff'),
      freq: tag('freq', '补水泵频率', 'number', 'freq', 'Hz'),
      cur: tag('cur', '补水泵电流', 'number', 'cur', 'A'),
      energy: tag('energy', '补水泵耗电', 'number', 'energy', 'KWh'),
    } },
  'dev-cp-1': { id: 'dev-cp-1', name: 'NO.1循环泵', type: 'internal', enabled: true,
    tags: {
      onoff: tag('onoff', '运行状态', 'bool', 'onoff'),
      freq: tag('freq', '循环泵频率', 'number', 'freq', 'Hz'),
      cur: tag('cur', '循环泵电流', 'number', 'cur', 'A'),
      energy: tag('energy', '循环泵耗电', 'number', 'energy', 'KWh'),
    } },
  'dev-cp-2': { id: 'dev-cp-2', name: 'NO.2循环泵', type: 'internal', enabled: true,
    tags: {
      onoff: tag('onoff', '运行状态', 'bool', 'onoff'),
      freq: tag('freq', '循环泵频率', 'number', 'freq', 'Hz'),
      cur: tag('cur', '循环泵电流', 'number', 'cur', 'A'),
      energy: tag('energy', '循环泵耗电', 'number', 'energy', 'KWh'),
    } },
  'dev-hex-1': { id: 'dev-hex-1', name: '1#换热器', type: 'internal', enabled: true,
    tags: {
      supplyT: tag('supplyT', '供水温度', 'number', 'supplyT', '℃'),
      returnT: tag('returnT', '回水温度', 'number', 'returnT', '℃'),
      flow: tag('flow', '瞬时流量', 'number', 'flow', 'm3/h'),
      heat: tag('heat', '瞬时热量', 'number', 'heat', 'GJ'),
    } },
  'dev-hex-2': { id: 'dev-hex-2', name: '2#换热器', type: 'internal', enabled: true,
    tags: {
      supplyT: tag('supplyT', '供水温度', 'number', 'supplyT', '℃'),
      returnT: tag('returnT', '回水温度', 'number', 'returnT', '℃'),
      flow: tag('flow', '瞬时流量', 'number', 'flow', 'm3/h'),
      heat: tag('heat', '瞬时热量', 'number', 'heat', 'GJ'),
    } },
  'dev-well-pump': { id: 'dev-well-pump', name: '深井泵', type: 'internal', enabled: true,
    tags: {
      onoff: tag('onoff', '运行状态', 'bool', 'onoff'),
      freq: tag('freq', '深井泵频率', 'number', 'freq', 'Hz'),
    } },
  'dev-tank': { id: 'dev-tank', name: '水箱', type: 'internal', enabled: true,
    tags: {
      level: tag('level', '水箱液位', 'number', 'level', '%'),
      makeupLevel: tag('makeupLevel', '补水液位', 'number', 'makeupLevel', '%'),
    } },
};

async function main() {
  let added = 0;
  for (const device of Object.values(devices)) {
    const res = await fetch(`${BASE}/api/projectData`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'set-device', data: device }),
    });
    if (!res.ok && res.status !== 500) {
      // FUXA restarts after write -> connection may drop; treat 500/network as possible success
      const txt = await res.text().catch(() => '');
      console.log(`device ${device.id}: HTTP ${res.status} ${txt.slice(0, 80)}`);
    }
    console.log(`added device: ${device.id} (${device.name})`);
    added++;
  }
  console.log(`\nDone. Attempted ${added} devices. Waiting for FUXA restart...`);
  await new Promise((r) => setTimeout(r, 4000));
}

main().catch((e) => { console.error('reproduce failed:', e); process.exit(1); });
