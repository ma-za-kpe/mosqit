# 🚀 Mosqit Deployment Guide

> Comprehensive deployment documentation for Mosqit Chrome Extension and Dashboard

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Local Development](#local-development)
3. [Chrome Extension Deployment](#chrome-extension-deployment)
4. [Next.js Dashboard Deployment](#nextjs-dashboard-deployment)
5. [Firebase Setup](#firebase-setup)
6. [GitHub OAuth Setup](#github-oauth-setup)
7. [Chrome AI APIs Setup](#chrome-ai-apis-setup)
8. [Production Deployment](#production-deployment)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Troubleshooting](#troubleshooting)

## 📋 Prerequisites

### Required Software
- **Node.js**: v22.0.0 or higher
- **npm**: v10.0.0 or higher
- **Chrome Canary**: Latest version
- **Git**: v2.40.0 or higher
- **VS Code**: Recommended IDE

### Required Accounts
- GitHub account (for OAuth and repository)
- Google account (for Chrome Web Store)
- Firebase account (optional, for mobile dashboard)
- Vercel account (for Next.js deployment)

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/mosqit.git
cd mosqit
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your values
code .env.local
```

### 4. Required Environment Variables

#### Critical (Must Have)
```env
# GitHub OAuth (Required for issue creation)
GITHUB_CLIENT_ID=required
GITHUB_CLIENT_SECRET=required
GITHUB_PERSONAL_ACCESS_TOKEN=required

# Chrome Extension
EXTENSION_ID=auto_generated_on_first_install

# Session Security
SESSION_SECRET=generate_32_char_random_string
JWT_SECRET=generate_32_char_random_string
```

#### Important (Recommended)
```env
# Firebase (for mobile dashboard)
NEXT_PUBLIC_FIREBASE_API_KEY=recommended
NEXT_PUBLIC_FIREBASE_PROJECT_ID=recommended

# Chrome AI APIs
CHROME_AI_ORIGIN_TRIAL_TOKEN=from_early_preview_program

# Storage Encryption
ENCRYPTION_KEY=generate_32_char_random_string
```

#### Optional (Nice to Have)
```env
# Analytics
NEXT_PUBLIC_SENTRY_DSN=optional
NEXT_PUBLIC_GA_MEASUREMENT_ID=optional

# Testing
TEST_GITHUB_REPO=optional
SAMPLE_REACT_REPO=optional
```

## 💻 Local Development

### 1. Start Development Servers

#### Next.js Dashboard (Port 3000)
```bash
npm run dev
```

#### Chrome Extension Development
```bash
# Build extension in watch mode
npm run dev:extension

# Or build once
npm run build:extension
```

### 2. Load Extension in Chrome Canary

1. Open Chrome Canary
2. Enable required flags:
```
chrome://flags/#enable-experimental-web-platform-features
chrome://flags/#optimization-guide-on-device-model
```
3. Restart Chrome
4. Navigate to `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked"
7. Select `dist/extension` folder
8. Note the generated Extension ID
9. Update `.env.local` with the Extension ID

### 3. Test DevTools Integration

1. Open any website
2. Open Chrome DevTools (F12)
3. Look for "Mosqit" panel
4. Test screenshot capture
5. Test log capture

## 🏗️ Build Process

### Development Build
```bash
# Build everything
npm run build

# Build specific components
npm run build:extension   # Chrome Extension only
npm run build:dashboard   # Next.js dashboard only
npm run build:mobile      # Mobile PWA only
```

### Production Build
```bash
# Production build with optimizations
npm run build:prod

# Analyze bundle size
npm run analyze
```

### Build Output Structure
```
dist/
├── extension/           # Chrome Extension files
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── devtools.html
│   └── popup.html
├── dashboard/          # Next.js static export
│   └── [Next.js build files]
└── mobile/            # PWA build
    └── [PWA files]
```

## 🔐 GitHub OAuth Setup

### 1. Create OAuth Application

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
2. Fill in the form:
   - **Application name**: Mosqit Dev (or Mosqit Production)
   - **Homepage URL**: `http://localhost:3000` (dev) or `https://mosqit.vercel.app` (prod)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
3. Click "Register application"
4. Copy Client ID and generate Client Secret
5. Update `.env.local`:
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 2. Create Personal Access Token

1. Go to [GitHub Settings > Personal access tokens](https://github.com/settings/tokens/new)
2. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read user profile data)
3. Generate token
4. Update `.env.local`:
```env
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token
```

## 🤖 Chrome AI APIs Setup

### 1. Join Early Preview Program

1. Visit [Chrome AI Early Preview](https://developer.chrome.com/ai)
2. Sign up for the program
3. Wait for approval email
4. Get your Origin Trial Token

### 2. Configure Chrome Canary

```bash
# Windows
"C:\Program Files\Google\Chrome Canary\Application\chrome.exe" --enable-experimental-web-platform-features --enable-features=WebAI,AIPromptAPI,AISummarizationAPI,AIWriterAPI,AIRewriterAPI

# macOS
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary --enable-experimental-web-platform-features --enable-features=WebAI,AIPromptAPI,AISummarizationAPI,AIWriterAPI,AIRewriterAPI

# Linux
google-chrome-canary --enable-experimental-web-platform-features --enable-features=WebAI,AIPromptAPI,AISummarizationAPI,AIWriterAPI,AIRewriterAPI
```

### 3. Test AI APIs

```javascript
// Test in Chrome DevTools Console
async function testAI() {
  if ('ai' in window) {
    const session = await window.ai.createTextSession();
    const result = await session.prompt("Hello, AI!");
    console.log(result);
  } else {
    console.log("Chrome AI APIs not available");
  }
}
testAI();
```

## 🔥 Firebase Setup (Optional)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project "mosqit-extension"
3. Enable Authentication, Firestore, and Storage
4. Create web app
5. Copy configuration

### 2. Configure Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
# - Storage
```

### 3. Update Environment
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mosqit-extension.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mosqit-extension
```

## 📦 Chrome Extension Deployment

### 1. Prepare for Chrome Web Store

#### Update Manifest
```json
{
  "manifest_version": 3,
  "name": "Mosqit - AI-Powered Debugging",
  "version": "1.0.0",
  "description": "Buzz through frontend bugs with AI-driven GitHub issues"
}
```

#### Create Store Assets
- Icon sizes: 16x16, 48x48, 128x128
- Screenshots: 1280x800 or 640x400
- Promotional images: 440x280, 920x680
- Demo video: YouTube link

### 2. Package Extension

```bash
# Create production build
npm run build:extension:prod

# Create ZIP file
npm run package:extension
# Output: dist/mosqit-extension-v1.0.0.zip
```

### 3. Publish to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time developer fee ($5)
3. Click "New Item"
4. Upload ZIP file
5. Fill in store listing details
6. Submit for review

## 🌐 Next.js Dashboard Deployment

### Vercel Deployment (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add GITHUB_CLIENT_ID production
vercel env add GITHUB_CLIENT_SECRET production
# ... add other variables
```

#### 3. Configure Domain
```bash
# Add custom domain
vercel domains add mosqit.yourdomain.com
```

### Alternative: Self-Hosted Deployment

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run Docker image
docker build -t mosqit-dashboard .
docker run -p 3000:3000 --env-file .env.production mosqit-dashboard
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Mosqit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build-extension:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build:extension:prod
      - uses: actions/upload-artifact@v3
        with:
          name: extension-build
          path: dist/extension

  deploy-dashboard:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build:dashboard
      - run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 📊 Production Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] GitHub OAuth working
- [ ] Chrome AI APIs accessible
- [ ] Firebase project setup (if using)
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance optimized

### Extension Release
- [ ] Version number updated
- [ ] Changelog written
- [ ] Store assets prepared
- [ ] Privacy policy updated
- [ ] Terms of service ready
- [ ] Demo video recorded

### Dashboard Release
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] PWA manifest updated

### Post-Deployment
- [ ] Extension published to store
- [ ] Dashboard live and accessible
- [ ] Documentation updated
- [ ] Social media announcement
- [ ] Hackathon submission complete

## 🐛 Troubleshooting

### Common Issues

#### Chrome AI APIs Not Working
```bash
# Check if flags are enabled
chrome://flags

# Verify in console
window.ai !== undefined
```

#### GitHub OAuth Failing
```bash
# Check redirect URI matches exactly
# Verify client ID and secret
# Check token scopes
```

#### Extension Not Loading
```bash
# Check manifest.json syntax
# Verify all files exist
# Check console for errors
```

#### Firebase Connection Issues
```bash
# Verify Firebase config
# Check security rules
# Review quota limits
```

### Debug Commands

```bash
# Check environment variables
npm run env:check

# Validate configuration
npm run validate:config

# Test GitHub connection
npm run test:github

# Test Chrome AI APIs
npm run test:ai

# Check build output
npm run build:analyze
```

## 📚 Additional Resources

### Documentation
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome AI APIs](https://developer.chrome.com/ai)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Setup](https://firebase.google.com/docs/web/setup)
- [GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps)

### Support Channels
- GitHub Issues: [Report bugs](https://github.com/yourusername/mosqit/issues)
- Discussions: [Ask questions](https://github.com/yourusername/mosqit/discussions)
- Email: mosqit.extension@gmail.com

---

*Last Updated: September 2025*
*Version: 1.0.0*