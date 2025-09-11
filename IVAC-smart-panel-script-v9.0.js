// ==UserScript==
// @name         NeuroCode smart panel
// @namespace    http://tampermonkey.net/
// @version      9.0
// @description  Panel with full functionality
// @author       NHRepon
// @match        https://payment.ivacbd.com/*
// @match        https://nhrepon-portfolio.vercel.app/*
// @match        https://ivacbd.com/*
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// @inject-into  content
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(async function () {
    'use strict';

    const style = document.createElement('style');
    style.textContent = `
    #smart-panel {
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 10px;
            box-shadow: 0px 0px 15px 5px rgb(0 0 0);
            padding: 8px;
            z-index: 9999;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.5s ease-in-out;
            width: 350px;
            height: 550px;
            pointer-events: none;
        }
        #smart-panel.visible {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }
        
        #smart-panel-title {
            animation: zoomInOut 4s infinite;
        }
        
        @keyframes zoomInOut {
            0% { transform: scale(0.95); }
            50% { transform: scale(1.15); font-weight: bold; }
            100% { transform: scale(0.95); }
        }
        #toggle-panel{
        position: fixed;
            bottom: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: linear-gradient(90deg, rgb(255 255 255) 0%, rgb(190 255 253) 50%, rgb(255 248 188) 100%);
            color: white;
            border: none;
            font-size: 18px;
            cursor: pointer;
            box-shadow: 0px 0px 25px 15px rgb(0 0 0);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            }
        #toggle-panel:hover {
            transform: scale(1.1);
            box-shadow: 0px 0px 27px 15px rgb(0 0 0);
        }
        
        #smart-panel button {
            cursor: pointer;
            color: white;
            background-color: #135d32;
            border-radius:0.25rem;
            width:fit-content;
            padding: 0.5rem 0.8rem;
        }
        #smart-panel input, #smart-panel select{
        background-color: white;
        border-radius:0.25rem;
        width:100%;
        border: 1px solid grey;
        padding: 6px 8px;
        margin: 4px 0px;
        }

        .d-none{
            display: none;;
        }
`;
    document.head.appendChild(style);
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
    document.head.appendChild(link);
    let tailwind = document.createElement('script');
    tailwind.src = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4';
    document.head.appendChild(tailwind);

    let cloudflareScript = document.createElement('script');
    cloudflareScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    cloudflareScript.async = true;
    cloudflareScript.defer = true;
    document.head.appendChild(cloudflareScript);



    let authInfo = {
        name: "NHRepon",
        email: "OwXyQ@example.com",
        mobile: "01612345678",
        password: "YourPassword123",
        captchaToken: "",
        authToken: "",
        cfClearance: "",
        slotInfo:""
    };

    let appInfo = {
        webFileId: "BGDRS54D43FD",
        highCommission: "4",
        ivacCenter: "8",
        visaType: "17",
        familyCount: "0",
        familyData: [],
        visitPurpose: "Medical Checkup purpose entry",
        appointmentDate: "",
        appointmentTime: "09:00-09:59",
        paymentMethod: {name: "VISA", slug: "visacard", link: "https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/visa.png"
        }
    }
    let settings = {
        autoProcess: false,
        retryCount: 0
    }


    const setMessage = (success, msg) => {
        let dom = document.getElementById("message");
        dom.textContent = msg;
        dom.style.color = success ? "green" : "red";
    };
    function getRandomInt(min, max) {
        min = Math.ceil(min); // Ensure min is an integer
        max = Math.floor(max); // Ensure max is an integer
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const saveData = ()=>{
        try {
            authInfo.mobile = document.getElementById('userMobile').value;
            authInfo.password = document.getElementById('userPassword').value;
            appInfo.highCommission = document.querySelector("#select-high-commission").value;
            appInfo.webFileId = document.querySelector("#webfile").value;
            appInfo.ivacCenter = document.querySelector("#select-ivac-center").value;
            appInfo.visaType = document.querySelector("#select-visa-type").value;
            let fData = document.querySelector("#family-member-data").value;
            if (fData) {
                const fd = fData.split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => {
                        const [name, webfileNo] = line.split(',').map(item => item.trim());
                        return {
                            name: name,
                            webfile_no: webfileNo,
                            again_webfile_no: webfileNo
                        };
                    });
                appInfo.familyData = fd;
                appInfo.familyCount = fd.length;
            }
            appInfo.visitPurpose = document.querySelector("#visit-purpose").value;

            localStorage.setItem("auth-info", JSON.stringify(authInfo));
            localStorage.setItem("app-info", JSON.stringify(appInfo));
            localStorage.setItem("setting", JSON.stringify(settings));
            setMessage(true, "Data saved successfully");
        } catch (error) {
            setMessage(false, error.message);
        }
    }
    const getSavedData = ()=>{
        try {
            authInfo = JSON.parse(localStorage.getItem("auth-info"));
            appInfo = JSON.parse(localStorage.getItem("app-info"));
            settings = JSON.parse(localStorage.getItem("setting"));

            document.getElementById("webfile").value = appInfo.webFileId;
            document.getElementById("select-high-commission").value = appInfo.highCommission;
            document.getElementById("select-ivac-center").value = appInfo.ivacCenter;
            document.getElementById("select-visa-type").value = appInfo.visaType;
            document.getElementById("visit-purpose").value = appInfo.visitPurpose;
            setMessage(true, "Data loaded successfully");
        } catch (error) {
            setMessage(false, error.message);
        }
    }

    const setAppDataToIvacPage = () => {
        try {
            const centerElements = document.querySelectorAll("#center");
            if (centerElements.length < 2) {
                setMessage(false, "Required center elements not found");
            }

            const setValue = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.value = value;
            };
            // Set values
            centerElements[0].value = document.getElementById("select-high-commission")?.value || "";
            setValue("webfile_id", document.getElementById("webfile")?.value || "");
            setValue("first-name", document.getElementById("webfile")?.value || "");
            centerElements[1].value = document.getElementById("select-ivac-center")?.value || "";
            setValue("visa_type", document.getElementById("select-visa-type")?.value || "");
            setValue("family_count", familyCount || "");
            setValue("visit_purpose", document.getElementById("visit-purpose")?.value || "");

            // Enable button
            const button = document.querySelector("button[type='button']");
            if (button) {
                button.removeAttribute("disabled");
                button.classList.remove("cursor-not-allowed");
            }
            setMessage(true, "App data set successfully");
        } catch (e) {
            setMessage(false, `Error: ${e.message}`);
        }
    };

    const getTomorrowDate = () => {
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const day = tomorrow.getDate();
        const month = tomorrow.getMonth() + 1; // Months are zero-indexed
        const year = tomorrow.getFullYear();
        return `${year}/${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}`;
    }
    appInfo.appointmentDate = getTomorrowDate();
    const getIvacAuthData = ()=>{
        try {
            if(localStorage.getItem("access_token")){
                authInfo.authToken = localStorage.getItem("access_token");
                authInfo.captchaToken = localStorage.getItem("captchaToken");
                authInfo.email = localStorage.getItem("auth_email");
                authInfo.name = localStorage.getItem("auth_name");
                authInfo.phone = localStorage.getItem("auth_phone");
                setMessage(true, "Token fetched successfully");
            }else {
                setMessage(false, "Token not found");
            }
        }catch (e) {
            setMessage(false, e.message)
        }
    }



    const getCloudflareCaptchaToken = () => {
        return new Promise(resolve => {
            const checkToken = () => {
                const token = document.querySelector('input[name="cf-turnstile-response"]').value;
                if (token) {
                    setMessage(true, "Cloudflare token found");
                    localStorage.setItem("captchaToken", token);
                    authInfo.captchaToken = token;
                    resolve(token);
                } else {
                    setMessage(false, "Waiting for cloudflare token...");
                    setTimeout(checkToken, 5000);
                }
            };
            checkToken();
        });
    };
    const generateCloudflareCaptchaToken = async () => {
        try {
            await turnstile.reset();
            await turnstile.execute();
            setMessage(true, "Cloudflare token generated successfully");
            await getCloudflareCaptchaToken();
        }catch (e) {
            setMessage(false, e.message);
        }
    }

    function getCookie() {
        if (!document.cookie) return {};
        const allCookies = document.cookie.split(';').reduce((cookies, cookie) => {
            const [name, value] = cookie.split('=').map(c => c.trim());
            if (name) {
                cookies[name] = decodeURIComponent(value || "");
            }
            return cookies;
        }, {});

        console.log("All cookies:", allCookies);
        console.log("cf_clearance:", allCookies['cf_clearance'] || "Not found");
        authInfo.cfClearance = allCookies['cf_clearance'] || "";
        return allCookies;
    }

    const PostRequest = async (url, body) => {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const response = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${authInfo.authToken}`,
                            //"Accept": "application/json, text/plain, */*",
                            // "Language": "en",
                            // "Cookie": `cf_clearance=${authInfo.cfClearance}; __cf_bm=${getCookie().__cf_bm || ""}; captcha_token=${authInfo.captchaToken};`,
                            // "authority": "payment.ivacbd.com",
                            // "scheme": "https",
                            // "accept-encoding": "gzip, deflate, br, zstd",
                            // "accept-language": "en-US,en;q=0.9",
                            // "Origin": "https://payment.ivacbd.com",
                            // "Priority": "u=1,i",
                            // "Referer": "https://payment.ivacbd.com/",
                            // "sec-ch-ua":`"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"`,
                            // "sec-ch-ua-arch":`"x86"`,
                            // "sec-ch-ua-bitness":`"64"`,
                            // "sec-ch-ua-full-version":`"139.0.7258.157"`,
                            // "sec-ch-ua-full-version-list":`"Not;A=Brand";v="99.0.0.0", "Google Chrome";v="139.0.7258.157", "Chromium";v="139.0.7258.157"`,
                            // "sec-ch-ua-mobile":`"?0"`,
                            // "sec-ch-ua-model":`""`,
                            // "sec-ch-ua-platform":`"Windows"`,
                            // "sec-ch-ua-platform-version":`"10.0.0"`,
                            // "sec-fetch-dest":"empty",
                            // "sec-fetch-mode":"cors",
                            // "sec-fetch-site":"same-origin",
                            // "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
                            //
                        },
                        body: JSON.stringify(body),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        setMessage(true, data.message);
                        resolve(data);
                        return data;
                    } else {
                        setMessage(false, data.message);
                        return {status: "failed", data: data};
                    }
                } catch (e) {
                    setMessage(false, e.message);
                    reject(e);
                }
            }, settings.autoProcess?settings.retryCount*1000:0);

        });
    }


    const GetRequest = async (url) => {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const response = await fetch(url, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "Authorization": `Bearer ${authInfo.captchaToken}`,
                            "language": "en",
                        }
                    });
                    const data = await response.json();
                    if (response.ok) {
                        setMessage(data.message);
                        resolve(data);
                    } else {
                        setMessage(data.message);
                        return {status: "failed", data: data};
                    }
                } catch (e) {
                    setMessage(e.message);
                    reject(e);
                }
            }, settings.autoProcess?settings.retryCount*1000:0);
        });
    }


    async function sendLoginOtp() {
        const mobile = document.getElementById('userMobile').value;
        const password = document.getElementById('userPassword').value;
        if (!mobile) {
            setMessage(false,"Please enter a mobile number");
            return;
        }
        if (!password) {
            setMessage(false,"Please enter a password");
            return;
        }

        if (!authInfo.captchaToken) {
            const cfct = await getCloudflareCaptchaToken();
            if (!cfct) {
                setMessage(false,"Cloudflare captcha token not found in login request");
                return;
            }
        }


        const response = await PostRequest("https://payment.ivacbd.com/api/v2/mobile-verify", {
            mobile_no: mobile,
            captcha_token: authInfo.captchaToken,
            answer: 1,
            problem: "abc"
        });
        if (response.status === "success") {
            setMessage(true, response.message);
            const loginResponse = await PostRequest("https://payment.ivacbd.com/api/v2/login", {
                mobile_no: mobile,
                password: password,
            })
            if (loginResponse.status === "success") {
                setMessage(true, loginResponse.message);
            } else {
                setMessage(false, loginResponse.message);
            }
        } else {
            setMessage(false, response.message);
        }
    }


    async function verifyLoginOtp() {
        const mobile = document.getElementById('userMobile').value;
        const password = document.getElementById('userPassword').value;
        const otp = document.getElementById("otp").value;
        if (!otp) {
            setMessage(false, "Please enter an OTP");
            return;
        }
        const response = await PostRequest("https://payment.ivacbd.com/api/v2/login-otp", {
            mobile_no: mobile,
            password: password,
            otp: otp,
        });

        if (response.status === "success") {
            setMessage(true, response.message + " and slot available: " + response.data.slot_available.toString());
            authInfo.name = response.data.name;
            authInfo.email = response.data.email;
            authInfo.slotInfo = response.data.slot_available;
            authInfo.authToken = response.data.access_token;
            await localStorage.setItem("activeStep", "1");
            // await localStorage.setItem("ivacAuthUser", JSON.stringify(response.data));
            await localStorage.setItem("user_phone", response.data.mobile_no);
            await localStorage.setItem("user_email", response.data.email);
            await localStorage.setItem("auth_name", response.data.name);
            await localStorage.setItem("auth_email", response.data.email);
            await localStorage.setItem("auth_phone", response.data.mobile_no);

            const data = await response.data;
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    await localStorage.setItem(key, data[key]);
                }
            }
            toggleTab(1);
        } else {
            setMessage(false, response.message);
        }
    }


// ========== Application Submit Function ==========
    async function sendDataToServer() {
        if (!appInfo.highCommission && !appInfo.webFileId && !appInfo.ivacCenter && !appInfo.visaType) {
            setMessage(false,"Please, provide web file id, hich commission, ivac id, visa type");
            return;
        }
        let payload = {
            y6e7uk_token_t6d8n3: authInfo.captchaToken,
            highcom: appInfo.highCommission,
            webfile_id: appInfo.webFileId,
            webfile_id_repeat: appInfo.webFileId,
            ivac_id: appInfo.ivacCenter,
            visa_type: appInfo.visaType,
            family_count: appInfo.familyCount,
            visit_purpose: appInfo.visitPurpose,
        };
        try {
            const response = await PostRequest("https://payment.ivacbd.com/api/v2/payment/application-r5s7h3-submit-hyju6t", payload);
            if (response.status === "success") {
                setMessage(true, response.message + " Payable amount: " + response.data.payable_amount);
                localStorage.setItem("activeStep", "2");
                if (settings.autoProcess){
                    await sendPersonalInfoToServer();
                }
            }
        } catch (error) {
            setMessage(false, error.message);
        }
    }
    async function sendPersonalInfoToServer() {
        let personalData = {};
        if (appInfo.familyData.length > 0) {
            personalData = {
                full_name: authInfo.name,
                email_name: authInfo.email,
                phone: authInfo.mobile,
                webfile_id: appInfo.webFileId,
                family: appInfo.familyData
            }
        } else {
            personalData = {
                full_name: authInfo.name,
                email_name: authInfo.email,
                phone: authInfo.mobile,
                webfile_id: appInfo.webFileId,
            }
        }
        const personalInfoSubmit = await PostRequest("https://payment.ivacbd.com/api/v2/payment/personal-info-submit", personalData);
        if (personalInfoSubmit.status === "success") {
            setMessage(true, personalInfoSubmit.message + " Payable amount: " + personalInfoSubmit.data.payable_amount);
            localStorage.setItem("activeStep", "3");
            if (settings.autoProcess){
                await sendOverviewToServer();
            }
        }
    }

    async function sendOverviewToServer() {
        const sendOverview = await PostRequest("https://payment.ivacbd.com/api/v2/payment/overview-submit", {captcha_token: cloudflareCaptchaToken});
        if (sendOverview.status === "success") {
            setMessage(true, sendOverview.message);
            localStorage.setItem("activeStep", "4");
            if (settings.autoProcess){
                await payNow();
            }
            toggleTab(2);
        }
    }


// ========== Send OTP Function ==========
    async function sendOTP(resend = false) {
        try {
            const sendOtp = await PostRequest("https://payment.ivacbd.com/api/v2/payment/pay-otp-sent",
                {resend: resend ? 1 : 0});
            if (sendOtp.status === "success") {
                setMessage(true, sendOtp.message);
            } else {
                setMessage(false, sendOtp.message);
            }
        } catch (error) {
            setMessage(false, error.message);
        }
    }

// ========== Verify OTP Function ==========
    async function verifyOTP(otp) {
        if (!otp || otp.length !== 6) {
            setMessage(false, "Please enter a valid 6-digit OTP");
            return;
        }
        try {
            const verifyOtp = await PostRequest("https://payment.ivacbd.com/api/v2/payment/pay-otp-verify",
                {otp: otp});
            if (verifyOtp.status === "success") {
                setMessage(true, verifyOtp.message);

                if (verifyOtp.data) {
                    document.getElementById('date-input').value = verifyOtp.data.slot_dates[0];
                    appInfo.appointmentDate = verifyOtp.data.slot_dates[0];
                    const slotTimes = await PostRequest("https://payment.ivacbd.com/api/v2/payment/pay-slot-time",
                        {appointment_date: verifyOtp.data.slot_dates[0] || appInfo.appointmentDate});
                    if (slotTimes.status === "success") {
                        setMessage(true, slotTimes.message);
                        if (slotTimes.data) {
                            setMessage(true, slotTimes.message);
                            appInfo.appointmentTime = slotTimes.data.slot_times[0];
                            document.getElementById('slot-display').textContent =
                                `Date: ${appInfo.appointmentDate} and Time: ${appInfo.appointmentTime} (\nAvailable Slot: ${slotTimes.data.slot_times[0].availableSlot})`;
                        }
                    }
                }
            }
        } catch (error) {
            setMessage(false, error.message);
        }
    }


// ========== Pay Now Function ==========
    async function payNow() {
        if (!appInfo.appointmentDate || !appInfo.appointmentTime) {
            setMessage(false, "Please select a date and time slot first");
            return;
        }

        const payload = {
            appointment_date: appInfo.appointmentDate,
            appointment_time: appInfo.appointmentTime,
            k5t0g8_token_y4v9f6: authInfo.captchaToken,
            selected_payment: appInfo.paymentMethod
        };
        const sendPayment = await PostRequest("https://payment.ivacbd.com/api/v2/payment/h7j3wt-now-y0k3d6", payload);
        if (sendPayment.status === "success") {
            setMessage(true, sendPayment.message);
            if (sendPayment.data) {
                setMessage(true, "Payment link: " + sendPayment.data.payment_url);
                document.getElementById('payment-link-container').innerHTML = `
                <a href="${sendPayment.data.payment_url}" target="_blank">${sendPayment.data.payment_url}</a>
                `;
                localStorage.setItem("paymentUrl", sendPayment.data.payment_url);
                window.open(sendPayment.data.payment_url, '_blank', activeTab);
            }
        }else {
            setMessage(false, sendPayment.message);
        }
    }

    async function updateIvacCenters(highCom) {
        const selectIvacCenter = document.querySelector("#select-ivac-center");
        selectIvacCenter.innerHTML = "";
        const ivacCenters = [
            [[9, "IVAC, BARISAL"], [12, "IVAC, JESSORE"], [17, "IVAC, Dhaka (JFP)"], [20, "IVAC, SATKHIRA"]],
            [[5, "IVAC, CHITTAGONG"], [21, "IVAC, CUMILLA"], [22, "IVAC, NOAKHALI"], [23, "IVAC, BRAHMANBARIA"]],
            [[2, "IVAC , RAJSHAHI"], [7, "I[VAC, RANGPUR"], [18, "IVAC, THAKURGAON"], [19, "IVAC, BOGURA"], [24, "IVAC, KUSHTIA"]],
            [[4, "IVAC, SYLHET"], [8, "IVAC, MYMENSINGH"]],
            [[3, "IVAC, KHULNA"]]
        ];
        const centers = ivacCenters[highCom-1];
        if (centers) {
            for (let i = 0; i < centers.length; i++) {
                const option = document.createElement('option');
                option.value = centers[i][0];
                option.textContent = centers[i][1];
                selectIvacCenter.appendChild(option);
            }
        }
    }



    function toggleTab(index) {
        const contents = document.querySelectorAll(".tab-content");
        contents.forEach((content, i) => {
            content.classList.toggle("d-none", i !== index);
        });
    }

    const htmlData = document.createElement('div');
    htmlData.id = "smart-panel";
    htmlData.innerHTML = `
        <div id="smart-panel-header" class="flex gap-1 py-1 rounded items-center justify-between bg-[#135d32] text-sm cursor-move">
            <h3 id="smart-panel-title" class="text-white mx-4">IVAC Smart Panel</h3>
            <button id="close-button"><span class="-me-2 py-1 px-2 bg-gray-200 hover:bg-gray-300 rounded text-red-600"><i class="bi bi-x-circle"></i></span></button>
        </div>
        <div class="flex flex-col gap-2">
            <div class="flex justify-between gap-2 w-full">
                <p id="message" class="text-red-600 text-sm py-2"></p>
            </div>
            <div class="flex gap-1 flex-wrap rounded bg-[#135d32] text-white text-sm">
                <button id="tab-0"><i class="bi bi-person"></i> User</button>
                <button id="tab-1"><i class="bi bi-info-circle"></i> Info</button>
                <button id="tab-2"><i class="bi bi-lock"></i> Otp</button>
                <button id="tab-3"><i class="bi bi-gear"></i> Settings</button>
            </div>
            <div class="tab-content-body py-4 w-full overflow-y-auto h-[380px] text-sm">
                <div id="tab-0" class="tab-content">
                    <div id="login" class="flex flex-col gap-2 w-full">
                        <div class="flex flex-col gap-2 py-2">
                            <div class="cf-turnstile" data-sitekey="0x4AAAAAABpNUpzYeppBoYpe"></div>
                            <div class="flex gap-2">
                                <button id="cf-button" type="button">Generate CF token</button>
                                <button id="get-captcha-token-button" type="button">Get CF token</button>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <input type="text" id="userMobile" name="mobile" required placeholder="Enter mobile number">
                            <input type="password" id="userPassword" name="password" required placeholder="Enter password" >
                            <button id="send-login-otp-button" type="button">Send OTP</button>
                        </div>
                        <div class="flex flex-col gap-2">
                            <input type="text" id="otp" name="otp" required placeholder="Enter OTP" >
                            <button id="verify-login-otp-button" type="button">Verify</button>
                        </div>
                    </div>
                </div>
                <div id="tab-1" class="tab-content d-none">
                    <div id="info-form" class="flex flex-col gap-2 w-full">
                        <div>
                            <input value="${appInfo.webFileId}" name="web_file" id="webfile" type="text">
                        </div>
                        <div>
                            <label for="high_commission">Select High Commission</label>
                            <select name="high_commission" id="select-high-commission">
                                <option value="4">Sylhet</option>
                                <option value="1" selected>Dhaka</option>
                                <option value="2">Chittagong</option>
                                <option value="3">Rajshahi</option>
                                <option value="5">Khulna</option>
                            </select>
                        </div>
                        <div>
                            <select name="ivac_center" id="select-ivac-center">
                            </select>
                        </div>
                        
                        <label for="visa_type">Select Visa Type</label>
                        <select name="visa_type" id="select-visa-type">
                            <option value="13" selected>MEDICAL ATTENDANT VISA</option>
                            <option value="19">DOUBLE ENTRY VISA</option>
                            <option value="6">ENTRY VISA</option>
                            <option value="3">TOURIST VISA</option>
                            <option value="1">BUSINESS VISA</option>
                            <option value="2">STUDENT VISA</option>
                            <option value="18">OTHERS VISA</option>
                        </select>
                        <div class="flex flex-col gap-2">
                            <label for="family-member-data">Enter family member data:</label>
                            <textarea id="family-member-data" cols="30" rows="5" class="w-full border border-gray-300 p-2 rounded" placeholder="Enter family member name and webfile"></textarea>
                        </div>
                        <div>
                            <input value="${appInfo.visitPurpose}" name="visit_purpose" id="visit-purpose" type="text">
                        </div>
                        <div class="flex gap-4">
                            <button id="send-app-info-button" type="button">app Info</button>
                            <button id="send-personal-info-button" type="button">personal Info</button>
                            <button id="send-overview-button" type="button">overview</button>
                        </div>
                        <div class="flex gap-4">
                            <button id="save-data-button" type="button">Save Data</button>
                            <button id="get-saved-data-button" type="button">Get saved data</button> 
                        </div>
                    </div>
                </div>
                <div id="tab-2" class="tab-content d-none">
                    <div class="mb-3">
                        <div>OTP Verification</div>
                        <div>
                            <input type="text" id="otp-input" placeholder="Enter 6-digit OTP" maxLength="6" />
                            <button id="otp-send-button" type="button">Send otp</button>
                            <button id="otp-verify-button" type="button">Verify</button>
                            <button id="resend-otp-button" type="button">Resend OTP</button>
                        </div>
                    </div>
                    <div id="slot-captcha-content" class="flex flex-col gap-2 w-full">
                        <input id="date-input" type="text" value="${appInfo.appointmentDate}">
                        <div class="flex gap-2 items-center">
                            <input id="time-input" type="text" value="${appInfo.appointmentTime}" class="w-full">
                            <button id="slot-button" class="w-fit">Get Slots</button>
                        </div>
                        <div id="slot-display">No slot Selected</div>
                        <div class="flex flex-col gap-2 py-2">
                            <button id="paynow-button">Pay Now</button>
                            <p id="payment-link-container" style="display: none;"></p>
                        </div>
                    </div>
                </div>
                <div id="tab-3" class="tab-content d-none">
                    <div class="flex flex-col gap-2 mb-3">
                        <lable for="auto-process-button">Auto process:</lable>
                        <div class="flex gap-4 items-center">
                            <div class="w-8 h-8 flex items-center justify-center"><input id="auto-process-button" type="checkbox" class="w-8 h-8 text-green-600 bg-gray-100 border-gray-300 rounded" /></div>
                            <input id="retry-count-input" type="text" value="1"/>
                        </div>
                    </div>
                    <div class="flex gap-2 flex-wrap my-2">
                        <button id="get-auth-token-button" type="button">Get ivac auth data</button>
                        <button id="get-cookie-button" class="" type="button">Get cookie</button>
                        <button id="set-app-info-to-ivac-button" type="button">Set App Info to IVAC</button> 
                        
                    </div>
                </div>
            </div>
            
        </div>
        `;

    htmlData.querySelector('#tab-0').addEventListener('click', function () {
        toggleTab(0);
    });
    htmlData.querySelector('#close-button').addEventListener('click', () => {
        htmlData.classList.remove('visible');
    });
    htmlData.querySelector('#send-login-otp-button').addEventListener('click', sendLoginOtp);
    htmlData.querySelector('#verify-login-otp-button').addEventListener('click', verifyLoginOtp);
    htmlData.querySelector('#cf-button').addEventListener('click', async function() {
        await generateCloudflareCaptchaToken()
    });
    htmlData.querySelector('#get-auth-token-button').addEventListener('click', async () => {
        getIvacAuthData();
    });
    htmlData.querySelector('#get-captcha-token-button').addEventListener('click', async () => {
        await getCloudflareCaptchaToken();
    });
    htmlData.querySelector('#get-cookie-button').addEventListener('click', async () => {
        await getCookie();
    });
    htmlData.querySelector('#set-app-info-to-ivac-button').addEventListener('click', async function () {
        await setAppDataToIvacPage();
    });








    htmlData.querySelector('#tab-1').addEventListener('click', () => {
        toggleTab(1);
    });
    htmlData.querySelector('#webfile').addEventListener('change', async () => {
        let payment = await GetRequest(`https:payment.ivacbd.com/api/v2/payment/check/${document.querySelector("#webfile").value}`);
        if (payment.status === "success") {
            setMessage(payment.message);
        }
    });
    htmlData.querySelector('#send-app-info-button').addEventListener('click', async () => {
        await saveData();
        await sendDataToServer();
    });
    htmlData.querySelector('#send-personal-info-button').addEventListener('click', async () => {
        await sendPersonalInfoToServer();
    });
    htmlData.querySelector('#send-overview-button').addEventListener('click', async () => {
        await sendOverviewToServer();
    });
    htmlData.querySelector("#select-high-commission").addEventListener("change", async () => {
        await updateIvacCenters(Number(document.querySelector("#select-high-commission").value));
    })
    htmlData.querySelector("#save-data-button").addEventListener("click", async () => {
        saveData();
        });
    htmlData.querySelector('#get-saved-data-button').addEventListener('click', function () {
        getSavedData();
    });


    htmlData.querySelector('#tab-2').addEventListener('click', function () {
        toggleTab(2);
    });
    htmlData.querySelector('#otp-send-button').addEventListener('click', async function () {
        await sendOTP(false);
    });
    htmlData.querySelector('#otp-verify-button').addEventListener('click', async function () {
        await verifyOTP(document.querySelector("#otp-input").value);
    });
    htmlData.querySelector("#resend-otp-button").addEventListener('click', async () => {
        await sendOTP(true);
    });
    htmlData.querySelector("#paynow-button").addEventListener('click', async () => {
        await payNow();
    });





    htmlData.querySelector('#tab-3').addEventListener('click', function () {
        toggleTab(3);
    });
    htmlData.querySelector('#auto-process-button').addEventListener('click', function () {
        let autoProcess = htmlData.querySelector('#auto-process-button').checked;
        if (autoProcess) {
            settings.autoProcess = true;
            setMessage(true, "Auto process enabled")
        } else {
            setMessage(false, "Auto process not enabled")
        }
    });
    htmlData.querySelector('#retry-count-input').addEventListener('change', function () {
        settings.retryCount = htmlData.querySelector('#retry-count-input').value;
    });




    document.body.appendChild(htmlData);





// Create toggle button for the panel (fixed position)
    const togglePanelBtn = document.createElement('button');
    togglePanelBtn.id = 'toggle-panel';
    togglePanelBtn.classList = 'p-3';
    togglePanelBtn.innerHTML = `
    <svg width="25px" height="25px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="10" height="10" fill="#135d32" />
    <rect x="13" y="1" width="10" height="10" fill="#135d32" />
    <rect x="1" y="13" width="10" height="10" fill="#135d32" />
    <rect x="13" y="13" width="10" height="10" fill="#135d32" />
</svg>
`;
    togglePanelBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        htmlData.classList.toggle('visible');
    });
    document.body.appendChild(togglePanelBtn);


// Handle clicks outside the panel to close it
    document.addEventListener('click', function (e) {
        if (!htmlData.contains(e.target) && e.target !== togglePanelBtn) {
            htmlData.classList.remove('visible');
        }
    });

// Prevent panel clicks from bubbling up when panel is visible
    htmlData.addEventListener('click', function (e) {
        if (htmlData.classList.contains('visible')) {
            e.stopPropagation();
        }
    });







// Make the panel draggable
    htmlData.draggable = true;
    let isDragging = false;
    let offsetX, offsetY;

// Load saved position if exists
    const savedPosition = localStorage.getItem('panelPosition');
    if (savedPosition) {
        htmlData.style.position = 'fixed';
        htmlData.style.left = savedPosition.left;
        htmlData.style.top = savedPosition.top;
    } else {
        // Default position if none saved
        htmlData.style.position = 'fixed';
        htmlData.style.right = '20px';
        htmlData.style.top = '100px';
    }
    htmlData.addEventListener('dragstart', function (e) {
        const rect = htmlData.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        isDragging = true;
        // Required for Firefox
        e.dataTransfer.setData('text/plain', '');
    });

    document.addEventListener('dragover', function (e) {
        e.preventDefault();
        if (isDragging) {
            htmlData.style.left = e.clientX + 'px';
            htmlData.style.top = e.clientY + 'px';
        }
    });
    document.addEventListener('dragend', function () {
        if (isDragging) {
            isDragging = false;
            localStorage.setItem('panelPosition', {
                left: htmlData.style.left,
                top: htmlData.style.top
            });
        }
    });


    const events = ['contextmenu', 'copy', 'cut', 'paste'];
    events.forEach(event => {
        document.body.addEventListener(event, e => e.stopImmediatePropagation(), true);
    });


// Initialize all data when script starts
    async function init() {
        await updateIvacCenters(1);
        await getIvacAuthData();
        await loadSavedData();

        if (!authInfo.captchaToken) {
            const maxAttempts = 10; // Maximum number of attempts
            let attempts = 0;
            let success = false;
            
            while (!success && attempts < maxAttempts) {
                const turnstileResponse = document.querySelector('input[name="cf-turnstile-response"]')?.value;
                if (turnstileResponse) {
                    try {
                        await getCloudflareCaptchaToken();
                        success = true; // Successfully got the token
                        setMessage(true, "Cloudflare token acquired successfully!");
                    } catch (error) {
                        setMessage(false, `Failed: (attempt ${attempts + 1}/${maxAttempts}) \n${error.message}`);
                        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
                    }
                } else {
                    setMessage(true, `Awaiting Cloudflare token... (attempt ${attempts + 1}/${maxAttempts})`);
                    await new Promise(resolve => setTimeout(resolve, 3000)); // Check every 3 seconds
                }
                attempts++;
                if (attempts === maxAttempts) {
                    setMessage(false, "Failed to get Cloudflare token after multiple attempts. Please refresh the page and try again.");
                }
            }
        }



    }


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        await init();
    }

})();