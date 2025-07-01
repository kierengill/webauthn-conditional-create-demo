# WebAuthn Conditional Create Proof of Concept

This project demonstrates Chrome's auto-enrollment feature for passkeys using WebAuthn Conditional Create. This feature allows websites to automatically create a passkey for users who have recently signed in with a password, without requiring additional user interaction.

## Key Features

- **Automatic Passkey Creation**: After password authentication, the application attempts to create a passkey conditionally
- **Proper Handling of WebAuthn Caveats**: Implements all best practices from the Chrome documentation
- **Graceful Error Handling**: Properly handles and displays user-friendly messages for various error scenarios
- **Passkey Sign-In**: Attempts to sign in with an existing passkey before showing the password form
- **Feature Detection**: Checks if the browser supports WebAuthn and Conditional Create

## Prerequisites

- Chrome 108+ or equivalent browser that supports WebAuthn Conditional Create
- Python 3.x for running the local HTTPS server
- OpenSSL for generating a self-signed certificate

## How It Works

1. The application first attempts to sign in with an existing passkey using conditional get
2. If no passkey is available, the user signs in with a username and password
3. After successful password authentication, the application attempts to create a passkey conditionally
4. If the user has a password saved in their password manager and has recently signed in, Chrome will automatically create a passkey
5. The application displays the result of the passkey creation attempt

## Implementation Details

This implementation properly handles all the caveats mentioned in the [Chrome WebAuthn Conditional Create documentation](https://developer.chrome.com/docs/identity/webauthn-conditional-create):

1. **Ignoring User Presence and User Verification flags**: The server-side code (simulated in our frontend) is designed to ignore these flags, which will be false for conditional creation.

2. **Aborting ongoing WebAuthn calls**: We use the AbortController to properly abort any ongoing WebAuthn operations before attempting a conditional create.

3. **Graceful exception handling**: We handle specific exceptions like InvalidStateError, NotAllowedError, and AbortError gracefully without showing confusing error messages to the user.

4. **Conditional Get before Create**: The application first attempts to sign in with an existing passkey using conditional get before showing the password form.

5. **Password-based authentication requirement**: As noted in the documentation, conditional create only works after password-based authentication, not with passwordless methods like magic links.

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
- Google Password Manager and many other password managers have restrictions with localhost domains, so for proper testing, deploy to a real domain (see deploy-instructions.md)
- In a production environment, you would use the Signal API to keep the list of passkeys consistent between the passkey provider and the server

## References

- [Chrome WebAuthn Conditional Create Documentation](https://developer.chrome.com/docs/identity/webauthn-conditional-create)
- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
