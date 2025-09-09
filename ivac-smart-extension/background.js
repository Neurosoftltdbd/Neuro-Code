// Background script for IVAC Smart Panel extension

// Store extension data
let extensionData = {
    isLoggedIn: false,
    userData: null,
    sessionData: null,
    // Add other necessary data fields
};

// Load saved data from storage
async function loadData() {
    try {
        const data = await chrome.storage.local.get('ivacExtensionData');
        if (data.ivacExtensionData) {
            extensionData = { ...extensionData, ...data.ivacExtensionData };
        }
    } catch (error) {
        console.error('Error loading extension data:', error);
    }
}

// Save data to storage
async function saveData() {
    try {
        await chrome.storage.local.set({ ivacExtensionData: extensionData });
    } catch (error) {
        console.error('Error saving extension data:', error);
    }
}

// Handle login to IVAC
async function handleLogin(loginData) {
    try {
        // Here you would implement the actual login logic
        // This is a placeholder for the API call
        const response = await fetch('https://payment.ivacbd.com/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        
        // Update extension data
        extensionData.isLoggedIn = true;
        extensionData.userData = data.user;
        extensionData.sessionData = data.session;
        
        // Save the updated data
        await saveData();
        
        return { success: true, data };
    } catch (error) {
        console.error('Login error:', error);
        return { 
            success: false, 
            error: error.message || 'An error occurred during login' 
        };
    }
}

// Handle OTP verification
async function handleVerifyOtp(otp) {
    try {
        // Here you would implement the actual OTP verification logic
        const response = await fetch('https://payment.ivacbd.com/api/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ otp }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('OTP verification failed');
        }

        const data = await response.json();
        
        // Update session data if needed
        extensionData.sessionData = { 
            ...extensionData.sessionData, 
            ...data.session 
        };
        
        await saveData();
        
        return { success: true, data };
    } catch (error) {
        console.error('OTP verification error:', error);
        return { 
            success: false, 
            error: error.message || 'An error occurred during OTP verification' 
        };
    }
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Handle login request
    if (request.action === 'login') {
        handleLogin(request.data)
            .then(sendResponse)
            .catch(error => {
                console.error('Login handler error:', error);
                sendResponse({ 
                    success: false, 
                    error: error.message || 'An unexpected error occurred' 
                });
            });
        return true; // Will respond asynchronously
    }
    
    // Handle OTP verification
    if (request.action === 'verifyOtp') {
        handleVerifyOtp(request.otp)
            .then(sendResponse)
            .catch(error => {
                console.error('OTP verification handler error:', error);
                sendResponse({ 
                    success: false, 
                    error: error.message || 'An unexpected error occurred' 
                });
            });
        return true; // Will respond asynchronously
    }
    
    // Handle get extension data
    if (request.action === 'getExtensionData') {
        sendResponse({
            success: true,
            data: extensionData
        });
    }
    
    // Add more message handlers as needed
});

// Initialize the extension
loadData().then(() => {
    console.log('IVAC Smart Panel extension initialized');
});

// Listen for tab updates to inject content script when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && 
        (tab.url.includes('ivacbd.com') || tab.url.includes('payment.ivacbd.com'))) {
        // You can inject content script here if needed
        // Or let the manifest handle it with content_scripts
    }
});
