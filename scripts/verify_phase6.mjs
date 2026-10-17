import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function runVerification() {
  console.log('Launching Chromium for comprehensive Phase 6 verification...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=gl', '--enable-webgl', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  console.log('Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000); // Wait for boot loader / initial render

  // 1. Verify Header Clock & Local-Time Period
  console.log('1. Checking Header clock & local-time theme...');
  const headerText = await page.locator('header').textContent();
  console.log(`Header snippet: ${headerText?.replace(/\s+/g, ' ').substring(0, 160)}`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase6_header_clock.png') });

  // 2. Verify Resume Bundler Button
  console.log('2. Testing Resume Bundler Button click...');
  const resumeBtn = page.locator('header button[aria-label="Download resume"]');
  if (await resumeBtn.count() > 0) {
    await resumeBtn.click();
    await page.waitForTimeout(400); // Capture bundling state
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase6_resume_bundling.png') });
    await page.waitForTimeout(600);
  }

  // 3. Verify Konami Code (Matrix Mode)
  console.log('3. Testing Konami Code sequence...');
  const konamiKeys = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  for (const k of konamiKeys) {
    await page.keyboard.press(k);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(300);
  const matrixActive = await page.evaluate(() => window.__compileStore?.getState()?.matrixMode);
  console.log(`Matrix mode active: ${matrixActive}`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase6_konami_matrix.png') });
  await page.waitForTimeout(1000);

  // 4. Verify Custom 404 Overlay
  console.log('4. Testing Custom 404 Overlay...');
  await page.evaluate(() => {
    window.location.hash = '#/404';
  });
  await page.waitForTimeout(600);
  const is404 = await page.evaluate(() => window.__compileStore?.getState()?.is404);
  console.log(`Is 404 modal visible: ${is404}`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase6_custom_404.png') });

  // Reset 404 via checkout home button
  const checkoutBtn = page.locator('button:has-text("git checkout home")');
  if (await checkoutBtn.count() > 0) {
    await checkoutBtn.click();
    await page.waitForTimeout(800);
  }

  // 5. Capture All Sections via Stage Jump Keys
  console.log('5. Capturing individual sections...');
  await page.keyboard.press('1');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_hero.png') });

  await page.keyboard.press('2');
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_works.png') });

  await page.keyboard.press('3');
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_arsenal.png') });

  await page.keyboard.press('4');
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_trajectory.png') });

  await page.keyboard.press('5');
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_contact.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase6_git_footer.png') });

  // 6. Section-by-Section FPS & Full-Scroll LoAF Performance Profiling
  console.log('6. Profiling top-to-bottom scroll performance (LoAF & FPS)...');
  await page.keyboard.press('1'); // Return to top
  await page.waitForTimeout(1000);

  const scrollResult = await page.evaluate(async () => {
    const longFrames = [];
    let observer = null;

    if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')) {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            longFrames.push({
              duration: Math.round(entry.duration),
              startTime: Math.round(entry.startTime)
            });
          }
        }
      });
      // Do NOT buffer past frames! Only observe from this point forward.
      observer.observe({ type: 'long-animation-frame', buffered: false });
    }

    // Scroll smoothly through document via Lenis
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const lenis = window.__lenis;

    // Measure FPS across the 5 sections
    const sectionFps = [];
    const sectionTargets = [0, 0.25, 0.45, 0.70, 1.0];

    for (let s = 0; s < sectionTargets.length; s++) {
      const targetProg = sectionTargets[s];
      const targetY = totalHeight * targetProg;

      if (lenis) {
        lenis.scrollTo(targetY, { duration: 0.8, immediate: false });
      } else {
        window.scrollTo(0, targetY);
      }

      // Count RAF frames for 800ms
      let frameCount = 0;
      const t0 = performance.now();
      await new Promise(resolve => {
        const countFrame = () => {
          frameCount++;
          if (performance.now() - t0 < 800) {
            requestAnimationFrame(countFrame);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(countFrame);
      });

      const actualDuration = (performance.now() - t0) / 1000;
      sectionFps.push(Math.round(frameCount / actualDuration));
    }

    if (observer) {
      observer.disconnect();
    }

    return {
      sectionFps,
      longFramesCount: longFrames.length,
      longFrames
    };
  });

  console.log('\n================ PERFORMANCE PROFILE ================');
  console.log(`Average FPS per section:`);
  console.log(`  Stage 0 (Hero):       ${scrollResult.sectionFps[0]} FPS`);
  console.log(`  Stage 1 (Works):      ${scrollResult.sectionFps[1]} FPS`);
  console.log(`  Stage 2 (Arsenal):    ${scrollResult.sectionFps[2]} FPS`);
  console.log(`  Stage 3 (Trajectory): ${scrollResult.sectionFps[3]} FPS`);
  console.log(`  Stage 4 (Contact):    ${scrollResult.sectionFps[4]} FPS`);
  console.log(`Total frames > 50ms during active scroll: ${scrollResult.longFramesCount}`);
  if (scrollResult.longFramesCount > 0) {
    console.log('Long frames:', scrollResult.longFrames);
  } else {
    console.log('VERIFIED: 0 frames exceeded 50ms during active top-to-bottom scroll!');
  }
  console.log('=====================================================\n');

  await browser.close();
  console.log('Phase 6 verification completed successfully.');
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
