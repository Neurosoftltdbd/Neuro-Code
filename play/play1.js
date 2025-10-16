const { chromium } = require("playwright");
(async () => {
    const browser = await chromium.launch({
        headless:false,
    });
    console.log("Browser launched");
    const context = await browser.newContext({
        proxy: {
            server: '103.13.192.76:8080',
            //username: '2f1d8a0cc7b893e8',
            //password: 'yk8QRD9o'
        },
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--disable-features=DefaultBrowserSecurityFeatures'],
        bypassCSP: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        viewport:{
            width:1280,
            height:720
        },
        acceptDownloads:true,
        extraHTTPHeaders:true,
        javaScriptEnabled:true,
    });

    const page = await context.newPage();

    // Human-like delays
    const humanDelay = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    // Random mouse movements
    const moveMouseRandomly = async () => {
        const dimensions = await page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            };
        });

        const x = Math.floor(Math.random() * dimensions.width);
        const y = Math.floor(Math.random() * dimensions.height);
        await page.mouse.move(x, y, { steps: humanDelay(3, 7) });
    };

    try {
        // Random delay before navigation
        await page.waitForTimeout(humanDelay(1000, 3000));
        console.log('Navigating to payment.ivacbd.com...');
        const response = await page.goto('https://payment.ivacbd.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await moveMouseRandomly();
        console.log(`Navigation status: ${response.status()}`);
        console.log('Page title:', await page.title());
    } catch (error) {
        console.error('Error navigating to payment.ivacbd.com:', error);
    }
    // Random delay
    await page.waitForTimeout(Math.random() * 3000);

    console.log("Page loaded");




    // Uncomment to close the browser when done
    // await browser.close();
})();