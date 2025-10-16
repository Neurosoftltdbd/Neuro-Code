module.exports = {
    TARGET_URL: 'https://payment.ivacbd.com',
    
    // Multiple proxy list sources to try
    PROXY_SOURCES: [
        'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=5000&country=BD',
        'https://www.proxy-list.download/api/v1/get?type=http&country=BD',
        'https://www.proxyscan.io/api/proxy?type=http&uptime=50&format=txt',
    ],
    
    // Browser configuration
    BROWSER_OPTIONS: {
        headless: false, // Set to true in production
        slowMo: 100,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-blink-features=AutomationControlled',
            '--disable-infobars',
            '--window-size=1366,768',
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
        ],
        // Add a real user data directory to appear more like a regular user
        userDataDir: './user_data',
    },
    
    // Timeout settings
    TIMEOUTS: {
        PAGE_LOAD: 60000,
        PROXY_TEST: 5000,  // Reduced timeout for faster testing
        REQUEST: 15000,
        RETRY_DELAY: 1000,  // 1 second delay between retries
    },
    
    // User agent and headers
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    
    // Cloudflare bypass settings
    CLOUDFLARE_OPTIONS: {
        maxTimeout: 30000,  // Max time to wait for Cloudflare challenge
        waitForSelectorTimeout: 10000,
    },
    
    // Retry settings
    RETRY: {
        MAX_ATTEMPTS: 3,
        DELAY: 2000,  // 2 seconds between retries
    }
};
