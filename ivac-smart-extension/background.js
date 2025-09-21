// Background script for IVAC Smart Panel extension

// Store extension data
let extensionData = {
    isLoggedIn: false,
    userData: null,
    sessionData: null,
    // Add other necessary data fields
};


// Handle login to IVAC
async function handleLogin(loginData) {
    try {
        const response = await fetch('https://payment.ivacbd.com/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
            credentials: 'include'
        });

        if (!response.ok) {
            console.log('Login failed');
        }

        const data = await response.json();

        extensionData.isLoggedIn = true;
        extensionData.userData = data.user;
        extensionData.sessionData = data.session;

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

