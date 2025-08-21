// // pages/api/get-captcha-token.js or app/api/get-captcha-token/route.js
// import puppeteer from 'puppeteer';
// import {NextResponse} from "next/server";
//
// export async function GET() {
//
//     const url = 'https://payment.ivacbd.com';
//     let captchaToken = null;
//     let browser;
//     try {
//         browser = await puppeteer.launch({ headless: "new" }); // Set to true for faster execution
//         const page = await browser.newPage();
//         // Set user agent to avoid detection
//         await page.setUserAgent(
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
//         );
//
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
//
//
//         try {
//             await page.waitForSelector('input[name="cf-turnstile-response"]', { timeout: 30000 });
//             captchaToken = await page.$eval('input[name="cf-turnstile-response"]', el => el.value);
//             return NextResponse.json({ captchaToken: captchaToken });
//         } catch (e) {
//             console.error('Failed to get the captcha token:', e);
//         }
//     } catch (error) {
//         console.error('Puppeteer operation failed:', error);
//        return NextResponse.json({ message: 'Puppeteer operation failed', error: error });
//     } finally {
//         if (browser) {
//             await browser.close();
//         }
//     }
// }




// src/app/api/ivac/get-captcha-token/route.ts
import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server';


export async function GET() {
    const url = 'https://payment.ivacbd.com';
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
        );

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        await page.waitForSelector('iframe[src*="turnstile"]', { timeout: 60000 });

        await page.waitForTimeout(60000);

        const captchaToken = await page.$eval(
            'input[name="cf-turnstile-response"]',
            (el: HTMLInputElement) => el.value
        );

        return NextResponse.json({ captchaToken });
    } catch (error) {
        console.error('Error getting captcha token:', error);
        return NextResponse.json({ error: error });
    } finally {
        if (browser) await browser.close();
    }
}
