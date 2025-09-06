import axios from "axios";

let authToken = '';

if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('token') || '';

}

export const GetRequest = async (url: string, seconds: number) => {
    return new Promise((resolve, reject) => {
        setTimeout(async ()=>{
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        "Accept": "application/json",
                        "Authorization": `Bearer ${authToken}`,
                        "language": "en",
                        origin: 'https://ivacbd.com/',
                        scheme: 'https',
                        host: "ivacbd.com",
                        useragent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36'
                    }
                });
                return await response.json();
            }catch (e) {
                return reject(e);
            }
        }, seconds*1000);
    });
}

export const PostRequest = async (url: string, data: object, seconds: number) => {
    return new Promise((resolve, reject) => {
        setTimeout(async ()=>{
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Accept": "application/json",
                        "Authorization": `Bearer ${authToken}`,
                        "Language": "en",
                        "Origin": 'https://ivacbd.com/',
                        "Scheme": 'https',
                        "Host": "ivacbd.com",
                        "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36',
                        "Referer": "https://ivacbd.com/",
                        "Connection": "keep-alive",
                        "x-requested-with": "XMLHttpRequest",
                        "cf-turnstile-response": "cf-turnstile-response",
                        "cf-turnstile-language": "en",
                        "Cf-Ray": "979b098b2808814e-DAC",
                        "Cross-Origin-Opener-Policy": "same-origin",
                        "Cross-Origin-Embedder-Policy": "same-origin",
                        "Allow-Control-Allow-Origin": "https://ivacbd.com/",

                    },
                    body: JSON.stringify(data)
                });
                return await response.json();
            }catch (e) {
                return reject(e);
            }
        }, seconds*1000);
    });
}