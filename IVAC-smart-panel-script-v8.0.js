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
            background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            padding: 8px;
            z-index: 9999;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s ease;
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
            background: linear-gradient(145deg, #6a11cb, #2575fc);
            color: white;
            border: none;
            font-size: 18px;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        #toggle-panel:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
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

    let highCommission = 4;
    let webFileId = "";
    let ivacId = 4;
    let visaType = 13;
    let familyCount = 0;
    let visitPurpose = "Medical purpose";
    let fullName = "";
    let email = "";
    let phone = "";
    let familyName = "";
    let familyWebFileId = "";
    let familyMembers = [];
    let authToken = "";
    let cloudflareCaptchaToken = "";
    let timeOut = null;
    let slotInfo = {
        appointment_date: null,
        appointment_time: null
    };
    let captchaInfo = {
        captcha_id: null,
        captcha_text: null
    };
    let paymentLink = null;

    // Default payment method
    const defaultPaymentMethod = {
        name: "VISA",
        slug: "visacard",
        link: "https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/visa.png"
    };

    const setMessage = (msg) => document.getElementById("message").textContent = msg;

    function getRandomInt(min, max) {
        min = Math.ceil(min); // Ensure min is an integer
        max = Math.floor(max); // Ensure max is an integer
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const PostRequest = async (url, body) => {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${authToken}`,
                "language": "en",
                // "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/237.84.2.178 Safari/537.36",
                // "origin": 'https://payment.ivacbd.com/',
                // "access-control-allow-origin": '*'
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            return {status: "failed", data: data};
        }
    }


    const GetRequest = async (url) => {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${authToken}`,
                "language": "en",
            }
        });
        return await response.json();
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
                    const [webfileNo, name] = line.split(',').map(item => item.trim());
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
            family_count: familyCount.toString(),
            visit_purpose_t5y6u8: visitPurpose,
        };
        try {
            const response = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/application-info-submit", payload);
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
                setTimeout(async ()=>{

                const personalInfoSubmit = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/personal-info-submit", personalData);
                if (personalInfoSubmit.status === "success") {
                    setMessage(personalInfoSubmit.message +" Payable amount: " +personalInfoSubmit.data.payable_amount);
                    setTimeout(async () => {
                        const sendOverview = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/overview-submit", {});
                        if (sendOverview.status === "success") {
                            setMessage(sendOverview.message);
                            setTimeout( async () => {
                                await sendOTP();
                                toggleTab(2);
                            }, 5000);
                        } else {
                            setMessage(sendOverview.message)
                        }
                    },10000);
                } else {
                    console.log(personalInfoSubmit);
                    setMessage(personalInfoSubmit.message);
                }
                }, getRandomInt(3000, 10000));
            } else {
                console.log("Application submission failed:", response);
                setMessage(response.data.message || "Application submission failed");
            }
        } catch (error) {
            console.log("Application submit error:", error);
            setMessage(error.message);
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

                    setTimeout( async () => {
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

                    }, getRandomInt(3000, 10000));
                }
            }else {
                setMessage(verifyOtp.message);
            }

        } catch (error) {
            setMessage(error.message);
        }
    }

    // ========== Generate Captcha Function ==========
    async function generateCaptcha() {

        try {
            const response = await fetch("https://api-payment.ivacbd.com/api/v2/captcha/generate-pay", {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                    "language": "en"
                }
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                captchaInfo.captcha_id = data.data.captcha_id;
                // Display captcha in the panel
                const captchaImageContainer = document.getElementById('captcha-container');
                if (captchaImageContainer) {
                    captchaImageContainer.innerHTML = '';
                    const img = document.createElement('img');
                    img.id = 'captcha-image';
                    img.src = data.data.captcha_image;
                    img.alt = 'CAPTCHA Image';
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '100%';

                    captchaImageContainer.appendChild(img);
                    document.getElementById('captcha-input').value = '';
                }
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage(error.message);
        }
    }





    // ========== Verify Captcha Function ==========
    async function verifyCaptcha(captchaInput) {
        if (!captchaInput) {
            setMessage("Please enter the captcha text");
            return;
        }

        if (!captchaInfo.captcha_id) {
            setMessage("Please generate a captcha first");
            document.getElementById('generate-captcha-button').classList.remove('hidden');
            return;
        }

        try {
            const sendCaptcha = await PostRequest("https://api-payment.ivacbd.com/api/v2/captcha/verify-pay",
                {
                    captcha_id: captchaInfo.captcha_id,
                    captcha_input: captchaInput
                });

            if (sendCaptcha.status === "success") {
                setMessage(sendCaptcha.message);
                // Clear captcha input after successful verification
                document.getElementById('captcha-input').value = '';
                document.getElementById("paynow-button").classList.remove("hidden");
                await payNow();
            } else {
                setMessage(sendCaptcha.message);
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
            appointment_date: slotInfo.appointment_date,
            appointment_time: slotInfo.appointment_time,
            captcha_token: cloudflareCaptchaToken,
            selected_payment: defaultPaymentMethod
        };

        try {
            //const sendPayment = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/pay-now", payload);
            const sendPayment = await PostRequest("https://api-payment.ivacbd.com/api/v2/payment/pay-now-s1d3fr", payload);

            if (sendPayment.status === "success") {
                setMessage(sendPayment.message);
                console.log(sendPayment);
                // Store payment link
                if (sendPayment.data && sendPayment.data.payment_url) {
                    paymentLink = sendPayment.data.payment_url;
                    await updatePaymentLinkDisplay(sendPayment.data.payment_url);

                    // Auto-open the payment link in a new tab
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
        const token = document.querySelector('input[name="cf-turnstile-response"]').value;
        if (token) {
            setMessage("Cloudflare token found")
            cloudflareCaptchaToken = token;
        }else{
            setMessage("Waiting for cloudflare token...");
            return;
        }


        const response = await fetch("https://api-payment.ivacbd.com/api/v2/mobile-verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                mobile_no: mobile,
                captcha_token: cloudflareCaptchaToken
            })
        });

        if (response.ok) {
            const data = await response.json();
            setMessage(data.message);
            setTimeout( async () => {
                const loginResponse = await PostRequest("https://api-payment.ivacbd.com/api/v2/login",{
                    mobile_no: mobile,
                    password: password,
                })
                if (loginResponse.status === "success") {
                    setMessage(loginResponse.message);
                } else {
                    setMessage(loginResponse.message);
                }
            },getRandomInt(3000, 10000))

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
            <h3 class="text-white mx-4">IVAC Smart Panel</h3>
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
                <button id="tab-0">Login</button>
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
                        </div>
                    </div>
                </div>
                <div id="tab-1" class="tab-content d-none">
                    <div id="info-form" class="flex flex-col gap-2 w-full">
                        <div>
                            <input name="web_file" id="webfile" type="text" placeholder="Enter Web File Number">
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
                            <option value="2">STUDENT VISA</option>
                        </select>
                        <div class="flex flex-col gap-2">
                            <label for="family-member-data">Enter family member data:</label>
                            <textarea id="family-member-data" cols="30" rows="5" class="w-full border border-gray-300 p-2 rounded" placeholder="Enter family member webfile and name"></textarea>
                        </div>
                        <div>
                            <input value="Medical purpose" name="visit_purpose" id="visit-purpose" type="text" placeholder="Enter Visit Purpose Details">
                        </div>
                        <div class="flex flex-col gap-2">
                            <input name="full_name" id="input-full_name" type="text" placeholder="Enter Full Name">
                            <input name="email" id="input-email" type="email" placeholder="Enter Email">
                            <input name="phone" id="input-phone" type="tel" placeholder="Enter Phone Number">
                        </div>
                        <button id="send-info-button" type="button">Send Info</button>
                        
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
                        <div class="flex flex-col gap-2">
                            <button id="generate-captcha-button" class="hidden">Generate Captcha</button>
                            <div id="captcha-container" class="w-2/3"></div>
                            <input id="captcha-input" type="text" placeholder="Enter Captcha">
                            <button id="captcha-verify-button" type="button">Verify</button>
                        </div>
                        <div class="flex flex-col gap-2 py-2">
                            <button id="paynow-button" class="hidden">Pay Now</button>
                            <p id="payment-link-container" style="display: none;"></p>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
        `;

    htmlData.querySelector('#tab-0').addEventListener('click', function (e) {
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


    htmlData.querySelector('#tab-1').addEventListener('click', function (e) {
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


    htmlData.querySelector('#tab-2').addEventListener('click', function (e) {
        toggleTab(2);
    });
    htmlData.querySelector("#select-high-commission").addEventListener("change", async () => {
        await updateIvacCenters(Number(document.querySelector("#select-high-commission").value));
    })


    htmlData.querySelector('#tab-3').addEventListener('click', function (e) {
        toggleTab(3);
    });
    htmlData.querySelector('#otp-verify-button').addEventListener('click', async function (e) {
        await verifyOTP(document.querySelector("#otp-input").value);
    });
    htmlData.querySelector("#resend-otp-button").addEventListener('click', async () => {
        await sendOTP(true);
    });
    htmlData.querySelector("#generate-captcha-button").addEventListener('click', async () => {
        await generateCaptcha();
    });
    htmlData.querySelector("#captcha-verify-button").addEventListener('click', async () => {
        await verifyCaptcha(document.querySelector("#captcha-input").value);
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
    togglePanelBtn.innerHTML = '⚙️';
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
        htmlData.style.top = '20px';
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


    document.addEventListener('DOMContentLoaded', init);

    // Run initialization
    // if (document.readyState === 'loading') {
    //     document.addEventListener('DOMContentLoaded', init);
    // } else {
    //     init();
    // }


})();