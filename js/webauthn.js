/**
 * WebAuthn module for handling passkey operations
 */
const WebAuthnService = (() => {
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
     * Creates a passkey conditionally after password authentication
     * @param {Object} user The authenticated user
     * @returns {Promise<Object>} Result of the passkey creation
     */
    const createPasskeyConditionally = async (user) => {
        if (!user) {
            throw new Error('User must be authenticated to create a passkey');
        }

        try {
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
                const credentialData = {
                    id: credential.id,
                    type: credential.type,
                    rawId: arrayBufferToBase64(credential.rawId),
                    response: {
                        clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
                        attestationObject: arrayBufferToBase64(credential.response.attestationObject)
                    }
                };
                
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
            console.error('Error creating passkey:', error);
            return {
                success: false,
                error: error.message || 'Failed to create passkey'
            };
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
        createPasskeyConditionally
    };
})();
