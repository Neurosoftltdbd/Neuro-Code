const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapeProxies() {
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            // Set a user agent to avoid bot detection
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

            console.log('Navigating to the proxy list page...');
            await page.goto('https://proxyscrape.com/free-proxy-list/bangladesh', {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            console.log('Extracting proxy data...');
            const proxies = await page.evaluate(() => {
                const proxyRows = Array.from(document.querySelectorAll('table tbody tr'));
                return proxyRows.map(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 9) return null;

                    return {
                        protocol: cells[0].textContent.trim().toLowerCase(),
                        ip: cells[1].textContent.trim(),
                        port: cells[2].querySelector('button')?.textContent.trim() || '',
                        code: cells[3].textContent.trim(),
                        country: cells[4].querySelector('span')?.textContent.trim() || '',
                        anonymity: cells[5].textContent.trim(),
                        https: cells[6].querySelector('svg') ? 'No' : 'Yes',
                        latency: cells[7].textContent.trim(),
                        lastChecked: cells[8].textContent.trim(),
                        fullAddress: function () {
                            return `${this.protocol}://${this.ip}:${this.port}`;
                        }
                    };
                }).filter(Boolean);
            });
            // // Save to a JSON file
            // await fs.writeFile('proxies.json', JSON.stringify(proxies, null, 2));
            // // After writing the file
            // await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            resolve(proxies);
        } catch (error) {
            reject(error);
        } finally {
            await browser.close();
        }
    })
}

// Run the scraper
// scrapeProxies().then(proxies => {
//     if (proxies) {
//         console.log('\nSample of scraped proxies:');
//         //console.table(proxies.slice(0, 5));
//         console.log('scraped proxies: ', proxies.length);
//     }
// }).catch(console.error);


// Export as default
module.exports = { scrapeProxies };
