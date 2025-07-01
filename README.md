# WebAuthn Conditional Create Proof of Concept

This project demonstrates Chrome's auto-enrollment feature for passkeys using WebAuthn Conditional Create. This feature allows websites to automatically create a passkey for users who have recently signed in with a password, without requiring additional user interaction.

## Prerequisites

- Chrome 108+ or equivalent browser that supports WebAuthn Conditional Create
- Python 3.x for running the local HTTPS server
- OpenSSL for generating a self-signed certificate

## How It Works

1. The user signs in with a username and password
2. After successful authentication, the application attempts to create a passkey conditionally
3. If the user has a password saved in their password manager and has recently signed in, Chrome will automatically create a passkey
4. The application displays the result of the passkey creation attempt

## Running the Demo

1. Clone or download this repository
2. Navigate to the project directory
3. Run the Python HTTPS server:

```
python server.py
```

4. Open your browser and navigate to `https://localhost:8443`
5. Accept the security warning for the self-signed certificate
6. Sign in with the demo credentials:
   - Username: `demo`
   - Password: `password123`
7. After successful sign-in, the application will attempt to create a passkey conditionally

## Testing the Feature

To test the auto-enrollment feature:

1. First, ensure you're using Chrome 108+ or equivalent
2. Sign in with the demo credentials
3. When prompted, save the password in your password manager
4. Sign out and sign in again with the saved password
5. After successful sign-in, the application will attempt to create a passkey conditionally
6. If successful, you'll see a confirmation message and details about the created passkey

## Conditions for Auto-Enrollment

For the auto-enrollment to work:

1. The user must have a password saved in their password manager for the site
2. The user must have recently signed in using a password-based login
3. The browser must support WebAuthn Conditional Create

## Notes

- This is a proof of concept and not intended for production use
- In a real application, the server would verify and register the passkey
- The demo uses a self-signed certificate, which is sufficient for local testing but would not be suitable for production

## References

- [Chrome WebAuthn Conditional Create Documentation](https://developer.chrome.com/docs/identity/webauthn-conditional-create)
- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
