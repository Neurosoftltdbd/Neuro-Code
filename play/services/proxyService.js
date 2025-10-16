const dns = require('dns').promises;
const net = require('net');
const https = require('https');
const { chromium } = require('playwright');
const logger = require('../utils/logger');
const config = require('../config');

// Helper function to fetch data from URL
const fetchUrl = (url) => {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Status Code: ${res.statusCode}`));
            }
            const data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => resolve(Buffer.concat(data).toString()));
        });
        req.on('error', reject);
        req.setTimeout(config.TIMEOUTS.REQUEST, () => {
            req.destroy(new Error('Request timeout'));
        });
    });
};

// Helper function to parse proxy list from text
const parseProxyList = (text) => {
    const proxies = [];
    const lines = text.split(/\r?\n/);
    
    for (const line of lines) {
        const match = line.trim().match(/^(?:https?:\/\/)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})/);
        if (match) {
            proxies.push({
                ip: match[1],
                port: match[2],
                protocol: 'http',
                country: 'BD',
                anonymity: 'unknown',
                lastCheck: new Date().toISOString()
            });
        }
    }
    
    return proxies;
};

class ProxyService {
    constructor() {
        this.proxyList = [];
    }

    async getProxies() {
        // Try each proxy source until we get a valid list
        for (const source of config.PROXY_SOURCES) {
            try {
                await logger.info(`Fetching proxies from: ${source}`);
                const response = await fetchUrl(source);
                this.proxyList = parseProxyList(response);
                
                if (this.proxyList.length > 0) {
                    await logger.info(`Found ${this.proxyList.length} proxies from ${new URL(source).hostname}`);
                    return this.proxyList;
                }
            } catch (error) {
                await logger.warn(`Failed to fetch from ${source}:`, error.message);
            }
        }
        
        // If all API sources fail, try with browser as fallback
        await logger.warn('All proxy API sources failed, trying browser fallback...');
        const browser = await chromium.launch({ 
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        try {
            const context = await browser.newContext();
            const page = await context.newPage();
            
            await page.goto('https://www.sslproxies.org/', { 
                waitUntil: 'domcontentloaded',
                timeout: config.TIMEOUTS.PAGE_LOAD
            });
            
            this.proxyList = await page.evaluate(() => {
                const proxies = [];
                const rows = document.querySelectorAll('#proxylisttable tbody tr');
                
                for (const row of rows) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 2) {
                        proxies.push({
                            ip: cells[0]?.textContent?.trim(),
                            port: cells[1]?.textContent?.trim(),
                            country: cells[3]?.textContent?.trim() || 'Unknown',
                            protocol: 'https',
                            anonymity: cells[4]?.textContent?.trim().toLowerCase() || 'unknown',
                            lastCheck: new Date().toLocaleString()
                        });
                    }
                }
                
                return proxies.filter(p => p.ip && p.port);
            });
            
            await logger.info(`Found ${this.proxyList.length} proxies from browser fallback`);
            return this.proxyList;
            
        } catch (error) {
            await logger.error('Browser fallback failed:', error);
            throw new Error('All proxy sources failed');
        } finally {
            await browser.close();
        }
    }

    async testProxyConnection(proxy) {
        if (!proxy || !proxy.ip || !proxy.port) {
            return false;
        }

        return new Promise((resolve) => {
            const socket = net.createConnection({
                host: proxy.ip,
                port: parseInt(proxy.port),
                timeout: config.TIMEOUTS.PROXY_TEST
            });
            
            socket.on('connect', () => {
                socket.end();
                resolve(true);
            });
            
            socket.on('error', (err) => {
                logger.debug(`Proxy connection error (${proxy.ip}:${proxy.port}):`, err.message);
                resolve(false);
            });
            
            socket.on('timeout', () => {
                logger.debug(`Proxy connection timeout (${proxy.ip}:${proxy.port})`);
                socket.destroy();
                resolve(false);
            });
        });
    }

    async findWorkingProxy() {
        if (this.proxyList.length === 0) {
            await logger.info('No proxies in cache, fetching fresh list...');
            await this.getProxies();
        }

        if (this.proxyList.length === 0) {
            await logger.warn('No proxies found in the list');
            return null;
        }

        await logger.info(`Testing ${this.proxyList.length} proxies...`);
        
        // Test proxies in parallel with a concurrency limit
        const CONCURRENCY_LIMIT = 5;
        const workingProxies = [];
        
        for (let i = 0; i < this.proxyList.length; i += CONCURRENCY_LIMIT) {
            const batch = this.proxyList.slice(i, i + CONCURRENCY_LIMIT);
            const results = await Promise.all(
                batch.map(proxy => this.testProxyConnection(proxy).then(isWorking => ({
                    proxy,
                    isWorking
                })))
            );
            
            const working = results.filter(r => r.isWorking).map(r => r.proxy);
            workingProxies.push(...working);
            
            if (working.length > 0) {
                // Return the first working proxy
                await logger.info(`Found ${working.length} working proxies`);
                return working[0];
            }
            
            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        await logger.warn('No working proxies found in the list');
        return null;
    }

    async isDomainReachable(hostname) {
        try {
            const address = await dns.lookup(hostname);
            await logger.info(`Domain ${hostname} is reachable at ${address.address}`);
            return true;
        } catch (err) {
            await logger.error(`DNS lookup failed for ${hostname}`, err);
            return false;
        }
    }
}

module.exports = new ProxyService();
