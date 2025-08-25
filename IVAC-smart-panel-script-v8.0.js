// ==UserScript==
// @name         IVAC Panel New Server
// @namespace    http://tampermonkey.net/
// @version      8.0
// @description  Panel with captcha functionality and Pay Now button
// @author       You
// @match        https://payment.ivacbd.com/*
// @match        https://nhrepon-portfolio.vercel.app/*
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4
// ==/UserScript==

(async function () {
    'use strict';

    GM_addStyle(`
        /* Smart Panel Styles */
        #smart-panel {
            position: fixed;
            bottom: 80px;
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
            height: 450px;
            pointer-events: none;
        }

        #smart-panel.visible {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }

        #smart-panel-title {
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 6px;
            background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: zoomInOut 2s infinite alternate;
            text-align: center;
            width: 100%;
            justify-content: center;
        }

        @keyframes zoomInOut {
            0% { transform: scale(0.95); }
            100% { transform: scale(1.05); }
        }

        #smart-panel-close {
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            color: #7f8c8d;
            padding: 0;
            line-height: 1;
            transition: all 0.2s ease;
            position: absolute;
            right: 0;
        }

        #smart-panel-close:hover {
            color: #e74c3c;
            transform: scale(1.2);
        }
        
        #toggle-panel {
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

    `);

    let webFileId = "";
    let familyCount = 0;
    let fullName = "";
    let email = "";
    let phone = "";
    let familyMembers = [];
    let authToken = "" || localStorage.getItem('authToken');
    let cloudflareCaptchaToken = "";
    let timeOut = null;
    let slotInfo = {
        appointment_date: null,
        appointment_time: null
    };

    const setMessage = (msg) => document.getElementById("message").textContent = msg;

    function getRandomInt(min, max) {
        min = Math.ceil(min); // Ensure min is an integer
        max = Math.floor(max); // Ensure max is an integer
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const getCloudflareCaptchaToken = () => {
        return new Promise(resolve => {
            const checkToken = () => {
                const token = document.querySelector('input[name="cf-turnstile-response"]').value;
                if (token) {
                    setMessage("Cloudflare token found");
                    GM_setValue("captchaToken", token);
                    localStorage.setItem("captchaToken", token);
                    cloudflareCaptchaToken = token;
                    resolve(token);
                } else {
                    setMessage("Waiting for cloudflare token...");
                    setTimeout(checkToken, 5000);
                }
            };
            checkToken();
        });
    };
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
                    setMessage(e.message);
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
                        //return data;
                        resolve(data);
                    } else {
                        return {status: "failed", data: data};
                    }
                }catch (e) {
                    setMessage(e.message);
                    reject(e);
                }
            }, getRandomInt(2000, 5000));
        });
    }



    // ========== Application Submit Function ==========
    async function sendDataToServer(highCommission, webFileId, ivacId, visaType, familyData, visitPurpose) {
        if (!webFileId || !ivacId || !visaType) {
            setMessage("Please, provide web file id, ivac id, visa type");
            return;
        }
        if(familyData){
            const fd = familyData.split('\n')
                .filter(line => line.trim() !== '') // Good practice to filter out empty lines
                .map(line => {
                    const [name, webfileNo] = line.split(',').map(item => item.trim());
                    return {
                        name: name,
                        webfile_no: webfileNo,
                        again_webfile_no: webfileNo
                    };
                });
            familyMembers = fd;
            familyCount = fd.length;
        }


        let payload = {
            captcha_token:cloudflareCaptchaToken,
            highcom: highCommission.toString(),
            webfile_id: webFileId,
            webfile_id_repeat: webFileId,
            ivac_id: ivacId.toString(),
            visa_type: visaType.toString(),
            family_count_y7u4r6: familyCount.toString(),
            visit_purpose: visitPurpose,
        };
        try {
            const response = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/application-info-submit-mu5h7k", payload);
            if (response.status === "success") {
                setMessage(response.message +" Payable amount: " +response.data.payable_amount);

                let personalData = {};
                if(familyMembers.length > 0){
                    personalData = {
                        full_name: fullName,
                        email_name: email,
                        phone: phone,
                        webfile_id: webFileId,
                        family: familyMembers
                    }
                }else{
                    personalData = {
                        full_name: fullName,
                        email_name: email,
                        phone: phone,
                        webfile_id: webFileId,
                    }
                }
                const personalInfoSubmit = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/personal-info-submit", personalData);
                if (personalInfoSubmit.status === "success") {
                    setMessage(personalInfoSubmit.message +" Payable amount: " +personalInfoSubmit.data.payable_amount);
                } else {
                    console.log(personalInfoSubmit);
                    setMessage(personalInfoSubmit.message);
                }
            } else {
                console.log("Application submission failed:", response);
                setMessage(response.data.message || "Application submission failed");
            }
        } catch (error) {
            console.log("Application submit error:", error);
            setMessage(error.message);
        }
    }
    async function sendOverviewToServer() {
        try {
            const sendOverview = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/overview-submit", {captcha_token: cloudflareCaptchaToken});
            if (sendOverview.status === "success") {
                setMessage(sendOverview.message);
                await sendOTP();
                toggleTab(2);
            } else {
                setMessage(sendOverview.message)
            }
        }catch (e) {
            setMessage(e.message);
        }
    }


    // ========== Send OTP Function ==========
    async function sendOTP(resend = false) {

        try {
            const sendOtp = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/pay-otp-sent",
                {resend: resend ? 1 : 0});
            if (sendOtp.status === "success") {
                setMessage(sendOtp.message);
            }else {
                setMessage(sendOtp.message);
            }
        } catch (error) {
            setMessage(error.message);
        }
    }

    // ========== Verify OTP Function ==========
    async function verifyOTP(otp) {
        if (!otp || otp.length !== 6) {
            setMessage("Please enter a valid 6-digit OTP");
            return;
        }
        try {
            const verifyOtp = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/pay-otp-verify",
                {otp: otp});
            if (verifyOtp.status === "success") {
                setMessage(verifyOtp.message);
                toggleTab(3);
                document.getElementById('otp-input').value = '';

                // If date is available in response, set it in the date input
                if (verifyOtp.data && verifyOtp.data.slot_dates && verifyOtp.data.slot_dates.length > 0) {
                    document.getElementById('date-input').value = verifyOtp.data.slot_dates[0];
                    slotInfo.appointment_date = verifyOtp.data.slot_dates[0];
                        const slotTimes = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/pay-slot-time",
                            {appointment_date: verifyOtp.data.slot_dates[0]});
                        if(slotTimes.status === "success"){
                            setMessage(slotTimes.message);
                            // Display the slot time information
                            if (slotTimes.data && slotTimes.data.slot_times && slotTimes.data.slot_times.length > 0) {
                                const slot = slotTimes.data.slot_times[0];
                                document.getElementById('slot-display').textContent =
                                    `${slot.time_display} (Slot: ${slot.availableSlot})`;

                                // Store slot info for Pay Now
                                slotInfo.appointment_date = verifyOtp.data.slot_dates[0];
                                slotInfo.appointment_time = slot.time_display;

                                await payNow();

                            } else {
                                document.getElementById('slot-display').textContent = "No slots available";
                                slotInfo.appointment_date = null;
                                slotInfo.appointment_time = null;
                            }
                        }else{
                            setMessage(slotTimes.message);
                        }
                }
            }else {
                setMessage(verifyOtp.message);
            }
        } catch (error) {
            setMessage(error.message);
        }
    }


    // ========== Pay Now Function ==========
    async function payNow() {
        if (!slotInfo.appointment_date || !slotInfo.appointment_time) {
            setMessage("Please select a date and time slot first");
            return;
        }

        const payload = {
            appointment_date_3y44u6: slotInfo.appointment_date,
            appointment_time: slotInfo.appointment_time,
            captcha_token: cloudflareCaptchaToken,
            selected_payment: {
                name: "VISA",
                slug: "visacard",
                link: "https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/visa.png"
            }
        };

        try {
            //const sendPayment = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/pay-now", payload);
            const sendPayment = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/pay-now-a2f59h", payload);

            if (sendPayment.status === "success") {
                setMessage(sendPayment.message);
                if (sendPayment.data && sendPayment.data.payment_url) {
                    await updatePaymentLinkDisplay(sendPayment.data.payment_url);
                    GM_openInTab(sendPayment.data.payment_url, { active: true });
                }
            } else {
                setMessage(sendPayment.message);
            }
        } catch (error) {
            setMessage(error.message);
        }
    }

    async function updatePaymentLinkDisplay(paymentLink) {
        const paymentLinkContainer = document.getElementById('payment-link-container');
        if (paymentLinkContainer) {
            paymentLinkContainer.style.display = 'block';

                const link = document.createElement('a');
                link.id = 'payment-link';
                link.textContent = paymentLink;
                link.href = paymentLink;
                link.target = '_blank';
                paymentLinkContainer.innerHTML = '';
                await paymentLinkContainer.appendChild(link);

        }
    }



    async function sendLoginOtp() {
        const mobile = document.getElementById('userMobile').value;
        const password = document.getElementById('userPassword').value;
        if (!mobile) {
            setMessage("Please enter a mobile number");
            return;
        }
        if (!password) {
            setMessage("Please enter a password");
            return;
        }

        if(!cloudflareCaptchaToken){
            const cfct = await getCloudflareCaptchaToken();
            if (!cfct) {
                setMessage("Cloudflare captcha token not found in login request");
                return;
            }
        }


        const response = await PostRequest("https://api-payment.ivacbd.com/api/v2/mobile-verify", {
            "mobile_no": mobile,
            "captcha_token": cloudflareCaptchaToken,
            "answer": 1,
            "problem": "abc"
        });
        if (response.status === "success") {
            setMessage(response.message);
            const loginResponse = await PostRequest("https://api-payment.ivacbd.com/api/v2/login",{
                mobile_no: mobile,
                password: password,
            })
            if (loginResponse.status === "success") {
                setMessage(loginResponse.message);
            } else {
                setMessage(loginResponse.message);
            }

        } else {
            setMessage(response.message);
        }
    }


    async function verifyLoginOtp() {
        const mobile = document.getElementById('userMobile').value;
        const password = document.getElementById('userPassword').value;
        const otp = document.getElementById("otp").value;
        if (!otp) {
            setMessage("Please enter an OTP");
            return;
        }
        const response = await PostRequest("https://api-payment.ivacbd.com/api/v2/login-otp", {
            mobile_no: mobile,
            password: password,
            otp: otp,
        });

        if (response.status === "success") {
            setMessage(response.message + " and " + response.data.slot_available ? "Slot Available" : "Slot Not Available");
            console.log(response);
            authToken = response.data.access_token;
            await GM_setValue("token", authToken);
            await localStorage.setItem("ivacToken", authToken);
            fullName = response.data.name;
            email = response.data.email;
            phone = response.data.mobile_no;
            document.querySelector("#logout").classList.remove("hidden");
            document.querySelector("#login").classList.add("hidden");
            toggleTab(1);

        } else {
            console.error("Login failed");
            setMessage(response.message);
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
                <select id="time" class="p-1 rounded max-w-[50px] hidden">
                    <option value="3000">3s</option>
                    <option value="5000">5s</option>
                    <option value="7000" selected>7s</option>
                    <option value="10000">10s</option>
                    
                </select>
            </div>
            <div class="flex gap-1 flex-wrap rounded bg-[#135d32] text-white text-sm">
                <button id="tab-0"><i class="bi bi-person"></i> User</button>
                <button id="tab-1">Info</button>
                <button id="tab-2">Otp</button>
                <button id="tab-3">Slot</button>
            </div>
            <div class="tab-content-body py-4 w-full overflow-y-auto h-[300px] text-sm">
                <div id="tab-0" class="tab-content">
                    <div id="logout" class="hidden flex flex-col gap-2 w-full">
                        <button id="logout-button">Logout</button>
                    </div>
                    <div id="login" class="flex flex-col gap-2 w-full">
                        <div class="flex flex-col gap-2">
                            <input type="text" id="userMobile" name="mobile" required placeholder="Enter mobile number">
                            <input type="password" id="userPassword" name="password" required placeholder="Enter password" >
                            <button id="send-login-otp-button" type="button">Send OTP</button>
                        </div>
    
                        <div class="flex flex-col gap-2">
                            <input type="text" id="otp" name="otp" required placeholder="Enter OTP" >
                            <button id="verify-login-otp-button" type="button">Verify</button>
                            <button id="get-auth-token-button" type="button">Get auth token from ivac home page</button>
                            <button id="get-captcha-token-button" type="button">Get captcha token from ivac home page</button>
                        </div>
                    </div>
                </div>
                <div id="tab-1" class="tab-content d-none">
                    <div id="info-form" class="flex flex-col gap-2 w-full">
                        <div>
                            <input value="BGDRS54D43FD" name="web_file" id="webfile" type="text" placeholder="Enter Web File Number">
                        </div>
                        <div>
                            <label for="high_commission">Select High Commission</label>
                            <select name="high_commission" id="select-high-commission">
                                <option value="4" selected>Sylhet</option>
                                <option value="1">Dhaka</option>
                                <option value="2">Chittagong</option>
                                <option value="3">Rajshahi</option>
                                <option value="5">Khulna</option>
                            </select>
                        </div>
                        <div>
                            <select name="ivac_center" id="select-ivac-center"></select>
                        </div>
                        
                        <label for="visa_type">Select Visa Type</label>
                        <select name="visa_type" id="select-visa-type">
                            <option value="3">TOURIST VISA</option>
                            <option value="13" selected>MEDICAL/MEDICAL ATTENDANT VISA</option>
                            <option value="1">BUSINESS VISA</option>
                            <option value="6">ENTRY VISA</option>
                            <option value="19">DOUBLE ENTRY VISA</option>
                            <option value="2">STUDENT VISA</option>
                            <option value="18">OTHERS VISA</option>
                        </select>
                        <div class="flex flex-col gap-2">
                            <label for="family-member-data">Enter family member data:</label>
                            <textarea id="family-member-data" cols="30" rows="5" class="w-full border border-gray-300 p-2 rounded" placeholder="Enter family member name and webfile"></textarea>
                        </div>
                        <div>
                            <input value="Medical purpose" name="visit_purpose" id="visit-purpose" type="text" placeholder="Enter Visit Purpose Details">
                        </div>
                        <div class="flex gap-4">
                            <button id="send-info-button" type="button">Send Info</button>
                            <button id="send-overview-button" type="button">Send overview</button>
                        </div>
                        
                    </div>
                </div>
                <div id="tab-2" class="tab-content d-none">
                    <div>
                        <div>OTP Verification</div>
                        <div>
                            <input type="text" id="otp-input" placeholder="Enter 6-digit OTP" maxLength="6" />
                            <button id="otp-verify-button" type="button">Verify</button>
                            <button id="resend-otp-button" type="button">Resend OTP</button>
                        </div>
                    </div>
                </div>
                <div id="tab-3" class="tab-content d-none">
                    <div id="slot-captcha-content" class="flex flex-col gap-2 w-full">
                        <input id="date-input" type="date">
                        <button id="slot-button" class="hidden">Get Slots</button>
                        <div id="slot-display">No slot Selected</div>
                        <div class="flex flex-col gap-2 py-2">
                            <button id="paynow-button">Pay Now</button>
                            <p id="payment-link-container" style="display: none;"></p>
                        </div>
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
    htmlData.querySelector("#time").addEventListener("change",  () => {
        timeOut = htmlData.querySelector("#time").value;
        setMessage(timeOut + " milliseconds");
    });
    htmlData.querySelector("#logout-button").addEventListener("click", () => {
        authToken = "";
        GM_setValue("token", "");
        htmlData.querySelector("#logout").classList.add("hidden");
        htmlData.querySelector("#login").classList.remove("hidden");
    });

    htmlData.querySelector('#send-login-otp-button').addEventListener('click', sendLoginOtp);
    htmlData.querySelector('#verify-login-otp-button').addEventListener('click', verifyLoginOtp);
    htmlData.querySelector('#get-auth-token-button').addEventListener('click', async ()=> {
        const token = localStorage.getItem("access_token");
        const captchaToken = localStorage.getItem("captchaToken");
        if(!token){
            setMessage("Auth token not found");
        }else if(!captchaToken){
            setMessage("Captcha token not found");
        }else{
            authToken = token;
            GM_setValue("token", token);
            cloudflareCaptchaToken = captchaToken;
            htmlData.querySelector("#logout").classList.remove("hidden");
            htmlData.querySelector("#login").classList.add("hidden");
            setMessage("Token fetched successfully");
        }
    });
    htmlData.querySelector('#get-captcha-token-button').addEventListener('click', async ()=> {
        const captchaToken = await getCloudflareCaptchaToken();
        if(!captchaToken){
            setMessage("Captcha token not found in only captcha token request");
        }else {
            setMessage("Captcha token fetched successfully");
            GM_setValue("captchaToken", captchaToken);
            localStorage.setItem("captchaToken", captchaToken);
            cloudflareCaptchaToken = captchaToken;
        }
    });







    htmlData.querySelector('#tab-1').addEventListener('click', function () {
        toggleTab(1);
    });
    htmlData.querySelector('#webfile').addEventListener('change', async () => {
        let payment = await GetRequest(`https://api-payment.ivacbd.com/api/v2/payment/check/${document.querySelector("#webfile").value}`);
        if(payment.status === "success"){
            setMessage(payment.message);
        }
    });
    htmlData.querySelector('#send-info-button').addEventListener('click', async ()=>{
        await sendDataToServer(
            document.querySelector("#select-high-commission").value,
            document.querySelector("#webfile").value,
            document.querySelector("#select-ivac-center").value,
            document.querySelector("#select-visa-type").value,
            document.querySelector("#family-member-data").value,
            document.querySelector("#visit-purpose").value,
        );
    });
    htmlData.querySelector('#send-overview-button').addEventListener('click', async ()=>{
        await sendOverviewToServer();
    });








    htmlData.querySelector('#tab-2').addEventListener('click', function () {
        toggleTab(2);
    });
    htmlData.querySelector("#select-high-commission").addEventListener("change", async () => {
        await updateIvacCenters(Number(document.querySelector("#select-high-commission").value));
    })





    htmlData.querySelector('#tab-3').addEventListener('click', function () {
        toggleTab(3);
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

    document.body.appendChild(htmlData);


    async function updateIvacCenters(highCom) {
        const selectIvacCenter = document.querySelector("#select-ivac-center");
        selectIvacCenter.innerHTML = "";
        const ivacCenters = [
            [[]],
            [[9, "IVAC, BARISAL"], [12, "IVAC, JESSORE"], [17, "IVAC, Dhaka (JFP)"], [20, "IVAC, SATKHIRA"]],
            [[5, "IVAC, CHITTAGONG"], [21, "IVAC, CUMILLA"], [22, "IVAC, NOAKHALI"], [23, "IVAC, BRAHMANBARIA"]],
            [[2, "IVAC , RAJSHAHI"], [7, "I[VAC, RANGPUR"], [18, "IVAC, THAKURGAON"], [19, "IVAC, BOGURA"], [24, "IVAC, KUSHTIA"]],
            [[4, "IVAC, SYLHET"], [8, "IVAC, MYMENSINGH"]],
            [[3, "IVAC, KHULNA"]]
        ];
        const centers = ivacCenters[highCom];
        if (centers) {
            for (let i = 0; i < centers.length; i++) {
                const option = document.createElement('option');
                option.value = centers[i][0];
                option.textContent = centers[i][1];
                selectIvacCenter.appendChild(option);
            }
        }
    }

    await updateIvacCenters(4);








    // Create toggle button for the panel (fixed position)
    const togglePanelBtn = document.createElement('button');
    togglePanelBtn.id = 'toggle-panel';
    togglePanelBtn.classList = 'p-3';
    togglePanelBtn.innerHTML = `
    <svg width="80px" height="80px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <!-- Top-left grid -->
    <rect x="1" y="1" width="10" height="10" fill="#000000" />
    <!-- Top-right grid -->
    <rect x="13" y="1" width="10" height="10" fill="#000000" />
    <!-- Bottom-left grid -->
    <rect x="1" y="13" width="10" height="10" fill="#000000" />
    <!-- Bottom-right grid -->
    <rect x="13" y="13" width="10" height="10" fill="#000000" />
</svg>
    `;
    togglePanelBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        htmlData.classList.toggle('visible');
    });
    document.body.appendChild(togglePanelBtn);

    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
    document.head.appendChild(link);


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
    const savedPosition = GM_getValue('panelPosition', null);
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
        // Calculate the offset between mouse and element position
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
            // Update the position of the panel
            htmlData.style.left = (e.clientX - offsetX) + 'px';
            htmlData.style.top = (e.clientY - offsetY) + 'px';
        }
    });

    document.addEventListener('dragend', function () {
        if (isDragging) {
            isDragging = false;
            // Save the new position
            GM_setValue('panelPosition', {
                left: htmlData.style.left,
                top: htmlData.style.top
            });
        }
    });


    // Initialize all data when script starts
    async function init() {
        const savedToken = GM_getValue("token");
        if (authToken == null && savedToken != null) {
            authToken = savedToken;
        }

        if (authToken) {
            setMessage("Authentication token found!")
            htmlData.querySelector("#logout").classList.remove("hidden");
            htmlData.querySelector("#login").classList.add("hidden");
        } else {
            htmlData.querySelector("#logout").classList.add("hidden");
            htmlData.querySelector("#login").classList.remove("hidden");
        }


        const panelSettings = GM_getValue('panelPosition', null);
        if (panelSettings) {
            htmlData.style.left = panelSettings.left;
            htmlData.style.top = panelSettings.top;
        }

    }


    //document.addEventListener('DOMContentLoaded', init);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        await init();
    }


})();