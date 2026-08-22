import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const SHOT_DIR = 'docs/screenshots';
mkdirSync(SHOT_DIR, { recursive: true });

async function waitForApp(page, route) {
  await page.goto(`http://localhost:1881/${route}`, { waitUntil: 'networkidle', timeout: 40000 }).catch((e) => console.log('goto warn', route, e.message));
  await page.waitForTimeout(6000);
}

async function main() {
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await waitForApp(page, '');
  await page.screenshot({ path: `${SHOT_DIR}/fuxa-main.png` });
  console.log('saved fuxa-main.png');

  await waitForApp(page, '#/editor');
  await page.screenshot({ path: `${SHOT_DIR}/fuxa-editor.png` });
  console.log('saved fuxa-editor.png');

  await waitForApp(page, '#/editor');
  const buttons = page.locator('mat-icon, .mat-icon-button, button');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const txt = (await buttons.nth(i).innerText().catch(() => '')) || '';
    if (/device|Devices/i.test(txt)) {
      await buttons.nth(i).click().catch(() => {});
      break;
    }
  }
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SHOT_DIR}/fuxa-editor-devices.png` });
  console.log('saved fuxa-editor-devices.png');

  await browser.close();
}

main().catch((e) => { console.error('screenshot failed:', e); process.exit(1); });
