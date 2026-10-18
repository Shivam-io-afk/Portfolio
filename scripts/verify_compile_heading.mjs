import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function testCompileHeading() {
  console.log('--- Starting CompileHeading Verification ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser Error]:`, msg.text());
    }
  });

  // Setup session storage to bypass bootloader, plus CLS and pulse event listeners
  await page.addInitScript(() => {
    window.sessionStorage.setItem('compile_booted', 'true');
    window.__layoutShifts = [];
    window.__pulseEvents = [];

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__layoutShifts.push({
              value: entry.value,
              sources: (entry.sources || []).map(s => ({
                nodeName: s.node ? s.node.nodeName : 'unknown',
                className: s.node ? String(s.node.className || '') : '',
              }))
            });
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.error('CLS observer error:', e);
    }

    window.addEventListener('compile-pulse', () => {
      window.__pulseEvents.push({ time: performance.now() });
    });
  });

  console.log('Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });

  // Wait 250ms for fonts & measurement to initialize monospace spans
  await page.waitForTimeout(250);

  // 1. Screenshot at 0ms (monospaced start state during delay)
  console.log('Capturing hero heading at 0ms (dim monospace source code)...');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'compile_heading_0ms.png'),
    clip: { x: 40, y: 140, width: 620, height: 320 }
  });

  // Wait ~600ms (t ≈ 850ms) to capture midway sweep
  console.log('Waiting ~600ms for midway sweep...');
  await page.waitForTimeout(600);
  console.log('Capturing hero heading at ~350ms midway sweep...');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'compile_heading_350ms.png'),
    clip: { x: 40, y: 140, width: 620, height: 320 }
  });

  // Wait for compile completion
  console.log('Waiting for hero compile to complete...');
  await page.waitForTimeout(1000);

  // Capture done state
  console.log('Capturing hero heading done state...');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'compile_heading_done.png'),
    clip: { x: 40, y: 140, width: 620, height: 320 }
  });

  // Verify compile-pulse fired
  const pulses = await page.evaluate(() => window.__pulseEvents);
  console.log(`compile-pulse events received: ${pulses.length} (Expected: >= 1)`);

  // Verify CLS score during hero compilation
  const shifts = await page.evaluate(() => window.__layoutShifts);
  const totalHeadingCLS = shifts
    .filter(s => s.sources && s.sources.some(src => (typeof src.className === 'string' && src.className.includes('compile')) || src.nodeName === 'H1'))
    .reduce((sum, s) => sum + s.value, 0);

  console.log(`Heading Cumulative Layout Shift (CLS): ${totalHeadingCLS.toFixed(4)} (Expected: 0.0000)`);

  // Verify Hero Stat Counter
  const metricsCount = await page.locator('#hero .font-mono').count();
  console.log(`Hero stat elements found: ${metricsCount}`);

  // 2. Scroll to each section and verify headings compile
  const sections = [
    { id: 'projects', selector: '#projects h2', expectedTitle: 'Selected Works.' },
    { id: 'skills', selector: '#skills h2', expectedTitle: 'Technical Arsenal.' },
    { id: 'contact', selector: '#contact h2', expectedTitle: 'Get in Touch.' }
  ];

  for (const sec of sections) {
    console.log(`Scrolling to #${sec.id}...`);
    await page.evaluate((id) => {
      if (window.lenis) {
        window.lenis.scrollTo('#' + id, { immediate: true });
      } else {
        document.getElementById(id)?.scrollIntoView();
      }
    }, sec.id);

    await page.waitForTimeout(1400);

    const headingText = await page.evaluate((sel) => {
      const heading = document.querySelector(sel);
      return heading ? heading.getAttribute('aria-label') : null;
    }, sec.selector);

    console.log(`Section #${sec.id} heading: "${headingText}" (matches: ${headingText === sec.expectedTitle})`);

    // Verify stage label completed with checkmark
    const hasCheckmark = await page.evaluate((id) => {
      const secEl = document.getElementById(id);
      return secEl ? secEl.textContent.includes('✓') : false;
    }, sec.id);
    console.log(`Section #${sec.id} stage label checkmark present: ${hasCheckmark}`);
  }

  // 3. Test prefers-reduced-motion
  console.log('Testing prefers-reduced-motion: reduce...');
  const reducedContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce'
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.addInitScript(() => {
    window.sessionStorage.setItem('compile_booted', 'true');
  });
  await reducedPage.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
  await reducedPage.waitForTimeout(400);

  const cursorCount = await reducedPage.locator('.compile-cursor').count();
  const ghostVisible = await reducedPage.evaluate(() => {
    const ghost = document.querySelector('#hero .compile-ghost');
    return ghost ? window.getComputedStyle(ghost).visibility : null;
  });

  console.log(`Reduced motion: cursor count = ${cursorCount} (Expected: 0)`);
  console.log(`Reduced motion: ghost visibility = ${ghostVisible} (Expected: visible)`);

  await reducedPage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'compile_heading_reduced_motion.png'),
    clip: { x: 40, y: 140, width: 620, height: 320 }
  });

  console.log('--- Verification Complete ---');
  await browser.close();
}

testCompileHeading().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
