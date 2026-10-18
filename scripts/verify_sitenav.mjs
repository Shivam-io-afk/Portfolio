import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function verifySiteNav() {
  console.log('--- STARTING SITENAV VERIFICATION ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('[Browser Error]', msg.text());
      pageErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    console.error('[Page Uncaught Error]', err.message);
    pageErrors.push(err.message);
  });

  // Skip boot screen
  await page.addInitScript(() => {
    window.sessionStorage.setItem('compile_booted', 'true');
  });

  console.log('Navigating to http://localhost:5174/...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Verify SiteNav element existence and structure
  console.log('\n[1/6] Verifying SiteNav DOM elements...');
  const navLocator = page.locator('nav.snav');
  await navLocator.waitFor({ timeout: 5000 });
  const navText = await navLocator.innerText();
  console.log('SiteNav text preview:', navText.replace(/\n/g, ' '));

  const hasBrand = navText.includes('SM') && navText.includes('Shivam Mishra');
  const hasWorks = navText.includes('01') && navText.includes('WORKS');
  const hasArsenal = navText.includes('02') && navText.includes('ARSENAL');
  const hasTrajectory = navText.includes('03') && navText.includes('TRAJECTORY');
  const hasContact = navText.includes('04') && navText.includes('CONTACT');
  const hasIST = navText.includes('IST');
  const hasResume = navText.includes('RÉSUMÉ') || navText.includes('Résumé');
  const hasHireMe = navText.includes('HIRE ME');

  console.log('✓ Brand present:', hasBrand);
  console.log('✓ Links present:', { hasWorks, hasArsenal, hasTrajectory, hasContact });
  console.log('✓ IST Clock present:', hasIST);
  console.log('✓ Resume present:', hasResume);
  console.log('✓ Hire me present:', hasHireMe);

  // Verify resume download href
  const resumeHref = await page.locator('a.snav-ghost').first().getAttribute('href');
  const hasDownload = await page.locator('a.snav-ghost').first().getAttribute('download');
  console.log('✓ Resume href:', resumeHref, '(download attribute:', hasDownload !== null, ')');

  // Verify window.lenis is exposed
  const lenisExposed = await page.evaluate(() => typeof window.lenis !== 'undefined' && typeof window.lenis.scrollTo === 'function');
  console.log('✓ window.lenis exposed and functional:', lenisExposed);

  await page.screenshot({ path: path.join(artifactsDir, 'sitenav_stage0_hero.png') });

  // 2. Test nav link click with smooth scrolling to Works
  console.log('\n[2/6] Clicking Works nav link...');
  await page.locator('a.snav-link[href="#projects"]').click();
  await page.waitForTimeout(1800);

  // Check active state
  const isWorksActive = await page.locator('a.snav-link[href="#projects"]').getAttribute('aria-current');
  console.log('✓ Works link aria-current:', isWorksActive);

  // Check pill position
  const pillStyle = await page.locator('.snav-pill').getAttribute('style');
  console.log('✓ Pill style at Works:', pillStyle);

  await page.screenshot({ path: path.join(artifactsDir, 'sitenav_works_pill.png') });

  // 3. Test Hire Me button click (scrolls to #contact)
  console.log('\n[3/6] Clicking Hire Me button...');
  await page.locator('button.snav-hire').click();
  await page.waitForTimeout(2000);

  const contactScrolled = await page.evaluate(() => {
    const contactEl = document.getElementById('contact');
    const rect = contactEl?.getBoundingClientRect();
    return rect && rect.top < window.innerHeight;
  });
  console.log('✓ Scrolled to #contact on Hire Me click:', contactScrolled);

  // 4. Test Brand Logo click (scrolls to #hero)
  console.log('\n[4/6] Clicking Brand link (SM)...');
  await page.locator('a.snav-brand').click();
  await page.waitForTimeout(2000);

  const heroScrolled = await page.evaluate(() => {
    return window.scrollY < 300;
  });
  console.log('✓ Scrolled back to #hero on Brand click:', heroScrolled);

  // 5. Test Cursor Hover over Navbar (hiding BIT label)
  console.log('\n[5/6] Testing floating cursor label over navbar...');
  // First hover away from navbar (e.g. at x: 200, y: 500)
  await page.mouse.move(200, 500);
  await page.waitForTimeout(300);

  const labelCountAway = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('div')).filter(el => el.textContent?.includes('BIT #'));
    return labels.length;
  });
  console.log('✓ BIT label count away from navbar:', labelCountAway);

  // Now hover over navbar (at center top: x: 720, y: 35)
  await page.mouse.move(720, 35);
  await page.waitForTimeout(300);

  const labelCountOverNav = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('div')).filter(el => el.textContent?.includes('BIT #'));
    return labels.length;
  });
  console.log('✓ BIT label count when cursor is over navbar (must be 0):', labelCountOverNav);

  await page.screenshot({ path: path.join(artifactsDir, 'sitenav_cursor_hover.png') });

  // 6. Test Mobile Viewport and Menu Drawer
  console.log('\n[6/6] Testing mobile viewport and menu sheet...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);

  // Open mobile menu
  await page.locator('button.snav-menu').click();
  await page.waitForTimeout(600);

  const sheetOpen = await page.locator('.snav-sheet.is-open').count();
  console.log('✓ Mobile menu sheet open:', sheetOpen > 0);

  await page.screenshot({ path: path.join(artifactsDir, 'sitenav_mobile_menu.png') });

  console.log('\n--- SITENAV VERIFICATION COMPLETE ---');
  console.log('Total errors:', pageErrors.length);

  await browser.close();
}

verifySiteNav().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
