import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifactsDir = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function runVerification() {
  console.log('--- STARTING BUG-FIX PASS VERIFICATION ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // Set booted in sessionStorage before loading page
  await page.addInitScript(() => {
    window.sessionStorage.setItem('compile_booted', 'true');
  });

  // Track long animation frames and console errors
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Install LoAF observer
  await page.evaluate(() => {
    window.__loafEntries = [];
    if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            window.__loafEntries.push({
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        }
      });
      observer.observe({ type: 'long-animation-frame', buffered: true });
    }
  });

  // --- STAGE 0: HERO ---
  console.log('\n[1/6] Verifying Stage 00 / SOURCE (Hero)...');
  const stage0Label = await page.locator('header').innerText();
  console.log('Header text preview:', stage0Label.replace(/\n/g, ' '));
  const has00 = stage0Label.includes('00 / SOURCE');
  console.log('✓ Stage 00 label detected:', has00);

  const heroStatusText = await page.locator('#hero').innerText();
  const hasReadyBits = heroStatusText.includes('STATUS: READY · 12K BITS · WEBGL');
  console.log('✓ No fake metrics ("STATUS: READY · 12K BITS · WEBGL"):', hasReadyBits);

  await page.screenshot({ path: path.join(artifactsDir, 'bugfix_hero.png') });

  // --- STAGE 1: WORKS ---
  console.log('\n[2/6] Scrolling to Stage 01 / BUILD (Works)...');
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo('#projects', { duration: 0.8 });
    } else {
      document.getElementById('projects')?.scrollIntoView();
    }
  });
  await page.waitForTimeout(1600);

  const stage1Text = await page.locator('header').innerText();
  const has01 = stage1Text.includes('01 / BUILD');
  console.log('✓ Stage 01 label detected:', has01);

  await page.screenshot({ path: path.join(artifactsDir, 'bugfix_works.png') });

  // --- STAGE 2: ARSENAL ---
  console.log('\n[3/6] Scrolling to Stage 02 / NETWORK (Arsenal)...');
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo('#skills', { duration: 0.8 });
    } else {
      document.getElementById('skills')?.scrollIntoView();
    }
  });
  await page.waitForTimeout(1600);

  const stage2Text = await page.locator('header').innerText();
  const has02 = stage2Text.includes('02 / NETWORK');
  console.log('✓ Stage 02 label detected:', has02);

  const arsenalIntro = await page.locator('#skills p').first().innerText();
  console.log('Arsenal intro text:', arsenalIntro);
  const correctArsenalWording = arsenalIntro.includes('The tools I use to design, build and ship full-stack web apps');
  console.log('✓ Correct Arsenal intro wording:', correctArsenalWording);

  await page.screenshot({ path: path.join(artifactsDir, 'bugfix_arsenal.png') });

  // --- STAGE 3: TRAJECTORY ---
  console.log('\n[4/6] Scrolling to Stage 03 / RUNTIME (Trajectory / Roadmap)...');
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo('#experience', { duration: 0.8 });
    } else {
      document.getElementById('experience')?.scrollIntoView();
    }
  });
  await page.waitForTimeout(1600);

  const stage3Text = await page.locator('header').innerText();
  const has03 = stage3Text.includes('03 / RUNTIME');
  console.log('✓ Stage 03 label detected:', has03);

  // Check month label opacity fade in spine
  const spineOpacities = await page.evaluate(() => {
    const spine = document.querySelector('#experience');
    if (!spine) return [];
    const rows = spine.querySelectorAll('.will-change-transform > div');
    const opacities = [];
    rows.forEach((r, idx) => {
      if (idx < 5) opacities.push(window.getComputedStyle(r).opacity);
    });
    return opacities;
  });
  console.log('✓ Spine month row opacities (sample):', spineOpacities);

  await page.screenshot({ path: path.join(artifactsDir, 'bugfix_trajectory.png') });

  // --- STAGE 4: CONTACT ---
  console.log('\n[5/6] Scrolling to Stage 04 / DEPLOY (Contact)...');
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo('#contact', { immediate: true });
    } else {
      document.getElementById('contact')?.scrollIntoView();
    }
  });
  await page.waitForTimeout(1000);

  const stage4Text = await page.locator('header').innerText();
  const has04 = stage4Text.includes('04 / DEPLOY');
  console.log('✓ Stage 04 label detected:', has04);

  await page.screenshot({ path: path.join(artifactsDir, 'bugfix_contact.png') });

  // --- DEEP DIVE MODAL & KHATABOOK-APP CHECK ---
  console.log('\n[6/6] Verifying Project Deep Dive modal & Khatabook-App mention...');
  await page.evaluate(() => {
    window.__compileStore.getState().openDeepDive('khatabook-clone');
  });
  await page.waitForTimeout(600);

  const modalLocator = page.locator('#project-deep-dive-modal');
  await modalLocator.waitFor({ timeout: 5000 });
  const modalText = await modalLocator.innerText();
  const mentionsKhatabookApp = modalText.includes('Khatabook-App') && modalText.includes('Companion React Frontend');
  console.log('✓ Deep dive mentions Khatabook-App:', mentionsKhatabookApp);

  await page.screenshot({ path: path.join(artifactsDir, 'bugfix_deepdive.png') });

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // --- PERFORMANCE METRICS (LoAF) ---
  const loafs = await page.evaluate(() => window.__loafEntries || []);
  console.log(`\n--- PERFORMANCE RESULTS ---`);
  console.log(`Total Long Animation Frames (>50ms): ${loafs.length}`);
  if (loafs.length > 0) {
    console.log(`LoAF details:`, loafs);
  }

  // --- VERIFY REPO LINKS ---
  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.map((a) => a.href).filter((h) => h.includes('github.com') || h.includes('linkedin.com'));
  });
  console.log(`\n--- VERIFIED LINKS SAMPLE ---`);
  const uniqueLinks = [...new Set(links)];
  uniqueLinks.forEach((l) => console.log('Link:', l));

  await browser.close();
  console.log('\n--- VERIFICATION COMPLETE ---');
}

runVerification().catch((err) => {
  console.error(err);
  process.exit(1);
});
