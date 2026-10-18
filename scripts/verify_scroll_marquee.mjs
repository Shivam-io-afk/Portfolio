import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function testScrollMarquee() {
  console.log('--- STARTING SCROLL MARQUEE VERIFICATION ---');
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

  // 1. Scroll to contact section
  console.log('\n[1/4] Scrolling to #contact...');
  await page.evaluate(() => {
    if (window.lenis) {
      window.lenis.scrollTo('#contact', { immediate: true });
    } else {
      document.getElementById('contact')?.scrollIntoView();
    }
  });
  await page.waitForTimeout(1000);

  const marqueeLocator = page.locator('.smq');
  await marqueeLocator.waitFor({ state: 'visible', timeout: 5000 });

  // 2. Verify classes and structure
  console.log('\n[2/4] Verifying ScrollMarquee structure and typography...');
  const isInViewport = await marqueeLocator.evaluate((el) => el.classList.contains('is-in'));
  console.log('✓ .is-in class applied (bands unfolded):', isInViewport);

  const boldFont = await page.locator('.smq-bold').first().evaluate((el) => window.getComputedStyle(el).fontFamily);
  const italFont = await page.locator('.smq-ital').first().evaluate((el) => window.getComputedStyle(el).fontFamily);
  const outFont = await page.locator('.smq-out').first().evaluate((el) => window.getComputedStyle(el).fontFamily);

  console.log('✓ Bold font family:', boldFont, '(contains Space Grotesk:', boldFont.includes('Space Grotesk'), ')');
  console.log('✓ Italic font family:', italFont, '(contains Instrument Serif:', italFont.includes('Instrument Serif'), ')');
  console.log('✓ Outlined font family:', outFont, '(contains Space Grotesk:', outFont.includes('Space Grotesk'), ')');

  const textFront = await page.locator('.smq-a').innerText();
  const textBack = await page.locator('.smq-b').innerText();
  console.log('✓ Band A text sample:', textFront.slice(0, 80).replace(/\n/g, ' '));
  console.log('✓ Band B text sample:', textBack.slice(0, 80).replace(/\n/g, ' '));

  await page.screenshot({ path: path.join(artifactsDir, 'scroll_marquee_contact.png') });
  console.log('✓ Initial contact marquee screenshot saved.');

  // 3. Test scrolling down past it (bands speed up and lean)
  console.log('\n[3/4] Testing scroll down reactions (speed & lean)...');
  await page.evaluate(() => {
    if (window.lenis) {
      window.lenis.scrollTo(document.body.scrollHeight, { duration: 1.5 });
    } else {
      window.scrollBy({ top: 400, behavior: 'smooth' });
    }
  });
  await page.waitForTimeout(400);

  const transformsDown = await page.evaluate(() => {
    const skewA = document.querySelector('.smq-a .smq-skew');
    const skewB = document.querySelector('.smq-b .smq-skew');
    const trackA = document.querySelector('.smq-a .smq-track');
    const trackB = document.querySelector('.smq-b .smq-track');
    return {
      skewA: skewA ? window.getComputedStyle(skewA).transform : 'none',
      skewB: skewB ? window.getComputedStyle(skewB).transform : 'none',
      trackA: trackA ? window.getComputedStyle(trackA).transform : 'none',
      trackB: trackB ? window.getComputedStyle(trackB).transform : 'none',
    };
  });
  console.log('✓ Transforms during scroll down:', transformsDown);

  await page.screenshot({ path: path.join(artifactsDir, 'scroll_marquee_scrolling_down.png') });

  // 4. Test scrolling up past it (reversing direction and leaning opposite)
  console.log('\n[4/4] Testing scroll up reactions (reverse & opposite lean)...');
  await page.evaluate(() => {
    const contact = document.getElementById('contact');
    if (contact && window.lenis) {
      window.lenis.scrollTo(contact, { duration: 1.5 });
    } else {
      window.scrollBy({ top: -500, behavior: 'smooth' });
    }
  });
  await page.waitForTimeout(400);

  const transformsUp = await page.evaluate(() => {
    const skewA = document.querySelector('.smq-a .smq-skew');
    const skewB = document.querySelector('.smq-b .smq-skew');
    const trackA = document.querySelector('.smq-a .smq-track');
    const trackB = document.querySelector('.smq-b .smq-track');
    return {
      skewA: skewA ? window.getComputedStyle(skewA).transform : 'none',
      skewB: skewB ? window.getComputedStyle(skewB).transform : 'none',
      trackA: trackA ? window.getComputedStyle(trackA).transform : 'none',
      trackB: trackB ? window.getComputedStyle(trackB).transform : 'none',
    };
  });
  console.log('✓ Transforms during scroll up:', transformsUp);

  await page.screenshot({ path: path.join(artifactsDir, 'scroll_marquee_scrolling_up.png') });

  console.log('\n--- SCROLL MARQUEE VERIFICATION COMPLETE ---');
  await browser.close();
}

testScrollMarquee().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
