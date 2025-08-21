import puppeteer from 'puppeteer';


async function getCloudflareToken() {
    const url = 'https://payment.ivacbd.com';
    let browser;

    try {
        browser = await puppeteer.launch({headless:true});
        const page = await browser.newPage();
        console.log('New page created');
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');
        await page.goto(url);

        await page.evaluate(()=>{
            const html = document.querySelector('body').innerHTML;
            console.log("HTML:", html);
        })

        // await page.waitForSelector('input[name="cf-turnstile-response"]', { timeout: 30000 });
        // console.log("Waiting for captcha token...");
        //
        // const [token] = await Promise.all([page.evaluate(() => {
        //     const el = document.querySelector('input[name="cf-turnstile-response"]');
        //     return el ? el.value : null;
        // })]);



        // node gct.js

        // console.log('Captcha Token:', token);
        // return token;
    } catch (error) {
        console.error('Error getting captcha token:', error);
    } finally {
        if (browser) await browser.close();
    }
}
await getCloudflareToken();
