import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function testHireMe() {
  console.log('--- TESTING HIRE ME SCROLL BEHAVIOR ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    window.sessionStorage.setItem('compile_booted', 'true');
  });

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Click Hire Me button in navbar
  console.log('Clicking Hire me button in navbar...');
  const hireBtn = page.locator('button.snav-hire');
  await hireBtn.waitFor();
  await hireBtn.click();

  // Wait for smooth Lenis scroll and focus
  await page.waitForTimeout(1500);

  // Check contact-form position and focus
  const formState = await page.evaluate(() => {
    const formEl = document.getElementById('contact-form');
    const inputEl = formEl?.querySelector('input');
    const activeEl = document.activeElement;
    const rect = formEl?.getBoundingClientRect();
    return {
      formExists: !!formEl,
      rectTop: rect ? Math.round(rect.top) : null,
      rectBottom: rect ? Math.round(rect.bottom) : null,
      isInputFocused: activeEl === inputEl,
      activeTag: activeEl?.tagName,
      activePlaceholder: activeEl?.getAttribute('placeholder'),
    };
  });

  console.log('Form State after clicking Hire Me:', formState);

  // Take screenshot
  const screenshotPath = path.join(artifactsDir, 'hire_me_form_destination.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  // Also test mobile viewport
  console.log('\nTesting mobile viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await hireBtn.click();
  await page.waitForTimeout(1500);

  const mobileFormState = await page.evaluate(() => {
    const formEl = document.getElementById('contact-form');
    const rect = formEl?.getBoundingClientRect();
    return {
      rectTop: rect ? Math.round(rect.top) : null,
      rectBottom: rect ? Math.round(rect.bottom) : null,
    };
  });
  console.log('Mobile Form State after clicking Hire Me:', mobileFormState);

  const mobileScreenshotPath = path.join(artifactsDir, 'hire_me_form_mobile.png');
  await page.screenshot({ path: mobileScreenshotPath });
  console.log('Mobile screenshot saved to:', mobileScreenshotPath);

  await browser.close();
  console.log('--- COMPLETED ---');
}

testHireMe().catch((err) => {
  console.error(err);
  process.exit(1);
});
