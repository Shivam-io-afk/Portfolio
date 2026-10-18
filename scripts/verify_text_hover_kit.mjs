import { chromium } from 'playwright';

async function testHoverKit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    hasTouch: false,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // 1. BitDissolve on Hero Heading
  console.log('Testing BitDissolve on Hero...');
  const heroHeading = page.locator('#hero h1');
  const h1Text = await heroHeading.evaluate((el) => el.className);
  console.log('Hero h1 class:', h1Text);

  const heroBox = await heroHeading.boundingBox();
  if (heroBox) {
    await page.mouse.move(heroBox.x + heroBox.width / 2, heroBox.y + heroBox.height / 2);
    await page.waitForTimeout(400);
    const canvasCount = await heroHeading.locator('canvas').count();
    console.log('Hero BitDissolve canvas created on hover:', canvasCount > 0);
    await page.screenshot({ path: 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901/verify_bitdissolve_hero.png' });
  }

  // 2. RollNumber on Hero Stats
  console.log('Testing RollNumber on Hero stats...');
  const rollNumbers = page.locator('#hero .thk-rn');
  const rnCount = await rollNumbers.count();
  console.log('Hero RollNumber count:', rnCount);
  if (rnCount > 0) {
    const firstRn = rollNumbers.first();
    const rnBox = await firstRn.boundingBox();
    if (rnBox) {
      await page.mouse.move(rnBox.x + rnBox.width / 2, rnBox.y + rnBox.height / 2);
      await page.waitForTimeout(150);
      const isRolling = await firstRn.evaluate((el) => el.classList.contains('is-rolling'));
      console.log('Hero RollNumber is-rolling on hover:', isRolling);
      await page.screenshot({ path: 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901/verify_rollnumber_hero.png' });
    }
  }

  // 3. TypeSwap on Stage 00
  console.log('Testing TypeSwap on Stage 00...');
  const stage00 = page.locator('#hero .thk-ts');
  const tsCount = await stage00.count();
  console.log('Stage 00 TypeSwap count:', tsCount);
  if (tsCount > 0) {
    const tsBox = await stage00.first().boundingBox();
    if (tsBox) {
      await page.mouse.move(tsBox.x + tsBox.width / 2, tsBox.y + tsBox.height / 2);
      await page.waitForTimeout(700); // let it retype
      const typedText = await stage00.first().innerText();
      console.log('Stage 00 text on hover:', typedText);
      await page.screenshot({ path: 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901/verify_typeswap_stage00.png' });
    }
  }

  // 4. BracketLink on Hero Github
  console.log('Testing BracketLink on Hero Github...');
  const bracketLinks = page.locator('#hero .thk-bl');
  const blCount = await bracketLinks.count();
  console.log('Hero BracketLink count:', blCount);
  if (blCount > 0) {
    const blBox = await bracketLinks.first().boundingBox();
    if (blBox) {
      await page.mouse.move(blBox.x + blBox.width / 2, blBox.y + blBox.height / 2);
      await page.waitForTimeout(200);
      await page.screenshot({ path: 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901/verify_bracketlink_hero.png' });
    }
  }

  // 5. WordmarkSpotlight in Footer
  console.log('Testing WordmarkSpotlight in Footer...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  const footerWordmark = page.locator('.thk-wm');
  const wmCount = await footerWordmark.count();
  console.log('Footer Wordmark count:', wmCount);
  if (wmCount > 0) {
    const wmBox = await footerWordmark.boundingBox();
    if (wmBox) {
      await page.mouse.move(wmBox.x + wmBox.width * 0.45, wmBox.y + wmBox.height * 0.5);
      await page.waitForTimeout(300);
      const rStyle = await footerWordmark.evaluate((el) => el.style.getPropertyValue('--r'));
      console.log('Wordmark --r radius on hover:', rStyle);
      await page.screenshot({ path: 'C:/Users/sm255/.gemini/antigravity/brain/e8ca3446-7140-411d-ad77-183f9fc77901/verify_wordmark_spotlight.png' });
    }
  }

  await browser.close();
  console.log('Verification finished successfully!');
}

testHoverKit().catch(console.error);

