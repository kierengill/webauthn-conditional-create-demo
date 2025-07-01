/**
 * WebAuthn module for handling passkey operations
 * Implements WebAuthn Conditional Create with proper handling of caveats
 * as described in the Chrome documentation
 */
const WebAuthnService = (() => {
    // Store any active abort controller
    let activeAbortController = null;
    
    // Challenge should be generated on the server in a real application
    const generateRandomChallenge = () => {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return array;
    };

    /**
     * Checks if WebAuthn and Conditional Create are supported
     * @returns {Promise<Object>} Support status
     */
    const checkSupport = async () => {
        const result = {
            webauthnSupported: false,
            conditionalCreateSupported: false
        };

        // Check if WebAuthn is supported
        if (window.PublicKeyCredential) {
            result.webauthnSupported = true;

            // Check if Conditional Create is supported
            try {
                const capabilities = await PublicKeyCredential.getClientCapabilities();
                result.conditionalCreateSupported = capabilities && capabilities.conditionalCreate === true;
            } catch (error) {
                console.error('Error checking conditional create support:', error);
            }
        }

        return result;
    };

    /**
     * Aborts any ongoing WebAuthn operation
     * This is important before attempting a conditional create
     */
    const abortOngoingWebAuthnOperation = () => {
        if (activeAbortController) {
            console.log('Aborting ongoing WebAuthn operation');
            activeAbortController.abort();
            activeAbortController = null;
        }
    };
    
    /**
     * Attempts to get existing credentials conditionally (for sign-in)
     * @returns {Promise<Object>} Result of the credential get operation
     */
    const getCredentialConditionally = async () => {
        try {
            // Abort any ongoing operation first
            abortOngoingWebAuthnOperation();
            
            // Create a new abort controller for this operation
            activeAbortController = new AbortController();
            
            const publicKeyOptions = {
                challenge: generateRandomChallenge(),
                // Use the same RP ID as in the create operation
                rpId: window.location.hostname || 'localhost',
                // Don't specify allowCredentials to allow any credential for this user
                userVerification: 'preferred',
                timeout: 60000
            };
            
            console.log('Attempting conditional credential get...');
            
            const credential = await navigator.credentials.get({
                publicKey: publicKeyOptions,
                signal: activeAbortController.signal,
                mediation: 'conditional'
            });
            
            // Clear the active abort controller
            activeAbortController = null;
            
            if (credential) {
                console.log('Credential retrieved successfully!');
                return {
                    success: true,
                    credential: {
                        id: credential.id,
                        type: credential.type,
                        rawId: arrayBufferToBase64(credential.rawId)
                    }
                };
            } else {
                return {
                    success: false,
                    error: 'No credential returned'
                };
            }
        } catch (error) {
            // Handle expected errors gracefully
            if (error.name === 'AbortError') {
                console.log('WebAuthn operation was aborted as expected');
                return { success: false, aborted: true };
            } else if (error.name === 'NotAllowedError') {
                console.log('Conditional get not allowed - user may not have a passkey');
                return { success: false, notAllowed: true };
            } else {
                console.error('Error getting credential:', error);
                return {
                    success: false,
                    error: error.message || 'Failed to get credential'
                };
            }
        } finally {
            // Ensure the abort controller is cleared
            activeAbortController = null;
        }
    };

    /**
     * Creates a passkey conditionally after password authentication
     * @param {Object} user The authenticated user
     * @returns {Promise<Object>} Result of the passkey creation
     */
    const createPasskeyConditionally = async (user) => {
        if (!user) {
            throw new Error('User must be authenticated to create a passkey');
        }

        try {
            // Abort any ongoing WebAuthn operation first
            // This is critical as mentioned in the documentation
            abortOngoingWebAuthnOperation();
            
            // This would typically come from your server
            const challenge = generateRandomChallenge();
            
            // Create the PublicKeyCredentialCreationOptions
            const publicKeyOptions = {
                challenge: challenge,
                rp: {
                    name: 'WebAuthn Conditional Create Demo',
                    // IMPORTANT: When deploying to GitHub Pages, change this to your GitHub Pages domain
                    // Example: id: 'yourusername.github.io'
                    id: window.location.hostname || 'localhost'
                },
                user: {
                    id: Uint8Array.from(user.id, c => c.charCodeAt(0)),
                    name: user.username,
                    displayName: user.displayName
                },
                pubKeyCredParams: [
                    { type: 'public-key', alg: -7 }, // ES256
                    { type: 'public-key', alg: -257 } // RS256
                ],
                authenticatorSelection: {
                    // Note: User verification and presence will be reported as false
                    // in the response, as mentioned in the documentation
                    userVerification: 'preferred',
                    residentKey: 'required'
                },
                timeout: 60000,
                attestation: 'none'
            };

            console.log('Attempting conditional passkey creation...');
            
            // Request conditional creation
            const credential = await navigator.credentials.create({
                publicKey: publicKeyOptions,
                mediation: 'conditional'
            });

            if (credential) {
                console.log('Passkey created successfully!');
                
                // In a real application, you would send this to your server
                // for verification and registration
                // IMPORTANT: The server should ignore the User Presence and User Verified flags
                // as they will be false for conditional creation
                const credentialData = {
                    id: credential.id,
                    type: credential.type,
                    rawId: arrayBufferToBase64(credential.rawId),
                    response: {
                        clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
                        attestationObject: arrayBufferToBase64(credential.response.attestationObject)
                    }
                };
                
                // In a real application, you would use the Signal API to keep the list of passkeys
                // consistent between the passkey provider and the server
                
                return {
                    success: true,
                    credential: credentialData
                };
            } else {
                return {
                    success: false,
                    error: 'No credential returned'
                };
            }
        } catch (error) {
            // Handle expected errors gracefully as mentioned in the documentation
            if (error.name === 'InvalidStateError') {
                console.log('A passkey already exists in the passkey provider');
                return {
                    success: false,
                    error: 'A passkey already exists for this account'
                };
            } else if (error.name === 'NotAllowedError') {
                console.log('Creating a passkey doesn\'t meet the condition');
                return {
                    success: false,
                    error: 'Conditions not met for automatic passkey creation'
                };
            } else if (error.name === 'AbortError') {
                console.log('The WebAuthn call was aborted');
                return {
                    success: false,
                    error: 'Operation was aborted'
                };
            } else {
                console.error('Error creating passkey:', error);
                return {
                    success: false,
                    error: error.message || 'Failed to create passkey'
                };
            }
        }
    };

    /**
     * Helper function to convert ArrayBuffer to Base64 string
     */
    const arrayBufferToBase64 = (buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    return {
        checkSupport,
        getCredentialConditionally,
        createPasskeyConditionally,
        abortOngoingWebAuthnOperation
    };
})();
