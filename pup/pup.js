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

async function run() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        executablePath: executablePath(),
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--window-size=1920,1080',
            '--start-maximized'
        ],
        proxy: {
            server: '103.82.8.189'
        }
    });

    try {
        const page = await browser.newPage();

        // Set a realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36');

        // Set extra headers
        await page.setExtraHTTPHeaders({
            'accept-language': 'en-US,en;q=0.9',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'accept-encoding': 'gzip, deflate, br',
            'upgrade-insecure-requests': '1'
        });

        console.log('Navigating to page...');

        // First, visit a neutral page to establish a clean session
        await page.goto('https://www.ivacbd.com', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        await delay(3000); // Wait for 3 seconds

        // Now navigate to the target site
        console.log('Navigating to target site...');
        const pg = await browser.newPage();
        await pg.goto('https://payment.ivacbd.com/', {
            waitUntil: 'domcontentloaded',
            timeout: 120000 // 2 minutes timeout
        });

        // Wait for Cloudflare challenge to complete
        console.log('Waiting for Cloudflare challenge...');
        await page.waitForFunction(
            'document.querySelector("body").innerText.includes("payment.ivacbd.com")',
            { timeout: 120000 }
        ).catch(e => console.log('Cloudflare challenge might be present'));

        // await page.evaluate(() => {
        //     document.body.innerHTML = `<h2>Hello, hacker</h2>`;
        // });

        // Read and inject the IVAC smart panel script
        try {
            const scriptPath = resolve(__dirname, '../IVAC-smart-panel-script-v9.0.js');
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
        await delay(120000);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Uncomment to close browser automatically
        // await browser.close();
    }
}

run();