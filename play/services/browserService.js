const { chromium } = require('playwright');
const logger = require('../utils/logger');
const config = require('../config');
const fs = require('fs');
const path = require('path');

class BrowserService {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        //this.scriptPath = path.join(process.cwd(), './IVAC-smart-panel-script-v9.0.js');
        this.scriptPath = path.resolve(__dirname, '../../IVAC-smart-panel-script-v9.0.js');
    }

    /** Initialize the browser and context */
    async initialize(proxy = null) {
        try {
            await logger.info('Launching browser...');

            // Browser launch options
            const launchOptions = {
                headless: config.BROWSER_OPTIONS.headless,
                slowMo: config.BROWSER_OPTIONS.slowMo,
                args: config.BROWSER_OPTIONS.args.filter(arg => !arg.startsWith('--user-data-dir')),
                ...(proxy && {
                    proxy: {
                        server: `${proxy.protocol || 'http'}://${proxy.ip}:${proxy.port}`,
                        username: proxy.username,
                        password: proxy.password
                    }
                })
            };

            // Context options
            const contextOptions = {
                viewport: {
                    width: 1280 + Math.floor(Math.random() * 100),
                    height: 720 + Math.floor(Math.random() * 100)
                },
                userAgent: config.USER_AGENT,
                ignoreHTTPSErrors: true,
                extraHTTPHeaders: {
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                bypassCSP: true
            };

            // Launch with persistent or normal context
            if (config.BROWSER_OPTIONS.userDataDir) {
                this.context = await chromium.launchPersistentContext(
                    config.BROWSER_OPTIONS.userDataDir,
                    { ...launchOptions, ...contextOptions }
                );
                this.browser = this.context.browser();
            } else {
                this.browser = await chromium.launch(launchOptions);
                this.context = await this.browser.newContext(contextOptions);
            }

            this.page = await this.context.newPage();
            await this.addStealthEvasions(this.page);
            this.attachLogging(this.page);

            await logger.info('Browser initialized successfully');
            return { browser: this.browser, context: this.context, page: this.page };

        } catch (error) {
            await logger.error('Failed to initialize browser:', error);
            await this.close();
            throw error;
        }
    }

    /** Stealth modifications for navigator object */
    async addStealthEvasions(page) {
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });

            const originalQuery = window.navigator.permissions?.query;
            if (originalQuery) {
                window.navigator.permissions.query = (parameters) => {
                    if (parameters.name === 'notifications') {
                        return Promise.resolve({ state: Notification.permission });
                    }
                    return originalQuery(parameters);
                };
            }
        });
    }

    /** Attach request/response logging */
    attachLogging(page) {
        page.on('request', req => logger.debug(`→ ${req.method()} ${req.url()}`));
        page.on('response', res => logger.debug(`← ${res.status()} ${res.url()}`));
        page.on('pageerror', err => logger.error(`Page error: ${err.message}`));
        page.on('console', msg => {
            if (msg.type() === 'error') logger.error(`Browser console error: ${msg.text()}`);
        });
    }

    /** 
     * Navigate to a URL with retry and timeout handling
     * @param {string} url - The URL to navigate to
     * @param {Object} options - Navigation options
     * @param {number} [options.timeout=90000] - Navigation timeout in ms
     * @param {number} [options.maxRetries=2] - Maximum number of retry attempts
     * @param {number} [options.retryDelay=3000] - Delay between retries in ms
     */
    async navigateTo(url, options = {}) {
        if (!this.context) throw new Error('Browser not initialized. Call initialize() first.');

        const {
            timeout = 90000, // Increased default timeout to 90 seconds
            maxRetries = 2,
            retryDelay = 3000
        } = options;

        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
                if (this.page && !this.page.isClosed()) {
                    await this.page.close().catch(() => {});
                }

                this.page = await this.context.newPage();
                this.attachLogging(this.page);
                await this.addStealthEvasions(this.page);

                await logger.info(`[Attempt ${attempt}/${maxRetries + 1}] Navigating to ${url}...`);

                // Block unnecessary resources but be less aggressive
                await this.page.route('**/*', (route) => {
                    const type = route.request().resourceType();
                    // Only block heavy resources, allow others
                    if (['image', 'font', 'media', 'stylesheet'].includes(type)) {
                        return route.abort();
                    }
                    route.continue();
                });

                // Try with domcontentloaded first
                let response;
                try {
                    response = await this.page.goto(url, {
                        waitUntil: 'domcontentloaded',
                        timeout: Math.min(timeout, 30000) // Initial load timeout
                    });
                } catch (error) {
                    await logger.warn(`Initial load failed, retrying with networkidle: ${error.message}`);
                    response = await this.page.goto(url, {
                        waitUntil: 'networkidle',
                        timeout: timeout
                    });
                }

                await logger.info(`Page loaded with status: ${response?.status()}`);

                // Wait for networkidle with a reasonable timeout
                await this.page.waitForLoadState('networkidle', { 
                    timeout: 15000 // Shorter timeout for networkidle
                }).catch(() => 
                    logger.debug('Network idle not reached, continuing...')
                );

                // Handle Cloudflare if present
                if (await this.isCloudflareProtected()) {
                    await this.handleCloudflareChallenge();
                }

                // Inject IVAC script if needed
                if (this.scriptPath) {
                    await this.injectIvacScript();
                }

                return response;

            } catch (error) {
                lastError = error;
                await logger.warn(`Navigation attempt ${attempt} failed: ${error.message}`);
                
                if (attempt <= maxRetries) {
                    await logger.info(`Retrying in ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        }

        // If we get here, all retries failed
        await logger.error(`All ${maxRetries + 1} navigation attempts failed`);
        throw lastError || new Error('Navigation failed with unknown error');
    }

    /** Check if Cloudflare is active */
    async isCloudflareProtected() {
        return await this.page.evaluate(() => {
            return document.title.includes('Just a moment...') ||
                !!document.querySelector('#cf-challenge-running, .cf-browser-verification');
        });
    }

    /** Handle Cloudflare waiting page */
    async handleCloudflareChallenge() {
        try {
            await logger.warn('Cloudflare protection detected, waiting...');
            await Promise.race([
                this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 }),
                this.page.waitForFunction(
                    'document.readyState === "complete" && !document.title.includes("Just a moment")',
                    { timeout: 60000, polling: 1000 }
                )
            ]);
            await this.page.waitForTimeout(3000);
        } catch (e) {
            await logger.warn('Cloudflare challenge may still be active:', e.message);
        }
    }

    /** Inject IVAC smart panel script if available */
    async injectIvacScript() {
        try {
            if (!fs.existsSync(this.scriptPath)) {
                return await logger.warn(`IVAC smart panel script not found at: ${this.scriptPath}`);
            }

            await logger.info('Injecting IVAC smart panel script...');
            const scriptContent = await fs.promises.readFile(this.scriptPath, 'utf8');
            await this.page.evaluate(scriptContent);

            const initialized = await this.page.evaluate(() => typeof window.IVAC_SMART_PANEL !== 'undefined');
            if (initialized) {
                await logger.info('IVAC smart panel initialized successfully');
            } else {
                await logger.warn('IVAC script injected but may not have initialized properly');
            }
        } catch (error) {
            await logger.error('Failed to inject IVAC smart panel script:', error);
        }
    }



    /** Close browser and cleanup */
    async close() {
        try {
            if (this.context) await this.context.close();
            //if (this.browser) await this.browser.close();
            this.browser = this.context = this.page = null;
            await logger.info('Browser closed successfully');
        } catch (error) {
            await logger.error('Error closing browser:', error);
        }
    }
}

module.exports = BrowserService;
