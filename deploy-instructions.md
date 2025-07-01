# Deploying WebAuthn Conditional Create Demo to GitHub Pages

Since Google Password Manager can't save passwords from localhost domains, we can deploy this proof of concept to GitHub Pages for free. Here's how to do it:

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
