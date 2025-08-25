const readline =require("node:readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
// node is.js
const run =async () => {
    const mobile = "01829938427";
    const password = "Repon7248";
    let fullName = "";
    let email = "";
    let phone = "";
    let authToken = "";
    let cloudflareCaptchaToken = "";


    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const PostRequest = async (url, body) => {
        return new Promise((resolve, reject) => {
            setTimeout(async ()=>{
                try {
                    const response = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json, text/plain, */*",
                            "Authorization": `Bearer ${authToken}`,
                            "language": "en",
                        },
                        body: JSON.stringify(body),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        resolve(data);
                    } else {
                        return {status: "failed", data: data};
                    }
                }catch (e) {
                    console.log(e.message);
                    reject(e);
                }
            }, getRandomInt(3000, 7000));

        });
    }
    const GetRequest = async (url) => {
        return new Promise((resolve, reject) => {
            setTimeout(async ()=>{
                try {
                    const response = await fetch(url, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "Authorization": `Bearer ${authToken}`,
                            "language": "en",

                        }
                    });
                    const data = await response.json();
                    if (response.ok) {
                        resolve(data);
                    } else {
                        return {status: "failed", data: data};
                    }
                }catch (e) {
                    console.log(e.message);
                    reject(e);
                }
            }, getRandomInt(2000, 5000));
        });
    }

    const mobileVerifyResponse = await PostRequest("https://api-payment.ivacbd.com/api/v2/mobile-verify", {
        "mobile_no": mobile,
        "captcha_token": cloudflareCaptchaToken,
        "answer": 1,
        "problem": "abc"
    });
    if (mobileVerifyResponse.status === "success") {
        console.log(mobileVerifyResponse.message);
        const loginResponse = await PostRequest("https://api-payment.ivacbd.com/api/v2/login",{
            mobile_no: mobile,
            password: password,
        })
        if (loginResponse.status === "success") {
            console.log(loginResponse.message);
            rl.question('Enter OTP: ', async (otp) => {
                const otpResponse = await PostRequest("https://api-payment.ivacbd.com/api/v2/login-otp", {
                    mobile_no: mobile,
                    password: password,
                    otp: otp,
                });
            if (otpResponse.status === "success") {
                console.log(otpResponse.message + " and " + otpResponse.data.slot_available ? "Slot Available" : "Slot Not Available");
                authToken = otpResponse.data.access_token;
                fullName = otpResponse.data.name;
                email = otpResponse.data.email;
                phone = otpResponse.data.mobile_no;
            } else {console.log(otpResponse.message);}
            rl.close();
        });
        } else {console.log(loginResponse);}
    } else {console.log(mobileVerifyResponse);}

}






run()
rl.close();

