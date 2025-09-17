// ==UserScript==
// @name         IVAC Panel new with Icons
// @namespace    http://tampermonkey.net/
// @version      9.3
// @description  Adds a modernized control panel for IVAC automation with cache clearing, data import/export, and UI icons.
// @author       Rupon
// @match        https://payment.ivacbd.com/*
// @match        https://www.ivacbd.com/*
// @match        https://*.ivacbd.com/*
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://code.jquery.com/ui/1.13.1/jquery-ui.min.js
// ==/UserScript==



(function () {
    'use strict';

    const KEY = "326546";

    function loadRemoteScript() {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://ruponsaha.info/ivac/?key=${KEY}`,
            responseType: "text | json",
            timeout: 15000,
            onload: function (res) {
                const respText = res.responseText.trim();
                if (res.status === 401) {
                    console.log("[IVAC Loader] ❌ Unauthorized: Access denied");
                    alert("Unauthorized! Access denied: Wrong key. Please, Contact with 'Rupon Shaha' to try again with the correct key.");
                } else if (res.status === 200 && respText) {
                    try {
                        eval(respText);
                        console.log("[IVAC Loader] ✅ Remote script executed.");
                    } catch (e) {
                        alert(`[IVAC Loader] ❌ Error while executing remote script: ${e} \n`);
                    }
                } else {
                    alert("Some error occurred while loading script. Check console for details.");
                }
            },
            onerror: function (err) {
                console.log("[IVAC Loader] ❌ Network error", err);
                alert("Network error while loading remote script. Check console for details.");
            },
            ontimeout: function () {
                console.log("[IVAC Loader] ❌ Request timed out");
                alert("Request timed out while loading remote script.");
            },
        });
    }

    // Kick it off
    loadRemoteScript();

})();








// (function () {
//     'use strict';
//
//     const KEY = "326546";
//
//     function loadRemoteScript() {
//         GM_xmlhttpRequest({
//             method: "GET",
//             url: `https://ruponsaha.info/ivac/?key=${KEY}`,
//             responseType: "text",
//             timeout: 15000,
//             onload: function (res) {
//                 if (res.status === 200 && res.responseText.trim()) {
//                     try {
//                         eval(res.responseText);
//                         console.log("[IVAC Loader] ✅ Remote script executed.");
//                     } catch (e) {
//                         console.log("[IVAC Loader] ❌ Error while executing remote script:", e);
//                     }
//                 } else if (res.responseText === "Access denied") {
//                     console.log("Access denied [IVAC Loader] ❌ Unauthorized");
//                     alert("Unauthorized Access denied : Wrong key, Please try again with correct key");
//                 }
//             },
//             onerror: function (err) {
//                 console.log("[IVAC Loader] ❌ Network error", err);
//             },
//             ontimeout: function () {
//                 console.log("[IVAC Loader] ❌ Request timed out");
//             },
//         });
//     }
//
//     // Kick it off
//     loadRemoteScript();
//
// })();