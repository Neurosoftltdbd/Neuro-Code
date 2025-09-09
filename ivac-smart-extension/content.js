// Content script that will be injected into IVAC pages

// Initialize the panel when the page is fully loaded
function initPanel() {
    // Create the panel container
    const panel = document.createElement('div');
    panel.style = "width: 350px; height: 550px;"
    panel.id = 'smart-panel';
    
    // Add the panel HTML
    panel.innerHTML = `
        <div id="smart-panel-header" class="flex gap-1 py-1 rounded items-center justify-between bg-[#135d32] text-sm cursor-move min-w-[350px] min-h-[550px]">
            <h3 id="smart-panel-title" class="text-white mx-4">IVAC Smart Panel</h3>
            <button id="close-button"><span class="-me-2 py-1 px-2 bg-gray-200 hover:bg-gray-300 rounded text-red-600">×</span></button>
        </div>
        <div class="flex flex-col gap-2">
            <div id="message" class="text-red-600 text-sm py-2"></div>
            
            <!-- Tab Navigation -->
            <div class="flex gap-1 flex-wrap rounded bg-[#135d32] text-white text-sm">
                <button class="tab-button active" data-tab="tab-0">Login</button>
                <button class="tab-button" data-tab="tab-1">Application</button>
                <button class="tab-button" data-tab="tab-2">OTP</button>
            </div>
            
            <!-- Tab Content -->
            <div class="tab-content-body">
                <!-- Login Tab -->
                <div id="tab-0" class="tab-content active">
                    <div id="login" class="flex flex-col gap-2 w-full">
                        <div class="cf-turnstile" data-sitekey="0x4AAAAAABpNUpzYeppBoYpe"></div>
                        <button id="login-button" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                            Login with IVAC
                        </button>
                    </div>
                </div>
                
                <!-- Application Tab -->
                <div id="tab-1" class="tab-content">
                    <!-- Application form will be loaded here -->
                </div>
                
                <!-- OTP Tab -->
                <div id="tab-2" class="tab-content">
                    <div class="mb-3">
                        <div>OTP Verification</div>
                        <input type="text" id="otp-input" placeholder="Enter 6-digit OTP" maxlength="6" />
                        <button id="verify-otp" class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mt-2">
                            Verify OTP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add the panel to the page
    document.body.appendChild(panel);
    
    // Add event listeners
    setupEventListeners();
    
    // Inject the Cloudflare Turnstile script if needed
    if (!document.querySelector('script[src*="challenges.cloudflare.com"]')) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }
    const style = document.createElement('style');
    style.textContent = `
    #smart-panel {
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 10px;
            box-shadow: 0px 0px 15px 5px rgb(0 0 0);
            padding: 8px;
            z-index: 9999;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.5s ease-in-out;
            width: 350px;
            height: 550px;
            pointer-events: none;
        }
        #smart-panel.visible {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }
        
        #smart-panel-title {
            animation: zoomInOut 4s infinite;
        }
        
        @keyframes zoomInOut {
            0% { transform: scale(0.95); }
            50% { transform: scale(1.15); font-weight: bold; }
            100% { transform: scale(0.95); }
        }
        #toggle-panel{
        position: fixed;
            bottom: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: linear-gradient(90deg, rgb(255 255 255) 0%, rgb(190 255 253) 50%, rgb(255 248 188) 100%);
            color: white;
            border: none;
            font-size: 18px;
            cursor: pointer;
            box-shadow: 0px 0px 25px 15px rgb(0 0 0);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            }
        #toggle-panel:hover {
            transform: scale(1.1);
            box-shadow: 0px 0px 27px 15px rgb(0 0 0);
        }
        
        #smart-panel button {
            cursor: pointer;
            color: white;
            background-color: #135d32;
            border-radius:0.25rem;
            width:fit-content;
            padding: 0.5rem 0.8rem;
        }
        #smart-panel input, #smart-panel select{
        background-color: white;
        border-radius:0.25rem;
        width:100%;
        border: 1px solid grey;
        padding: 6px 8px;
        margin: 4px 0px;
        }

        .d-none{
            display: none;;
        }
`;
    document.head.appendChild(style);
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
    document.head.appendChild(link);
    let tailwind = document.createElement('script');
    tailwind.src = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4';
    document.head.appendChild(tailwind);
}

// Set up event listeners for the panel
function setupEventListeners() {
    const panel = document.getElementById('smart-panel');
    const closeButton = panel.querySelector('#close-button');
    const tabButtons = panel.querySelectorAll('.tab-button');
    
    // Toggle panel visibility
    closeButton.addEventListener('click', () => {
        panel.classList.remove('visible');
    });
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Login button
    const loginButton = panel.querySelector('#login-button');
    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }
    
    // OTP verification
    const verifyOtpButton = panel.querySelector('#verify-otp');
    if (verifyOtpButton) {
        verifyOtpButton.addEventListener('click', handleOtpVerification);
    }
}

// Handle tab switching
function switchTab(tabId) {
    // Hide all tab contents and deactivate all buttons
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected tab and activate its button
    const tab = document.getElementById(tabId);
    const button = document.querySelector(`[data-tab="${tabId}"]`);
    
    if (tab) tab.classList.add('active');
    if (button) button.classList.add('active');
}

// Handle login
async function handleLogin() {
    // This will be implemented to handle the login logic
    showMessage('Logging in...', 'info');
    
    try {
        // Send message to background script to handle login
        const response = await chrome.runtime.sendMessage({
            action: 'login',
            // Add any required login data here
        });
        
        if (response.success) {
            showMessage('Login successful!', 'success');
            switchTab('tab-1'); // Switch to application tab
        } else {
            showMessage(response.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('An error occurred during login', 'error');
    }
}

// Handle OTP verification
async function handleOtpVerification() {
    const otpInput = document.getElementById('otp-input');
    const otp = otpInput.value.trim();
    
    if (!otp || otp.length !== 6) {
        showMessage('Please enter a valid 6-digit OTP', 'error');
        return;
    }
    
    showMessage('Verifying OTP...', 'info');
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'verifyOtp',
            otp: otp
        });
        
        if (response.success) {
            showMessage('OTP verified successfully!', 'success');
            // Handle successful verification (e.g., redirect or enable features)
        } else {
            showMessage(response.error || 'Invalid OTP', 'error');
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        showMessage('An error occurred during OTP verification', 'error');
    }
}

// Show a message in the panel
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = `text-${type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue'}-600 text-sm py-2`;
    
    // Auto-hide after 5 seconds
    if (type !== 'error') {
        setTimeout(() => {
            if (messageElement.textContent === message) {
                messageElement.textContent = '';
            }
        }, 5000);
    }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updatePanel') {
        // Update the panel with new data
        if (request.data) {
            // Update UI elements based on the data
            console.log('Updating panel with data:', request.data);
        }
    }
    
    // Return true to indicate we want to send a response asynchronously
    return true;
});

// Initialize the panel when the page is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPanel);
} else {
    initPanel();
}
