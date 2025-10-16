'use strict';

run();

async function run(){

    if (document.getElementById('ivac-smart-panel')) {
        console.log('IVAC Panel is already running.');
        alert('IVAC Panel is already running.');
        return;
    }
    console.log('Initializing IVAC Panel V6 for console...');

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`${src} loaded successfully.`);
                resolve();
            };
            script.onerror = (err) => {
                console.error(`Failed to load ${src}`, err);
                reject(err);
            };
            document.head.appendChild(script);
        });
    }

    try {
        if (typeof window.jQuery === 'undefined') {
            console.log('Loading jQuery...');
            await loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
        }
        if (typeof window.jQuery.ui === 'undefined') {
            console.log('Loading jQuery UI...');
            await loadScript('https://code.jquery.com/ui/1.13.1/jquery-ui.min.js');
        }
    } catch (error) {
        console.error('Fatal Error: Could not load required libraries (jQuery, jQuery UI). The script cannot run.', error);
        alert('Failed to load required libraries. Check the console for more details.');
        return;
    }
    console.log('All dependencies loaded. Executing the main script logic.');
    const GM_setValue = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error in GM_setValue shim:', e);
        }
    };
    const GM_getValue = (key, defaultValue) => {
        const storedValue = localStorage.getItem(key);
        if (storedValue === null || typeof storedValue === 'undefined') {
            return defaultValue;
        }
        try {
            return JSON.parse(storedValue);
        } catch (e) {
            console.error(`Error parsing stored value for key "${key}". Returning default value.`, e);
            return defaultValue;
        }
    };
    const GM_deleteValue = (key) => localStorage.removeItem(key);
    const GM_addStyle = (css) => {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = css;
        document.head.appendChild(style);
    };
    const GM_openInTab = (url) => window.open(url, '_blank');
    (function () {
        const allowInteraction = () => {
            const eventsToStop = ['contextmenu', 'copy', 'cut', 'paste', 'selectstart', 'keydown'];
            for (const event of eventsToStop) {
                document.addEventListener(event, e => e.stopPropagation(), true);
            }
        };
        const allowDevTools = () => {
            window.addEventListener('keydown', function (e) {
                if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'U'].includes(e.key.toUpperCase()))) {
                    e.stopPropagation();
                }
            }, true);
        };
        allowInteraction();
        allowDevTools();
        window.addEventListener('load', () => setTimeout(() => {
            allowInteraction();
            allowDevTools();
        }, 1000));
    })();
    const $$ = s => [...document.querySelectorAll(s)];
    const fire = (el, t) => el && el.dispatchEvent(new Event(t, {bubbles: true, cancelable: true}));
    const setReact = (el, v) => {
        if (!el) return false;
        const p = el instanceof HTMLInputElement ? HTMLInputElement.prototype : el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : Object.getPrototypeOf(el);
        const d = Object.getOwnPropertyDescriptor(p, "value");
        d && d.set ? d.set.call(el, v) : el.value = v;
        el.focus?.();
        fire(el, "input");
        fire(el, "change");
        el.blur?.();
        return String(el.value ?? "") === String(v ?? "");
    };
    const missionSel = () => $$('select#center').find(s => [...s.options].some(o => /Dhaka|Chittagong|Rajshahi|Sylhet|Khulna/i.test(o.textContent || "")));
    const ivacSel = () => $$('select#center').find(s => [...s.options].some(o => /^IVAC,/i.test(o.textContent || "")));
    const findSaveAndNextBtn = () => $$('button').find(b => /Save and Next/i.test(b.textContent || ""));
    const enableEl = el => {
        if (!el) return;
        el.disabled = false;
        el.removeAttribute('disabled');
        el.classList.remove('disabled', 'opacity-50', 'cursor-not-allowed', 'bg-gray-200');
    };
    const enableBtn = b => {
        if (!b) return;
        b.disabled = false;
        b.removeAttribute('disabled');
        b.classList.remove('disabled', 'opacity-50', 'cursor-not-allowed');
    };
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const waitFor = (fn, ms = 10000, step = 150) => new Promise(res => {
        const t0 = performance.now();
        const id = setInterval(() => {
            let v;
            try {
                v = fn();
            } catch {
            }
            if (v) {
                clearInterval(id);
                res(v);
            } else if (performance.now() - t0 > ms) {
                clearInterval(id);
                res(null);
            }
        }, step);
    });
    const findVisible = (selectors) => {
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.offsetParent !== null) return el;
        }
        return null;
    };

    async function fillWithRetry(selectors, value, label = "field", attempts = 3, delayMs = 50) {
        const el = findVisible(selectors);
        if (el) {
            if (setReact(el, value)) {
                console.log(`[IVAC Panel] Filled ${label} instantly`);
                return true;
            }
        }
        for (let i = 0; i < attempts; i++) {
            await sleep(delayMs);
            const retryEl = findVisible(selectors);
            if (retryEl && setReact(retryEl, value)) {
                console.log(`[IVAC Panel] Filled ${label} on retry ${i + 1}`);
                return true;
            }
        }
        console.log(`[IVAC Panel] Could not find ${label} after retries`);
        return false;
    }

    const API_BASE_URL = "https://payment.ivacbd.com/api/v2";
    const CAPSOLVER_API_KEY = "CAP-ADF28423681FE80E495EAA63B0C91E3E7812C2815AD0DA28692B530CB3EF571F";
    const app_info_submit_endpoint = "payment/application-r5s7h3-submit-hyju6t";
    const pay_now_endpoint = "payment/h7j3wt-now-y0k3d6";
    let captcha_token = null;
    let isStopping = false;
    let currentRequestController = null;
    let isOtpSent = false;
    let panelVisible = false;
    let successCountdownInterval = null;
    const chevronIconSVG = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style="vertical-align: middle; margin-left: 4px;"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>`;
    GM_addStyle(`#ivac-smart-panel{position:fixed;top:20px;left:20px;background:#f5f5f5;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.15);padding:10px;z-index:9999;border:1px solid #dcdcdc;transform:translateX(-20px);opacity:0;transition:all .3s ease;width:310px!important;max-height:570px;overflow-y:auto;pointer-events:none;color:#000}#ivac-smart-panel::-webkit-scrollbar{width:5px}#ivac-smart-panel::-webkit-scrollbar-track{background:#f1f1f1}#ivac-smart-panel::-webkit-scrollbar-thumb{background:linear-gradient(135deg,#6a11cb,#2575fc);border-radius:10px}#ivac-smart-panel::-webkit-scrollbar-thumb:hover{background:linear-gradient(135deg,#4a00e0,#1a5cbf)}#ivac-smart-panel.visible{transform:translateX(0);opacity:1;pointer-events:auto}#ivac-smart-panel-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #e0e0e0;cursor:move}#ivac-smart-panel-title{font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;margin:0 auto;background:linear-gradient(to right,#6a11cb,#2575fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:pulseZoom 1.5s infinite alternate}@keyframes pulseZoom{0%{transform:scale(.98)}to{transform:scale(1.02)}}#ivac-smart-panel-close{background:none;border:none;font-size:18px;cursor:pointer;color:#666;padding:0;line-height:1;transition:all .2s ease}#ivac-smart-panel-close:hover{color:#e74c3c;transform:scale(1.2)}#status-display{padding:8px 10px;border-radius:6px;font-size:13px;border:1px solid #e0e0e0;margin-bottom:10px;background:#f8f9fa;display:flex;justify-content:space-between;align-items:center}#status-countdown{font-size:11px;font-weight:700;color:#fff;background-color:#28a745;padding:2px 6px;border-radius:10px;display:none;flex-shrink:0}#status-display.status-success .status-text{color:#198754;font-weight:600}#status-display.status-error .status-text{color:#dc3545;font-weight:600}#status-display .status-text{color:#333;flex-grow:1;text-align:center}#ivac-panel-tabs{display:flex;margin-bottom:10px;border-bottom:1px solid #e0e0e0;background:#f5f5f5;border-radius:6px;overflow:hidden}.ivac-tab{flex:1;text-align:center;padding:8px 0;cursor:pointer;font-size:12px;font-weight:700;transition:all .2s ease;color:#666;display:flex;align-items:center;justify-content:center;gap:6px}.ivac-tab svg{width:14px;height:14px;fill:currentColor}.ivac-tab.active{background:rgba(52,152,219,.2);color:#000}.ivac-tab[data-tab=login].active{background:linear-gradient(135deg,#6a11cb,#2575fc);color:#fff}.ivac-tab[data-tab=home].active{background:linear-gradient(135deg,#11998e,#38ef7d);color:#fff}.ivac-tab[data-tab=file].active{background:linear-gradient(135deg,#f46b45,#eea849);color:#fff}.ivac-tab-content{display:none}.ivac-tab-content.active{display:block}#ivac-smart-panel-buttons{display:flex;flex-direction:column;gap:5px}.ivac-panel-btn{padding:8px 10px;border-radius:6px;border:none;color:#fff;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s ease;box-shadow:0 2px 5px rgba(0,0,0,.1);font-size:12px;margin-bottom:5px}.stop-btn{background:linear-gradient(145deg,#e74c3c,#c0392b)!important}.ivac-panel-btn:hover{transform:translateY(-2px);box-shadow:0 5px 15px rgba(0,0,0,.2)}#ivac-app-submit-btn{background:linear-gradient(145deg,#11998e,#38ef7d);flex:1}#ivac-personal-submit-btn{background:linear-gradient(145deg,#f46b45,#eea849);flex:1}#ivac-overview-btn{background:linear-gradient(145deg,#8e2de2,#4a00e0);flex:1}#ivac-toggle-panel{position:fixed;bottom:20px;right:20px;width:50px;height:50px;border-radius:50%;background:linear-gradient(145deg,#6a11cb,#2575fc);color:#fff;border:none;font-size:20px;cursor:pointer;box-shadow:0 5px 15px rgba(0,0,0,.2);z-index:10000;display:flex;align-items:center;justify-content:center;transition:all .3s ease}#ivac-toggle-panel:hover{transform:scale(1.1);box-shadow:0 8px 20px rgba(0,0,0,.3)}.ivac-form-group{margin-bottom:10px}.ivac-form-group label{display:block;margin-bottom:4px;font-weight:700;font-size:12px}.ivac-form-group input,.ivac-form-group select,.ivac-form-group textarea{width:100%;padding:8px;border:1px solid #d0d0d0;border-radius:6px;font-size:12px;box-sizing:border-box;color:#000}.ivac-btn-row{display:flex;align-items:center;gap:5px;margin-bottom:5px}#ivac-send-otp-btn{background:linear-gradient(145deg,#3498db,#2980b9);flex:1}#ivac-verify-otp-btn{background:linear-gradient(145deg,#f12711,#f5af19);flex:1}#ivac-otp-input{flex:1.2;border:1px solid #d0d0d0;border-radius:6px;padding:6px;font-size:12px;max-width:90px;text-align:center}#ivac-date-section{display:flex;align-items:center;gap:5px;margin-bottom:5px}#ivac-date-input{flex:.8;padding:6px;border:1px solid #d0d0d0;border-radius:6px;font-size:12px;min-width:90px}#ivac-slot-btn{width:auto;padding:0 8px;height:32px;background:linear-gradient(145deg,#8e2de2,#4a00e0);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;flex-shrink:0}#ivac-slot-container{flex:1;position:relative}#ivac-slot-display{padding:6px;border:1px solid #d0d0d0;border-radius:6px;font-size:12px;font-weight:400;color:#000;height:32px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;width:100%;box-sizing:border-box}#ivac-slot-dropdown{position:absolute;top:100%;left:0;width:100%;max-height:150px;overflow-y:auto;background:#fff;border:1px solid #d0d0d0;border-radius:6px;z-index:1000;box-shadow:0 2px 5px rgba(0,0,0,.15);opacity:0;transform:translateY(-5px);visibility:hidden;transition:opacity .2s ease,transform .2s ease}#ivac-slot-dropdown.show{opacity:1;transform:translateY(0);visibility:visible}.slot-option{padding:8px;cursor:pointer;font-size:12px}.slot-option:hover{background-color:#f0f0f0}#ivac-pay-now-btn{background:linear-gradient(145deg,#28a745,#20c997)}#ivac-bottom-actions{display:flex;justify-content:space-between;gap:8px;margin-top:5px}#ivac-bottom-actions .ivac-panel-btn{flex:1;margin:0!important}#ivac-available-slot-info{display:none;margin-top:4px;padding:2px;border-radius:2px;background:0 0;text-align:center;font-size:15px;font-weight:700;animation:slot-info-fade-in .4s ease;background:linear-gradient(to right,#00c6ff,#0072ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 1px 1px rgba(0,0,0,.1))}#ivac-available-slot-info strong{font-size:17px;margin-left:4px;display:inline-block;background:linear-gradient(to right,#f857a6,#ff5858);-webkit-background-clip:text;-webkit-text-fill-color:transparent}@keyframes slot-info-fade-in{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}#ivac-payment-link-container{margin-top:10px;padding:6px 8px;background:#e9ecef;border-radius:6px;min-height:20px;display:flex;align-items:center;gap:8px}#ivac-payment-link-container a{color:#007bff;text-decoration:none;font-weight:700;font-size:11px;word-break:break-all}#ivac-payment-link-container a:hover{text-decoration:underline}#ivac-copy-link-btn{padding:4px 10px;font-size:10px;font-weight:700;border:none;border-radius:4px;background:linear-gradient(145deg,#3498db,#2980b9);color:#fff;cursor:pointer;transition:all .2s ease;flex-shrink:0}#ivac-copy-link-btn:hover{transform:scale(1.05);background:linear-gradient(145deg,#2980b9,#3498db)}#ivac-token-input{flex:1;border:1px solid #ccc;border-radius:6px;padding:8px;font-size:12px;font-family:monospace;transition:all .2s ease;background:#f8f9fa;box-sizing:border-box;font-weight:700}#ivac-token-input:focus{border-color:#6a11cb;box-shadow:0 0 5px rgba(106,17,203,.3)}#ivac-token-refresh{flex-shrink:0;width:32px;height:32px;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;padding:0;transition:transform .2s ease}#ivac-token-refresh:hover{transform:scale(1.1)}#ivac-token-refresh{background:linear-gradient(145deg,#3498db,#2980b9)}#ivac-login-content{display:flex;flex-direction:column;gap:12px}.ivac-login-row{display:flex;gap:5px;align-items:center}.ivac-login-row input{flex:1;width:100%;padding:8px;border:1px solid #d0d0d0;border-radius:6px;font-size:12px;box-sizing:border-box;color:#000}.ivac-login-row .ivac-panel-btn{margin-bottom:0;white-space:nowrap;flex-shrink:0;height:34px;width:85px}.ivac-login-actions-row{margin-top:5px;padding-top:12px;border-top:1px dashed #d0d0d0;display:flex;gap:5px;align-items:center}#login-btn-clear-cache{background:linear-gradient(145deg,#f39c12,#e67e22)!important;width:auto;padding:8px 10px;font-size:11px;flex-shrink:0;margin:0!important;height:32px}.ivac-login-actions-row #ivac-token-input{height:32px;flex:1;min-width:50px}#login-btn-mobile-verify{background:linear-gradient(145deg,#00b09b,#96c93d)}#login-btn-send-otp{background:linear-gradient(145deg,#f46b45,#eea849)}#login-btn-final{background:linear-gradient(145deg,#2ecc71,#27ae60)}.ivac-file-row{display:flex;gap:5px}.ivac-file-row .ivac-form-group{flex:1}#ivac-file-import-export-actions{display:flex;gap:5px;margin-top:10px;margin-bottom:10px}#ivac-file-import-export-actions .ivac-panel-btn{flex:1;margin-bottom:0!important}#ivac-file-import-btn{background:linear-gradient(145deg,#6a11cb,#2575fc)}#ivac-file-export-btn{background:linear-gradient(145deg,#11998e,#38ef7d)}#ivac-file-actions{display:flex;gap:5px;margin-top:10px}#ivac-file-actions .ivac-panel-btn{flex:1;margin-bottom:0!important}#ivac-file-save-btn{background:linear-gradient(145deg,#2ecc71,#27ae60)}#ivac-file-clear-btn{background:linear-gradient(145deg,#f46b45,#eea849)}#ivac-file-cancel-btn{background:linear-gradient(145deg,#95a5a6,#7f8c8d)}#ivac-autofill-container{position:fixed;bottom:20px;left:20px;z-index:10000;opacity:0;transform:translateX(-20px);transition:all .4s cubic-bezier(.34,1.56,.64,1)}.floating-btn{position:relative;width:50px;height:50px;border:none;border-radius:50%;font-weight:700;color:#fff;cursor:pointer;transition:all .3s cubic-bezier(.34,1.56,.64,1);box-shadow:0 4px 20px rgba(0,0,0,.15);overflow:hidden;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px}.floating-btn:hover{transform:translateY(-4px) scale(1.05);box-shadow:0 8px 25px rgba(0,0,0,.2)}.floating-btn .icon{font-size:12px;margin-bottom:1px}.floating-btn .text{font-size:8px;font-weight:600;letter-spacing:.5px}.btn-fill{background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)}.pulse-animation{animation:pulse 2s infinite}@keyframes pulse{0%{box-shadow:0 4px 20px rgba(0,0,0,.15)}50%{box-shadow:0 4px 20px rgba(0,0,0,.15),0 0 0 8px rgba(59,130,246,.1)}to{box-shadow:0 4px 20px rgba(0,0,0,.15)}}.bounce-in{animation:bounceIn .6s cubic-bezier(.34,1.56,.64,1)}@keyframes bounceIn{0%{opacity:0;transform:scale(.3) translateY(-20px)}50%{opacity:1;transform:scale(1.05) translateY(0)}70%{transform:scale(.95)}to{opacity:1;transform:scale(1)}}.panel-version{text-align:center;font-size:10px;font-weight:700;color:#dc3545;margin-top:8px;padding-top:0;border-top:none}#ivac-theme-toggle{background:none;border:none;font-size:14px;cursor:pointer;color:#666;padding:0;line-height:1;transition:all .2s ease;position:absolute;left:15px}#ivac-theme-toggle:hover{color:#2575fc;transform:scale(1.2)}#ivac-smart-panel.dark-theme{background:#2d3436;border-color:#555;color:#dfe6e9}#ivac-smart-panel.dark-theme #ivac-smart-panel-header{border-bottom-color:#444}#ivac-smart-panel.dark-theme #ivac-smart-panel-title{background:none;-webkit-background-clip:unset;-webkit-text-fill-color:#f1c40f;animation:none;transform:scale(1)}#ivac-smart-panel.dark-theme #ivac-theme-toggle,#ivac-smart-panel.dark-theme #ivac-smart-panel-close{color:#b2bec3}#ivac-smart-panel.dark-theme .ivac-form-group input,#ivac-smart-panel.dark-theme .ivac-form-group select,#ivac-smart-panel.dark-theme .ivac-form-group textarea,#ivac-smart-panel.dark-theme #ivac-otp-input,#ivac-smart-panel.dark-theme #ivac-date-input,#ivac-smart-panel.dark-theme #ivac-token-input,#ivac-smart-panel.dark-theme .ivac-login-row input{background-color:#3b3b3b;border-color:#555;color:#fff}#ivac-smart-panel.dark-theme .ivac-form-group input::placeholder,#ivac-smart-panel.dark-theme #ivac-otp-input::placeholder,#ivac-smart-panel.dark-theme #ivac-token-input::placeholder,#ivac-smart-panel.dark-theme .ivac-login-row input::placeholder{color:#888}#ivac-smart-panel.dark-theme #status-display{background:#3b3b3b;border-color:#555}#ivac-smart-panel.dark-theme #status-display .status-text{color:#b2bec3}#ivac-smart-panel.dark-theme #status-display.status-success .status-text{color:#2ecc71}#ivac-smart-panel.dark-theme #status-display.status-error .status-text{color:#ff7675}#ivac-smart-panel.dark-theme #ivac-panel-tabs{background:#3b3b3b;border-bottom-color:#555}#ivac-smart-panel.dark-theme .ivac-tab{color:#b2bec3}#ivac-smart-panel.dark-theme .ivac-tab.active{background:rgba(52,152,219,.2);color:#dfe6e9}#ivac-smart-panel.dark-theme .ivac-tab[data-tab=login].active,#ivac-smart-panel.dark-theme .ivac-tab[data-tab=home].active,#ivac-smart-panel.dark-theme .ivac-tab[data-tab=file].active{color:#fff}#ivac-smart-panel.dark-theme #ivac-slot-display{background-color:#3b3b3b;border-color:#555;color:#dfe6e9}#ivac-smart-panel.dark-theme #ivac-slot-dropdown{background:#2d3436;border-color:#555}#ivac-smart-panel.dark-theme .slot-option:hover{background-color:#4e5759}#ivac-smart-panel.dark-theme #ivac-payment-link-container{background-color:#3b3b3b}#ivac-smart-panel.dark-theme #ivac-payment-link-container a{color:#55aaff}#ivac-smart-panel.dark-theme .panel-version{color:#ff7675}`);
    let dynamicHighcom, dynamicWebfileId, dynamicIvacId, dynamicVisaType, dynamicFamilyCount, dynamicVisitPurpose,
        dynamicFullName, dynamicEmail, dynamicPhone, dynamicLoginMobile, dynamicLoginPassword;
    let familyMembers = [];
    let authToken = GM_getValue('authToken', '');
    let slotInfo = {appointment_date: null, appointment_time: null, available_slots: []};

    function loadSavedData() {
        dynamicHighcom = GM_getValue('dynamicHighcom', 1);
        dynamicWebfileId = GM_getValue('dynamicWebfileId', null);
        dynamicIvacId = GM_getValue('dynamicIvacId', 17);
        dynamicVisaType = GM_getValue('dynamicVisaType', '13');
        dynamicFamilyCount = GM_getValue('dynamicFamilyCount', 0);
        dynamicVisitPurpose = GM_getValue('dynamicVisitPurpose', null);
        dynamicFullName = GM_getValue('dynamicFullName', null);
        dynamicEmail = GM_getValue('dynamicEmail', null);
        dynamicPhone = GM_getValue('dynamicPhone', null);
        dynamicLoginMobile = GM_getValue('dynamicLoginMobile', null);
        dynamicLoginPassword = GM_getValue('dynamicLoginPassword', null);
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
        GM_setValue('dynamicLoginMobile', dynamicLoginMobile);
        GM_setValue('dynamicLoginPassword', dynamicLoginPassword);
        GM_setValue('familyMembers', familyMembers);
    }

    function clearSavedData() {
        const keysToClear = ['dynamicHighcom', 'dynamicWebfileId', 'dynamicIvacId', 'dynamicVisaType', 'dynamicFamilyCount', 'dynamicVisitPurpose', 'dynamicFullName', 'dynamicEmail', 'dynamicPhone', 'familyMembers', 'dynamicLoginMobile', 'dynamicLoginPassword'];
        keysToClear.forEach(key => GM_deleteValue(key));
        loadSavedData();
        populateForm();
        updateStatus('Form data cleared!', 'success');
    }

    function updateStatus(message, type = 'processing') {
        const statusText = document.querySelector('#status-display .status-text');
        if (!statusText) return;
        if (type !== 'success' && successCountdownInterval) {
            clearInterval(successCountdownInterval);
            successCountdownInterval = null;
            const countdownEl = document.getElementById('status-countdown');
            if (countdownEl) countdownEl.style.display = 'none';
        }
        const statusDisplay = statusText.parentElement;
        statusDisplay.className = '';
        if (type === 'success') statusDisplay.classList.add('status-success'); else if (type === 'error') statusDisplay.classList.add('status-error');
        statusText.textContent = message;
        console.log(`[Status: ${type}] ${message}`);
    }

    function startSuccessCountdown(message) {
        if (successCountdownInterval) {
            clearInterval(successCountdownInterval);
        }
        updateStatus(message, 'success');
        const countdownEl = document.getElementById('status-countdown');
        if (!countdownEl) return;
        let secondsElapsed = 0;
        const totalDuration = 30;
        countdownEl.textContent = `${secondsElapsed}s`;
        countdownEl.style.display = 'inline-block';
        successCountdownInterval = setInterval(() => {
            secondsElapsed++;
            if (secondsElapsed <= totalDuration) {
                countdownEl.textContent = `${secondsElapsed}s`;
            } else {
                clearInterval(successCountdownInterval);
                successCountdownInterval = null;
                countdownEl.style.display = 'none';
            }
        }, 1000);
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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    clientKey: CAPSOLVER_API_KEY,
                    task: {type: "AntiTurnstileTaskProxyless", websiteURL: pageUrl, websiteKey: siteKey}
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
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({clientKey: CAPSOLVER_API_KEY, taskId: taskId})
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
            if (error.message === "Operation stopped by user.") {
                console.log("[IVAC Panel] CF Solve operation stopped by user.");
            } else {
                updateStatus(`CF Solve Error: ${error.message}`, 'error');
            }
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
                "accept": "application/json",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "language": "en",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin"
            };
            if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: method,
                headers: headers,
                body: (method === 'GET' || !Object.keys(payload).length) ? null : JSON.stringify(payload),
                signal: currentRequestController.signal,
                referrerPolicy: "strict-origin-when-cross-origin",
                mode: "cors",
                credentials: "include"
            });
            if (response.ok) {
                const result = response.status === 204 ? {} : await response.json();
                startSuccessCountdown(`${description} successful ✓`);
                return result;
            }
            const errorResult = await response.json().catch(() => ({message: `HTTP Error: ${response.status}`}));
            console.error("API Error Response:", errorResult);
            throw new Error(errorResult.message || `HTTP Error ${response.status}`);
        } catch (error) {
            if (error.name === 'AbortError') {
                updateStatus('Request Cancel.', 'error');
            } else {
                updateStatus(`${description} failed: ${error.message}`, 'error');
                isStopping = true;
            }
            return null;
        }
    }

    async function handleMobileVerify() {
        isStopping = false;
        const mobileNo = document.getElementById('login-mobile').value;
        if (!mobileNo) return updateStatus('Please enter a mobile number.', 'error');
        if (!await solveCloudflare("https://payment.ivacbd.com/login", "0x4AAAAAABpNUpzYeppBoYpe")) return;
        await makeRequest('mobile-verify', 'POST', {mobile_no: mobileNo, captcha_token}, 'Mobile Verify');
    }

    async function handleLoginSendOtp() {
        isStopping = false;
        const mobileNo = document.getElementById('login-mobile').value;
        const password = document.getElementById('login-password').value;
        if (!mobileNo || !password) return updateStatus('Please enter mobile and password.', 'error');
        await makeRequest('login', 'POST', {mobile_no: mobileNo, password}, 'Send OTP');
    }

    async function handleLoginVerifyOtp() {
        isStopping = false;
        const mobileNo = document.getElementById('login-mobile').value;
        const password = document.getElementById('login-password').value;
        const otp = document.getElementById('login-otp').value;
        if (!otp) return updateStatus('Please enter OTP.', 'error');
        const result = await makeRequest('login-otp', 'POST', {mobile_no: mobileNo, password, otp}, 'Login Verify');
        if (result && result.data && result.data.access_token) {
            authToken = result.data.access_token;
            const userData = result.data;
            localStorage.setItem('access_token', authToken);
            localStorage.setItem('user_email', userData.email);
            localStorage.setItem('user_phone', userData.mobile_no);
            localStorage.setItem('auth_name', userData.name);
            localStorage.setItem('auth_email', userData.email);
            localStorage.setItem('auth_phone', userData.mobile_no);
            localStorage.setItem('auth_photo', userData.profile_image);
            GM_setValue('authToken', authToken);
            updateStatus('Login successful!', 'success');
            document.getElementById('ivac-token-input').value = authToken;
            document.querySelector('.ivac-tab[data-tab="home"]').click();
        }
    }

    async function handleAppInfo() {
        isStopping = false;
        if (!dynamicWebfileId || !dynamicIvacId || !dynamicVisaType) return updateStatus("Please complete the File tab.", 'error');
        if (!await solveCloudflare(window.location.href, "0x4AAAAAABvQ3Mi6RktCuZ7P")) return;
        const payload = {
            highcom: String(dynamicHighcom),
            webfile_id: dynamicWebfileId,
            webfile_id_repeat: dynamicWebfileId,
            ivac_id: String(dynamicIvacId),
            visa_type: String(dynamicVisaType),
            family_count: String(dynamicFamilyCount || 0),
            visit_purpose: dynamicVisitPurpose || "medical purpose",
            y6e7uk_token_t6d8n3: captcha_token
        };
        await makeRequest(app_info_submit_endpoint, 'POST', payload, 'Application Info');
    }

    async function handlePersonalInfo() {
        isStopping = false;
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

    async function handleOverview() {
        isStopping = false;
        await makeRequest('payment/overview-submit', 'POST', {}, 'Overview');
    }

    async function handleSendPaymentOtp(isResend = false) {
        isStopping = false;
        return await makeRequest('payment/pay-otp-sent', 'POST', {resend: isResend ? 1 : 0}, isResend ? 'Resend OTP' : 'Send OTP');
    }

    async function handleOtpRequest() {
        isStopping = false;
        const result = await handleSendPaymentOtp(isOtpSent);
        if (result) {
            isOtpSent = true;
        }
    }

    async function handleVerifyPaymentOtp() {
        isStopping = false;
        const otp = document.getElementById('ivac-otp-input').value;
        if (!otp || otp.length !== 6) return updateStatus("Please enter a valid 6-digit OTP.", 'error');
        const result = await makeRequest('payment/pay-otp-verify', 'POST', {otp}, 'Verify OTP');
        if (result && result.data) {
            document.getElementById('ivac-otp-input').value = '';
            const appointmentDate = result.data?.slot_dates?.[0] || result.data?.appointment_date;
            if (appointmentDate) {
                document.getElementById('ivac-date-input').value = appointmentDate;
                updateStatus(`Date found: ${appointmentDate}`, 'success');
            }
        }
    }

    async function getSlot() {
        isStopping = false;
        const appointmentDate = document.getElementById('ivac-date-input').value;
        if (!appointmentDate) return updateStatus("Please select a date.", 'error');
        slotInfo.appointment_date = appointmentDate;
        const result = await makeRequest('payment/pay-slot-time', 'POST', {appointment_date: appointmentDate}, 'Slot Search');
        const slotInfoEl = document.getElementById('ivac-available-slot-info');
        if (result && result.data && result.data.slot_times) {
            slotInfo.available_slots = result.data.slot_times || [];
            const totalSlots = slotInfo.available_slots.reduce((acc, slot) => acc + (parseInt(slot.availableSlot, 10) || 0), 0);
            if (slotInfoEl) {
                if (totalSlots > 0) {
                    slotInfoEl.innerHTML = `Available Slots: <strong>${totalSlots}</strong>`;
                    slotInfoEl.style.display = 'block';
                } else {
                    slotInfoEl.style.display = 'none';
                }
            }
            updateSlotDropdown();
        } else {
            if (slotInfoEl) slotInfoEl.style.display = 'none';
            slotInfo.available_slots = [];
            updateSlotDropdown();
        }
    }

    async function payNow() {
        isStopping = false;
        const appointmentDate = document.getElementById('ivac-date-input').value;
        if (!appointmentDate) {
            return updateStatus("Please select a date first.", 'error');
        }
        slotInfo.appointment_date = appointmentDate;
        if (!slotInfo.appointment_time) {
            slotInfo.appointment_time = "09:00 - 09:59";
            updateStatus(`Using default time: ${slotInfo.appointment_time}`, 'success');
        }
        if (!await solveCloudflare(window.location.href, "0x4AAAAAABvQ3Mi6RktCuZ7P")) return;
        const payload = {
            appointment_date: slotInfo.appointment_date,
            appointment_time: slotInfo.appointment_time,
            k5t0g8_token_y4v9f6: captcha_token,
            selected_payment: {
                "name": "VISA",
                "slug": "visacard",
                "link": "https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/visa.png"
            }
        };
        const result = await makeRequest(pay_now_endpoint, 'POST', payload, 'Payment');
        if (result && result.data && result.data.url) {
            updateStatus('Payment link generated!', 'success');
            window.open(result.data.url, '_blank');
            isOtpSent = false;
            const linkContainer = document.getElementById('ivac-payment-link-container');
            linkContainer.innerHTML = '';
            const copyBtn = document.createElement('button');
            copyBtn.id = 'ivac-copy-link-btn';
            copyBtn.textContent = 'Copy';
            copyBtn.title = 'Copy Payment Link';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(result.data.url).then(() => {
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy link: ', err);
                    updateStatus('Copy failed!', 'error');
                });
            });
            const linkEl = document.createElement('a');
            linkEl.href = result.data.url;
            linkEl.textContent = 'Payment Link (Click to Open)';
            linkEl.title = result.data.url;
            linkEl.target = '_blank';
            linkContainer.appendChild(copyBtn);
            linkContainer.appendChild(linkEl);
        }
    }

    function updateSlotDropdown() {
        const slotDropdown = document.getElementById('ivac-slot-dropdown');
        const slotDisplay = document.getElementById('ivac-slot-display');
        slotDropdown.innerHTML = '';
        if (slotInfo.available_slots.length === 0) {
            const defaultTime = "09:00 - 09:59";
            slotDisplay.innerHTML = `${defaultTime} ${chevronIconSVG}`;
            slotInfo.appointment_time = defaultTime;
            updateStatus('No slots. Default time set for Pay Now.', 'success');
            return;
        }
        const firstSlot = slotInfo.available_slots[0];
        slotDisplay.innerHTML = `${firstSlot.time_display} ${chevronIconSVG}`;
        slotInfo.appointment_time = firstSlot.time_display;
        slotInfo.available_slots.forEach(slot => {
            const option = document.createElement('div');
            option.className = 'slot-option';
            option.textContent = `${slot.time_display} (${slot.availableSlot})`;
            option.addEventListener('click', () => {
                slotDisplay.innerHTML = `${slot.time_display} ${chevronIconSVG}`;
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
            "1": [[17, "Dhaka (JFP)"], [9, "Barisal"], [12, "Jessore"], [20, "Satkhira"]],
            "2": [[5, "Chittagong"], [21, "Cumilla"], [22, "Noakhali"], [23, "Brahmanbaria"]],
            "3": [[2, "Rajshahi"], [7, "Rangpur"], [18, "Thakurgaon"], [19, "Bogura"], [24, "Kushtia"]],
            "4": [[4, "Sylhet"], [8, "Mymensingh"]],
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
        authToken = localStorage.getItem('access_token');
        if (authToken) {
            document.getElementById('ivac-token-input').value = authToken;
            updateStatus("Token loaded successfully.", "success");
        } else {
            updateStatus("No login token found.", "error");
        }
    }

    async function clearSiteData() {
        try {
            localStorage.clear();
            sessionStorage.clear();
            if ('cookieStore' in window) {
                try {
                    const cookies = await cookieStore.getAll();
                    for (const cookie of cookies) {
                        console.log('Cookie deleted:', cookie);
                        await cookieStore.delete(cookie.name);
                    }
                } catch (err) {
                    console.warn("cookieStore API not fully supported:", err);
                }
            }
            const cookies = document.cookie.split(";");
            for (const cookie of cookies) {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                if (name === "cf_clearance") {
                    console.log("Deleting cf_clearance cookie explicitly...");
                }
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax";
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            }
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            }
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.unregister()));
            }
            authToken = '';
            $('#ivac-token-input').val('');
            updateStatus('All site data cleared successfully!', 'success');
            console.log("All site data has been cleared, including cf_clearance.");
        } catch (error) {
            console.error("Error clearing site data: ", error);
            updateStatus(`Error clearing site data: ${error.message}`, 'error');
        }
    }

    function handleExport() {
        try {
            const familyMembersData = familyMembers.map(m => ({name: m.full_name, webfile_no: m.webfile_id}));
            const fileInfo = {
                mobile: dynamicPhone || "",
                password: "",
                applicant_name: dynamicFullName || "",
                applicant_webfile: dynamicWebfileId || "",
                purposeTxt: dynamicVisitPurpose || "",
                email: dynamicEmail || "",
                highCom: parseInt(dynamicHighcom) || null,
                ivacId: parseInt(dynamicIvacId) || null,
                VisaTypeId: parseInt(dynamicVisaType) || null,
                familyData: familyMembersData,
                loginMobile: dynamicLoginMobile || "",
                loginPassword: dynamicLoginPassword || ""
            };
            const dataToExport = {file_info: fileInfo};
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ivac_config_${fileInfo.applicant_webfile || 'data'}.json`;
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
                    const importedJson = JSON.parse(content);
                    if (!importedJson.file_info) throw new Error("Invalid format: 'file_info' object not found.");
                    const d = importedJson.file_info;
                    dynamicHighcom = d.highCom;
                    dynamicIvacId = d.ivacId;
                    dynamicWebfileId = d.applicant_webfile;
                    dynamicVisaType = d.VisaTypeId;
                    dynamicVisitPurpose = d.purposeTxt;
                    dynamicFullName = d.applicant_name;
                    dynamicEmail = d.email;
                    dynamicPhone = d.mobile;
                    dynamicLoginMobile = d.loginMobile || d.mobile;
                    dynamicLoginPassword = d.loginPassword;
                    familyMembers = (d.familyData || []).map(member => ({
                        full_name: member.name,
                        webfile_id: member.webfile_no
                    }));
                    dynamicFamilyCount = familyMembers.length;
                    saveData();
                    populateForm();
                    if (dynamicLoginMobile) $('#login-mobile').val(dynamicLoginMobile);
                    if (d.loginPassword) $('#login-password').val(d.loginPassword);
                    updateStatus('Data imported successfully!', 'success');
                } catch (error) {
                    updateStatus(`Import failed: ${error.message}`, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    function getDataForAutofill() {
        return {
            highCom: parseInt(dynamicHighcom),
            ivacId: parseInt(dynamicIvacId),
            webfile_id: dynamicWebfileId,
            applicant_webfile: dynamicWebfileId,
            loginMobile: dynamicLoginMobile,
            loginPassword: dynamicLoginPassword,
            VisaTypeId: parseInt(dynamicVisaType),
            familyCount: familyMembers.length,
            purposeTxt: dynamicVisitPurpose,
            familyData: familyMembers.map(m => ({name: m.full_name, webfile_no: m.webfile_id})),
            applicant_name: dynamicFullName,
            email: dynamicEmail,
            mobile: dynamicPhone
        };
    }

    async function fillApplication() {
        const D = getDataForAutofill();
        if (!D) return false;
        const ms = missionSel();
        enableEl(ms);
        const iv = ivacSel();
        enableEl(iv);
        const webfileInput = document.querySelector("#webfile_id");
        enableEl(webfileInput);
        const conf = $$("label").find(l => /ONCE AGAIN/i.test(l.textContent || ""))?.closest(".sm\\:col-span-3")?.querySelector("input");
        enableEl(conf);
        const visa = document.querySelector("#visa_type");
        enableEl(visa);
        const fam = document.querySelector("#family_count");
        enableEl(fam);
        const purpose = document.querySelector("#visit_purpose");
        enableEl(purpose);
        if (ms && D.highCom != null) {
            setReact(ms, String(D.highCom));
        }
        setReact(webfileInput, D.applicant_webfile || D.webfile_id || "");
        setReact(conf, D.applicant_webfile || D.webfile_id || "");
        if (iv && D.ivacId != null) {
            const opt = await waitFor(() => [...iv.options].find(o => o.value.endsWith('|' + D.ivacId)), 5000, 200);
            if (opt) {
                console.log(`[IVAC Panel] Found IVAC center, setting to: ${opt.textContent}`);
                setReact(iv, opt.value);
            } else {
                console.log(`[IVAC Panel] Could not find IVAC center option with value ending in |${D.ivacId} after waiting.`);
            }
        }
        if (visa && D.VisaTypeId != null) {
            setReact(visa, String(D.VisaTypeId));
        }
        if (fam && D.familyCount != null) {
            setReact(fam, String(D.familyCount));
        }
        setReact(purpose, D.purposeTxt || "");
        enableBtn(findSaveAndNextBtn());
        console.log("[IVAC Panel] Application filled");
        return true;
    }

    function fillFamily() {
        const D = getDataForAutofill();
        if (!D) return false;
        setReact(document.querySelector("#full-name"), D.applicant_name || "");
        setReact(document.querySelector("#email"), D.email || "");
        setReact(document.querySelector("#user_phone"), D.mobile || "");
        setReact(document.querySelector("#webfile_id"), D.applicant_webfile || D.webfile_id || "");
        if (D.familyData && D.familyData.length > 0) {
            D.familyData.forEach((m, i) => {
                if (i >= 4) return;
                setTimeout(() => {
                    setReact(document.querySelector(`#full-name-${i}`), m.name || "");
                    setReact(document.querySelector(`#web-file-number-${i}`), m.webfile_no || "");
                    setReact(document.querySelector(`#web-file-number-repeat-${i}`), m.webfile_no || "");
                }, 20 * (i + 1));
            });
        }
        enableBtn(findSaveAndNextBtn());
        console.log("[IVAC Panel] Family info filled");
        return true;
    }

    async function enhancedAutoFill() {
        const D = getDataForAutofill();
        if (!D || Object.keys(D).length === 0 || !D.webfile_id) {
            console.log("[IVAC Panel] No data found. Please add data in the panel's 'File' tab and save it first.");
            updateStatus("No data for Autofill. Go to File tab & Save.", "error");
            return false;
        }
        console.log("[IVAC Panel] Starting auto-fill");
        let filled = false;
        const fillPromises = [];
        if (missionSel() || ivacSel()) {
            console.log("[IVAC Panel] Filling application form...");
            fillPromises.push(fillApplication());
        }
        if (document.querySelector("#email") && document.querySelector("#user_phone")) {
            console.log("[IVAC Panel] Filling family form...");
            fillPromises.push(Promise.resolve(fillFamily()));
        }
        if (D.loginMobile) {
            console.log("[IVAC Panel] Filling Login Mobile...");
            const selectors = ['input[name*="mobile" i]', '#mobile_no', 'input[placeholder*="Mobile" i]'];
            fillPromises.push(fillWithRetry(selectors, D.loginMobile, 'Login Mobile'));
        }
        if (D.loginPassword) {
            console.log("[IVAC Panel] Filling Login Password...");
            const selectors = ['#password', 'input[name="password"]', '#login-password'];
            fillPromises.push(fillWithRetry(selectors, D.loginPassword, 'Login Password'));
        }
        const results = await Promise.all(fillPromises);
        filled = results.some(r => r);
        if (filled) {
            console.log("[IVAC Panel] Auto-fill process completed.");
        } else {
            console.log("[IVAC Panel] No matching forms found on this page for auto-fill.");
        }
        return filled;
    }

    function addAutofillButton() {
        if ($("#ivac-autofill-container").length) return;
        const container = document.createElement("div");
        container.id = "ivac-autofill-container";
        const autoFillBtn = document.createElement("button");
        autoFillBtn.className = "floating-btn btn-fill pulse-animation";
        autoFillBtn.title = "Auto Fill Form";
        autoFillBtn.innerHTML = `<div class="icon">🎯</div><div class="text">FILL</div>`;
        autoFillBtn.addEventListener('click', async () => {
            if (autoFillBtn.disabled) return;
            autoFillBtn.disabled = true;
            const prev = autoFillBtn.innerHTML;
            autoFillBtn.innerHTML = `<div class="icon">⏳</div><div class="text">FILLING</div>`;
            try {
                await enhancedAutoFill();
            } finally {
                autoFillBtn.innerHTML = prev;
                setTimeout(() => {
                    autoFillBtn.disabled = false;
                }, 250);
            }
        });
        container.appendChild(autoFillBtn);
        document.body.appendChild(container);
        setTimeout(() => {
            container.style.opacity = "1";
            container.style.transform = "translateX(0)";
            autoFillBtn.classList.add("bounce-in");
        }, 500);
    }

    const smartPanel = document.createElement('div');
    smartPanel.id = 'ivac-smart-panel';
    smartPanel.innerHTML = `<div id="ivac-smart-panel-header"><button id="ivac-theme-toggle" title="Toggle Theme">🌙</button><div id="ivac-smart-panel-title">Rupon Modernization</div><button id="ivac-smart-panel-close">&times;</button></div><div id="status-display"><span class="status-text">Ready</span><span id="status-countdown"></span></div><div id="ivac-panel-tabs"><div class="ivac-tab active" data-tab="login"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg> Login</div><div class="ivac-tab" data-tab="home"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146z"/></svg> Home</div><div class="ivac-tab" data-tab="file"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zm0 2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zm0 2a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1h-4z"/></svg> File</div></div>`;
    const loginContent = document.createElement('div');
    loginContent.className = 'ivac-tab-content active';
    loginContent.id = 'ivac-login-content';
    loginContent.innerHTML = `<div class="ivac-login-row"><input id="login-mobile" placeholder="Mobile Number"><button class="ivac-panel-btn" id="login-btn-mobile-verify">Verify</button></div><div class="ivac-login-row"><input id="login-password" type="text" placeholder="Password" style="flex: 1; width: 100%; box-sizing: border-box;"><button class="ivac-panel-btn" id="login-btn-send-otp">Send OTP</button></div><div class="ivac-login-row"><input id="login-otp" placeholder="OTP"><button class="ivac-panel-btn" id="login-btn-final">Login</button></div><div class="ivac-login-actions-row"><button class="ivac-panel-btn" id="login-btn-clear-cache">Clear Cache</button><input id="ivac-token-input" placeholder="Auth Token"><button id="ivac-token-refresh" title="Refresh Token">🔄</button></div><div class="panel-version">Ver : 1.5</div>`;
    const homeContent = document.createElement('div');
    homeContent.className = 'ivac-tab-content';
    homeContent.id = 'ivac-home-content';
    homeContent.innerHTML = `<div id="ivac-smart-panel-buttons"><div class="ivac-btn-row"><button class="ivac-panel-btn" id="ivac-app-submit-btn">App Info</button><button class="ivac-panel-btn" id="ivac-personal-submit-btn">Per Info</button><button class="ivac-panel-btn" id="ivac-overview-btn">Overview</button></div><div class="ivac-btn-row"><button class="ivac-panel-btn" id="ivac-send-otp-btn">Send OTP</button><input id="ivac-otp-input" placeholder="OTP"><button class="ivac-panel-btn" id="ivac-verify-otp-btn">Verify</button></div><div id="ivac-date-section"><input id="ivac-date-input" type="date"><button id="ivac-slot-btn">Slot</button><div id="ivac-slot-container"><div id="ivac-slot-display">Select Time ${chevronIconSVG}</div><div id="ivac-slot-dropdown"></div></div></div><div id="ivac-bottom-actions"><button id="ivac-stop-btn" class="ivac-panel-btn stop-btn">Stop</button><button id="ivac-pay-now-btn" class="ivac-panel-btn">Pay Now</button></div><div id="ivac-available-slot-info"></div><div id="ivac-payment-link-container"></div></div><div class="panel-version">Ver : 1.5</div>`;
    const fileContent = document.createElement('div');
    fileContent.className = 'ivac-tab-content';
    fileContent.id = 'ivac-file-content';
    const locationRow = document.createElement('div');
    locationRow.className = 'ivac-file-row';
    locationRow.appendChild(createFormGroup('file-highcom', 'High Commission', 'select', [{
        value: '1',
        text: 'Dhaka'
    }, {value: '2', text: 'Chittagong'}, {value: '3', text: 'Rajshahi'}, {value: '4', text: 'Sylhet'}, {
        value: '5',
        text: 'Khulna'
    }]));
    locationRow.appendChild(createFormGroup('file-ivac', 'IVAC Center', 'select'));
    const credentialsRow = document.createElement('div');
    credentialsRow.className = 'ivac-file-row';
    credentialsRow.appendChild(createFormGroup('file-phone', 'Mobile No (Login)'));
    const passwordGroup = createFormGroup('file-login-password', 'Login Password', 'text');
    credentialsRow.appendChild(passwordGroup);
    const visaTypeSelect = createFormGroup('file-visatype', 'Visa Type', 'select', [{
        value: '3',
        text: 'TOURIST VISA'
    }, {value: '13', text: 'MEDICAL/MEDICAL ATTENDANT VISA'}, {value: '1', text: 'BUSINESS VISA'}, {
        value: '6',
        text: 'ENTRY VISA'
    }, {value: '2', text: 'STUDENT VISA'}, {value: '19', text: 'DOUBLE ENTRY VISA'}]);
    const familyBulkInputGroup = createFormGroup('file-family-bulk-input', 'Family Members', 'textarea');
    familyBulkInputGroup.querySelector('textarea').rows = 4;
    familyBulkInputGroup.querySelector('textarea').placeholder = 'Name After Down BGD,';
    const visitPurposeGroup = createFormGroup('file-visitpurpose', 'Visit Purpose', 'textarea');
    visitPurposeGroup.querySelector('textarea').rows = 1;
    fileContent.appendChild(locationRow);
    fileContent.appendChild(credentialsRow);
    fileContent.appendChild(createFormGroup('file-webfile', 'Webfile Number'));
    fileContent.appendChild(createFormGroup('file-fullname', 'Full Name'));
    fileContent.appendChild(createFormGroup('file-email', 'Email'));
    fileContent.appendChild(visaTypeSelect);
    fileContent.appendChild(familyBulkInputGroup);
    fileContent.appendChild(visitPurposeGroup);
    fileContent.innerHTML += `<div id="ivac-file-import-export-actions"><button id="ivac-file-import-btn" class="ivac-panel-btn">Import</button><button id="ivac-file-export-btn" class="ivac-panel-btn">Export</button></div><div id="ivac-file-actions"><button id="ivac-file-cancel-btn" class="ivac-panel-btn">Cancel</button><button id="ivac-file-clear-btn" class="ivac-panel-btn">Clear</button><button id="ivac-file-save-btn" class="ivac-panel-btn">Save</button></div>`;
    smartPanel.appendChild(loginContent);
    smartPanel.appendChild(homeContent);
    smartPanel.appendChild(fileContent);
    document.body.appendChild(smartPanel);
    const togglePanelBtn = document.createElement('button');
    togglePanelBtn.id = 'ivac-toggle-panel';
    togglePanelBtn.innerHTML = '⚙️';
    document.body.appendChild(togglePanelBtn);

    function startTokenObserver() {
        const tokenCheckInterval = setInterval(() => {
            if (!authToken) {
                const tokenFromStorage = localStorage.getItem('access_token');
                if (tokenFromStorage) {
                    console.log("[IVAC Panel] Auto-detected auth token from localStorage.");
                    authToken = tokenFromStorage;
                    GM_setValue('authToken', authToken);
                    $('#ivac-token-input').val(authToken);
                    updateStatus('Token auto-detected!', 'success');
                    clearInterval(tokenCheckInterval);
                }
            } else {
                clearInterval(tokenCheckInterval);
            }
        }, 2000);
    }

    function attachEventListeners() {
        $(togglePanelBtn).on('click', () => smartPanel.classList.toggle('visible'));
        $('#ivac-smart-panel-close').on('click', () => smartPanel.classList.remove('visible'));
        $('#ivac-theme-toggle').on('click', () => {
            let theme = GM_getValue('ivacTheme', 'light');
            if (theme === 'light') {
                smartPanel.classList.add('dark-theme');
                GM_setValue('ivacTheme', 'dark');
                $('#ivac-theme-toggle').html('☀️');
            } else {
                smartPanel.classList.remove('dark-theme');
                GM_setValue('ivacTheme', 'light');
                $('#ivac-theme-toggle').html('🌙');
            }
        });
        $('#login-btn-clear-cache').on('click', clearSiteData);
        $('#login-btn-mobile-verify').on('click', handleMobileVerify);
        $('#login-btn-send-otp').on('click', handleLoginSendOtp);
        $('#login-btn-final').on('click', handleLoginVerifyOtp);
        $('#ivac-app-submit-btn').on('click', handleAppInfo);
        $('#ivac-personal-submit-btn').on('click', handlePersonalInfo);
        $('#ivac-overview-btn').on('click', handleOverview);
        $('#ivac-send-otp-btn').on('click', handleOtpRequest);
        $('#ivac-verify-otp-btn').on('click', handleVerifyPaymentOtp);
        $('#ivac-slot-btn').on('click', getSlot);
        $('#ivac-pay-now-btn').on('click', payNow);
        $('#ivac-slot-display').on('click', () => $('#ivac-slot-dropdown').toggleClass('show'));
        $('#ivac-stop-btn').on('click', () => {
            isStopping = true;
            if (currentRequestController) {
                currentRequestController.abort();
            }
            updateStatus('Operation stopped by user.', 'error');
        });
        $('#ivac-token-refresh').on('click', fetchAuthToken);
        $('#ivac-token-input').on('input', (e) => {
            authToken = e.target.value;
            GM_setValue('authToken', authToken);
            localStorage.setItem('access_token', authToken);
            updateStatus('Auth Token auto-saved!', 'success');
        });
        $('#ivac-file-cancel-btn').on('click', () => $('.ivac-tab[data-tab="home"]').trigger('click'));
        $('#ivac-file-clear-btn').on('click', clearSavedData);
        $('#ivac-file-import-btn').on('click', handleImport);
        $('#ivac-file-export-btn').on('click', handleExport);
        $('#ivac-file-save-btn').on('click', () => {
            dynamicHighcom = $('#file-highcom').val();
            dynamicIvacId = $('#file-ivac').val();
            dynamicWebfileId = $('#file-webfile').val();
            dynamicVisaType = $('#file-visatype').val();
            dynamicVisitPurpose = $('#file-visitpurpose').val();
            dynamicFullName = $('#file-fullname').val();
            dynamicEmail = $('#file-email').val();
            dynamicPhone = $('#file-phone').val();
            dynamicLoginMobile = dynamicPhone;
            dynamicLoginPassword = $('#file-login-password').val();
            const bulkText = $('#file-family-bulk-input').val().trim();
            const lines = bulkText.split('\n').map(line => line.trim()).filter(line => line);
            if (lines.length > 0 && lines.length % 2 !== 0) {
                return updateStatus('Family data incomplete. Each member needs a name and webfile on separate lines.', 'error');
            }
            if (lines.length / 2 > 4) {
                return updateStatus('Error: A maximum of 4 family members is allowed.', 'error');
            }
            dynamicFamilyCount = lines.length / 2;
            familyMembers = [];
            for (let i = 0; i < lines.length; i += 2) {
                familyMembers.push({full_name: lines[i], webfile_id: lines[i + 1]});
            }
            saveData();
            $('#login-mobile').val(dynamicLoginMobile);
            $('#login-password').val(dynamicLoginPassword);
            updateStatus('File information saved!', 'success');
            $('.ivac-tab[data-tab="home"]').trigger('click');
        });
        $('#file-highcom').on('change', function () {
            updateIvacCenters(this, document.getElementById('file-ivac'));
        });
        $('#ivac-panel-tabs').on('click', (e) => {
            const tab = e.target.closest('.ivac-tab');
            if (!tab) return;
            $('.ivac-tab').removeClass('active');
            $('.ivac-tab-content').hide();
            $(tab).addClass('active');
            const targetContent = $(`#ivac-${tab.dataset.tab}-content`);
            if (targetContent.length) targetContent.show();
            if (tab.dataset.tab === 'file') {
                $('#file-highcom').trigger('change');
            }
        });
    }

    function populateForm() {
        $('#file-highcom').val(dynamicHighcom);
        $('#file-webfile').val(dynamicWebfileId);
        $('#file-visatype').val(dynamicVisaType);
        $('#file-visitpurpose').val(dynamicVisitPurpose);
        $('#file-fullname').val(dynamicFullName);
        $('#file-email').val(dynamicEmail);
        $('#file-phone').val(dynamicPhone);
        $('#file-login-password').val(dynamicLoginPassword);
        $('#file-family-bulk-input').val(familyMembers.map(m => `${m.full_name}\n${m.webfile_id}`).join('\n'));
        updateIvacCenters(document.getElementById('file-highcom'), document.getElementById('file-ivac'));
        setTimeout(() => {
            $('#file-ivac').val(dynamicIvacId);
        }, 100);
    }

    function init() {
        loadSavedData();
        fetchAuthToken();
        startTokenObserver();
        $('.ivac-tab-content').hide();
        const activeTab = $('.ivac-tab.active');
        if (activeTab.length) {
            const targetContent = $(`#ivac-${activeTab.data('tab')}-content`);
            if (targetContent.length) targetContent.show();
        }
        populateForm();
        $('#login-mobile').val(dynamicLoginMobile);
        $('#login-password').val(dynamicLoginPassword);
        const currentTheme = GM_getValue('ivacTheme', 'light');
        const themeToggleBtn = document.getElementById('ivac-theme-toggle');
        if (currentTheme === 'dark') {
            smartPanel.classList.add('dark-theme');
            themeToggleBtn.innerHTML = '☀️';
        } else {
            themeToggleBtn.innerHTML = '🌙';
        }
        attachEventListeners();
        addAutofillButton();
        updateStatus("Panel ready.", "success");
        $('#ivac-smart-panel').draggable({handle: "#ivac-smart-panel-header"});
        smartPanel.classList.remove('visible');
    }

    init();
}