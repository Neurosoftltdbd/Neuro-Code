import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add stealth plugin
puppeteer.use(StealthPlugin());

// Add delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Jitter helpers for more human-like pacing
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const jitter = (base, pct = 0.25) => {
  const delta = Math.floor(base * pct);
  return rand(Math.max(0, base - delta), base + delta);
};
const humanPause = async (baseMs = 800) => {
  await delay(jitter(baseMs));
};

// Random mouse wiggles to simulate idle human presence
async function humanMouseWiggle(page, { moves = 8 } = {}) {
  try {
    const viewport = page.viewport();
    const startX = rand(50, Math.max(60, (viewport?.width || 1200) - 60));
    const startY = rand(50, Math.max(60, (viewport?.height || 800) - 60));
    await page.mouse.move(startX, startY, { steps: rand(5, 12) });
    for (let i = 0; i < moves; i++) {
      await delay(rand(80, 220));
      const x = startX + rand(-40, 40);
      const y = startY + rand(-25, 25);
      await page.mouse.move(x, y, { steps: rand(2, 10) });
    }
  } catch {}
}

// Smooth scroll to bottom and a bit up
async function gentleScroll(page) {
  try {
    await page.evaluate(async () => {
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));
      const total = document.body.scrollHeight;
      const steps = Math.max(4, Math.min(18, Math.floor(total / 600)));
      const chunk = Math.ceil(total / steps);
      for (let i = 0; i < steps; i++) {
        window.scrollBy({ top: chunk, behavior: 'smooth' });
        await sleep(200 + Math.floor(Math.random() * 300));
      }
      await sleep(300 + Math.floor(Math.random() * 300));
      window.scrollBy({ top: -Math.floor(chunk / 2), behavior: 'smooth' });
    });
  } catch {}
}

// Choose a realistic UA and viewport
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
];
const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1600, height: 900 },
  { width: 1536, height: 864 },
  { width: 1366, height: 768 }
];

async function run() {
    const vp = VIEWPORTS[rand(0, VIEWPORTS.length - 1)];
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        executablePath: executablePath(),
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            `--window-size=${vp.width},${vp.height}`,
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            //'--proxy-server=2f1d8a0cc7b893e8:yk8QRD9o@res.proxy-seller.com:10000',
        ],
        ignoreDefaultArgs: ['--disable-extensions'],
        ignoreHTTPSErrors: true,
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent(USER_AGENTS[rand(0, USER_AGENTS.length - 1)]);
        await page.setExtraHTTPHeaders({
            'accept-language': 'en-US,en;q=0.9',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'accept-encoding': 'gzip, deflate, br',
            'upgrade-insecure-requests': '1',
        });

        // BEFORE injecting script: optionally bypass CSP (use responsibly)
        await page.setBypassCSP(true); // only if you control the target or have permission

        console.log('Navigating to page...');

        await page.goto('https://www.ivacbd.com', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        await humanPause(1500);
        await humanMouseWiggle(page);
        await gentleScroll(page);

        // Now navigate to the target site
        console.log('Navigating to target site...');
        await page.goto('https://payment.ivacbd.com/', {
            waitUntil: 'domcontentloaded',
            timeout: 120000 // 2 minutes timeout
        });
        await humanPause(1200);
        await humanMouseWiggle(page);

        // Wait for Cloudflare challenge to complete
        console.log('Waiting for Cloudflare challenge...');
        await page.waitForFunction(
            () => document.readyState === 'complete' || document.readyState === 'interactive',
            { timeout: 120000 }
        ).catch(() => console.log('Page may still be loading or blocked'));
        await humanPause(1000);
        await gentleScroll(page);

        // await page.evaluate(() => {
        //     document.body.innerHTML = `<h2>Hello, hacker</h2>`;
        // });

        // Read and inject the IVAC smart panel script
        try {
            const scriptPath = resolve(__dirname, './ivac-rupon.js');
            const scriptContent = readFileSync(scriptPath, 'utf8');

            // Remove the UserScript header if it exists
            const scriptWithoutHeader = scriptContent.replace(
                /^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\s*/,
                ''
            );

            // Inject the script content directly
            await page.evaluate((script) => {
                const scriptEl = document.createElement('script');
                scriptEl.textContent = script;
                document.head.appendChild(scriptEl);
            }, scriptWithoutHeader);

            console.log('IVAC Smart Panel script injected successfully');

            // Take a screenshot after injection
            await page.screenshot({ path: 'after_injection.png', fullPage: true });
            console.log('Screenshot after injection saved as after_injection.png');

        } catch (error) {
            console.error('Error injecting script:', error);
        }

        // Take a screenshot
        await page.screenshot({ path: 'cloudflare_page.png', fullPage: true });
        console.log('Screenshot saved as cloudflare_page.png');

        // Get page content
        const content = await page.content();
        console.log('Page content length:', content.length);

        // Log all cookies
        const cookies = await page.cookies();
        console.log('Cookies:', cookies);

        // Keep the browser open for manual inspection
        console.log('Keeping browser open for 2 minutes...');
        await humanPause(2000);
        await humanMouseWiggle(page, { moves: 12 });
        await delay(118000);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Uncomment to close browser automatically
        // await browser.close();
    }
}

run();