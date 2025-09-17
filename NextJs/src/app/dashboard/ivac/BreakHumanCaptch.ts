"use client"
import puppeteer from 'puppeteer';

export async function getCloudflareToken() {
    const url = 'https://payment.ivacbd.com/';
    let captchaToken = null;

    // Launch a stealthy browser instance
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1920,1080',
            '--disable-dev-shm-usage',
        ]
    });

    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');

    // Navigate to the target page
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (error) {
        console.error('Failed to navigate to the URL:', error);
        await browser.close();
        return null;
    }

    try {
        //await page.waitForSelector('.quoteText', { visible: true, timeout: 15000 });
        const token = await page.$eval('input[name="cf-turnstile-response"]', (el: HTMLInputElement) => el.value);

        if (token) {
            captchaToken = token;
            console.log('Token found:', token);
        }
    }catch (e) {
        console.log('Token not yet available. Waiting...' + e);
    }
    // Wait for the page to fully render
    await new Promise(resolve => setTimeout(resolve, 5000));

    await browser.close();
    return captchaToken;
}