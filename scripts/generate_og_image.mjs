import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, '../public/og-image.png');

async function generateOgImage() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px;
      height: 630px;
      background: #07070a;
      color: #d8dde6;
      font-family: 'Space Grotesk', sans-serif;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 64px 80px;
    }
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(216, 221, 230, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(216, 221, 230, 0.04) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }
    .glow-sphere {
      position: absolute;
      right: 120px;
      top: 100px;
      width: 440px;
      height: 440px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 91, 31, 0.35) 0%, rgba(255, 91, 31, 0.08) 50%, transparent 70%);
      filter: blur(20px);
      pointer-events: none;
    }
    .orbit-ring {
      position: absolute;
      right: 100px;
      top: 80px;
      width: 480px;
      height: 480px;
      border-radius: 50%;
      border: 1px dashed rgba(255, 91, 31, 0.4);
      pointer-events: none;
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
      border-bottom: 1px solid rgba(216, 221, 230, 0.1);
      padding-bottom: 24px;
    }
    .monogram {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .bracket { color: #ff5b1f; }
    .status-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(74, 222, 128, 0.1);
      border: 1px solid rgba(74, 222, 128, 0.3);
      border-radius: 9999px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #4ade80;
      letter-spacing: 0.1em;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4ade80;
    }
    .main-body {
      z-index: 10;
      max-width: 720px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #ff5b1f;
      letter-spacing: 0.1em;
    }
    h1 {
      font-size: 76px;
      line-height: 0.95;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #ffffff;
    }
    h1 .serif {
      font-family: 'Instrument Serif', serif;
      font-style: italic;
      color: #ff5b1f;
      font-weight: 400;
      padding-left: 12px;
    }
    .desc {
      font-size: 22px;
      font-weight: 400;
      color: rgba(216, 221, 230, 0.85);
      line-height: 1.4;
    }
    .footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
      border-top: 1px solid rgba(216, 221, 230, 0.1);
      padding-top: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: rgba(216, 221, 230, 0.5);
      letter-spacing: 0.1em;
    }
    .accent { color: #ff5b1f; }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="glow-sphere"></div>
  <div class="orbit-ring"></div>

  <div class="header-row">
    <div class="monogram">
      <span class="bracket">[</span>
      <span style="font-weight: 700; color: #fff;">SM</span>
      <span class="bracket">]</span>
      <span style="color: rgba(216, 221, 230, 0.4); margin: 0 4px;">//</span>
      <span>COMPILE ARCHITECTURE SYSTEM</span>
    </div>
    <div class="status-pill">
      <span class="dot"></span>
      <span>BUILD #2026 · PASSING</span>
    </div>
  </div>

  <div class="main-body">
    <div class="tag">
      <span>●</span>
      <span>STAGE 00 /// SOURCE.INIT · 12,000 BITS</span>
    </div>
    <h1>SHIVAM<span class="serif">Mishra.</span></h1>
    <p class="desc">
      MERN Stack Developer & Creative Technologist crafting high-performance web applications, GSAP/Three.js motion, and API-integrated AI features.
    </p>
  </div>

  <div class="footer-row">
    <div>
      <span class="accent">LOCATION:</span> REWA, INDIA &bull; <span class="accent">STACK:</span> REACT · NODE · THREE.JS · MONGODB
    </div>
    <div>
      PORTFOLIO-SHIVAM.VERCEL.APP
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outputPath, type: 'png' });
  await browser.close();
  console.log(`Generated OG image: ${outputPath}`);
}

generateOgImage().catch((err) => {
  console.error(err);
  process.exit(1);
});

