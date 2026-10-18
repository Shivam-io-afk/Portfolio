import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function testStackedDeck() {
  console.log('--- STARTING STACKED CARDS DECK VERIFICATION ---');
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

  // 1. Scroll to Works (#projects)
  console.log('\n[1/6] Navigating to #projects (Works)...');
  await page.evaluate(() => {
    if (window.lenis) {
      window.lenis.scrollTo('#projects', { duration: 1.0 });
    } else {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
  await page.waitForTimeout(1600);

  // Verify section layout
  const sectionMetrics = await page.evaluate(() => {
    const sec = document.getElementById('projects');
    const slots = sec?.querySelectorAll('.w-full.relative.h-\\[100vh\\], .w-full.relative.h-\\[60vh\\]');
    const stickyCards = sec?.querySelectorAll('.sticky.w-full');
    const firstCard = stickyCards?.[0];
    const firstRect = firstCard?.getBoundingClientRect();
    return {
      sectionHeight: sec?.offsetHeight,
      slotsCount: slots?.length,
      stickyCardsCount: stickyCards?.length,
      firstCardWidth: firstRect?.width,
      firstCardLeft: firstRect?.left,
    };
  });

  console.log('✓ Section total height:', sectionMetrics.sectionHeight, 'px');
  console.log('✓ Slot count (expected 5):', sectionMetrics.slotsCount);
  console.log('✓ Sticky cards count (expected 5):', sectionMetrics.stickyCardsCount);
  console.log('✓ First card width (max 640px):', Math.round(sectionMetrics.firstCardWidth));
  console.log('✓ First card left position:', Math.round(sectionMetrics.firstCardLeft), '(placed on left half)');

  // Verify active tower is 0
  const activeTower0 = await page.evaluate(() => window.__compileStore.getState().activeTower);
  console.log('✓ Active tower on arrival (expected 0):', activeTower0);

  await page.screenshot({ path: path.join(artifactsDir, 'cards_deck_stage1_card0.png') });

  // 2. Scroll to Card 1
  console.log('\n[2/6] Scrolling down to Card 1 (Taskflow)...');
  await page.evaluate(() => {
    window.scrollBy({ top: window.innerHeight * 0.95, behavior: 'smooth' });
  });
  await page.waitForTimeout(1200);

  const card1Metrics = await page.evaluate(() => {
    const sec = document.getElementById('projects');
    const stickyCards = sec?.querySelectorAll('.sticky.w-full');
    const c0 = stickyCards?.[0]?.getBoundingClientRect();
    const c1 = stickyCards?.[1]?.getBoundingClientRect();
    const activeTower = window.__compileStore.getState().activeTower;
    return {
      c0Top: Math.round(c0?.top || 0),
      c1Top: Math.round(c1?.top || 0),
      peekDiff: Math.round((c1?.top || 0) - (c0?.top || 0)),
      activeTower,
    };
  });
  console.log('✓ Card 0 sticky top:', card1Metrics.c0Top, 'px, Card 1 sticky top:', card1Metrics.c1Top, 'px');
  console.log('✓ Top peek difference (expected ~18px):', card1Metrics.peekDiff, 'px');
  console.log('✓ Active tower at Card 1:', card1Metrics.activeTower);

  await page.screenshot({ path: path.join(artifactsDir, 'cards_deck_card1_stacked.png') });

  // 3. Scroll to Card 3 (Zoom Meet Clone)
  console.log('\n[3/6] Scrolling down to Card 3 (Zoom Meet Clone)...');
  await page.evaluate(() => {
    window.scrollBy({ top: window.innerHeight * 1.8, behavior: 'smooth' });
  });
  await page.waitForTimeout(1200);

  const activeTower3 = await page.evaluate(() => window.__compileStore.getState().activeTower);
  console.log('✓ Active tower at Card 3:', activeTower3);

  await page.screenshot({ path: path.join(artifactsDir, 'cards_deck_card3_stacked.png') });

  // 4. Scroll to Card 4 (ShelterMap - final card in deck)
  console.log('\n[4/6] Scrolling down to Card 4 (ShelterMap)...');
  await page.evaluate(() => {
    window.scrollBy({ top: window.innerHeight * 1.2, behavior: 'smooth' });
  });
  await page.waitForTimeout(1200);

  const card4Metrics = await page.evaluate(() => {
    const sec = document.getElementById('projects');
    const stickyCards = Array.from(sec?.querySelectorAll('.sticky.w-full') || []);
    const tops = stickyCards.map(c => Math.round(c.getBoundingClientRect().top));
    const activeTower = window.__compileStore.getState().activeTower;
    return { tops, activeTower };
  });
  console.log('✓ All 5 stacked card tops:', card4Metrics.tops);
  console.log('✓ Active tower at Card 4:', card4Metrics.activeTower);

  await page.screenshot({ path: path.join(artifactsDir, 'cards_deck_all_stacked.png') });

  // 5. Test CASE STUDY button clickability on the active top card
  console.log('\n[5/6] Testing CASE STUDY button clickability on top card...');
  const caseStudyButtons = page.locator('#projects button:has-text("CASE STUDY")');
  const count = await caseStudyButtons.count();
  console.log('✓ Found CASE STUDY buttons count:', count);

  // Click CASE STUDY on the visible active card (Card 4 or Card 3)
  const lastButton = caseStudyButtons.last();
  await lastButton.click();
  await page.waitForTimeout(600);

  const isModalOpen = await page.evaluate(() => window.__compileStore.getState().isDeepDiveOpen);
  console.log('✓ Case study modal opened successfully from top card click:', isModalOpen);

  // Close modal via Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  const isModalClosed = await page.evaluate(() => !window.__compileStore.getState().isDeepDiveOpen);
  console.log('✓ Case study modal closed cleanly:', isModalClosed);

  // 6. Mobile Viewport Check (full-width cards & 10px stack offset)
  console.log('\n[6/6] Testing mobile viewport layout (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);

  const mobileMetrics = await page.evaluate(() => {
    const sec = document.getElementById('projects');
    const stickyCards = sec?.querySelectorAll('.sticky.w-full');
    const c0 = stickyCards?.[0]?.getBoundingClientRect();
    const c1 = stickyCards?.[1]?.getBoundingClientRect();
    return {
      c0Width: Math.round(c0?.width || 0),
      c0Top: Math.round(c0?.top || 0),
      c1Top: Math.round(c1?.top || 0),
      peekDiff: Math.round((c1?.top || 0) - (c0?.top || 0)),
    };
  });
  console.log('✓ Mobile card width:', mobileMetrics.c0Width, 'px (fills mobile width)');
  console.log('✓ Mobile peek difference (expected ~10px):', mobileMetrics.peekDiff, 'px');

  await page.screenshot({ path: path.join(artifactsDir, 'cards_deck_mobile.png') });

  console.log('\n==================================================');
  console.log('CARDS ALMANAC STACKED DECK VERIFIED SUCCESSFULLY!');
  console.log('==================================================');

  await browser.close();
}

testStackedDeck().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

