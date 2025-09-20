# Chrome Web Store CI/CD Setup Guide

## Prerequisites

1. **Chrome Web Store Developer Account**
   - Sign up at https://chrome.google.com/webstore/developer/dashboard
   - Pay one-time $5 registration fee

2. **Initial Manual Upload**
   - Upload the extension manually first time to get an Extension ID
   - Save the Extension ID (looks like: `abcdefghijklmnopqrstuvwxyz`)

## Setting Up Automated Publishing

### Step 1: Enable Chrome Web Store API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Chrome Web Store API:
   - Go to "APIs & Services" → "Enable APIs"
   - Search for "Chrome Web Store API"
   - Click Enable

### Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Desktop app" as application type
4. Download the credentials JSON

### Step 3: Generate Refresh Token

```bash
# Install the Chrome Web Store CLI tool
npm install -g chrome-webstore-upload-cli

# Generate refresh token using your credentials
chrome-webstore-upload get-refresh-token --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET

# Follow the OAuth flow and save the refresh token
```

### Step 4: Add GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

- `CHROME_EXTENSION_ID`: Your extension ID from Chrome Web Store
- `CHROME_CLIENT_ID`: OAuth 2.0 client ID
- `CHROME_CLIENT_SECRET`: OAuth 2.0 client secret
- `CHROME_REFRESH_TOKEN`: Generated refresh token

## Usage

### Automatic Publishing (on version tag)

```bash
# Create and push a version tag
git tag v1.0.1
git push origin v1.0.1

# This triggers the workflow to:
# 1. Build the extension
# 2. Run tests
# 3. Package as ZIP
# 4. Upload to Chrome Web Store
# 5. Create GitHub Release
```

### Manual Publishing

1. Go to Actions tab in GitHub
2. Select "Publish Chrome Extension" workflow
3. Click "Run workflow"
4. Select branch and click "Run"

## Local Testing

```bash
# Test the build locally
npm run build:extension

# Package locally
cd dist/extension
zip -r ../mosqit-extension.zip .

# Test the ZIP file
# 1. Go to chrome://extensions
# 2. Enable Developer Mode
# 3. Drag and drop the ZIP file
```

## Monitoring

### Check Publishing Status

1. **GitHub Actions**: Check workflow runs in Actions tab
2. **Chrome Web Store**: Dashboard shows review status
3. **Email**: Google sends emails about review status

### Review Timeline

- **Automated Review**: 1-2 hours for simple updates
- **Manual Review**: 1-3 business days
- **First Submission**: Up to 7 days

## Troubleshooting

### Common Issues

1. **"Invalid manifest"**
   - Ensure manifest.json version is incremented
   - Check all required fields are present

2. **"API quota exceeded"**
   - Chrome Web Store API has rate limits
   - Wait a few minutes and retry

3. **"Authentication failed"**
   - Refresh token may have expired
   - Generate a new refresh token

4. **"Extension rejected"**
   - Check email for specific rejection reasons
   - Common: Missing privacy policy, unclear description

## Version Management

### package.json and manifest.json

The CI/CD can auto-increment versions:

```json
// package.json
{
  "version": "1.0.1"
}

// manifest.json
{
  "version": "1.0.1"
}
```

### Semantic Versioning

- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features
- **Patch** (1.0.1): Bug fixes

## Security Notes

- Never commit credentials to the repository
- Use GitHub Secrets for sensitive data
- Rotate refresh tokens periodically
- Enable 2FA on Google account

## Additional Resources

- [Chrome Web Store API Documentation](https://developer.chrome.com/docs/webstore/api/)
- [Publishing Guidelines](https://developer.chrome.com/docs/webstore/publish/)
- [Review Guidelines](https://developer.chrome.com/docs/webstore/review-process/)