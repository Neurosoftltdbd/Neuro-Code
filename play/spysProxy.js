const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function spysProxy() {
    return new Promise(async (resolve, reject) => {
            const options = new chrome.Options();
    options.addArguments(
        '--headless=new',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1280,720',
        '--disable-software-rasterizer',
        '--disable-web-security',
        '--ignore-certificate-errors',
        '--disable-blink-features=AutomationControlled'
    );

    // Add user agent to appear more like a regular browser
    options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log('Navigating to spys.one proxy list...');
        await driver.get('https://spys.one/free-proxy-list/BD/');
        
        // Wait for any table to appear
        await driver.wait(until.elementLocated(By.css('table')), 30000);
        
        // Wait a bit more for dynamic content to load
        await driver.sleep(5000);
        
        // Try to find the proxy table
        const proxyList = await driver.executeScript(`
            const proxies = [];
            const tables = document.querySelectorAll('table');
            
            tables.forEach(table => {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 2) {
                        const text = cells[0].textContent.trim();
                        const ipMatch = text.match(/\\d+\\.\\d+\\.\\d+\\.\\d+/);
                        const portMatch = text.match(/:\\d+/);
                        
                        if (ipMatch) {
                            const ip = ipMatch[0];
                            const port = portMatch ? portMatch[0].substring(1) : '8080';
                            proxies.push({
                                ip: ip,
                                port: port,
                                protocol: 'http'
                            });
                        }
                    }
                });
            });
            
            return proxies;
        `);

        if (proxyList && proxyList.length > 0) {
            console.log(`Found ${proxyList.length} proxies`);
            console.log(proxyList);
            resolve(proxyList);
        } else {
            // Debug: Print page source if no proxies found
            const pageSource = await driver.getPageSource();
            console.log('Page source length:', pageSource.length);
            console.log('Page title:', await driver.getTitle());
            reject(new Error('No proxies found on the page'));
        }
    } catch (error) {
        console.error('Error in spysProxy:', error);
        reject(error);
    }
    
    })
}
//spysProxy();
// Run the function if this file is executed directly
// if (require.main === module) {
//     spysProxy()
//         .then(proxies => {
//             console.log('\nSample of scraped proxies:');
//             proxies.slice(0, 5).forEach(proxy => console.log(proxy));
//             console.log(`\nTotal proxies found: ${proxies.length}`);
//         })
//         .catch(error => {
//             console.error('Failed to get proxies:', error.message);
//             process.exit(1);
//         });
// }

module.exports = { spysProxy };