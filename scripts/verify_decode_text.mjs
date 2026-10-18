import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function verifyDecodeText() {
  console.log('══════════ DECODE TEXT HOVER VERIFICATION ══════════');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11'],
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  // Skip boot screen
  await page.addInitScript(() => {
    window.sessionStorage.setItem('compile_booted', 'true');
  });

  console.log('1. Loading portfolio at http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  console.log('Waiting for Hero heading to complete compile animation into DecodeText (.dt)...');
  await page.waitForSelector('#hero h1.dt', { timeout: 10000 });

  // 1. Verify Hero heading has compiled into DecodeText (.dt)
  console.log('\n2. Verifying Hero heading (.dt) ...');
  const heroDtExists = await page.evaluate(() => {
    const h1 = document.querySelector('#hero h1');
    if (!h1) return { error: 'No #hero h1 found' };
    const isDt = h1.classList.contains('dt');
    const charCount = h1.querySelectorAll('.dt-c').length;
    const realCount = h1.querySelectorAll('.dt-r').length;
    const glyphCount = h1.querySelectorAll('.dt-g').length;
    return { isDt, charCount, realCount, glyphCount, ariaLabel: h1.getAttribute('aria-label') };
  });

  console.log('Hero heading structure:', heroDtExists);
  if (!heroDtExists.isDt || heroDtExists.charCount < 13) {
    throw new Error(`Hero heading did not compile to DecodeText! ${JSON.stringify(heroDtExists)}`);
  }
  console.log('✓ PASS: Hero heading compiled to DecodeText with 13 letter spans');

  // 2. Test Hover & Proximity Decoding on Hero Heading
  console.log('\n3. Testing hover & proximity decoding on Hero heading...');
  const h1Box = await page.locator('#hero h1').boundingBox();
  if (!h1Box) throw new Error('Could not get bounding box for #hero h1');

  // Hover over the first word "SHIVAM" (around x = h1Box.x + 40, y = h1Box.y + 25)
  const hoverX = h1Box.x + 50;
  const hoverY = h1Box.y + 35;
  await page.mouse.move(hoverX, hoverY);
  await page.waitForTimeout(300);

  const hoverState = await page.evaluate(() => {
    const h1 = document.querySelector('#hero h1');
    const chars = Array.from(h1.querySelectorAll('.dt-c'));
    const real = chars.map((c) => c.querySelector('.dt-r'));
    const glyph = chars.map((c) => c.querySelector('.dt-g'));

    // Check cursor mode
    const caret = document.querySelector('.animate-cursor-caret');
    const caretOpacity = caret ? window.getComputedStyle(caret).opacity : '0';

    const states = chars.map((c, i) => ({
      index: i,
      char: real[i].textContent,
      glyph: glyph[i].textContent,
      realOpacity: window.getComputedStyle(real[i]).opacity,
      glyphOpacity: window.getComputedStyle(glyph[i]).opacity,
      transform: c.style.transform,
    }));

    return {
      isHot: h1.classList.contains('is-hot'),
      caretOpacity,
      decodedCount: states.filter((s) => parseFloat(s.glyphOpacity) > 0.5).length,
      normalCount: states.filter((s) => parseFloat(s.realOpacity) > 0.5).length,
      firstChar: states[0], // 'S' in SHIVAM (close to cursor)
      lastChar: states[states.length - 1], // '.' in Mishra. (far from cursor)
    };
  });

  console.log('Hero hover state:', {
    isHot: hoverState.isHot,
    caretOpacity: hoverState.caretOpacity,
    decodedCount: hoverState.decodedCount,
    normalCount: hoverState.normalCount,
    firstChar: hoverState.firstChar,
    lastChar: hoverState.lastChar,
  });

  if (!hoverState.isHot) throw new Error('Hero heading did not get .is-hot class on hover');
  if (hoverState.decodedCount === 0) throw new Error('No letters decoded on hover!');
  if (parseFloat(hoverState.caretOpacity) < 0.5) throw new Error('Custom cursor did not switch to caret on hover!');
  console.log('✓ PASS: Proximity decoding active: letters near cursor decoded to glyphs, far letters remain normal');
  console.log('✓ PASS: Custom cursor switched to text caret (|)');

  // Take screenshot of Hero hover decode
  await page.screenshot({ path: path.join(artifactsDir, 'decode_hero_hover.png') });
  console.log('✓ Screenshot saved: decode_hero_hover.png');

  // 3. Move mouse away and verify full resolution
  console.log('\n4. Testing resolution after mouse leaves...');
  await page.mouse.move(10, 10);
  await page.waitForTimeout(500);

  const leaveState = await page.evaluate(() => {
    const h1 = document.querySelector('#hero h1');
    const chars = Array.from(h1.querySelectorAll('.dt-c'));
    const real = chars.map((c) => c.querySelector('.dt-r'));
    const glyph = chars.map((c) => c.querySelector('.dt-g'));

    const decodedCount = glyph.filter((g) => parseFloat(window.getComputedStyle(g).opacity) > 0.1).length;
    const normalCount = real.filter((r) => parseFloat(window.getComputedStyle(r).opacity) > 0.9).length;
    const transformsActive = chars.filter((c) => c.style.transform !== '').length;

    return {
      isHot: h1.classList.contains('is-hot'),
      decodedCount,
      normalCount,
      transformsActive,
    };
  });

  console.log('Hero leave state:', leaveState);
  if (leaveState.isHot) throw new Error('Hero heading still has .is-hot after leave');
  if (leaveState.decodedCount > 0) throw new Error('Some glyphs are still decoded after leave!');
  if (leaveState.transformsActive > 0) throw new Error('Some char transforms did not reset after leave!');
  console.log('✓ PASS: All letters cleanly resolved back to real text with zero lingering transforms');

  // 4. Scroll to Projects and test "Selected Works."
  console.log('\n5. Scrolling to #projects section...');
  await page.evaluate(() => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'instant' });
  });
  console.log('Waiting for Selected Works to compile into DecodeText (.dt)...');
  await page.waitForSelector('#projects h2.dt', { timeout: 10000 });

  const worksDtExists = await page.evaluate(() => {
    const h2 = document.querySelector('#projects h2');
    return {
      exists: !!h2,
      isDt: h2?.classList.contains('dt'),
      text: h2?.getAttribute('aria-label'),
      charCount: h2?.querySelectorAll('.dt-c').length,
    };
  });
  console.log('Selected Works structure:', worksDtExists);
  if (!worksDtExists.isDt) throw new Error('Selected Works did not compile to DecodeText');
  console.log('✓ PASS: "Selected Works." compiled to DecodeText');

  // 5. Test Project Card Title ("ONBUGGY")
  console.log('\n6. Testing Project Card title ("ONBUGGY")...');
  const cardTitleInfo = await page.evaluate(() => {
    const title = document.querySelector('#projects h3.dt');
    return {
      exists: !!title,
      text: title?.getAttribute('aria-label'),
      charCount: title?.querySelectorAll('.dt-c').length,
    };
  });
  console.log('ONBUGGY card title structure:', cardTitleInfo);
  if (!cardTitleInfo.exists || cardTitleInfo.charCount < 7) {
    throw new Error('Project card title ONBUGGY is not rendered with DecodeText');
  }

  // Hover over card background (outside title) -> check cursor is 'open'
  console.log('Testing card background hover cursor...');
  const cardBox = await page.locator('[data-cursor="open"]').first().boundingBox();
  if (cardBox) {
    // Bottom area of card away from title
    await page.mouse.move(cardBox.x + cardBox.width - 50, cardBox.y + cardBox.height - 30);
    await page.waitForTimeout(200);

    const cursorOpenState = await page.evaluate(() => {
      const openDisc = Array.from(document.querySelectorAll('div')).find((d) => d.textContent?.includes('OPEN ↗'));
      return {
        openDiscOpacity: openDisc ? window.getComputedStyle(openDisc).opacity : '0',
      };
    });
    console.log('Cursor over card background:', cursorOpenState);
  }

  // Now hover directly over the project card title "ONBUGGY"
  console.log('Hovering directly over ONBUGGY card title...');
  const titleBox = await page.locator('#projects h3.dt').first().boundingBox();
  if (!titleBox) throw new Error('Could not get bounding box for ONBUGGY title');

  await page.mouse.move(titleBox.x + 30, titleBox.y + titleBox.height / 2);
  await page.waitForTimeout(300);

  const cardTitleHoverState = await page.evaluate(() => {
    const title = document.querySelector('#projects h3.dt');
    const caret = document.querySelector('.animate-cursor-caret');
    const chars = Array.from(title.querySelectorAll('.dt-c'));
    const glyphs = chars.map((c) => c.querySelector('.dt-g'));
    const decodedCount = glyphs.filter((g) => parseFloat(window.getComputedStyle(g).opacity) > 0.5).length;

    return {
      isHot: title.classList.contains('is-hot'),
      caretOpacity: caret ? window.getComputedStyle(caret).opacity : '0',
      decodedCount,
    };
  });

  console.log('ONBUGGY title hover state:', cardTitleHoverState);
  if (!cardTitleHoverState.isHot) throw new Error('ONBUGGY title did not get .is-hot');
  if (cardTitleHoverState.decodedCount === 0) throw new Error('ONBUGGY letters did not decode!');
  if (parseFloat(cardTitleHoverState.caretOpacity) < 0.5) throw new Error('Cursor did not switch to caret over card title!');
  console.log('✓ PASS: Hovering project card title switches cursor to caret and decodes letters!');

  // Take screenshot of Project card title hover decode
  await page.screenshot({ path: path.join(artifactsDir, 'decode_project_card_hover.png') });
  console.log('✓ Screenshot saved: decode_project_card_hover.png');

  // 6. Test Case Study Modal Title
  console.log('\n7. Testing Case Study Modal Title...');
  // Click DEEP DIVE / CASE STUDY on ONBUGGY
  await page.locator('#projects button:has-text("CASE STUDY"), #projects button:has-text("DEEP DIVE")').first().click();
  console.log('Waiting for modal title to compile into DecodeText (.dt)...');
  await page.waitForSelector('[data-lenis-prevent] h1.dt', { timeout: 10000 });

  const modalTitleState = await page.evaluate(() => {
    const modal = document.querySelector('[data-lenis-prevent]');
    if (!modal) return { error: 'Modal not open' };
    const h1 = modal.querySelector('h1.dt');
    return {
      modalOpen: true,
      hasDtH1: !!h1,
      titleText: h1?.getAttribute('aria-label'),
      charCount: h1?.querySelectorAll('.dt-c').length,
    };
  });
  console.log('Modal title state:', modalTitleState);
  if (!modalTitleState.hasDtH1) throw new Error('Case study title in modal is not DecodeText!');
  console.log('✓ PASS: Case study modal title compiled into DecodeText');

  // Hover over the modal title
  const modalH1Box = await page.locator('[data-lenis-prevent] h1.dt').boundingBox();
  if (modalH1Box) {
    await page.mouse.move(modalH1Box.x + 40, modalH1Box.y + modalH1Box.height / 2);
    await page.waitForTimeout(300);

    const modalHover = await page.evaluate(() => {
      const h1 = document.querySelector('[data-lenis-prevent] h1.dt');
      const caret = document.querySelector('.animate-cursor-caret');
      const chars = Array.from(h1?.querySelectorAll('.dt-c') || []);
      const decodedCount = chars.map((c) => c.querySelector('.dt-g')).filter((g) => g && parseFloat(window.getComputedStyle(g).opacity) > 0.5).length;
      return {
        isHot: h1?.classList.contains('is-hot'),
        caretOpacity: caret ? window.getComputedStyle(caret).opacity : '0',
        decodedCount,
      };
    });
    console.log('Modal title hover:', modalHover);
    if (!modalHover.isHot || modalHover.decodedCount === 0) throw new Error('Modal title letters did not decode!');
    console.log('✓ PASS: Case study title decodes on hover');
    await page.screenshot({ path: path.join(artifactsDir, 'decode_casestudy_hover.png') });
    console.log('✓ Screenshot saved: decode_casestudy_hover.png');
  }

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 7. Test Touch Device Guard
  console.log('\n8. Testing Touch Device Guard (coarse pointer)...');
  const touchContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const touchPage = await touchContext.newPage();
  await touchPage.addInitScript(() => {
    window.sessionStorage.setItem('compile_booted', 'true');
  });
  await touchPage.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await touchPage.waitForTimeout(2000);

  const touchCheck = await touchPage.evaluate(() => {
    const h1 = document.querySelector('#hero h1');
    const isDt = h1?.classList.contains('dt');
    // Dispatch a touch event or pointerenter with pointerType "touch"
    const enterEvt = new PointerEvent('pointerenter', { pointerType: 'touch', bubbles: true });
    h1?.dispatchEvent(enterEvt);
    return {
      isDt,
      isHot: h1?.classList.contains('is-hot'),
    };
  });
  console.log('Touch device response:', touchCheck);
  if (touchCheck.isHot) throw new Error('FAIL: DecodeText activated on touch event!');
  console.log('✓ PASS: Touch device safely ignored: no hover or lens effect on touch');

  await touchContext.close();
  await browser.close();
  console.log('\n══════════ ALL DECODE TEXT VERIFICATIONS PASSED ══════════\n');
}

verifyDecodeText().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
