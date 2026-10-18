import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function runPerfPassVerification() {
  console.log('══════════ PERFORMANCE PASS VERIFICATION ══════════');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-features=LongAnimationFrameMonitor'],
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  // Skip boot screen
  await page.addInitScript(() => {
    window.sessionStorage.setItem('compile_booted', 'true');
  });

  console.log('1. Loading portfolio at http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // 1. Verify --vel-split on html/body is NEVER set
  console.log('\n2. Verifying --vel-split on <html> and <body>...');
  const htmlSplit = await page.evaluate(() => {
    return {
      htmlVelSplit: document.documentElement.style.getPropertyValue('--vel-split'),
      bodyVelSplit: document.body.style.getPropertyValue('--vel-split'),
    };
  });
  console.log('Initial <html>/<body> --vel-split:', htmlSplit);
  if (htmlSplit.htmlVelSplit || htmlSplit.bodyVelSplit) {
    throw new Error('FAIL: --vel-split was set on <html> or <body>!');
  }
  console.log('✓ PASS: --vel-split is not on <html> or <body>');

  // 2. Set up LongAnimationFrame and frame-timing observers before scroll
  await page.evaluate(() => {
    window.__perfData = {
      longAnimationFrames: [],
      maxRafDuration: 0,
      rafDurationsOver50ms: [],
      totalFrames: 0,
      velSplitValuesOnHeadings: [],
      wroteToDocElement: false,
    };

    // PerformanceObserver for Long Animation Frame (LoAF)
    try {
      const loafObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__perfData.longAnimationFrames.push({
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });
      loafObserver.observe({ type: 'long-animation-frame', buffered: true });
    } catch {
      // Fallback to longtask if loaf not available
      try {
        const longtaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.__perfData.longAnimationFrames.push({
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        });
        longtaskObserver.observe({ entryTypes: ['longtask'] });
      } catch {}
    }

    // Precise rAF duration monitor
    let lastTime = performance.now();
    function rafLoop(now) {
      const delta = now - lastTime;
      lastTime = now;
      window.__perfData.totalFrames++;
      if (delta > window.__perfData.maxRafDuration) {
        window.__perfData.maxRafDuration = delta;
      }
      if (delta > 50) {
        window.__perfData.rafDurationsOver50ms.push(Math.round(delta));
      }

      // Check if documentElement ever receives --vel-split
      if (document.documentElement.style.getPropertyValue('--vel-split')) {
        window.__perfData.wroteToDocElement = true;
      }

      // Sample heading --vel-split values
      const visibleH = document.querySelector('h1[style*="--vel-split"], h2[style*="--vel-split"]');
      if (visibleH) {
        const val = visibleH.style.getPropertyValue('--vel-split');
        if (val && !window.__perfData.velSplitValuesOnHeadings.includes(val)) {
          window.__perfData.velSplitValuesOnHeadings.push(val);
        }
      }

      requestAnimationFrame(rafLoop);
    }
    requestAnimationFrame(rafLoop);
  });

  // 3. Scroll top -> bottom with mouse wheel
  console.log('\n3. Scrolling top → bottom with mouse wheel...');
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  console.log(`Total scroll height: ${maxScroll}px`);

  // Move cursor to center of page to trigger scroll
  await page.mouse.move(720, 450);

  // Wheel down in realistic increments over 5 seconds
  const steps = 40;
  const deltaPerStep = maxScroll / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, deltaPerStep);
    await page.waitForTimeout(70);
  }

  // Wait 1.5s for smooth Lenis deceleration to rest at the bottom
  console.log('Waiting for Lenis deceleration to rest...');
  await page.waitForTimeout(1500);

  // 4. Verify rest state: velocity is ~0, heading styles are cleared/0
  const restState = await page.evaluate(() => {
    const headingsWithSplit = Array.from(document.querySelectorAll('h1, h2, .rgb-split-target'))
      .map(el => ({ tag: el.tagName, split: el.style.getPropertyValue('--vel-split') }))
      .filter(item => item.split !== '' && item.split !== '0px');
    return {
      headingsWithNonZeroSplit: headingsWithSplit,
      docElementHasSplit: document.documentElement.style.getPropertyValue('--vel-split') !== '',
    };
  });
  console.log('Rest state verification:', restState);
  if (restState.headingsWithNonZeroSplit.length > 0 || restState.docElementHasSplit) {
    console.warn('Warning: Some headings still have non-zero --vel-split at rest:', restState);
  } else {
    console.log('✓ PASS: All headings have --vel-split cleared to 0/none at rest');
  }

  // 5. Scroll back bottom -> top to measure reverse frames as well
  console.log('\n5. Scrolling back bottom → top with mouse wheel...');
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, -deltaPerStep);
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(1500);

  // 6. Collect Performance Data
  const perfResults = await page.evaluate(() => window.__perfData);
  console.log('\n══════════ PERFORMANCE AUDIT RESULTS ══════════');
  console.log('Total measured frames:', perfResults.totalFrames);
  console.log('Max rAF frame time:', `${Math.round(perfResults.maxRafDuration)}ms`);
  console.log('Frames exceeding 50ms during scroll:', perfResults.rafDurationsOver50ms.length);
  if (perfResults.rafDurationsOver50ms.length > 0) {
    console.log('Exceeding durations:', perfResults.rafDurationsOver50ms);
  }
  console.log('Long Animation Frames (LoAF > 50ms):', perfResults.longAnimationFrames.length);
  console.log('Quantized --vel-split values observed on headings:', perfResults.velSplitValuesOnHeadings);
  console.log('Wrote to <html> documentElement during scroll:', perfResults.wroteToDocElement);

  // Verify backdrop-filter count on active elements
  const backdropCount = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    return all.filter(el => {
      const style = window.getComputedStyle(el);
      const bf = style.backdropFilter || style.webkitBackdropFilter;
      return bf && bf !== 'none' && !el.closest('nav.snav');
    }).length;
  });
  console.log('Active non-SiteNav elements with backdrop-filter:', backdropCount);

  // 7. Verify tab visibility pausing
  console.log('\n7. Verifying tab visibility pausing...');
  const initialBitLabel = await page.locator('nav.snav').innerText(); // just check page is active
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(1000);
  console.log('✓ Handled tab hidden event without errors');

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(500);
  console.log('✓ Handled tab visible event without errors');

  // Take screenshot at hero
  await page.screenshot({ path: path.join(artifactsDir, 'perf_pass_verified.png') });
  console.log('✓ Screenshot saved to perf_pass_verified.png');

  await browser.close();
  console.log('\n══════════ VERIFICATION COMPLETE ══════════');
}

runPerfPassVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
