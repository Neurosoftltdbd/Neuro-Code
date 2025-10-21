const { chromium } = require("playwright");
const dns = require('dns').promises;
const net = require('net');
const { scrapeProxies } = require('./proxyScraper');
const { spysProxy } = require('./spysProxy');

async function testProxyConnection(proxy, maxRetries = 1) {
    const proxyUrl = `${proxy.ip}:${proxy.port}`;
    const proxyType = proxy.protocol || 'http';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Testing proxy ${proxyUrl} (attempt ${attempt}/${maxRetries})`);

            // Test basic TCP connection first
            const isReachable = await new Promise((resolve) => {
                const socket = net.createConnection({
                    host: proxy.ip,
                    port: parseInt(proxy.port),
                    timeout: 10000
                });

                socket.on('connect', () => {
                    socket.end();
                    resolve(true);
                });

                socket.on('error', () => resolve(false));
                socket.on('timeout', () => {
                    socket.destroy();
                    resolve(false);
                });
            });

            if (isReachable) {
                console.log(`✅ Proxy ${proxyUrl} is reachable`);
                return true; // Success - proxy is working
            } else {
                console.log(`❌ Proxy ${proxyUrl} is not reachable`);
            }
        } catch (err) {
            console.log(`⚠️ Error testing proxy ${proxyUrl}:`, err.message);
        }
    }

    return false; // All attempts failed
}

// Main execution
async function main() {
    //const proxies = await scrapeProxies();
    const proxies = await spysProxy();

    console.log('scraped proxies: ', proxies.length);
    const TARGET_URL = 'https://payment.ivacbd.com';

    const workingProxies = [];
    if (proxies.length > 0) {
        for (let i = 0; i < proxies.length; i++) {
            if (await testProxyConnection(proxies[i])) {
                workingProxies.push(proxies[i]);
                if (workingProxies.length >= 1) break;
            }
        }
    }

    console.log(`\n✅ Found ${workingProxies.length} working proxies out of ${proxies.length}`);

    let selectedProxy = workingProxies.length > 0 ? workingProxies[0] : null;

    console.log("\n🚀 Launching browser...");
    let browser;
    let context;
    try {
        browser = await chromium.launch({
            headless: false,
            slowMo: 100, // Slow down by 100ms for better visibility
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--proxy-server=' + selectedProxy.ip + ':' + selectedProxy.port
            ]
        });
        console.log('✅ Browser launched successfully');


        if (selectedProxy) {
            try {
                const proxyUrl = `${selectedProxy.protocol || 'http'}://${selectedProxy.ip}:${selectedProxy.port}`;
                console.log(`\n🔌 Using proxy: ${proxyUrl}`);

                const contextOptions = {
                    viewport: { width: 1280, height: 720 },
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
                    ignoreHTTPSErrors: true,
                    proxy: {
                        server: proxyUrl,
                        timeout: 20000 // 20 seconds timeout for proxy
                    },
                    extraHTTPHeaders: {
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    }
                };

                context = await browser.newContext(contextOptions);
            } catch (proxyError) {
                console.warn('⚠️ Failed to use proxy, falling back to direct connection:', proxyError.message);
                context = await browser.newContext();
            }
        } else {
            context = await browser.newContext();
        }
    } catch (error) {
        console.error('❌ Error creating browser context:', error.message);
    }

    // If context wasn't created with proxy or proxy failed, try without
    if (!context) {
        console.log("🌐 Trying direct connection...");
        context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
            ignoreHTTPSErrors: true,
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });
    }

    const page = await context.newPage();

    // Enable request/response logging
    page.on('request', request => console.log(`→ ${request.method()} ${request.url()}`));
    page.on('response', response =>
        console.log(`← ${response.status()} ${response.url()}`)
    );

    // Navigate to the payment page
    console.log(`🌐 Navigating to ${TARGET_URL}...`);

    try {
        try {
            const response = await page.goto(TARGET_URL, {
                waitUntil: 'domcontentloaded',
                referer: 'https://ivacbd.com',
                referrerPolicy: 'origin',
                headers: {
                    'Referer': 'https://payment.ivacbd.com',
                    'Referrer-Policy': 'origin',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
                },
                timeout: 120000 // 2 minutes timeout
            });

            if (response) {
                console.log(`✅ Page loaded with status: ${response.status()}`);
                console.log(`📄 Page title: ${await page.title()}`);
            }

        } catch (navError) {
            console.error('❌ Navigation error:', navError.message);
            main();
        }
    } catch (error) {
        console.error("❌ An unexpected error occurred:", error);
    }
};

main();
