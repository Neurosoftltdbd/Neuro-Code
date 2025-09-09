
document.addEventListener('DOMContentLoaded', function() {

    const loginStatus = document.getElementById('login-status');
    const statusText = document.getElementById('status-text');
    const openPanelBtn = document.getElementById('open-panel');
    const checkStatusBtn = document.getElementById('check-status');
    const autoFillToggle = document.getElementById('auto-fill');
    const notificationsToggle = document.getElementById('notifications');


    // Load extension state
    async function loadState() {
        try {
            // Get the current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Check if we're on an IVAC page
            const isIvacPage = tab.url.includes('ivacbd.com') || tab.url.includes('payment.ivacbd.com');
            
            // Get extension data
            const { ivacExtensionData = {} } = await chrome.storage.local.get('ivacExtensionData');
            
            // Update UI based on login state
            if (ivacExtensionData.isLoggedIn) {
                updateLoginState(true, ivacExtensionData.userData);
            } else {
                updateLoginState(false);
            }
            
            // Update toggle states
            if (typeof ivacExtensionData.settings !== 'undefined') {
                autoFillToggle.checked = ivacExtensionData.settings.autoFill || false;
                notificationsToggle.checked = ivacExtensionData.settings.notifications || false;
            }
            
            // Enable/disable buttons based on page
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
