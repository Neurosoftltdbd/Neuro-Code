// ==UserScript==
// @name         IVAC Panel New Server
// @namespace    http://tampermonkey.net/
// @version      8.0
// @description  Panel with captcha functionality and Pay Now button
// @author       You
// @match        https://nhrepon-portfolio.vercel.app/*
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4
// ==/UserScript==

(function () {
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
    let webFileId = null;
    let ivacId = null;
    let visaType = null;
    let familyCount = null;
    let visitPurpose = null;
    let fullName = null;
    let email = null;
    let phone = null;
    let familyName = null;
    let familyWebFileId = null;
    let familyMembers = [];
    let activeControllers = [];
    let authToken = "";
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

    const setMessage = (msg) => document.getElementById("ivac-message").textContent = msg;

    let userMobileInput = document.getElementById("userMobile");
    let userPasswordInput = document.getElementById("userPassword");
    let sendLoginOtpButton = document.getElementById("send-login-otp-button");
    let otpInput = document.getElementById("otp");
    let verifyLoginOtpButton = document.getElementById("verify-login-otp-button");

    let selectHighCommission = document.getElementById("select-high-commission");
    let selectIvacCenter = document.getElementById("select-ivac-center");
    let selectWebFile = document.getElementById("input-web-file");
    let selectVisaType = document.getElementById("select-visa-type");
    let selectFamilyCount = document.getElementById("select-family-count");
    let showFamilyMemberData = document.getElementById("show-family-member-data");
    let selectVisitPurpose = document.getElementById("select-visit-purpose");
    let selectFullName = document.getElementById("input-full_name");
    let selectEmail = document.getElementById("input-email");
    let selectPhone = document.getElementById("input-phone");























    // ========== Application Submit Function ==========
    async function sendDataToServer() {
        if (!webFileId || !ivacId || !visaType) {
            setMessage("Please complete the Settings Panel");
            return;
        }

        let payload = {
            highcom: highCommission.toString() || "4",
            webfile_id: webFileId,
            webfile_id_repeat: webFileId,
            ivac_id: ivacId.toString() || "4",
            visa_type: visaType.toString() || "13",
            family_count: familyCount ? familyCount.toString() : "0",
            visit_purpose: visitPurpose || "Medical purpose"
        };

        console.log("Submitting application with payload:", payload);

        const controller = new AbortController();
        activeControllers.push(controller);

        try {
            const response = await fetch("https://api-payment.ivacbd.com/api/v2/payment/application-info-submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                    "language": "en"
                },
                body: JSON.stringify(payload),
                redirect: 'follow',
                signal: controller.signal
            });

            if (response.ok) {
                console.log("Application submitted successfully!");
            } else {
                console.error("Application submission failed:", response.status);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Application submit error:", error);
            }
        } finally {
            // Remove the controller from active list
            const index = activeControllers.indexOf(controller);
            if (index > -1) {
                activeControllers.splice(index, 1);
            }
        }
    }

    // ========== Personal Info Submit Function ==========
    async function submitPersonalInfo() {
        if (!fullName || !email || !phone || !webFileId) {
            setMessage("Please complete the Settings Panel");
            return;
        }

        const controller = new AbortController();
        activeControllers.push(controller);

        try {
            // Prepare family members data
            const familyData = {};
            for (let i = 0; i < (familyCount || 0); i++) {
                const member = familyMembers[i] || {};
                familyData[i + 1] = {
                    name: member.name || familyName || "",
                    webfile_no: member.webfile || familyWebFileId || "",
                    again_webfile_no: member.webfile || familyWebFileId || ""
                };
            }

            const payload = {
                full_name: fullName,
                email_name: email,
                phone: phone,
                webfile_id: webFileId,
                family: familyData
            };

            console.log("Submitting personal info with payload:", payload);

            const response = await fetch("https://api-payment.ivacbd.com/api/v2/payment/personal-info-submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                    "language": "en"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            if (response.ok) {
                console.log("Personal info submitted successfully!");
            } else {
                console.error("Personal info submission failed:", response.status);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Personal info submit error:", error);
            }
        } finally {
            // Remove the controller from active list
            const index = activeControllers.indexOf(controller);
            if (index > -1) {
                activeControllers.splice(index, 1);
            }
        }
    }

    // ========== Overview Submit Function ==========
    function sendOverviewRequest() {
        const controller = new AbortController();
        activeControllers.push(controller);

        fetch('https://api-payment.ivacbd.com/api/v2/payment/overview-submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'language': 'en'
            },
            body: JSON.stringify({}),
            signal: controller.signal
        })
            .then(response => {
                if (response.ok) {
                    setMessage(response.message);
                    return response.json();
                } else {
                    setMessage(`Overview request failed with status: ${response.status}`);
                }
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.error('Overview request failed:', error);
                }
            })
            .finally(() => {
                // Remove the controller from active list
                const index = activeControllers.indexOf(controller);
                if (index > -1) {
                    activeControllers.splice(index, 1);
                }
            });
    }

    // ========== Payment Button Function ==========
    function handlePayment() {
        GM_openInTab('https://api-payment.ivacbd.com/api/v2/payment/checkout');
    }

    // ========== Stop All Requests Function ==========
    function stopAllRequests() {
        activeControllers.forEach(controller => {
            controller.abort();
        });
        // Clear the array
        activeControllers = [];
        console.log('All pending requests have been stopped');
    }

    // ========== Send OTP Function ==========
    async function sendOTP(resend = false) {
        const payload = {
            resend: resend ? 1 : 0
        };
        console.log(`Sending ${resend ? 're' : ''}OTP with payload:`, payload);
        const controller = new AbortController();
        activeControllers.push(controller);
        try {
            const response = await fetch("https://api-payment.ivacbd.com/api/v2/payment/pay-otp-sent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                    "language": "en"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(`${resend ? 'Re' : ''}OTP sent successfully!`);
                console.log(`${resend ? 'Re' : ''}OTP sent successfully!`);
            } else {
                console.error(`${resend ? 'Re' : ''}OTP send failed:`, response.status);
                setMessage(`${resend ? 'Re' : ''}OTP send failed!`);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error(`${resend ? 'Re' : ''}OTP send error:`, error);
                setMessage(`${resend ? 'Re' : ''}OTP send error!`);
            }
        } finally {
            // Remove the controller from active list
            const index = activeControllers.indexOf(controller);
            if (index > -1) {
                activeControllers.splice(index, 1);
            }
        }
    }

    // ========== Verify OTP Function ==========
    async function verifyOTP(otp) {
        if (!otp || otp.length !== 6) {
            setMessage("Please enter a valid 6-digit OTP");
            return;
        }
        console.log("Verifying OTP with payload:", payload);

        const controller = new AbortController();
        activeControllers.push(controller);

        try {
            const response = await fetch("https://api-payment.ivacbd.com/api/v2/payment/pay-otp-verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                    "language": "en"
                },
                body: JSON.stringify({otp: otp}),
                signal: controller.signal
            });

            if (response.ok) {
                const data = await response.json();
                console.log("OTP verified successfully!");
                setMessage("OTP verified successfully!");

                // Clear OTP input after successful verification
                document.getElementById('ivac-otp-input').value = '';

                // If date is available in response, set it in the date input
                if (data.data && data.data.slot_dates && data.data.slot_dates.length > 0) {
                    document.getElementById('ivac-date-input').value = data.data.slot_dates[0];
                    slotInfo.appointment_date = data.data.slot_dates[0];
                }
            } else {
                console.error("OTP verification failed:", response.status);
                setMessage("OTP verification failed!");
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("OTP verification error:", error);
                setMessage("OTP verification error!");
            }
        } finally {
            // Remove the controller from active list
            const index = activeControllers.indexOf(controller);
            if (index > -1) {
                activeControllers.splice(index, 1);
            }
        }
    }

    // ========== Get Slot Times Function ==========
    async function getSlotTimes() {
        const dateInput = document.getElementById('ivac-date-input');
        if (!dateInput.value) {
            setMessage("Please select a date first");
            return;
        }

        const payload = {
            appointment_date: dateInput.value
        };

        console.log("Getting slot times with payload:", payload);

        const controller = new AbortController();
        activeControllers.push(controller);

        try {
            const response = await fetch("https://api-payment.ivacbd.com/api/v2/payment/pay-slot-time", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                    "language": "en"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Slot times retrieved successfully:", data);

                // Display the slot time information
                if (data.data && data.data.slot_times && data.data.slot_times.length > 0) {
                    const slot = data.data.slot_times[0];
                    document.getElementById('ivac-slot-display').textContent =
                        `${slot.time_display} (Slot: ${slot.availableSlot})`;

                    // Store slot info for Pay Now
                    slotInfo.appointment_date = dateInput.value;
                    slotInfo.appointment_time = slot.time_display;
                } else {
                    document.getElementById('ivac-slot-display').textContent = "No slots available";
                    slotInfo.appointment_date = null;
                    slotInfo.appointment_time = null;
                }
            } else {
                console.error("Slot times retrieval failed:", response.status);
                setMessage("Failed to get slot times!");
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Slot times retrieval error:", error);
                setMessage("Error getting slot times!");
            }
        } finally {
            // Remove the controller from active list
            const index = activeControllers.indexOf(controller);
            if (index > -1) {
                activeControllers.splice(index, 1);
            }
        }
    }

    // ========== Generate Captcha Function ==========
    async function generateCaptcha() {
        console.log("Generating captcha");

        const controller = new AbortController();
        activeControllers.push(controller);

        try {
            const response = await fetch("https://api-payment.ivacbd.com/api/v2/captcha/generate-pay", {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                    "language": "en"
                },
                signal: controller.signal
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Captcha generated successfully:", data);

                // Store captcha info
                captchaInfo.captcha_id = data.data.captcha_id;
                captchaInfo.captcha_text = data.data.captcha;

                // Display captcha in the panel
                const captchaImageContainer = document.getElementById('captcha-container');
                if (captchaImageContainer) {
                    captchaImageContainer.innerHTML = '';
                    const img = document.createElement('img');
                    img.id = 'ivac-captcha-image';
                    img.src = data.data.captcha_image;
                    img.alt = 'CAPTCHA Image';
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '100%';

                    captchaImageContainer.appendChild(img);
                    document.getElementById('ivac-captcha-input').value = '';
                }
            } else {
                console.error("Captcha generation failed:", response.status);
                setMessage("Failed to generate captcha!");
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Captcha generation error:", error);
                setMessage("Error generating captcha!");
            }
        } finally {
            // Remove the controller from active list
            const index = activeControllers.indexOf(controller);
            if (index > -1) {
                activeControllers.splice(index, 1);
            }
        }
    }

    // ========== Verify Captcha Function ==========
    async function verifyCaptcha() {
        const captchaInput = document.getElementById('captcha-input').value;
        if (!captchaInput) {
            setMessage("Please enter the captcha text");
            return;
        }

        if (!captchaInfo.captcha_id) {
            setMessage("Please generate a captcha first");
            return;
        }

        const payload = {
            captcha_id: captchaInfo.captcha_id,
            captcha_input: captchaInput
        };

        console.log("Verifying captcha with payload:", payload);

        const controller = new AbortController();
        activeControllers.push(controller);

        try {
            const response = await fetch("https://api-payment.ivacbd.com/api/v2/captcha/verify-pay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                    "language": "en"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Captcha verified successfully:", data);
                setMessage("Captcha verified successfully!");

                // Clear captcha input after successful verification
                document.getElementById('captcha-input').value = '';
                await paymentInfo(data.data);
            } else {
                console.error("Captcha verification failed:", response.status);
                setMessage("Captcha verification failed!");
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Captcha verification error:", error);
                setMessage("Captcha verification error!");
            }
        } finally {
            // Remove the controller from active list
            const index = activeControllers.indexOf(controller);
            if (index > -1) {
                activeControllers.splice(index, 1);
            }
        }
    }

    // ========== Pay Now Function ==========
    async function payNow() {
        if (!slotInfo.appointment_date || !slotInfo.appointment_time) {
            setMessage("Please select a date and time slot first");
            return;
        }

        if (!captchaInfo.captcha_id) {
            setMessage("Please generate and verify a captcha first");
            return;
        }

        const payload = {
            appointment_date: slotInfo.appointment_date,
            appointment_time: slotInfo.appointment_time,
            hash_param: captchaInfo.captcha_id,
            selected_payment: defaultPaymentMethod
        };

        console.log("Sending payment request with payload:", payload);

        const controller = new AbortController();
        activeControllers.push(controller);

        try {
            const response = await fetch("https://api-payment.ivacbd.com/api/v2/payment/pay-now", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                    "language": "en"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Payment request successful:", data);
                setMessage("Payment request submitted successfully!");

                // Store payment link
                if (data.data && data.data.payment_url) {
                    paymentLink = data.data.payment_url;
                    updatePaymentLinkDisplay();

                    // Auto-open the payment link in a new tab
                    GM_openInTab(paymentLink);
                }
            } else {
                console.error("Payment request failed:", response.status);
                setMessage("Payment request failed!");
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Payment request error:", error);
                setMessage("Payment request error!");
            }
        } finally {
            // Remove the controller from active list
            const index = activeControllers.indexOf(controller);
            if (index > -1) {
                activeControllers.splice(index, 1);
            }
        }
    }

    // Update payment link display
    function updatePaymentLinkDisplay() {
        const paymentLinkContainer = document.getElementById('ivac-payment-link-container');
        if (paymentLinkContainer) {
            paymentLinkContainer.style.display = 'block';

            const linkElement = document.getElementById('ivac-payment-link');
            if (linkElement) {
                linkElement.textContent = paymentLink;
                linkElement.href = paymentLink;
            } else {
                const link = document.createElement('a');
                link.id = 'ivac-payment-link';
                link.textContent = paymentLink;
                link.href = paymentLink;
                link.target = '_blank';
                paymentLinkContainer.innerHTML = '';
                paymentLinkContainer.appendChild(link);
            }
        }
    }

    // ==================== Modal and Input Functions ====================


    function updateFamilyInputs() {
        const count = parseInt(familyCount.value);
        familyInputsContainer.innerHTML = '';
        familyMembers = familyMembers || [];

        for (let i = 0; i < count; i++) {
            const memberContainer = document.createElement('div');
            memberContainer.className = 'family-member';

            const heading = document.createElement('h5');
            heading.innerText = `Family Member ${i + 1}`;
            memberContainer.appendChild(heading);

            // Name input
            const nameInput = document.createElement('input');
            nameInput.placeholder = "Name";
            nameInput.dataset.index = i;
            nameInput.dataset.type = 'name';
            nameInput.style.width = '100%';
            nameInput.style.padding = '8px';
            nameInput.style.border = '1px solid #ddd';
            nameInput.style.borderRadius = '6px';
            nameInput.style.marginBottom = '8px';
            nameInput.style.background = 'rgba(255,255,255,0.8)';
            nameInput.style.fontSize = '12px';
            memberContainer.appendChild(nameInput);

            // Webfile input
            const webfileInput = document.createElement('input');
            webfileInput.placeholder = "Web File Number";
            webfileInput.dataset.index = i;
            webfileInput.dataset.type = 'webfile';
            webfileInput.style.width = '100%';
            webfileInput.style.padding = '8px';
            webfileInput.style.border = '1px solid #ddd';
            webfileInput.style.borderRadius = '6px';
            webfileInput.style.marginBottom = '8px';
            webfileInput.style.background = 'rgba(255,255,255,0.8)';
            webfileInput.style.fontSize = '12px';
            memberContainer.appendChild(webfileInput);

            // Set saved values if they exist
            if (familyMembers[i]) {
                nameInput.value = familyMembers[i].name || '';
                webfileInput.value = familyMembers[i].webfile || '';
            }

            familyInputsContainer.appendChild(memberContainer);
        }
    }




    async function fetchAuthToken() {
        try {
            const response = await fetch("https://api-payment.ivacbd.com/api/v2/home", {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "language": "en"
                }
            });

            if (response.ok) {
                const data = await response.json();
                const token = response.headers.get("authorization");
                console.log("Response token:", token);
                alert("Token fetched successfully: " + token);
                if (data.data && token) {
                    authToken = token;
                    await GM_setValue('authToken', token);
                    document.getElementById('ivac-token-input').value = authToken;
                    console.log("Token fetched and saved successfully");
                }
            }
        } catch (error) {
            console.error("Error fetching token:", error);
        }
    }


    // ==================== Smart Panel Creation ====================

    // Create the smart panel container


    async function sendLoginOtp() {
        const mobile = document.getElementById('ivac-userMobile').value;
        const password = document.getElementById('ivac-password').value;
        if (!mobile) {
            setMessage("Please enter a mobile number");
            return;
        }
        if (!password) {
            setMessage("Please enter a password");
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
            })
        });

        if (response.ok) {
            const data = await response.json();
            setMessage(data.message);
            const loginResponse = await fetch("https://api-payment.ivacbd.com/api/v2/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    mobile_no: mobile,
                    password: password,
                })
            });

            if (loginResponse.ok) {
                const data = await loginResponse.json();
                setMessage(data.message);
            } else {
                setMessage(loginResponse.message);
            }

        } else {
            setMessage(response.message);
        }
    }


    async function verifyLoginOtp() {
        const mobile = document.getElementById('ivac-userMobile').value;
        const password = document.getElementById('ivac-password').value;
        const otp = document.getElementById('ivac-otp').value;
        if (!otp) {
            setMessage("Please enter an OTP");
            return;
        }
        const response = await fetch("https://api-payment.ivacbd.com/api/v2/login-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                mobile_no: mobile,
                password: password,
                otp: otp,
            })
        });

        if (response.ok) {
            const data = await response.json();
            setMessage(data.message);
            console.log(data);
            authToken = data.data.access_token;

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
            <button id="close-button"><span class="-me-2 p-1 bg-gray-200 hover:bg-gray-300 rounded text-red-600"><i class="bi bi-x-circle"></i></span></button>
        </div>
        <div class="flex flex-col gap-2">
            <p id="message" class="text-red-600 text-sm py-2"></p>
            <div class="flex gap-1 flex-wrap rounded bg-[#135d32] text-white text-sm">
                <button id="tab-0">Login</button>
                <button id="tab-1">Info</button>
                <button id="tab-2">Otp</button>
                <button id="tab-3">Slot</button>
                <button id="tab-4">user</button>
            </div>
            <div class="tab-content-body py-4 w-full overflow-y-auto h-[300px] text-sm">
                <div id="tab-0" class="tab-content">
                    <div class="flex flex-col gap-2 w-full">
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
                            <select name="ivac_center" id="select-ivac-center">
                            </select>
                        </div>
                        <div>
                            <input name="web_file" id="input-web-file" type="text" placeholder="Enter Web File Number">
                        </div>
                        <label for="visa_type">Select Visa Type</label>
                        <select name="visa_type" id="select-visa-type">
                            <option value="3">TOURIST VISA</option>
                            <option value="13" selected>MEDICAL/MEDICAL ATTENDANT VISA</option>
                            <option value="1">BUSINESS VISA</option>
                            <option value="6">ENTRY VISA</option>
                            <option value="2">STUDENT VISA</option>
                        </select>
                        <label for="family_count">Select Family Count</label>
                        <select name="family_count" id="select-family-count">
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                        <div id="show-family-member-data">
                        
                        </div>
                        <div>
                            <input name="visit_purpose" id="select-visit-purpose" type="text" placeholder="Enter Visit Purpose Details">
                        </div>
                        <div>
                            <input name="full_name" id="input-full_name" type="text" placeholder="Enter Full Name">
                            <input name="email" id="input-email" type="email" placeholder="Enter Email">
                            <input name="phone" id="input-phone" type="tel" placeholder="Enter Phone Number">
                        </div>
                        
                    </div>
                </div>
                <div id="tab-2" class="tab-content d-none">
                    
                    
                    <div>
                        <h5>OTP Verification</h5>
                        <div>
                            <input type="text" id="otp-input" placeholder="Enter 6-digit OTP" maxLength="6" />
                            <button id="otp-verify-button" type="button">Verify</button>
                            <button id="resend-otp-button" type="button">Resend OTP</button>
                        </div>
                    </div>
                </div>
                <div id="tab-3" class="tab-content d-none">
                    <div id="slot-captcha-content">
                        <input id="date-input" type="date">
                        <button id="slot-button">Get Slots</button>
                        <div id="ivac-slot-display">No slots Selected</div>
                    <div id="captcha-container" class="w-2/3">
                    
                    </div>
                    <button id="captcha-generate-button" type="button">Generate</button>
                   <div>
                        <input id="captcha-input" type="text" placeholder="Enter Captcha">
                        <button id="captcha-verify-button" type="button">Verify</button>
                    </div>
                    
                    
                    
                    
                    
                    </div>
                </div>
                <div id="tab-4" class="tab-content d-none">
                    <div>
                        <button id="paynow-button">Pay Now</button>
                        <p id="payment-link-container" style="display: none;"></p>
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

    htmlData.querySelector('#send-login-otp-button').addEventListener('click', sendLoginOtp);
    htmlData.querySelector('#verify-login-otp-button').addEventListener('click', verifyLoginOtp);

    htmlData.querySelector('#resend-otp-button').addEventListener('click', async function (e) {
        await sendOTP(true);
    });
    htmlData.querySelector('#otp-verify-button').addEventListener('click', async function (e) {
        const otpInput = htmlData.querySelector('#otp-input');
        if (otpInput) {
            await verifyOTP(otpInput.value);
        }
    });





    htmlData.querySelector('#tab-1').addEventListener('click', function (e) {
        toggleTab(1);
    });
    document.addEventListener('DOMContentLoaded', function () {
        selectHighCommission.addEventListener('change', () => {
            highCommission = parseInt(selectHighCommission.value);
            updateIvacCenters(highCommission);
        });
    });



    htmlData.querySelector("#select-family-count").addEventListener('change', ()=>{
        familyCount = parseInt(document.getElementById("select-family-count").value);
        if (familyCount > 0) {
            document.getElementById("show-family-member-data").innerHTML = '';
            for (let i = 0; i < familyCount; i++) {
                document.getElementById("show-family-member-data").innerHTML += `
                    <div class="family-member" id="family-member-${i}">
                        <label for="family-member-name">Family Member ${i + 1}</label>
                        <input type="text" placeholder="Name" id="family-member-name" >
                        <input type="text" placeholder="Webfile" id="family-member-webfile">
                    </div>
                `;
            }
        }
    });






    htmlData.querySelector('#tab-2').addEventListener('click', function (e) {
        toggleTab(2);
    });


    htmlData.querySelector('#tab-3').addEventListener('click', function (e) {
        toggleTab(3);
    });
    htmlData.querySelector('#slot-button').addEventListener('click', function (e) {
        getSlotTimes();
    });
    htmlData.querySelector("#captcha-generate-button").addEventListener('click', async () => {
        await generateCaptcha();
    });
    htmlData.querySelector("#captcha-verify-button").addEventListener('click', async () => {
        await verifyCaptcha();
    });
    htmlData.querySelector("#paynow-button").addEventListener('click', async () => {
        await payNow();
    });


    htmlData.querySelector('#tab-4').addEventListener('click', function (e) {
        toggleTab(4);
    });


    const paymentInfo = (paymentDetails) => {
        const content = document.getElementById('payment-link-container');
        content.innerHTML = paymentDetails;
    };

    document.body.appendChild(htmlData);












    function updateIvacCenters(shc) {
        const ivacCenters = {
            1: [9, "IVAC, BARISAL", 12, "IVAC, JESSORE", 17, "IVAC, Dhaka (JFP)", 20, "IVAC, SATKHIRA"],
            2: [5, "IVAC, CHITTAGONG", 21, "IVAC, CUMILLA", 22, "IVAC, NOAKHALI", 23, "IVAC, BRAHMANBARIA"],
            3: [2, "IVAC , RAJSHAHI", 7, "IVAC, RANGPUR", 18, "IVAC, THAKURGAON", 19, "IVAC, BOGURA", 24, "IVAC, KUSHTIA"],
            4: [4, "IVAC, SYLHET", 8, "IVAC, MYMENSINGH"],
            5: [3, "IVAC, KHULNA"]
        };
        const centers = ivacCenters[shc];
        if (centers) {
            for (let i = 0; i < centers.length; i += 2) {
                const value = centers[i];
                const name = centers[i + 1];

                const option = document.createElement('option');
                option.value = value;
                option.textContent = name;
                selectIvacCenter.appendChild(option);
            }
            console.log(selectIvacCenter + " " + ivacCenters[shc] + " " + centers + " " + name + " " + value);
        }
        console.log("updateIvacCenters called");
    }






















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



    htmlData.draggable=true;

    htmlData.ondragstart = function() {
        return false;
    };
    htmlData.ondrag = function() {
        return false;
    };
    htmlData.ondragend = function() {
        GM_setValue('panelPosition', { left: htmlData.style.left, top: htmlData.style.top });
        return true;
    };


    // Initialize all data when script starts
    async function init() {

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