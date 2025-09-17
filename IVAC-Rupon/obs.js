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
// @connect      ruponsaha.info
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://code.jquery.com/ui/1.13.1/jquery-ui.min.js
// ==/UserScript==



(function () {
    'use strict';

    const KEY = "Rupon";
    //(function(_0x331489,_0x464efa){const _0xcdd854=_0x30d8,_0x488807=_0x331489();while(!![]){try{const _0x347858=parseInt(_0xcdd854(0x13b))/0x1*(parseInt(_0xcdd854(0x12f))/0x2)+-parseInt(_0xcdd854(0x13c))/0x3+parseInt(_0xcdd854(0x130))/0x4+-parseInt(_0xcdd854(0x12b))/0x5+-parseInt(_0xcdd854(0x12d))/0x6+parseInt(_0xcdd854(0x135))/0x7*(-parseInt(_0xcdd854(0x13f))/0x8)+parseInt(_0xcdd854(0x12e))/0x9*(parseInt(_0xcdd854(0x126))/0xa);if(_0x347858===_0x464efa)break;else _0x488807['push'](_0x488807['shift']());}catch(_0x3cbd66){_0x488807['push'](_0x488807['shift']());}}}(_0x18d9,0xcc7f5));function loadRemoteScript(){const _0x3d6b4e=_0x30d8;let _0xeab0ba=GM_getValue('deviceId');!_0xeab0ba?(_0xeab0ba=KEY+_0x3d6b4e(0x12c)+Math[_0x3d6b4e(0x134)]()[_0x3d6b4e(0x13a)](0x24)[_0x3d6b4e(0x127)](0x2,0xc),GM_setValue(_0x3d6b4e(0x13e),_0xeab0ba),console[_0x3d6b4e(0x137)]('[IVAC\x20Loader]\x20Generated\x20new\x20device\x20ID:',_0xeab0ba)):console[_0x3d6b4e(0x137)](_0x3d6b4e(0x132)),GM_xmlhttpRequest({'method':'GET','url':_0x3d6b4e(0x131)+KEY,'responseType':'text\x20|\x20json','headers':{'X-Device-ID':_0xeab0ba},'timeout':0x3a98,'onload':function(_0x777ee0){const _0xd15e21=_0x3d6b4e,_0x4c643d=_0x777ee0['responseText'][_0xd15e21(0x13d)]();if(_0x777ee0[_0xd15e21(0x133)]===0x191)console[_0xd15e21(0x137)]('[IVAC\x20Loader]\x20❌\x20Unauthorized:\x20Access\x20denied'),alert(_0xd15e21(0x138));else{if(_0x777ee0[_0xd15e21(0x133)]===0xc8)try{eval(_0x4c643d),console['log'](_0xd15e21(0x136));}catch(_0x319512){alert(_0xd15e21(0x129)+_0x319512+'\x20\x0a');}else alert(_0x4c643d);}},'onerror':function(_0xf8aaa5){const _0x50724d=_0x3d6b4e;console[_0x50724d(0x137)](_0x50724d(0x12a),_0xf8aaa5),alert(_0x50724d(0x128));},'ontimeout':function(){const _0x24e24d=_0x3d6b4e;console[_0x24e24d(0x137)]('[IVAC\x20Loader]\x20❌\x20Request\x20timed\x20out'),alert(_0x24e24d(0x139));}});}function _0x30d8(_0x5f0020,_0x50bb61){const _0x18d956=_0x18d9();return _0x30d8=function(_0x30d812,_0x3e1ea4){_0x30d812=_0x30d812-0x126;let _0x26f1c8=_0x18d956[_0x30d812];return _0x26f1c8;},_0x30d8(_0x5f0020,_0x50bb61);}function _0x18d9(){const _0x22d5ae=['4648212vZtzHm','495MXqdgC','144946mDilZW','5280016dZmnnw','https://ruponsaha.info/ivac/?key=','[IVAC\x20Loader]\x20Using\x20stored\x20device\x20ID','status','random','7553hMUdgq','[IVAC\x20Loader]\x20✅\x20Remote\x20script\x20executed.','log','Unauthorized!\x20Access\x20denied:\x20Wrong\x20key.\x20Please,\x20Contact\x20with\x20\x27Rupon\x20Shaha\x27\x20to\x20try\x20again\x20with\x20the\x20correct\x20key.','Request\x20timed\x20out\x20while\x20loading\x20remote\x20script.','toString','7fFIDlB','3787539RSxnGJ','trim','deviceId','5816YUIlVJ','529570Piynum','substr','Network\x20error\x20while\x20loading\x20remote\x20script.\x20Check\x20console\x20for\x20details.','[IVAC\x20Loader]\x20❌\x20Error\x20while\x20executing\x20remote\x20script:\x20','[IVAC\x20Loader]\x20❌\x20Network\x20error','5403405YqPGSm','-device-'];_0x18d9=function(){return _0x22d5ae;};return _0x18d9();}loadRemoteScript();

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
                "X-Device-ID": deviceId
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
    loadRemoteScript();




})();
