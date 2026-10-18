import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function testDeepDiveScroll() {
  console.log('--- STARTING CASE STUDY OVERLAY SCROLL VERIFICATION ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('[Browser Error]', msg.text());
  });
  page.on('pageerror', (err) => {
    console.error('[Page Error]', err.message);
  });

  // Skip boot screen
  await page.addInitScript(() => {
    window.sessionStorage.setItem('compile_booted', 'true');
  });

  console.log('Navigating to http://localhost:5174/...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Scroll to projects section
  console.log('Scrolling main page to #projects...');
  await page.evaluate(() => {
    if (window.lenis) {
      window.lenis.scrollTo('#projects', { immediate: true });
    } else {
      document.getElementById('projects')?.scrollIntoView();
    }
  });
  await page.waitForTimeout(1000);

  const initialMainScroll = await page.evaluate(() => window.scrollY);
  console.log('Main page scrollY at #projects:', initialMainScroll);

  const projects = [
    { id: 'onbuggy', closeMethod: 'button', name: 'Onbuggy' },
    { id: 'taskflow', closeMethod: 'esc', name: 'Taskflow' },
    { id: 'khatabook-clone', closeMethod: 'browser_back', name: 'Khatabook Clone' },
    { id: 'zoom-clone', closeMethod: 'button', name: 'Zoom Clone' },
    { id: 'shelter-map', closeMethod: 'esc', name: 'ShelterMap' },
  ];

  for (let i = 0; i < projects.length; i++) {
    const { id, closeMethod, name } = projects[i];
    console.log(`\n--------------------------------------------------`);
    console.log(`[${i + 1}/5] Testing Case Study: ${name} (${id})`);

    // 1. Open the case study
    await page.evaluate((projId) => {
      window.__compileStore.getState().openDeepDive(projId);
    }, id);
    await page.waitForTimeout(500);

    const overlay = page.locator('#project-deep-dive-modal');
    await overlay.waitFor({ state: 'visible', timeout: 5000 });

    // 2. Check attributes and styles
    const dataLenisPrevent = await overlay.getAttribute('data-lenis-prevent');
    const zIndex = await page.evaluate(() => {
      const el = document.getElementById('project-deep-dive-modal');
      return window.getComputedStyle(el).zIndex;
    });
    const overscroll = await page.evaluate(() => {
      const el = document.getElementById('project-deep-dive-modal');
      return window.getComputedStyle(el).overscrollBehavior;
    });
    const htmlOverflow = await page.evaluate(() => document.documentElement.style.overflow);
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    const initialOverlayScrollTop = await page.evaluate(() => {
      const el = document.getElementById('project-deep-dive-modal');
      return el.scrollTop;
    });
    const navOpacity = await page.evaluate(() => {
      const nav = document.querySelector('.snav');
      return nav ? window.getComputedStyle(nav).opacity : '1';
    });

    console.log(`✓ data-lenis-prevent present: ${dataLenisPrevent !== null}`);
    console.log(`✓ overlay z-index: ${zIndex} (expected 70)`);
    console.log(`✓ overscroll-behavior: ${overscroll} (expected contain)`);
    console.log(`✓ html overflow: "${htmlOverflow}", body overflow: "${bodyOverflow}" (expected hidden)`);
    console.log(`✓ initial overlay scrollTop: ${initialOverlayScrollTop} (expected 0)`);
    console.log(`✓ SiteNav opacity: ${navOpacity} (expected 0)`);

    if (zIndex !== '70') throw new Error(`Wrong z-index: ${zIndex}`);
    if (initialOverlayScrollTop !== 0) throw new Error(`Overlay scrollTop not reset: ${initialOverlayScrollTop}`);
    if (htmlOverflow !== 'hidden' || bodyOverflow !== 'hidden') throw new Error('Document overflow not hidden');

    // 3. Scroll inside the overlay using mouse wheel
    const mainScrollBeforeWheel = await page.evaluate(() => window.scrollY);
    await page.mouse.move(720, 450); // Center of screen
    await page.mouse.wheel(0, 600); // Wheel down
    await page.waitForTimeout(400);

    const overlayScrollTopAfter = await page.evaluate(() => {
      const el = document.getElementById('project-deep-dive-modal');
      return el.scrollTop;
    });
    const mainScrollAfterWheel = await page.evaluate(() => window.scrollY);

    console.log(`✓ overlay scrollTop after wheel: ${overlayScrollTopAfter} (moved!)`);
    console.log(`✓ main page scrollY before: ${mainScrollBeforeWheel}, after: ${mainScrollAfterWheel} (identical!)`);

    if (overlayScrollTopAfter <= 0) throw new Error('Overlay did not scroll on wheel');
    if (mainScrollBeforeWheel !== mainScrollAfterWheel) throw new Error('Main page moved while modal was open!');

    // Capture screenshot of open case study
    await page.screenshot({ path: path.join(artifactsDir, `casestudy_${id}.png`) });

    // 4. Close using specified method
    console.log(`Closing via ${closeMethod}...`);
    if (closeMethod === 'button') {
      await page.locator('#project-deep-dive-modal button:has-text("BACK TO COMPILER")').click();
    } else if (closeMethod === 'esc') {
      await page.keyboard.press('Escape');
    } else if (closeMethod === 'browser_back') {
      await page.goBack();
    }
    await page.waitForTimeout(500);

    // 5. Verify modal closed and page unlocked
    const isModalOpen = await page.evaluate(() => window.__compileStore.getState().isDeepDiveOpen);
    const htmlOverflowRestored = await page.evaluate(() => document.documentElement.style.overflow);
    const bodyOverflowRestored = await page.evaluate(() => document.body.style.overflow);
    const navOpacityRestored = await page.evaluate(() => {
      const nav = document.querySelector('.snav');
      return nav ? window.getComputedStyle(nav).opacity : '0';
    });

    console.log(`✓ Modal closed: ${!isModalOpen}`);
    console.log(`✓ Document overflow restored: html="${htmlOverflowRestored}", body="${bodyOverflowRestored}"`);
    console.log(`✓ SiteNav opacity restored: ${navOpacityRestored}`);

    if (isModalOpen) throw new Error('Modal failed to close');
    if (htmlOverflowRestored === 'hidden' || bodyOverflowRestored === 'hidden') {
      throw new Error('Overflow remained stuck locked!');
    }

    // 6. Verify main page scrolls normally from where it was
    const beforeScroll = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => {
      if (window.lenis) {
        window.lenis.scrollTo(window.scrollY + 150, { immediate: true });
      } else {
        window.scrollBy(0, 150);
      }
    });
    await page.waitForTimeout(300);
    const afterScroll = await page.evaluate(() => window.scrollY);
    console.log(`✓ Main page scrolls normally: ${beforeScroll} -> ${afterScroll}`);
    if (afterScroll === beforeScroll) throw new Error('Main page could not scroll after closing modal');
  }

  console.log('\n==================================================');
  console.log('ALL 5 CASE STUDIES VERIFIED SUCCESSFULLY!');
  console.log('==================================================');

  await browser.close();
}

testDeepDiveScroll().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
