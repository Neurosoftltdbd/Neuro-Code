const puppeteer = require('puppeteer');
// node pup.js

async function getCookie() {
const url = "https://payment.ivacbd.com/";
const auth = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNGNhODE0NDkwMGE4OWIyZDUyM2MzOWE0MGE5MmJmYzI5ZTVlYTI4MGU0OGNjOWVmMGMwMzA2ODExMWE4NDMwNzQxNmQ1Y2Y4MmI5M2U0NGEiLCJpYXQiOjE3NTYyMDA5MDYuNTcyMjY2LCJuYmYiOjE3NTYyMDA5MDYuNTcyMjY4LCJleHAiOjE3NTYyMDQ1MDYuNTYzMDU5LCJzdWIiOiIxMjM2MTAiLCJzY29wZXMiOltdfQ.DKziqkff7yKdHY3I4JtgJD3n5ABJfz6Zn7cbh9i7Qbrdzhysl5AgdkBD3Xmos_4MKxR3KjpiLJZsMRPLCiN4qwLNHVAHwKAu_w1qhs6Ookmuxy8RHax43yLu5Qd8c2ReCUHkcdrHqZ8ZIv0OZw49B3m9HiNJQyMTYCRX753nMDCEuHQic88uACUTJnUUVR8bZrXphtgeJcFGdRA3zFY-x60GoJpXyzgxww3dvEw5ElOhf09FqfXaO_7gV32weaQNAYvijOiLmtGud0H_gvgFNOmu_-EogZbyObFmUC-2YHG9k-lP90gVoH-ynSAMvUPPnqIxyC2iaPVT4zQDay6VtveZBxeVDptj3bdzjNDxTyYUCHWD_40hLy5P31Q9wGckdhp2s3PuOlNcDCxqhWjJU9mmhWuCxePEX9YfpzdxznzpRf_XLAEyftfsonbwTNzLuwCGupVaPRxHB2DED6z27oiiit5DllmpS7Dj4kh1Mu5SEC6g1YlpofenCg4E6w0Ps7sjiw7KJI8rJTpJMl_Crw_NIU-F5shOYAnLTPVct2IntT_D20jRrHYUUmWH98hbB5CteJ6jCj96vKBerRfm1tofb8p-svsM6M8havEMk7-OtUPGVEjtHOtdxVbc5E1zuGoM3gg4TA7KckwdYKT45-teN01SgJmKhpgaodMMUgY"
try {
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    await page.setViewport({width: 800, height: 600})
    await page.goto(url, {waitUntil:"networkidle2", timeout:10000});
    const cookie = await page.cookies(url);
    console.log("\ncookies found: "+cookie.length + "\n\n"+JSON.stringify(cookie)+"\n\n" + cookie.map(c => c.name + "=" + c.value));

    // const mobile = await fetch("https://payment.ivacbd.com/", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //         "Accept": "application/json",
    //         "Cookie": cookie.map(c => c.name + "=" + c.value),
    //         "Authorization": ""
    //     },
    //     body: JSON.stringify({
    //         mobile_no: "01829938427",
    //         captcha_token: "0.VIF94jeMhtEx8w0eySIKMeqZ1Mig3DTMjDSTUXrFIZ_A68of-pnK7uyRASJq3EtP_pto5YR-WePTbSIh8QMFP3iuuhiQBHwE9-gop4UqqtXng25Z10A_OQkGUNETcUm0DoIpPftAGSjti5WpRTQ6L1TUaCHwS9T2yFNtdO-mLj_mqaTuyjzT70G6-oESZQsPmejxnxPaEne36Y3zyGAEpj3MJd82y889IRe61gDmkxE1iZhoV20Wv-WHsnAKmPQJF_T8HB7N81FydKoNV9AUF-xoMq0wi_CwxEDaM4uJ1IVEi-Q8ZCLAOM4x1Zqtv3irhiWk9b-kMcyYNyDdNHI_4B72gUw7lzs40KowBsBl5vm8GofgNOH3pi61BIhgBLR7z3O_gFtsMY1wuMRreRTsR0efkTyJ_FlJQhBtBQ6HIJ5Vk6N-RoM_eksCjXnRgrjNnQxq6BWmMNtWNKYfD_NaX0-lj2aEkl89Zhm6kU8Z3NEPaD5w38JF2MwUs7wlqUg6_SWIDflTwmN7ghKO5CZNsWu-a1ad_pHAFc-s1omDjBmWBxZeZejUQ9brnRYo45pxhWwzibsr1Ex3iD6oQhEM1HGFRKGSNvft3Vo5AaCZPr3k3C2gIkEVJ1VkcA8pKpBkXQy1XfOOuJQIHODDNxZra_U4DM6mH8WBDgpGSDZYCM1SZMfZnx7mBCnw9B0GjUs6kTrNzXldVAvrAWzkp0VqKAvQEzoXrBgcI9BP583saAMsJ1dVA2750Dy5u6pJ01lOJWa-rID7fyvxefMOG5rOF3CFMnTbZxS2LD1GeLMLXNnv2zBeVzTbme-dk5yUjNVTrGWl1R6B20nLE7JyTHNA9SVfcoxt1qZGuTsG3x-grNbxKobu5uyLOvF3XWE4raoWTfM4zsUDNfOKqi4HiNeJYhlJpyDfvwL-B2hKKYRTfVMtBqZI4WgT2VgEMGDlVjpT.hzQEizYUgHdPM7ewthzAZA.940b2549bd0cf5f52091276ee78c3f9d51c41b39854034b253133e219578c286",
    //         answer: 1,
    //         problem: "abc"
    //     })
    // });
    // const data = await mobile.json();
    // console.log(data.message);
    // console.log(mobile);
    //await browser.close();
}catch (e) {
   console.error(e);
}
}

getCookie();



// async function getCloudflareToken() {
//     const url = 'https://payment.ivacbd.com';
//     let browser;
//     let token;
//
//     try {
//         browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         console.log('New page created');
//
//         await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');
//         await page.goto(url, {waitUntil:"domcontentloaded", timeout:10000});
//
//         //await page.waitForSelector('input[type="checkbox"]', {timeout: 5000});
//
//         // Option 1 (recommended)
//         //await page.click('input[type="checkbox"]');
//
//         //await page.waitForSelector('input[name="cf-turnstile-response"]', { timeout: 30000 });
//         console.log("Waiting for captcha token...");
//
//         // await page.evaluate(()=>{
//         //     token = document.querySelector('input[name="cf-trunstile-response"]').value;
//         //     console.log("Auth token: " + token);
//         // })
//
//
//         // const [token] = await Promise.all([page.evaluate(() => {
//         //     const el = document.querySelector('input[name="cf-turnstile-response"]');
//         //     return el ? el.value : null;
//         // })]);
//
//
//         const response = await fetch("https://api-payment.ivacbd.com/api/v2/mobile-verify", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Accept": "application/json"
//             },
//             body: JSON.stringify({
//                 mobile_no: "01829938427",
//             })
//         });
//
//         console.log(await response.json());
//
//
//         // node script.js
//
//         console.log('Captcha Token:', token);
//         return token;
//     } catch (error) {
//         console.error('Error getting captcha token:', error);
//     } finally {
//         if (browser) await browser.close();
//     }
// }

