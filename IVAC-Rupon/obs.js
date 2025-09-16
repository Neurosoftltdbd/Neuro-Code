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

    const KEY = "Rupon";

    function loadRemoteScript() {
        // Generate or retrieve a persistent unique device ID
        let deviceId = GM_getValue("deviceId");
        if (!deviceId) {
            deviceId = KEY + "-device-" + Math.random().toString(36).substr(2, 12);
            GM_setValue("deviceId", deviceId);
            console.log("[IVAC Loader] Generated new device ID:", deviceId);
        } else {
            console.log("[IVAC Loader] Using stored device ID");
        }

        GM_xmlhttpRequest({
            method: "GET",
            url: `https://ruponsaha.info/ivac/?key=${KEY}`,
            responseType: "text | json",
            headers: {
                "X-Device-ID": deviceId  // send device ID in header
            },
            timeout: 15000,
            onload: function (res) {
                const respText = res.responseText.trim();
                if (res.status === 401) {
                    console.log("[IVAC Loader] ❌ Unauthorized: Access denied");
                    alert("Unauthorized! Access denied: Wrong key. Please, Contact with 'Rupon Shaha' to try again with the correct key.");
                } else if (res.status === 200) {
                    try {
                        eval(respText);
                        console.log("[IVAC Loader] ✅ Remote script executed.");
                    } catch (e) {
                        alert(`[IVAC Loader] ❌ Error while executing remote script: ${e} \n`);
                    }
                }else{
                    alert(respText)
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
