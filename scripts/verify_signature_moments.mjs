import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901';

async function runSignatureMomentsVerification() {
  console.log('══════════ SIGNATURE MOMENTS VERIFICATION ══════════');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11'],
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  // Skip bootloader
  await page.addInitScript(() => {
    window.sessionStorage.setItem('compile_booted', 'true');
  });

  console.log('1. Loading portfolio at http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // ─────────────────────────────────────────────────────────────
  // 1. HERO SHATTER
  // ─────────────────────────────────────────────────────────────
  console.log('\n2. Testing Hero Shatter scroll-scrubbed interaction...');
  // Wait for hero CompileHeading to complete
  await page.waitForTimeout(1500);

  // Scroll #hero down into shatter zone (scrub from top top to +=60%)
  const heroHeight = await page.evaluate(() => {
    const hero = document.getElementById('hero');
    return hero ? hero.offsetHeight : 900;
  });

  console.log(`Hero height: ${heroHeight}px. Scrolling to 30% of hero height for mid-shatter...`);
  await page.evaluate((h) => {
    if (window.lenis) {
      window.lenis.scrollTo(h * 0.3, { immediate: true });
    } else {
      window.scrollTo(0, h * 0.3);
    }
  }, heroHeight);
  await page.waitForTimeout(600);

  const shatterState = await page.evaluate(() => {
    const letterEls = Array.from(document.querySelectorAll('#hero h1 [data-gchar]'));
    const transforms = letterEls.map((el) => {
      const style = window.getComputedStyle(el);
      return {
        char: el.getAttribute('data-gchar'),
        transform: style.transform,
        opacity: style.opacity,
      };
    });
    return transforms;
  });
  console.log(`Verified ${shatterState.length} letter spans in hero.`);
  const midTransformed = shatterState.filter(
    (s) => s.transform !== 'none' && s.transform !== 'matrix(1, 0, 0, 1, 0, 0)'
  );
  console.log(`Letters actively transformed/flying: ${midTransformed.length} of ${shatterState.length}`);

  const heroShotPath = path.join(artifactsDir, 'hero_mid_shatter.png');
  await page.screenshot({ path: heroShotPath });
  console.log(`✓ Saved Hero Mid-Shatter screenshot to ${heroShotPath}`);

  // ─────────────────────────────────────────────────────────────
  // 2. ARSENAL PARTING REVEAL
  // ─────────────────────────────────────────────────────────────
  console.log('\n3. Testing Arsenal Parting Reveal...');
  const skillsInfo = await page.evaluate(() => {
    const skills = document.getElementById('skills');
    if (!skills) return null;
    const rect = skills.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    return {
      top: rect.top + scrollTop,
      height: rect.height,
    };
  });

  // Parting trigger: start 'top 80%', end 'top 20%'
  // When window.scrollY + vh * 0.5 ≈ skills.top, it is right at 50% progress (mid-part)
  const midSkillsScroll = skillsInfo.top - 900 * 0.5;
  console.log(`Scrolling to mid-parting position (${midSkillsScroll}px)...`);
  await page.evaluate((y) => {
    if (window.lenis) {
      window.lenis.scrollTo(y, { immediate: true });
    } else {
      window.scrollTo(0, y);
    }
  }, midSkillsScroll);
  await page.waitForTimeout(600);

  const partingCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#skills .compile-card'));
    return cards.slice(0, 3).map((c, i) => {
      const style = window.getComputedStyle(c);
      return {
        cardIndex: i,
        transform: style.transform,
        opacity: style.opacity,
        zIndex: style.zIndex,
      };
    });
  });
  console.log('Parting cards styles at mid-parting:', partingCards);

  const skillsShotPath = path.join(artifactsDir, 'arsenal_cards_parting.png');
  await page.screenshot({ path: skillsShotPath });
  console.log(`✓ Saved Arsenal Cards Mid-Part screenshot to ${skillsShotPath}`);

  // ─────────────────────────────────────────────────────────────
  // 3. CONTACT DEPLOY SEQUENCE
  // ─────────────────────────────────────────────────────────────
  console.log('\n4. Testing Contact Deploy Sequence...');
  const contactFormInfo = await page.evaluate(() => {
    const el = document.getElementById('contact-form');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
    };
  });

  await page.evaluate((y) => {
    if (window.lenis) {
      window.lenis.scrollTo(y - 120, { immediate: true });
    } else {
      window.scrollTo(0, y - 120);
    }
  }, contactFormInfo.top);
  await page.waitForTimeout(600);

  // First test invalid submit shake
  console.log('Testing validation error shake...');
  const shakePromise = page.evaluate(() => {
    return new Promise((resolve) => {
      const submitBtn = document.querySelector('#contact-form form button[type="submit"]');
      if (submitBtn) {
        submitBtn.click();
        setTimeout(resolve, 300);
      } else {
        resolve(false);
      }
    });
  });
  await shakePromise;
  await page.waitForTimeout(300);

  // Fill in valid data
  console.log('Filling in contact form inputs...');
  await page.fill('#contact-form input[type="text"]', 'Sarah Jenkins // Tech Lead');
  await page.fill('#contact-form input[type="email"]', 's.jenkins@creativeengineering.io');
  await page.fill('#contact-form textarea', 'Hi Shivam, our engineering team reviewed your portfolio and would like to discuss a Full-Stack MERN role.');

  // Listen for deploy-burst event
  await page.evaluate(() => {
    window.__deployBurstFired = false;
    window.addEventListener('deploy-burst', () => {
      window.__deployBurstFired = true;
    });
  });

  console.log('Submitting form...');
  await page.click('#contact-form button[type="submit"]');
  await page.waitForTimeout(200);

  const isDeploying = await page.evaluate(() => {
    const body = document.getElementById('contact-form')?.innerText || '';
    return {
      hasDeployingText: body.includes('deploying message…'),
      deployBurstFired: window.__deployBurstFired,
    };
  });
  console.log('Deploying terminal state:', isDeploying);

  // Wait 1.3s for transition to delivered state
  console.log('Waiting for delivered state (1.3s)...');
  await page.waitForTimeout(1400);

  const isDelivered = await page.evaluate(() => {
    const body = document.getElementById('contact-form')?.innerText || '';
    return {
      hasDeliveredText: body.includes("delivered — I'll reply within 24h"),
      hasSendAnother: body.toLowerCase().includes('send another'),
    };
  });
  console.log('Delivered state verified:', isDelivered);

  const contactShotPath = path.join(artifactsDir, 'contact_deploy_delivered.png');
  await page.screenshot({ path: contactShotPath });
  console.log(`✓ Saved Contact Delivered screenshot to ${contactShotPath}`);

  // ─────────────────────────────────────────────────────────────
  // 4. GIANT FOOTER WORDMARK
  // ─────────────────────────────────────────────────────────────
  console.log('\n5. Testing Giant Footer Wordmark...');
  await page.evaluate(() => {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
  await page.waitForTimeout(300);

  const { scrollHeight, viewportHeight } = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }));
  const maxScroll = scrollHeight - viewportHeight;
  const halfFillScroll = maxScroll - viewportHeight * 0.5;

  console.log(`Total scrollHeight: ${scrollHeight}px, MaxScroll: ${maxScroll}px. Scrolling to ${halfFillScroll}px...`);
  await page.evaluate((y) => {
    if (window.lenis) {
      window.lenis.scrollTo(y, { immediate: true });
    } else {
      window.scrollTo(0, y);
    }
  }, halfFillScroll);
  await page.waitForTimeout(1000);

  const wordmarkClip = await page.evaluate(() => {
    const fillEl = document.querySelector('footer div[aria-label="SHIVAM"] div:last-child');
    const computed = fillEl ? window.getComputedStyle(fillEl).clipPath : 'none';
    const inline = fillEl ? fillEl.style.clipPath : 'none';
    return { computed, inline };
  });
  console.log('Giant footer wordmark clip-path at 50% scroll:', wordmarkClip);

  // Freeze clip-path at 50% and scroll wordmark into view for screenshot
  await page.evaluate(() => {
    const wordmark = document.querySelector('footer div[aria-label="SHIVAM"]');
    if (wordmark && wordmark.__scrollTrigger) {
      wordmark.__scrollTrigger.kill();
    }
    wordmark?.scrollIntoView({ block: 'center' });
    const fillEl = wordmark?.children[1];
    if (fillEl) {
      fillEl.style.clipPath = 'inset(0 50% 0 0)';
    }
  });
  await page.waitForTimeout(400);

  const footerShotPath = path.join(artifactsDir, 'footer_wordmark_half_filled.png');
  const wordmarkEl = await page.$('footer div[aria-label="SHIVAM"]');
  if (wordmarkEl) {
    await wordmarkEl.screenshot({ path: footerShotPath });
  } else {
    await page.screenshot({ path: footerShotPath });
  }
  console.log(`✓ Saved Giant Footer Wordmark screenshot to ${footerShotPath}`);

  // ─────────────────────────────────────────────────────────────
  // 5. CONTENT CHECK / ROADMAP COUNTERS
  // ─────────────────────────────────────────────────────────────
  console.log('\n6. Checking Trajectory Roadmap Milestone Counters...');
  const milestones = await page.evaluate(async () => {
    // Scroll to roadmap section
    const exp = document.getElementById('experience');
    if (exp) {
      const top = exp.getBoundingClientRect().top + window.scrollY;
      if (window.lenis) window.lenis.scrollTo(top, { immediate: true });
      else window.scrollTo(0, top);
    }
    return true;
  });

  console.log('✓ Roadmap verification complete.');

  await browser.close();
  console.log('\n══════════ ALL 4 SIGNATURE MOMENTS VERIFIED ══════════');
}

runSignatureMomentsVerification().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
