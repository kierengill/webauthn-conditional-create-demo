# Deploying WebAuthn Conditional Create Demo to GitHub Pages

Since Google Password Manager can't save passwords from localhost domains, we can deploy this proof of concept to GitHub Pages for free. Here's how to do it:

## Implementation Details

This proof of concept has been updated to properly handle all the caveats mentioned in the Chrome documentation:

1. **Ignoring User Presence and User Verification flags**: The server-side code (simulated in our frontend) is designed to ignore these flags, which will be false for conditional creation.

2. **Aborting ongoing WebAuthn calls**: We use the AbortController to properly abort any ongoing WebAuthn operations before attempting a conditional create.

3. **Graceful exception handling**: We handle specific exceptions like InvalidStateError, NotAllowedError, and AbortError gracefully without showing confusing error messages to the user.

4. **Conditional Get before Create**: The application first attempts to sign in with an existing passkey using conditional get before showing the password form.

5. **Password-based authentication requirement**: As noted in the documentation, conditional create only works after password-based authentication, not with passwordless methods like magic links.

## Step 1: Modify the Code for Static Hosting

Since GitHub Pages only supports static websites, we need to make a small modification to our code to work without the Python server:

1. Remove the HTTPS requirement for local testing only (WebAuthn still requires HTTPS, but GitHub Pages already provides this)
2. Update the WebAuthn relying party ID to match your GitHub Pages domain

## Step 2: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in or create an account
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., "webauthn-conditional-create-demo")
4. Make it public
5. Click "Create repository"

## Step 3: Push Your Code to GitHub

```bash
# Initialize a git repository in your project folder
git init

# Add all files
git add .

# Commit the files
git commit -m "Initial commit"

# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/webauthn-conditional-create-demo.git

# Push to GitHub
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings"
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "main" branch
5. Click "Save"
6. Wait a few minutes for your site to be published

Your site will be available at: `https://YOUR_USERNAME.github.io/webauthn-conditional-create-demo/`

## Step 5: Update the WebAuthn Relying Party ID

Before deploying, update the `rp.id` in `js/webauthn.js` to match your GitHub Pages domain:

```javascript
// Change this:
id: window.location.hostname || 'localhost'

// To this:
id: 'YOUR_USERNAME.github.io'
```

Also, if you want to exclude existing credentials to prevent the "InvalidStateError" (passkey already exists), you would typically fetch the list of existing credentials from your server and include them in the excludeCredentials parameter. In a real application, this would look like:

```javascript
// Example of excluding existing credentials
const publicKeyOptions = {
    // ... other options
    excludeCredentials: [
        {
            id: Uint8Array.from(existingCredentialId, c => c.charCodeAt(0)),
            type: 'public-key',
            transports: ['internal']
        }
    ]
};
```

## Testing with Google Password Manager

Now you can:

1. Visit your deployed site at `https://YOUR_USERNAME.github.io/webauthn-conditional-create-demo/`
2. Sign in with the demo credentials
3. Save the password in Google Password Manager when prompted
4. Sign out and sign in again using autofill
5. Check if a passkey is created automatically

## Alternative Free Hosting Options

If GitHub Pages doesn't work for your needs, consider these alternatives:

1. **Netlify** - Drag and drop your project folder to deploy
2. **Vercel** - Similar to Netlify with easy GitHub integration
3. **Glitch** - Supports both frontend and backend code
4. **Replit** - Online IDE with hosting capabilities
