let authToken = '';

if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('token') || '';
}

export const GetRequest = async (url: string) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json",
            "Authorization": `Bearer ${authToken}`,
            "language": "en",
            origin: 'https://payment.ivacbd.com/',
            scheme: 'https',
            useragent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36'
        }
    });
    return await response.json();
}

export const PostRequest = async (url: string, data: object) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json",
            "Authorization": `Bearer ${authToken}`,
            "language": "en",
            origin: 'https://payment.ivacbd.com/',
            scheme: 'https',
            useragent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/244.178.44.111 Safari/537.36'


        },
        body: JSON.stringify(data)
    });
    return await response.json();
}