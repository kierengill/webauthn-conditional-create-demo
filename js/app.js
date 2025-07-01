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
            
            // Update UI with more informative message about when conditional create is likely to succeed
            passkeyResult.innerHTML = `
                <p>Attempting to create a passkey conditionally...</p>
                <p><em>Note: According to Chrome's documentation, conditional passkey creation is more likely to succeed when:</em></p>
                <ul>
                    <li>You have a password saved in your password manager for this site</li>
                    <li>You sign in using autofill from your password manager</li>
                </ul>
            `;
            
            // First, abort any ongoing WebAuthn operations
            // This is critical as mentioned in the documentation
            WebAuthnService.abortOngoingWebAuthnOperation();
            
            // Attempt to create a passkey
            const result = await WebAuthnService.createPasskeyConditionally(user);
            
            if (result.success) {
                passkeyResult.innerHTML = `
                    <p class="success">Passkey created successfully!</p>
                    <p>In a real application, this credential would be sent to the server for verification and registration.</p>
                    <p>Note: The server should ignore the User Presence and User Verified flags as they will be false for conditional creation.</p>
                    <details>
                        <summary>Credential Details</summary>
                        <pre>${JSON.stringify(result.credential, null, 2)}</pre>
                    </details>
                `;
            } else {
                // Handle specific error cases gracefully
                let errorMessage = result.error;
                let additionalInfo = `
                    <p>This could be because:</p>
                    <ul>
                        <li>You don't have a saved password for this site in your password manager</li>
                        <li>You haven't recently signed in with a password</li>
                        <li>Your password manager doesn't support this feature</li>
                    </ul>
                `;
                
                // For specific error cases, provide more targeted information
                if (result.error === 'A passkey already exists for this account') {
                    additionalInfo = `
                        <p>A passkey already exists for this account in your password manager.</p>
                        <p>In a real application, the server would maintain a list of registered passkeys and use the excludeCredentials parameter to prevent this error.</p>
                    `;
                }
                
                passkeyResult.innerHTML = `
                    <p class="error">Failed to create passkey: ${errorMessage}</p>
                    ${additionalInfo}
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

    // Try to sign in with a passkey first
    const tryPasskeySignIn = async () => {
        try {
            const support = await WebAuthnService.checkSupport();
            if (!support.webauthnSupported || !support.conditionalCreateSupported) {
                console.log('WebAuthn or Conditional Create not supported, skipping passkey sign-in attempt');
                return false;
            }
            
            console.log('Attempting to sign in with passkey...');
            
            // Attempt to get credentials conditionally
            const result = await WebAuthnService.getCredentialConditionally();
            
            if (result.success) {
                console.log('Passkey sign-in successful!');
                
                // In a real application, you would verify this credential with the server
                // and get the user information
                
                // For demo purposes, we'll just simulate a successful sign-in
                const user = {
                    username: 'demo',
                    id: '1234567890',
                    displayName: 'Demo User (via Passkey)'
                };
                
                // Update UI to show successful login
                loginSection.classList.add('hidden');
                passkeySection.classList.remove('hidden');
                
                statusMessage.textContent = `Welcome, ${user.displayName}! You've successfully signed in with a passkey.`;
                statusMessage.className = 'success';
                
                passkeyResult.innerHTML = `
                    <p class="success">Signed in with passkey successfully!</p>
                    <details>
                        <summary>Credential Details</summary>
                        <pre>${JSON.stringify(result.credential, null, 2)}</pre>
                    </details>
                `;
                
                return true;
            } else {
                console.log('Passkey sign-in not successful, falling back to password form');
                return false;
            }
        } catch (error) {
            console.error('Error trying passkey sign-in:', error);
            return false;
        }
    };

    // Initialize the application
    const init = async () => {
        await checkFeatureSupport();
        
        // Always set up the login form event listener
        loginForm.addEventListener('submit', handleLogin);
        signOutButton.addEventListener('click', handleSignOut);
        
        // Try to sign in with a passkey first
        // This demonstrates the conditional get functionality
        await tryPasskeySignIn();
        
        // The login form is visible by default, so no need to show it explicitly
        // if passkey sign-in fails
    };

    // Start the application
    init();
});
