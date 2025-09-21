
document.addEventListener('DOMContentLoaded', function() {

    const loginStatus = document.getElementById('login-status');
    const statusText = document.getElementById('status-text');
    const openPanelBtn = document.getElementById('open-panel');
    const checkStatusBtn = document.getElementById('check-status');

    async function loadState() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            const isIvacPage = tab.url.includes('ivacbd.com') || tab.url.includes('payment.ivacbd.com');
            openPanelBtn.onclick(()=>{alert("open panel button clicked");});

            openPanelBtn.disabled = !isIvacPage;
            checkStatusBtn.disabled = !isIvacPage;
            
        } catch (error) {
            console.error('Error loading extension state:', error);
            statusText.textContent = 'Error loading data';
            loginStatus.classList.add('error');
        }
    }

    loadState();
});
