const { chromium } = require("playwright");
const dns = require('dns').promises;
const fs = require('fs');
const net = require('net');


let proxyList = [];
const getProxy = async () => {
    const browser = await chromium.launch();
    console.log("Browser launched");
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://proxyscrape.com/free-proxy-list/bangladesh');
    proxyList = await page.evaluate(() => [...document.querySelectorAll('tbody tr')].map(row => {
        const cells = row.querySelectorAll('td');
        return {
            type: cells[0].textContent.trim().toLowerCase(),
            ip: cells[1].textContent.trim(),
            port: cells[2].querySelector('button').textContent.trim(),
            country: cells[3].textContent.trim(),
            anonymity: cells[5].textContent.trim().toLowerCase(),
            speed: cells[7].textContent.trim(),
            lastCheck: cells[8].textContent.trim()
        };
    }));
    console.log("Total proxy found: ",proxyList.length);
    await browser.close();
}


// Helper function to check if domain is reachable
async function isDomainReachable(hostname) {
    try {
        await dns.lookup(hostname);
        console.log(`✅ Domain ${hostname} is reachable and ip is ${await dns.lookup(hostname)}`);
        return true;
    } catch (err) {
        console.error(`DNS lookup failed for ${hostname}:`, err.message);
        return false;
    }
}

// Helper function to test proxy connection
async function testProxyConnection(proxyUrl) {
    try {
        const [host, port] = proxyUrl.split(':');
        
        return new Promise((resolve) => {
            const socket = net.createConnection({
                host: host,
                port: parseInt(port),
                timeout: 10000
            });
            
            socket.on('connect', () => {
                socket.end();
                resolve(true);
            });
            
            socket.on('error', (err) => {
                console.error('Proxy connection error:', err.message);
                resolve(false);
            });
            
            socket.on('timeout', () => {
                console.error('Proxy connection timeout');
                socket.destroy();
                resolve(false);
            });
        });
    } catch (err) {
        console.error('Error testing proxy:', err.message);
        return false;
    }
}

(async () => {
    await getProxy();
    const TARGET_URL = 'https://payment.ivacbd.com';
    const HOSTNAME = new URL(TARGET_URL).hostname;
    console.log("🔍 Checking network connectivity...");

    // Check if domain is reachable
    const isReachable = await isDomainReachable(HOSTNAME);
    if (!isReachable) {
        console.error(`❌ Cannot reach ${HOSTNAME}. Please check your internet connection and DNS settings.`);
        return;
    }
    
    // Test proxy connection
    console.log("🔌 Testing proxy connection...");
    const proxy = proxyList.map(()=>{
        return  testProxyConnection(proxyList.ip + ':' + proxyList.port);
    })

    if (!proxy) {
        console.error('❌ Proxy server is not reachable. Trying without proxy...');
    } else {
        console.log('✅ Proxy server is reachable');
    }
    
    // Launch browser with visible window
    const browser = await chromium.launch({
        headless: false,
        slowMo: 100, // Slow down by 100ms for better visibility
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
        ]
    });
    
    console.log("🚀 Browser launched");
    
    try {
        // Try with proxy first, then fallback to direct connection
        let context;
        
        if (proxy) {
            try {
                console.log("🔌 Trying with proxy...");
                context = await browser.newContext({
                    viewport: { width: 1366, height: 768 },
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
                    ignoreHTTPSErrors: true,
                    proxy: { server: proxy }
                });
            } catch (proxyError) {
                console.warn('⚠️ Failed to use proxy, falling back to direct connection:', proxyError.message);
            }
        }
        
        // If context wasn't created with proxy or proxy failed, try without
        if (!context) {
            console.log("🌐 Trying direct connection...");
            context = await browser.newContext({
                viewport: { width: 1366, height: 768 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
                ignoreHTTPSErrors: true
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
            const response = await page.goto(TARGET_URL, { 
                waitUntil: 'domcontentloaded',
                timeout: 60000 // 60 seconds timeout
            });
            
            if (response) {
                console.log(`✅ Page loaded with status: ${response.status()}`);
                console.log(`📄 Page title: ${await page.title()}`);
                
                // Take a screenshot for debugging
                await page.screenshot({ path: 'debug-screenshot.png' });
                console.log('📸 Screenshot saved as debug-screenshot.png');
                
                // Save page content for debugging
                const content = await page.content();
                fs.writeFileSync('page-content.html', content);
                console.log('💾 Page content saved as page-content.html');
                
                // Keep the browser open
                console.log("⏳ Keeping browser open... (Press Ctrl+C to exit)");
                await new Promise(() => {}); // Keep the process running
            }
            
        } catch (navError) {
            console.error('❌ Navigation error:', navError.message);
            // Keep the browser open for inspection
            console.log("\nBrowser will remain open for inspection...");
            await new Promise(() => {}); // Keep the process running
        }
        
    } catch (error) {
        console.error("❌ An unexpected error occurred:", error);
    } finally {
        // Browser close is now manual since we're keeping it open
        // await browser.close();
    }
})();