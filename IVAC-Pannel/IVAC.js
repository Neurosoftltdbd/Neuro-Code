// --- Global Variables & Configuration ---
const API_BASE_URL = "https://payment.ivacbd.com/api/v2";
const CAPSOLVER_API_KEY = "CAP-ADF28423681FE80E495EAA63B0C91E3E7812C2815AD0DA28692B530CB3EF571F"; // Enter your actual CapSolver API Key here

const app_info_submit_endpoint = "payment/application-r5s7h3-submit-hyju6t";
const pay_now_endpoint = "payment/h7j3wt-now-y0k3d6";

let captcha_token = null;
let isStopping = false;
let currentRequestController = null;
let isOtpSent = false;
let panelVisible = false; // MODIFIED: Always start with false, ignoring saved state

// --- Panel Styles ---
GM_addStyle(`
        #ivac-smart-panel {
            position: fixed; top: 20px; left: 20px; background: #f5f5f5; /* Light grayish white */
            border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            padding: 10px; z-index: 9999; border: 1px solid #dcdcdc;
            transform: translateX(-20px); opacity: 0; transition: all 0.3s ease;
            width: 310px !important; /* MODIFIED: Increased width */
            height: auto !important; max-height: 570px; overflow-y: auto;
            pointer-events: none; color: #000000;
        }
        #ivac-smart-panel.visible { transform: translateX(0); opacity: 1; pointer-events: auto; }
        #ivac-smart-panel-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0;
            cursor: move; /* Added cursor to indicate draggability */
        }
        #ivac-smart-panel-title {
            font-size: 16px; font-weight: bold; color: #000000; display: flex;
            align-items: center; gap: 8px; animation: pulseZoom 2s infinite alternate; margin: 0 auto;
        }
        @keyframes pulseZoom { 0% { transform: scale(0.95); } 100% { transform: scale(1.05); } }
        #ivac-smart-panel-close {
            background: none; border: none; font-size: 18px; cursor: pointer;
            color: #666666; padding: 0; line-height: 1; transition: all 0.2s ease;
        }
        #ivac-smart-panel-close:hover { color: #e74c3c; transform: scale(1.2); }
        #status-display {
            padding: 8px 10px; border-radius: 6px; font-size: 13px; border: 1px solid #e0e0e0;
            text-align: center; margin-bottom: 10px; background: #f8f9fa;
        }
        #status-display.status-success .status-text { color: #198754; font-weight: 600; }
        #status-display.status-error .status-text { color: #dc3545; font-weight: 600; }
        #status-display .status-text { color: #333; }
        #ivac-panel-tabs {
            display: flex; margin-bottom: 10px; border-bottom: 1px solid #e0e0e0;
            background: #f5f5f5; border-radius: 6px; overflow: hidden;
        }
        .ivac-tab {
            flex: 1; text-align: center; padding: 8px 0; cursor: pointer; font-size: 12px;
            font-weight: bold; transition: all 0.2s ease; color: #666666;
            display: flex; align-items: center; justify-content: center; gap: 6px; /* MODIFIED FOR ICONS */
        }
        /* MODIFIED: SVG icon styling */
        .ivac-tab svg {
            width: 14px; height: 14px; fill: currentColor;
        }
        /* === NEW: VIBRANT ACTIVE TAB COLORS === */
        .ivac-tab.active { background: rgba(52, 152, 219, 0.2); color: #000000; }
        .ivac-tab[data-tab="login"].active { background: linear-gradient(135deg, #6a11cb, #2575fc); color: white; }
        .ivac-tab[data-tab="home"].active { background: linear-gradient(135deg, #11998e, #38ef7d); color: white; }
        .ivac-tab[data-tab="file"].active { background: linear-gradient(135deg, #f46b45, #eea849); color: white; }
        .ivac-tab-content { display: none; }
        .ivac-tab-content.active { display: block; }
        #ivac-smart-panel-buttons { display: flex; flex-direction: column; gap: 5px; }
        .ivac-panel-btn {
            padding: 8px 10px; border-radius: 6px; border: none; color: white; font-weight: bold;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s ease; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            font-size: 12px; margin-bottom: 5px;
        }
        .stop-btn { background: linear-gradient(145deg, #e74c3c, #c0392b) !important; }
        .ivac-panel-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); }
        #ivac-app-submit-btn { background: linear-gradient(145deg, #11998e, #38ef7d); flex: 1; }
        #ivac-personal-submit-btn { background: linear-gradient(145deg, #f46b45, #eea849); flex: 1; }
        #ivac-overview-btn { background: linear-gradient(145deg, #8e2de2, #4a00e0); flex: 1; }
        #ivac-toggle-panel {
            position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px;
            border-radius: 50%; background: linear-gradient(145deg, #6a11cb, #2575fc);
            color: white; border: none; font-size: 20px; cursor: pointer;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); z-index: 10000;
            display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;
        }
        #ivac-toggle-panel:hover { transform: scale(1.1); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3); }
        .ivac-form-group { margin-bottom: 10px; }
        .ivac-form-group label { display: block; margin-bottom: 4px; font-weight: bold; font-size: 12px; }
        .ivac-form-group input, .ivac-form-group select, .ivac-form-group textarea {
            width: 100%; padding: 8px; border: 1px solid #d0d0d0; border-radius: 6px;
            font-size: 12px; box-sizing: border-box;
        }

        /* === HOME PANEL UI (MODERNIZED) === */
        .ivac-btn-row { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; }
        #ivac-send-otp-btn { background: linear-gradient(145deg, #00b09b, #96c93d); flex: 1; }
        #ivac-verify-otp-btn { background: linear-gradient(145deg, #f12711, #f5af19); flex: 1; }
        #ivac-otp-input { flex: 1.2; border: 1px solid #d0d0d0; border-radius: 6px; padding: 6px; font-size: 12px; max-width: 90px; text-align: center; }
        #ivac-date-section { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; }
        #ivac-date-input { flex: 0.8; padding: 6px; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 12px; min-width: 90px; }
        #ivac-slot-btn { width: auto; padding: 0 8px; height: 32px; background: linear-gradient(145deg, #8e2de2, #4a00e0); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; flex-shrink: 0; }
        #ivac-slot-container { flex: 1; position: relative; }
        #ivac-slot-display {
            padding: 6px; border: 1px solid #d0d0d0; border-radius: 6px; text-align: center;
            font-size: 12px;
            font-weight: normal; /* MODIFIED: Less bold */
            color: #000000; /* MODIFIED: Changed to black */
            height: 32px; display: flex;
            align-items: center; justify-content: center; cursor: pointer; width: 100%; box-sizing: border-box;
        }
        #ivac-slot-dropdown {
            position: absolute; top: 100%; left: 0; width: 100%; max-height: 150px; overflow-y: auto;
            background: #ffffff; border: 1px solid #d0d0d0; border-radius: 6px; z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.15);
            /* MODIFIED: Animation for smooth dropdown */
            opacity: 0;
            transform: translateY(-5px);
            visibility: hidden;
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
        #ivac-slot-dropdown.show {
            /* MODIFIED: Animation for smooth dropdown */
            opacity: 1;
            transform: translateY(0);
            visibility: visible;
        }
        .slot-option { padding: 8px; cursor: pointer; font-size: 12px; }
        .slot-option:hover { background-color: #f0f0f0; }
        #ivac-pay-now-btn { background: linear-gradient(145deg, #28a745, #20c997); }

        /* === NEW: Rearranged Buttons & Link Container === */
        #ivac-bottom-actions { display: flex; justify-content: space-between; gap: 8px; margin-top: 5px; }
        #ivac-bottom-actions .ivac-panel-btn { flex: 1; margin: 0 !important; }
        #ivac-payment-link-container {
            margin-top: 10px; font-size: 11px; text-align: center; word-break: break-all;
            padding: 8px; background: #e9ecef; border-radius: 6px; min-height: 18px;
        }
        #ivac-payment-link-container a { color: #007bff; text-decoration: none; font-weight: bold; }
        #ivac-payment-link-container a:hover { text-decoration: underline; }

        /* === NEW: Smart Auth Token Input === */
        #ivac-token-container { margin-top: 12px; padding-top: 12px; border-top: 1px dashed #d0d0d0; }
        #ivac-token-input {
            width: 100%; border: 1px solid #ccc; border-radius: 6px; padding: 8px;
            font-size: 12px; font-family: monospace; transition: all 0.2s ease;
            background: #f8f9fa; box-sizing: border-box;
            font-weight: bold; /* ADDED: BOLD FONT FOR TOKEN */
        }
        #ivac-token-input:focus { border-color: #6a11cb; box-shadow: 0 0 5px rgba(106, 17, 203, 0.3); }

        /* --- Updated Login Panel Styles (MODIFIED) --- */
        #ivac-login-content { display: flex; flex-direction: column; gap: 12px; }
        .ivac-login-row { display: flex; gap: 5px; align-items: center; }
        .ivac-login-row input {
            flex: 1; width: 100%; padding: 8px; border: 1px solid #d0d0d0;
            border-radius: 6px; font-size: 12px; box-sizing: border-box;
        }
        .ivac-login-row .ivac-panel-btn {
            margin-bottom: 0; white-space: nowrap; flex-shrink: 0;
            height: 34px; /* Fixed height for alignment */
            width: 85px; /* Fixed width for alignment */
        }
        #login-btn-clear-cache {
            /* FIXED: Colorful gradient for the clear cache button */
            background: linear-gradient(145deg, #f39c12, #e67e22) !important;
            margin-top: 5px; margin-bottom: 0 !important;
        }
        #login-btn-mobile-verify { background: linear-gradient(145deg, #00b09b, #96c93d); }
        #login-btn-send-otp { background: linear-gradient(145deg, #f46b45, #eea849); }
        #login-btn-final { background: linear-gradient(145deg, #2ecc71, #27ae60); }
        /* Specific spacing for login inputs */
        #login-mobile, #login-password, #login-otp { margin-bottom: 8px; }

        /* --- FILE PANEL STYLES --- */
        .ivac-file-row { display: flex; gap: 5px; }
        .ivac-file-row .ivac-form-group { flex: 1; }
        #ivac-file-import-export-actions { display: flex; gap: 5px; margin-top: 10px; margin-bottom: 10px; }
        #ivac-file-import-export-actions .ivac-panel-btn { flex: 1; margin-bottom: 0 !important; }
        #ivac-file-import-btn { background: linear-gradient(145deg, #6a11cb, #2575fc); }
        #ivac-file-export-btn { background: linear-gradient(145deg, #11998e, #38ef7d); }
        #ivac-file-actions { display: flex; gap: 5px; margin-top: 10px; }
        #ivac-file-actions .ivac-panel-btn { flex: 1; margin-bottom: 0 !important; }
        #ivac-file-save-btn { background: linear-gradient(145deg, #2ecc71, #27ae60); }
        #ivac-file-clear-btn { background: linear-gradient(145deg, #f46b45, #eea849); }
        #ivac-file-cancel-btn { background: linear-gradient(145deg, #95a5a6, #7f8c8d); }
    `);

// --- Shared variables ---
let dynamicHighcom, dynamicWebfileId, dynamicIvacId, dynamicVisaType, dynamicFamilyCount,
    dynamicVisitPurpose, dynamicFullName, dynamicEmail, dynamicPhone;
let familyMembers = [];
let authToken = GM_getValue('authToken', '');
let slotInfo = { appointment_date: null, appointment_time: null, available_slots: [] };

// --- Data Management Functions ---
function loadSavedData() {
    dynamicHighcom = GM_getValue('dynamicHighcom', 4);
    dynamicWebfileId = GM_getValue('dynamicWebfileId', null);
    dynamicIvacId = GM_getValue('dynamicIvacId', 4);
    dynamicVisaType = GM_getValue('dynamicVisaType', '13'); // Default to Medical Visa
    dynamicFamilyCount = GM_getValue('dynamicFamilyCount', 0);
    dynamicVisitPurpose = GM_getValue('dynamicVisitPurpose', null);
    dynamicFullName = GM_getValue('dynamicFullName', null);
    dynamicEmail = GM_getValue('dynamicEmail', null);
    dynamicPhone = GM_getValue('dynamicPhone', null);
    familyMembers = GM_getValue('familyMembers', []);
}

function saveData() {
    GM_setValue('dynamicHighcom', dynamicHighcom);
    GM_setValue('dynamicWebfileId', dynamicWebfileId);
    GM_setValue('dynamicIvacId', dynamicIvacId);
    GM_setValue('dynamicVisaType', dynamicVisaType);
    GM_setValue('dynamicFamilyCount', dynamicFamilyCount);
    GM_setValue('dynamicVisitPurpose', dynamicVisitPurpose);
    GM_setValue('dynamicFullName', dynamicFullName);
    GM_setValue('dynamicEmail', dynamicEmail);
    GM_setValue('dynamicPhone', dynamicPhone);
    GM_setValue('familyMembers', familyMembers);
}

function clearSavedData() {
    const keysToClear = [
        'dynamicHighcom', 'dynamicWebfileId', 'dynamicIvacId', 'dynamicVisaType',
        'dynamicFamilyCount', 'dynamicVisitPurpose', 'dynamicFullName', 'dynamicEmail',
        'dynamicPhone', 'familyMembers'
    ];
    keysToClear.forEach(key => GM_deleteValue(key));
    loadSavedData(); // Reload defaults after clearing
    populateForm(); // Repopulate form with defaults
    updateStatus('Form data cleared!', 'success');
}

// =============================================================
// ========== CORE LOGIC & API FUNCTIONS =======================
// =============================================================

function updateStatus(message, type = 'processing') {
    const statusText = document.querySelector('#status-display .status-text');
    if (!statusText) return;
    const statusDisplay = statusText.parentElement;
    statusDisplay.className = '';
    if (type === 'success') statusDisplay.classList.add('status-success');
    else if (type === 'error') statusDisplay.classList.add('status-error');
    statusText.textContent = message;
    console.log(`[Status: ${type}] ${message}`);
}

async function solveCloudflare(pageUrl, siteKey) {
    updateStatus('Solving Cloudflare CAPTCHA...');
    if (CAPSOLVER_API_KEY.includes("YOUR_CAPSOLVER_API_KEY")) {
        updateStatus('Error: CapSolver API Key is not set!', 'error');
        return null;
    }
    try {
        let response = await fetch("https://api.capsolver.com/createTask", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientKey: CAPSOLVER_API_KEY,
                task: { type: "AntiTurnstileTaskProxyless", websiteURL: pageUrl, websiteKey: siteKey }
            })
        });
        let data = await response.json();
        if (data.errorId) throw new Error(`CapSolver Error (createTask): ${data.errorDescription}`);

        const taskId = data.taskId;
        updateStatus(`CAPTCHA task created: ${taskId}`);

        let solution = null;
        while (!solution) {
            if (isStopping) throw new Error("Operation stopped by user.");
            await new Promise(resolve => setTimeout(resolve, 3000));
            response = await fetch("https://api.capsolver.com/getTaskResult", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientKey: CAPSOLVER_API_KEY, taskId: taskId })
            });
            data = await response.json();
            if (data.errorId) throw new Error(`CapSolver Error (getTaskResult): ${data.errorDescription}`);
            if (data.status === "ready") {
                solution = data.solution;
            } else {
                updateStatus('Solving CAPTCHA...');
            }
        }
        captcha_token = solution.token;
        updateStatus(`CAPTCHA solved successfully! ✓`, 'success');
        return captcha_token;
    } catch (error) {
        updateStatus(`CF Solve Error: ${error.message}`, 'error');
        return null;
    }
}

async function makeRequest(endpoint, method = 'POST', payload = {}, description = "") {
    currentRequestController = new AbortController();

    if (isStopping) {
        updateStatus('Operation stopped.', 'error');
        return null;
    }
    updateStatus(`Processing ${description}...`);

    try {
        const headers = {
            "accept": "application/json", "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json", "language": "en", "priority": "u=1, i",
            "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
            "sec-ch-ua-mobile": "?0", "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin"
        };
        if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: method, headers: headers,
            body: (method === 'GET' || !Object.keys(payload).length) ? null : JSON.stringify(payload),
            signal: currentRequestController.signal,
            referrerPolicy: "strict-origin-when-cross-origin",
            mode: "cors", credentials: "include"
        });

        if (response.ok) {
            const result = response.status === 204 ? {} : await response.json();
            updateStatus(`${description} successful ✓`, 'success');
            return result;
        }

        const errorResult = await response.json().catch(() => ({ message: `HTTP Error: ${response.status}` }));
        console.error("API Error Response:", errorResult);
        throw new Error(errorResult.message || `HTTP Error ${response.status}`);

    } catch (error) {
        if (error.name === 'AbortError') {
            updateStatus('Request aborted by user.', 'error');
            return null;
        }
        updateStatus(`${description} failed: ${error.message}`, 'error');
        isStopping = true; // Stop on any error.
        return null;
    }
}

// --- Login Flow Functions ---
async function handleMobileVerify() {
    const mobileNo = document.getElementById('login-mobile').value;
    if (!mobileNo) return updateStatus('Please enter a mobile number.', 'error');
    if (!await solveCloudflare("https://payment.ivacbd.com/login", "0x4AAAAAABpNUpzYeppBoYpe")) return;
    await makeRequest('mobile-verify', 'POST', { mobile_no: mobileNo, captcha_token }, 'Mobile Verify');
}

async function handleLoginSendOtp() {
    const mobileNo = document.getElementById('login-mobile').value;
    const password = document.getElementById('login-password').value;
    if (!mobileNo || !password) return updateStatus('Please enter mobile and password.', 'error');
    await makeRequest('login', 'POST', { mobile_no: mobileNo, password }, 'Send OTP');
}

async function handleLoginVerifyOtp() {
    const mobileNo = document.getElementById('login-mobile').value;
    const password = document.getElementById('login-password').value;
    const otp = document.getElementById('login-otp').value;
    if (!otp) return updateStatus('Please enter OTP.', 'error');

    const result = await makeRequest('login-otp', 'POST', { mobile_no: mobileNo, password, otp }, 'Login Verify');
    if (result && result.data && result.data.access_token) {
        authToken = result.data.access_token;
        GM_setValue('authToken', authToken);
        localStorage.setItem('access_token', authToken);
        updateStatus('Login successful!', 'success');
        document.getElementById('ivac-token-input').value = authToken;
        document.querySelector('.ivac-tab[data-tab="home"]').click();
    }
}

// --- Application Flow Functions ---
async function handleAppInfo() {
    if (!dynamicWebfileId || !dynamicIvacId || !dynamicVisaType) return updateStatus("Please complete the File tab.", 'error');
    if (!await solveCloudflare(window.location.href, "0x4AAAAAABvQ3Mi6RktCuZ7P")) return;
    const payload = { highcom: String(dynamicHighcom), webfile_id: dynamicWebfileId, webfile_id_repeat: dynamicWebfileId, ivac_id: String(dynamicIvacId), visa_type: String(dynamicVisaType), family_count: String(dynamicFamilyCount || 0), visit_purpose: dynamicVisitPurpose || "medical purpose", y6e7uk_token_t6d8n3: captcha_token };
    await makeRequest(app_info_submit_endpoint, 'POST', payload, 'Application Info');
}

async function handlePersonalInfo() {
    if (!dynamicFullName || !dynamicWebfileId) return updateStatus("Please enter personal information.", 'error');
    const familyPayload = familyMembers.map(member => ({
        webfile_no: member.webfile_id,
        again_webfile_no: member.webfile_id,
        name: member.full_name
    }));
    const payload = {
        full_name: dynamicFullName,
        email_name: dynamicEmail,
        phone: dynamicPhone,
        webfile_id: dynamicWebfileId,
        family: familyPayload
    };
    await makeRequest('payment/personal-info-submit', 'POST', payload, 'Personal Info');
}

async function handleOverview() { await makeRequest('payment/overview-submit', 'POST', {}, 'Overview'); }
async function handleSendPaymentOtp(isResend = false) { await makeRequest('payment/pay-otp-sent', 'POST', { resend: isResend ? 1 : 0 }, isResend ? 'Resend OTP' : 'Send OTP'); }

// MODIFIED: New handler for the OTP button to manage send/resend state
async function handleOtpRequest() {
    await handleSendPaymentOtp(isOtpSent);
    // After the first attempt, any subsequent click is a resend.
    isOtpSent = true;
}

async function handleVerifyPaymentOtp() {
    const otp = document.getElementById('ivac-otp-input').value;
    if (!otp || otp.length !== 6) return updateStatus("Please enter a valid 6-digit OTP.", 'error');
    const result = await makeRequest('payment/pay-otp-verify', 'POST', { otp }, 'Verify OTP');
    if (result && result.data) {
        const appointmentDate = result.data?.slot_dates?.[0] || result.data?.appointment_date;
        if (appointmentDate) {
            document.getElementById('ivac-date-input').value = appointmentDate;
            updateStatus(`Date found: ${appointmentDate}`, 'success');
        }
    }
}

async function getSlot() {
    const appointmentDate = document.getElementById('ivac-date-input').value;
    if (!appointmentDate) return updateStatus("Please select a date.", 'error');
    slotInfo.appointment_date = appointmentDate;
    const result = await makeRequest('payment/pay-slot-time', 'POST', { appointment_date: appointmentDate }, 'Slot Search');
    if (result && result.data) {
        slotInfo.available_slots = result.data.slot_times || [];
        updateSlotDropdown();
    }
}

async function payNow() {
    if (!slotInfo.appointment_date || !slotInfo.appointment_time) return updateStatus("Please select a date and time slot.", 'error');
    if(!await solveCloudflare(window.location.href, "0x4AAAAAABvQ3Mi6RktCuZ7P")) return;
    const payload = { appointment_date: slotInfo.appointment_date, appointment_time: slotInfo.appointment_time, k5t0g8_token_y4v9f6: captcha_token, selected_payment: { "name": "VISA", "slug": "visacard", "link": "https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/visa.png" } };
    const result = await makeRequest(pay_now_endpoint, 'POST', payload, 'Payment');
    if (result && result.data && result.data.url) {
        updateStatus('Payment link generated!', 'success');
        window.open(result.data.url, '_blank');
        isOtpSent = false; // MODIFIED: Reset OTP state after successful completion

        // NEW: Display the link in the panel
        const linkContainer = document.getElementById('ivac-payment-link-container');
        linkContainer.innerHTML = ''; // Clear previous link
        const linkEl = document.createElement('a');
        linkEl.href = result.data.url;
        linkEl.textContent = 'Payment Link (Click to Open)';
        linkEl.title = result.data.url;
        linkEl.target = '_blank';
        linkContainer.appendChild(linkEl);
    }
}

function stopAllRequests() {
    isStopping = true;
    if (currentRequestController) currentRequestController.abort();
    updateStatus('All operations stopped.', 'error');
    isOtpSent = false; // MODIFIED: Reset OTP state on stop
    setTimeout(() => { isStopping = false; }, 500);
}

// --- UI Helper Functions ---
function updateSlotDropdown() {
    const slotDropdown = document.getElementById('ivac-slot-dropdown');
    const slotDisplay = document.getElementById('ivac-slot-display');
    slotDropdown.innerHTML = '';

    if (slotInfo.available_slots.length === 0) {
        slotDisplay.textContent = "No slots available";
        slotInfo.appointment_time = null;
        return;
    }

    const firstSlot = slotInfo.available_slots[0];
    slotDisplay.textContent = `${firstSlot.time_display} (${firstSlot.availableSlot})`;
    slotInfo.appointment_time = firstSlot.time_display;

    slotInfo.available_slots.forEach(slot => {
        const option = document.createElement('div');
        option.className = 'slot-option';
        option.textContent = `${slot.time_display} (${slot.availableSlot})`;
        option.addEventListener('click', () => {
            slotDisplay.textContent = option.textContent;
            slotInfo.appointment_time = slot.time_display;
            slotDropdown.classList.remove('show');
        });
        slotDropdown.appendChild(option);
    });
}

function createFormGroup(id, labelText, inputType = 'text', options = null) {
    const group = document.createElement('div');
    group.className = 'ivac-form-group';
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    group.appendChild(label);
    let input;
    if (inputType === 'select') {
        input = document.createElement('select');
        input.id = id;
        if (options) {
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.text;
                input.appendChild(option);
            });
        }
    } else {
        input = document.createElement(inputType === 'textarea' ? 'textarea' : 'input');
        input.id = id;
        if (inputType !== 'textarea') input.type = inputType;
        input.placeholder = labelText;
    }
    group.appendChild(input);
    return group;
}

function updateIvacCenters(highcomSelect, ivacSelect) {
    const selectedHighCom = highcomSelect.value;
    const ivacCenters = {
        "1": [[17, "Dhaka (JFP)"], [8, "Mymensingh"], [9, "Barisal"], [12, "Jessore"], [20, "Satkhira"]],
        "2": [[5, "Chittagong"], [21, "Cumilla"], [22, "Noakhali"], [23, "Brahmanbaria"]],
        "3": [[2, "Rajshahi"], [7, "Rangpur"], [18, "Thakurgaon"], [19, "Bogura"], [24, "Kushtia"]],
        "4": [[4, "Sylhet"]],
        "5": [[3, "Khulna"]]
    };
    ivacSelect.innerHTML = '';
    (ivacCenters[selectedHighCom] || []).forEach(([value, name]) => {
        const option = document.createElement('option');
        option.value = value;
        option.text = `IVAC, ${name}`;
        ivacSelect.appendChild(option);
    });
}

async function fetchAuthToken() {
    authToken = localStorage.getItem('access_token') || GM_getValue('authToken', '');
    if (authToken) {
        document.getElementById('ivac-token-input').value = authToken;
        updateStatus("Token loaded successfully.", "success");
    } else {
        updateStatus("No login token found.", "error");
    }
}

// --- NEW: Clear Cache, Import, Export ---
async function clearSiteData() {
    try {
        // Clear GM storage used by the script
        const keysToClear = [
            'dynamicHighcom', 'dynamicWebfileId', 'dynamicIvacId', 'dynamicVisaType',
            'dynamicFamilyCount', 'dynamicVisitPurpose', 'dynamicFullName', 'dynamicEmail',
            'dynamicPhone', 'familyMembers', 'authToken', 'panelVisible'
        ];
        keysToClear.forEach(key => GM_deleteValue(key));

        // Clear browser storage for the current domain
        localStorage.clear();
        sessionStorage.clear();

        // Clear cookies for the current domain
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }

        // Clear Service Worker Caches
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
        }

        updateStatus('All site and script data cleared!', 'success');
        // Reload data to reset the script's state and UI
        authToken = '';
        $('#ivac-token-input').val('');
        loadSavedData();
        populateForm();

    } catch (error) {
        console.error("Error clearing site data: ", error);
        updateStatus(`Error clearing data: ${error.message}`, 'error');
    }
}

function handleExport() {
    try {
        // Ensure current form data is captured before export
        const dataToExport = {
            dynamicHighcom: $('#file-highcom').val(),
            dynamicIvacId: $('#file-ivac').val(),
            dynamicWebfileId: $('#file-webfile').val(),
            dynamicVisaType: $('#file-visatype').val(),
            dynamicVisitPurpose: $('#file-visitpurpose').val(),
            dynamicFullName: $('#file-fullname').val(),
            dynamicEmail: $('#file-email').val(),
            dynamicPhone: $('#file-phone').val(),
            familyMembers: [],
        };
        const bulkText = $('#file-family-bulk-input').val().trim();
        const lines = bulkText.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length > 0 && lines.length % 2 === 0) {
            for (let i = 0; i < lines.length; i += 2) {
                dataToExport.familyMembers.push({ full_name: lines[i], webfile_id: lines[i + 1] });
            }
        }
        dataToExport.dynamicFamilyCount = dataToExport.familyMembers.length;

        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ivac_config_${dataToExport.dynamicWebfileId || 'data'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        updateStatus('Data exported successfully!', 'success');
    } catch (error) {
        updateStatus(`Export failed: ${error.message}`, 'error');
    }
}

function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = readerEvent => {
            try {
                const content = readerEvent.target.result;
                const importedData = JSON.parse(content);

                dynamicHighcom = importedData.dynamicHighcom;
                dynamicIvacId = importedData.dynamicIvacId;
                dynamicWebfileId = importedData.dynamicWebfileId;
                dynamicVisaType = importedData.dynamicVisaType;
                dynamicVisitPurpose = importedData.dynamicVisitPurpose;
                dynamicFullName = importedData.dynamicFullName;
                dynamicEmail = importedData.dynamicEmail;
                dynamicPhone = importedData.dynamicPhone;
                familyMembers = importedData.familyMembers || [];
                dynamicFamilyCount = familyMembers.length;

                saveData();
                populateForm();
                updateStatus('Data imported successfully!', 'success');
            } catch (error) {
                updateStatus(`Import failed: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}


// ==================== Panel Creation ====================
const smartPanel = document.createElement('div');
smartPanel.id = 'ivac-smart-panel';
const panelHeader = document.createElement('div'); panelHeader.id = 'ivac-smart-panel-header';
const panelTitle = document.createElement('div'); panelTitle.id = 'ivac-smart-panel-title'; panelTitle.innerHTML = `Rupon Modernization`;
const panelClose = document.createElement('button'); panelClose.id = 'ivac-smart-panel-close'; panelClose.innerHTML = '&times;';
panelHeader.appendChild(panelTitle); panelHeader.appendChild(panelClose);
smartPanel.appendChild(panelHeader);
const statusDisplay = document.createElement('div'); statusDisplay.id = 'status-display'; statusDisplay.innerHTML = '<span class="status-text">Ready</span>';
smartPanel.appendChild(statusDisplay);

const panelTabs = document.createElement('div'); panelTabs.id = 'ivac-panel-tabs';

// --- MODIFIED: TABS WITH SVG ICONS ---
const loginTab = document.createElement('div');
loginTab.className = 'ivac-tab active';
loginTab.dataset.tab = 'login';
loginTab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg> Login`;

const homeTab = document.createElement('div');
homeTab.className = 'ivac-tab';
homeTab.dataset.tab = 'home';
homeTab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146z"/></svg> Home`;

const fileTab = document.createElement('div');
fileTab.className = 'ivac-tab';
fileTab.dataset.tab = 'file';
fileTab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zm0 2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zm0 2a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1h-4z"/></svg> File`;

panelTabs.appendChild(loginTab); panelTabs.appendChild(homeTab); panelTabs.appendChild(fileTab);
smartPanel.appendChild(panelTabs);

// --- UPDATED LOGIN PANEL ---
const loginContent = document.createElement('div');
loginContent.className = 'ivac-tab-content active';
loginContent.id = 'ivac-login-content';

const mobileRow = document.createElement('div'); mobileRow.className = 'ivac-login-row';
const mobileInput = document.createElement('input'); mobileInput.id = 'login-mobile'; mobileInput.placeholder = 'Mobile Number';
const mobileVerifyBtn = document.createElement('button'); mobileVerifyBtn.className = 'ivac-panel-btn'; mobileVerifyBtn.id = 'login-btn-mobile-verify'; mobileVerifyBtn.textContent = 'Verify';
mobileRow.appendChild(mobileInput); mobileRow.appendChild(mobileVerifyBtn);
loginContent.appendChild(mobileRow);

const passwordRow = document.createElement('div'); passwordRow.className = 'ivac-login-row';
const passwordInput = document.createElement('input'); passwordInput.id = 'login-password'; passwordInput.type = 'password'; passwordInput.placeholder = 'Password';
const sendOtpLoginBtn = document.createElement('button'); sendOtpLoginBtn.className = 'ivac-panel-btn'; sendOtpLoginBtn.id = 'login-btn-send-otp'; sendOtpLoginBtn.textContent = 'Send OTP';
passwordRow.appendChild(passwordInput); passwordRow.appendChild(sendOtpLoginBtn);
loginContent.appendChild(passwordRow);

const otpRowLogin = document.createElement('div'); otpRowLogin.className = 'ivac-login-row';
const otpInputLogin = document.createElement('input'); otpInputLogin.id = 'login-otp'; otpInputLogin.placeholder = 'OTP';
const finalLoginBtn = document.createElement('button'); finalLoginBtn.className = 'ivac-panel-btn'; finalLoginBtn.id = 'login-btn-final'; finalLoginBtn.textContent = 'Login';
otpRowLogin.appendChild(otpInputLogin); otpRowLogin.appendChild(finalLoginBtn);
loginContent.appendChild(otpRowLogin);

// NEW: Clear Cache Button
const clearCacheBtn = document.createElement('button');
clearCacheBtn.className = 'ivac-panel-btn';
clearCacheBtn.id = 'login-btn-clear-cache';
clearCacheBtn.textContent = 'Clear Cache';
loginContent.appendChild(clearCacheBtn);

// Smart Auth Token Input
const tokenContainer = document.createElement('div'); tokenContainer.id = 'ivac-token-container';
const tokenInput = document.createElement('input'); tokenInput.id = 'ivac-token-input'; tokenInput.placeholder = 'Paste & Auto-Save Auth Token';
tokenContainer.appendChild(tokenInput);
loginContent.appendChild(tokenContainer);

// --- MODERNIZED HOME PANEL ---
const homeContent = document.createElement('div'); homeContent.className = 'ivac-tab-content'; homeContent.id = 'ivac-home-content';
const homeButtons = document.createElement('div'); homeButtons.id = 'ivac-smart-panel-buttons';

const firstRow = document.createElement('div'); firstRow.className = 'ivac-btn-row';
const appSubmitBtn = document.createElement('button'); appSubmitBtn.className = 'ivac-panel-btn'; appSubmitBtn.id = 'ivac-app-submit-btn'; appSubmitBtn.textContent = 'App Info';
const personalSubmitBtn = document.createElement('button'); personalSubmitBtn.className = 'ivac-panel-btn'; personalSubmitBtn.id = 'ivac-personal-submit-btn'; personalSubmitBtn.textContent = 'Per Info';
const overviewBtn = document.createElement('button'); overviewBtn.className = 'ivac-panel-btn'; overviewBtn.id = 'ivac-overview-btn'; overviewBtn.textContent = 'Overview';
firstRow.appendChild(appSubmitBtn); firstRow.appendChild(personalSubmitBtn); firstRow.appendChild(overviewBtn);

const otpRow = document.createElement('div'); otpRow.className = 'ivac-btn-row';
const sendOtpBtn = document.createElement('button'); sendOtpBtn.className = 'ivac-panel-btn'; sendOtpBtn.id = 'ivac-send-otp-btn'; sendOtpBtn.textContent = 'Send OTP';
const otpInput = document.createElement('input'); otpInput.id = 'ivac-otp-input'; otpInput.placeholder = 'OTP';
const verifyOtpBtn = document.createElement('button'); verifyOtpBtn.className = 'ivac-panel-btn'; verifyOtpBtn.id = 'ivac-verify-otp-btn'; verifyOtpBtn.textContent = 'Verify';
otpRow.appendChild(sendOtpBtn); otpRow.appendChild(otpInput); otpRow.appendChild(verifyOtpBtn);

const dateSection = document.createElement('div'); dateSection.id = 'ivac-date-section';
const dateInput = document.createElement('input'); dateInput.id = 'ivac-date-input'; dateInput.type = 'date';
const slotBtn = document.createElement('button'); slotBtn.id = 'ivac-slot-btn'; slotBtn.textContent = 'Slot';
const slotContainer = document.createElement('div'); slotContainer.id = 'ivac-slot-container';
const slotDisplay = document.createElement('div'); slotDisplay.id = 'ivac-slot-display'; slotDisplay.textContent = 'Select Time';
const slotDropdown = document.createElement('div'); slotDropdown.id = 'ivac-slot-dropdown';
slotContainer.appendChild(slotDisplay); slotContainer.appendChild(slotDropdown);
dateSection.appendChild(dateInput); dateSection.appendChild(slotBtn); dateSection.appendChild(slotContainer);

// NEW: Re-arranged button row
const bottomActionsRow = document.createElement('div'); bottomActionsRow.id = 'ivac-bottom-actions';
const stopAllBtn = document.createElement('button'); stopAllBtn.className = 'ivac-panel-btn stop-btn'; stopAllBtn.textContent = 'Stop All';
const payNowBtn = document.createElement('button'); payNowBtn.id = 'ivac-pay-now-btn'; payNowBtn.className = 'ivac-panel-btn'; payNowBtn.textContent = 'Pay Now';
bottomActionsRow.appendChild(stopAllBtn);
bottomActionsRow.appendChild(payNowBtn);

// NEW: Container for payment link
const paymentLinkContainer = document.createElement('div');
paymentLinkContainer.id = 'ivac-payment-link-container';

homeButtons.appendChild(firstRow);
homeButtons.appendChild(otpRow);
homeButtons.appendChild(dateSection);
homeButtons.appendChild(bottomActionsRow);
homeButtons.appendChild(paymentLinkContainer);
homeContent.appendChild(homeButtons);


// --- FILE/SETTINGS PANEL ---
const fileContent = document.createElement('div'); fileContent.className = 'ivac-tab-content'; fileContent.id = 'ivac-file-content';
const locationRow = document.createElement('div'); locationRow.className = 'ivac-file-row';
locationRow.appendChild(createFormGroup('file-highcom', 'High Commission', 'select', [
    {value: '1', text: 'Dhaka'}, {value: '2', text: 'Chittagong'}, {value: '3', text: 'Rajshahi'},
    {value: '4', text: 'Sylhet'}, {value: '5', text: 'Khulna'}
]));
locationRow.appendChild(createFormGroup('file-ivac', 'IVAC Center', 'select'));
fileContent.appendChild(locationRow);
fileContent.appendChild(createFormGroup('file-webfile', 'Webfile Number'));
fileContent.appendChild(createFormGroup('file-visatype', 'Visa Type', 'select', [
    {value: '3', text: 'TOURIST VISA'}, {value: '13', text: 'MEDICAL/MEDICAL ATTENDANT VISA'},
    {value: '1', text: 'BUSINESS VISA'}, {value: '6', text: 'ENTRY VISA'},
    {value: '2', text: 'STUDENT VISA'}, {value: '19', text: 'DOUBLE ENTRY VISA'}
]));
const familyBulkInputGroup = createFormGroup('file-family-bulk-input', 'Family Members (Paste Here)', 'textarea');
const familyTextarea = familyBulkInputGroup.querySelector('textarea');
familyTextarea.rows = 8;
fileContent.appendChild(familyBulkInputGroup);
fileContent.appendChild(createFormGroup('file-visitpurpose', 'Visit Purpose', 'textarea'));
fileContent.appendChild(createFormGroup('file-fullname', 'Full Name'));
fileContent.appendChild(createFormGroup('file-email', 'Email'));
fileContent.appendChild(createFormGroup('file-phone', 'Phone Number'));

// NEW: Import/Export Buttons
const importExportActions = document.createElement('div');
importExportActions.id = 'ivac-file-import-export-actions';
const importBtn = document.createElement('button');
importBtn.id = 'ivac-file-import-btn'; importBtn.className = 'ivac-panel-btn'; importBtn.textContent = 'Import';
const exportBtn = document.createElement('button');
exportBtn.id = 'ivac-file-export-btn'; exportBtn.className = 'ivac-panel-btn'; exportBtn.textContent = 'Export';
importExportActions.appendChild(importBtn);
importExportActions.appendChild(exportBtn);
fileContent.appendChild(importExportActions);

const fileActions = document.createElement('div'); fileActions.id = 'ivac-file-actions';
const cancelBtn = document.createElement('button'); cancelBtn.id = 'ivac-file-cancel-btn'; cancelBtn.className = 'ivac-panel-btn'; cancelBtn.textContent = 'Cancel';
const clearBtn = document.createElement('button'); clearBtn.id = 'ivac-file-clear-btn'; clearBtn.className = 'ivac-panel-btn'; clearBtn.textContent = 'Clear';
const saveBtn = document.createElement('button'); saveBtn.id = 'ivac-file-save-btn'; saveBtn.className = 'ivac-panel-btn'; saveBtn.textContent = 'Save';
fileActions.appendChild(cancelBtn);
fileActions.appendChild(clearBtn);
fileActions.appendChild(saveBtn);
fileContent.appendChild(fileActions);

smartPanel.appendChild(loginContent);
smartPanel.appendChild(homeContent);
smartPanel.appendChild(fileContent);
document.body.appendChild(smartPanel);

const togglePanelBtn = document.createElement('button');
togglePanelBtn.id = 'ivac-toggle-panel'; togglePanelBtn.innerHTML = '⚙️';
document.body.appendChild(togglePanelBtn);

// --- Event Listeners ---
togglePanelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = smartPanel.classList.toggle('visible');
    GM_setValue('panelVisible', isVisible); // NEW: Save panel state
});

panelClose.addEventListener('click', (e) => {
    e.stopPropagation();
    smartPanel.classList.remove('visible');
    GM_setValue('panelVisible', false); // NEW: Save panel state
});

clearCacheBtn.addEventListener('click', clearSiteData);
mobileVerifyBtn.addEventListener('click', handleMobileVerify);
sendOtpLoginBtn.addEventListener('click', handleLoginSendOtp);
finalLoginBtn.addEventListener('click', handleLoginVerifyOtp);

appSubmitBtn.addEventListener('click', handleAppInfo);
personalSubmitBtn.addEventListener('click', handlePersonalInfo);
overviewBtn.addEventListener('click', handleOverview);
sendOtpBtn.addEventListener('click', handleOtpRequest); // MODIFIED: Pointing to the new handler
verifyOtpBtn.addEventListener('click', handleVerifyPaymentOtp);
slotBtn.addEventListener('click', getSlot);
payNowBtn.addEventListener('click', payNow);
stopAllBtn.addEventListener('click', stopAllRequests);
slotDisplay.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('ivac-slot-dropdown').classList.toggle('show');
});

// Auto-save token listener
tokenInput.addEventListener('input', () => {
    authToken = tokenInput.value;
    GM_setValue('authToken', authToken);
    updateStatus('Auth Token auto-saved!', 'success');
});

// File Panel Buttons
cancelBtn.addEventListener('click', () => { document.querySelector('.ivac-tab[data-tab="home"]').click(); });
clearBtn.addEventListener('click', clearSavedData);
importBtn.addEventListener('click', handleImport);
exportBtn.addEventListener('click', handleExport);

saveBtn.addEventListener('click', () => {
    dynamicHighcom = document.getElementById('file-highcom').value;
    dynamicIvacId = document.getElementById('file-ivac').value;
    dynamicWebfileId = document.getElementById('file-webfile').value;
    dynamicVisaType = document.getElementById('file-visatype').value;
    dynamicVisitPurpose = document.getElementById('file-visitpurpose').value;
    dynamicFullName = document.getElementById('file-fullname').value;
    dynamicEmail = document.getElementById('file-email').value;
    dynamicPhone = document.getElementById('file-phone').value;

    const bulkText = document.getElementById('file-family-bulk-input').value.trim();
    const lines = bulkText.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length > 0 && lines.length % 2 !== 0) {
        return updateStatus('Family data incomplete. Each member needs a name and webfile number on separate lines.', 'error');
    }
    const numMembers = lines.length / 2;
    if (numMembers > 4) {
        return updateStatus('Error: A maximum of 4 family members is allowed.', 'error');
    }
    dynamicFamilyCount = numMembers;
    familyMembers = [];
    for (let i = 0; i < lines.length; i += 2) {
        familyMembers.push({ full_name: lines[i], webfile_id: lines[i + 1] });
    }
    saveData();
    updateStatus('File information saved!', 'success');
    document.querySelector('.ivac-tab[data-tab="home"]').click(); // Switch to home tab
});

document.getElementById('file-highcom').addEventListener('change', function() {
    updateIvacCenters(this, document.getElementById('file-ivac'));
});

panelTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.ivac-tab');
    if (!tab) return;
    document.querySelectorAll('.ivac-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ivac-tab-content').forEach(c => c.style.display = 'none');
    tab.classList.add('active');
    const targetContent = document.getElementById(`ivac-${tab.dataset.tab}-content`);
    if(targetContent) targetContent.style.display = 'block';
    if (tab.dataset.tab === 'file') {
        document.getElementById('file-highcom').dispatchEvent(new Event('change'));
    }
});

function populateForm() {
    $('#file-highcom').val(dynamicHighcom);
    $('#file-webfile').val(dynamicWebfileId);
    $('#file-visatype').val(dynamicVisaType);
    $('#file-visitpurpose').val(dynamicVisitPurpose);
    $('#file-fullname').val(dynamicFullName);
    $('#file-email').val(dynamicEmail);
    $('#file-phone').val(dynamicPhone);
    const familyText = familyMembers.map(member => `${member.full_name}\n${member.webfile_id}`).join('\n');
    $('#file-family-bulk-input').val(familyText);
    updateIvacCenters(document.getElementById('file-highcom'), document.getElementById('file-ivac'));
    setTimeout(() => { $('#file-ivac').val(dynamicIvacId); }, 100);
}

function init() {
    loadSavedData();
    fetchAuthToken();
    document.querySelectorAll('.ivac-tab-content').forEach(c => c.style.display = 'none');
    const activeTab = document.querySelector('.ivac-tab.active');
    if (activeTab) {
        const targetContent = document.getElementById(`ivac-${activeTab.dataset.tab}-content`);
        if(targetContent) targetContent.style.display = 'block';
    }
    populateForm();
    updateStatus("Panel ready.", "success");
    $('#ivac-smart-panel').draggable({
        handle: "#ivac-smart-panel-header",
        start: function(event, ui) {
            $(this).css({ top: ui.position.top, left: ui.position.left, bottom: 'auto', right: 'auto' });
        }
    });

    // MODIFIED: Ensure the panel is always minimized on page load.
    smartPanel.classList.remove('visible');
    GM_setValue('panelVisible', false);


    const events = ['contextmenu', 'copy', 'cut', 'paste'];
    events.forEach(event => {
        document.body.addEventListener(event, e => e.stopImmediatePropagation(), true);
    });

}

window.addEventListener('load', init);
