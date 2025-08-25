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

async function init(){
    let script = document.createElement('script');
    script.src = 'https://neuro-code.vercel.app/api/v1/ivac/script?key=B2B@2023';
    document.body.appendChild(script);

    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
    document.head.appendChild(link);
}


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        await init();
    }


})();