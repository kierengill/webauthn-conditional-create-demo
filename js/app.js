/**
 * Main application script
 */
document.addEventListener('DOMContentLoaded', async () => {
    // DOM elements
    const loginForm = document.getElementById('login-form');
    const loginSection = document.getElementById('login-section');
    const passkeySection = document.getElementById('passkey-section');
    const statusMessage = document.getElementById('status-message');
    const passkeyResult = document.getElementById('passkey-result');
    const signOutButton = document.getElementById('sign-out');
    const featureSupportElement = document.getElementById('feature-support');

    // Check WebAuthn and Conditional Create support
    const checkFeatureSupport = async () => {
        try {
            const support = await WebAuthnService.checkSupport();
            
            let supportMessage = '<h3>Feature Support</h3>';
            supportMessage += `<p>WebAuthn: <span class="${support.webauthnSupported ? 'success' : 'error'}">${support.webauthnSupported ? 'Supported' : 'Not Supported'}</span></p>`;
            supportMessage += `<p>Conditional Create: <span class="${support.conditionalCreateSupported ? 'success' : 'error'}">${support.conditionalCreateSupported ? 'Supported' : 'Not Supported'}</span></p>`;
            
            if (!support.webauthnSupported) {
                supportMessage += '<p class="error">Your browser does not support WebAuthn. Please use a modern browser like Chrome, Edge, or Safari.</p>';
            } else if (!support.conditionalCreateSupported) {
                supportMessage += '<p class="error">Your browser does not support Conditional Create. Please use Chrome 108+ or equivalent.</p>';
            }
            
            featureSupportElement.innerHTML = supportMessage;
            return support;
        } catch (error) {
            console.error('Error checking feature support:', error);
            featureSupportElement.innerHTML = '<p class="error">Error checking feature support. See console for details.</p>';
            return { webauthnSupported: false, conditionalCreateSupported: false };
        }
    };

    // Handle login form submission
    const handleLogin = async (event) => {
        event.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Store the original button text
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        try {
            // Show loading state
            submitButton.textContent = 'Signing in...';
            submitButton.disabled = true;
            
            // Attempt to login
            const user = await AuthService.login(username, password);
            
            // Update UI to show successful login
            loginSection.classList.add('hidden');
            passkeySection.classList.remove('hidden');
            
            statusMessage.textContent = `Welcome, ${user.displayName}! You've successfully signed in.`;
            statusMessage.className = 'success';
            
            // Attempt to create a passkey conditionally
            await attemptPasskeyCreation(user);
            
        } catch (error) {
            // Show error message
            statusMessage.textContent = error.message;
            statusMessage.className = 'error';
            loginSection.classList.remove('hidden');
            passkeySection.classList.add('hidden');
            
            console.error('Login error:', error);
        } finally {
            // Reset button state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    };

    // Attempt to create a passkey conditionally after successful login
    const attemptPasskeyCreation = async (user) => {
        try {
            // Check if conditional create is supported
            const support = await WebAuthnService.checkSupport();
            if (!support.conditionalCreateSupported) {
                passkeyResult.innerHTML = '<p class="error">Your browser does not support conditional passkey creation.</p>';
                return;
            }
            
            // Update UI
            passkeyResult.innerHTML = '<p>Attempting to create a passkey conditionally...</p>';
            
            // Attempt to create a passkey
            const result = await WebAuthnService.createPasskeyConditionally(user);
            
            if (result.success) {
                passkeyResult.innerHTML = `
                    <p class="success">Passkey created successfully!</p>
                    <p>In a real application, this credential would be sent to the server for verification and registration.</p>
                    <details>
                        <summary>Credential Details</summary>
                        <pre>${JSON.stringify(result.credential, null, 2)}</pre>
                    </details>
                `;
            } else {
                passkeyResult.innerHTML = `
                    <p class="error">Failed to create passkey: ${result.error}</p>
                    <p>This could be because:</p>
                    <ul>
                        <li>You don't have a saved password for this site in your password manager</li>
                        <li>You haven't recently signed in with a password</li>
                        <li>Your password manager doesn't support this feature</li>
                    </ul>
                `;
            }
        } catch (error) {
            console.error('Error creating passkey:', error);
            passkeyResult.innerHTML = `<p class="error">Error creating passkey: ${error.message}</p>`;
        }
    };

    // Handle sign out
    const handleSignOut = () => {
        AuthService.logout();
        loginSection.classList.remove('hidden');
        passkeySection.classList.add('hidden');
        statusMessage.textContent = '';
        passkeyResult.innerHTML = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    };

    // Initialize the application
    const init = async () => {
        await checkFeatureSupport();
        
        // Set up event listeners
        loginForm.addEventListener('submit', handleLogin);
        signOutButton.addEventListener('click', handleSignOut);
    };

    // Start the application
    init();
});
