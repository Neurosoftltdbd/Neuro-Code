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
        // Generate or retrieve a persistent unique device ID
        let deviceId = GM_getValue("deviceId");
        if (!deviceId) {
            deviceId = KEY + "-device-" + Math.random().toString(36).substr(2, 12);
            GM_setValue("deviceId", deviceId);
            console.log("[IVAC Loader] Generated new device ID:", deviceId);
        } else {
            console.log("[IVAC Loader] Using stored device ID:", deviceId);
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

    //(function(_0xe086bb,_0x3d0967){const _0x4cb0ae=_0x1d4b,_0x29eb64=_0xe086bb();while(!![]){try{const _0x4fdee8=-parseInt(_0x4cb0ae(0x170))/0x1+-parseInt(_0x4cb0ae(0x171))/0x2+parseInt(_0x4cb0ae(0x15e))/0x3+parseInt(_0x4cb0ae(0x160))/0x4*(-parseInt(_0x4cb0ae(0x169))/0x5)+-parseInt(_0x4cb0ae(0x168))/0x6+-parseInt(_0x4cb0ae(0x16b))/0x7+parseInt(_0x4cb0ae(0x161))/0x8;if(_0x4fdee8===_0x3d0967)break;else _0x29eb64['push'](_0x29eb64['shift']());}catch(_0x2da419){_0x29eb64['push'](_0x29eb64['shift']());}}}(_0x2239,0x826bd));function _0x2239(){const _0x94db19=['[IVAC\x20Loader]\x20❌\x20Network\x20error','deviceId','trim','toString','[IVAC\x20Loader]\x20❌\x20Error\x20while\x20executing\x20remote\x20script:\x20','text\x20|\x20json','2915853snsTtd','responseText','3028JEMwIi','17072928cSbiFL','random','GET','log','Network\x20error\x20while\x20loading\x20remote\x20script.\x20Check\x20console\x20for\x20details.','substr','Unauthorized!\x20Access\x20denied:\x20Wrong\x20key.\x20Please,\x20Contact\x20with\x20\x27Rupon\x20Shaha\x27\x20to\x20try\x20again\x20with\x20the\x20correct\x20key.','4968330lYNiYi','305roTzIm','[IVAC\x20Loader]\x20✅\x20Remote\x20script\x20executed.','4475261MnUXRM','[IVAC\x20Loader]\x20❌\x20Request\x20timed\x20out','[IVAC\x20Loader]\x20Using\x20stored\x20device\x20ID:','[IVAC\x20Loader]\x20❌\x20Unauthorized:\x20Access\x20denied','Some\x20error\x20occurred\x20while\x20loading\x20script.\x20Check\x20console\x20for\x20details.','618986llVSuw','878642KzzxKF','status'];_0x2239=function(){return _0x94db19;};return _0x2239();}function _0x1d4b(_0x9d3a7,_0x40810a){const _0x22391a=_0x2239();return _0x1d4b=function(_0x1d4b07,_0x56979c){_0x1d4b07=_0x1d4b07-0x15e;let _0x16ac12=_0x22391a[_0x1d4b07];return _0x16ac12;},_0x1d4b(_0x9d3a7,_0x40810a);}function loadRemoteScript(){const _0x476273=_0x1d4b;let _0x111274=GM_getValue(_0x476273(0x174));!_0x111274?(_0x111274=KEY+'-device-'+Math[_0x476273(0x162)]()[_0x476273(0x176)](0x24)[_0x476273(0x166)](0x2,0xc),GM_setValue(_0x476273(0x174),_0x111274),console[_0x476273(0x164)]('[IVAC\x20Loader]\x20Generated\x20new\x20device\x20ID:',_0x111274)):console[_0x476273(0x164)](_0x476273(0x16d),_0x111274),GM_xmlhttpRequest({'method':_0x476273(0x163),'url':'https://ruponsaha.info/ivac/?key='+KEY,'responseType':_0x476273(0x178),'headers':{'X-Device-ID':_0x111274},'timeout':0x3a98,'onload':function(_0x48f217){const _0x226b82=_0x476273,_0x32987f=_0x48f217[_0x226b82(0x15f)][_0x226b82(0x175)]();if(_0x48f217[_0x226b82(0x172)]===0x191)console['log'](_0x226b82(0x16e)),alert(_0x226b82(0x167));else{if(_0x48f217[_0x226b82(0x172)]===0xc8&&_0x32987f)try{eval(_0x32987f),console['log'](_0x226b82(0x16a));}catch(_0x4a57e0){alert(_0x226b82(0x177)+_0x4a57e0+'\x20\x0a');}else alert(_0x226b82(0x16f));}},'onerror':function(_0x4edff6){const _0x6a478a=_0x476273;console['log'](_0x6a478a(0x173),_0x4edff6),alert(_0x6a478a(0x165));},'ontimeout':function(){const _0x56198b=_0x476273;console[_0x56198b(0x164)](_0x56198b(0x16c)),alert('Request\x20timed\x20out\x20while\x20loading\x20remote\x20script.');}});}loadRemoteScript();

})();
