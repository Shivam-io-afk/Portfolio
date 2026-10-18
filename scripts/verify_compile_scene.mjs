import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function verifyCompileScene() {
  console.log('--- STARTING COMPILE SCENE VERIFICATION ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('[Browser Error]', msg.text());
      pageErrors.push(msg.text());
    } else {
      consoleLogs.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error('[Page Uncaught Error]', err.message);
    pageErrors.push(err.message);
  });

  // Skip boot screen by setting sessionStorage
  await page.addInitScript(() => {
    window.sessionStorage.setItem('compile_booted', 'true');
  });

  console.log('Navigating to http://localhost:5174/...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Check canvas existence
  const canvasCount = await page.locator('canvas').count();
  console.log('Canvas elements on page:', canvasCount);
  if (canvasCount === 0) {
    throw new Error('No canvas element found! CompileScene failed to mount.');
  }

  // 1. Stage 0: Hero Reactor Core
  console.log('\n[1/5] Capturing Stage 0 (Hero Reactor Core)...');
  await page.evaluate(() => {
    document.getElementById('hero')?.scrollIntoView();
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(artifactsDir, 'compile_scene_stage0_hero.png') });
  console.log('✓ Stage 0 screenshot saved.');

  // 2. Stage 1: Works (5 Towers)
  console.log('\n[2/5] Scrolling to Stage 1 (Works 5 Towers)...');
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo('#projects', { duration: 1.0 });
    } else {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactsDir, 'compile_scene_stage1_towers.png') });
  console.log('✓ Stage 1 screenshot saved.');

  // 3. Stage 2: Arsenal (Galaxies)
  console.log('\n[3/5] Scrolling to Stage 2 (Arsenal Galaxies)...');
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo('#skills', { duration: 1.0 });
    } else {
      document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactsDir, 'compile_scene_stage2_galaxies.png') });
  console.log('✓ Stage 2 screenshot saved.');

  // 4. Stage 3: Trajectory (Double Helix)
  console.log('\n[4/5] Scrolling to Stage 3 (Trajectory Double Helix)...');
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo('#experience', { duration: 1.0 });
    } else {
      document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactsDir, 'compile_scene_stage3_helix.png') });
  console.log('✓ Stage 3 screenshot saved.');

  // 5. Stage 4: Contact (Beacon + Floor Waves)
  console.log('\n[5/5] Scrolling to Stage 4 (Contact Beacon + Waves)...');
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo('#contact', { immediate: true });
    } else {
      document.getElementById('contact')?.scrollIntoView();
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactsDir, 'compile_scene_stage4_beacon.png') });
  console.log('✓ Stage 4 screenshot saved.');

  console.log('\n--- VERIFICATION FINISHED ---');
  console.log('Errors encountered:', pageErrors.length);
  if (pageErrors.length > 0) {
    console.error('Error details:', pageErrors);
  }

  await browser.close();
}

verifyCompileScene().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

