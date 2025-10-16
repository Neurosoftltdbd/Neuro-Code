const proxyService = require('./services/proxyService');
const BrowserService = require('./services/browserService');
const logger = require('./utils/logger');
const config = require('./config');

class App {
    constructor() {
        this.browserService = new BrowserService();
    }

    async init() {
        try {
            // Check if domain is reachable
            const isReachable = await proxyService.isDomainReachable(
                new URL(config.TARGET_URL).hostname
            );
            
            if (!isReachable) {
                throw new Error(`Cannot reach ${config.TARGET_URL}. Please check your internet connection.`);
            }
            
            // Try to find a working proxy
            let proxy = null;
            try {
                proxy = await proxyService.findWorkingProxy();
                if (proxy) {
                    logger.info(`Using proxy: ${proxy.ip}:${proxy.port}`);
                } else {
                    logger.warn('No working proxy found, continuing without proxy');
                }
            } catch (proxyError) {
                logger.warn('Error finding working proxy, continuing without proxy', proxyError);
            }
            
            // Initialize browser with or without proxy
            await this.browserService.initialize(proxy);
            
            // Navigate to target URL
            await this.browserService.navigateTo(config.TARGET_URL);
            
            // Take a screenshot and save page content
            await this.browserService.takeScreenshot('page-loaded');
            await this.browserService.savePageContent('page-content');
            
            logger.info('Application initialized successfully');
            
        } catch (error) {
            logger.error('Application error', error);
            throw error;
        }
    }

    async close() {
        try {
            await this.browserService.close();
            logger.info('Application closed successfully');
        } catch (error) {
            logger.error('Error closing application', error);
            throw error;
        }
    }
}

// Run the application
(async () => {
    const app = new App();
    
    // Handle process termination
    process.on('SIGINT', async () => {
        logger.info('Shutting down...');
        await app.close();
        process.exit(0);
    });
    
    try {
        await app.init();
        
        // Keep the process running
        await new Promise(() => {});
        
    } catch (error) {
        logger.error('Fatal error:', error);
        await app.close();
        process.exit(1);
    }
})();
