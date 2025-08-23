import puppeteer from "puppeteer";


async function getCloudflareToken() {
    const url = 'https://payment.ivacbd.com';
    let browser;
    let token;

    try {
        browser = await puppeteer.launch({headless:true});
        const page = await browser.newPage();
        console.log('New page created');

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');
        await page.goto(url, {waitUntil:"domcontentloaded", timeout:10000});

        //await page.waitForSelector('input[type="checkbox"]', {timeout: 5000});

        // Option 1 (recommended)
        //await page.click('input[type="checkbox"]');

        //await page.waitForSelector('input[name="cf-turnstile-response"]', { timeout: 30000 });
        console.log("Waiting for captcha token...");

        // await page.evaluate(()=>{
        //     token = document.querySelector('input[name="cf-trunstile-response"]').value;
        //     console.log("Auth token: " + token);
        // })


        // const [token] = await Promise.all([page.evaluate(() => {
        //     const el = document.querySelector('input[name="cf-turnstile-response"]');
        //     return el ? el.value : null;
        // })]);


        const response = await fetch("https://api-payment.ivacbd.com/api/v2/mobile-verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                mobile_no: "01829938427",
            })
        });

        console.log(await response.json());


        // node gct.js

        console.log('Captcha Token:', token);
        return token;
    } catch (error) {
        console.error('Error getting captcha token:', error);
    } finally {
        if (browser) await browser.close();
    }
}
await getCloudflareToken();
