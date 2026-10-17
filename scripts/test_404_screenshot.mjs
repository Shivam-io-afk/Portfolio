import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('Triggering is404 = true directly via store...');
  await page.evaluate(() => {
    window.__compileStore.getState().setIs404(true);
  });
  await page.waitForTimeout(600);

  const visible = await page.locator('[role="dialog"]').isVisible();
  console.log('Is 404 dialog visible:', visible);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase6_custom_404.png') });
  await browser.close();
}
test();

