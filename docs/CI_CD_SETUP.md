# 🔄 CI/CD Setup Guide for Mosqit

> Complete guide for setting up GitHub Actions and Vercel deployment

## 📋 Prerequisites

- GitHub repository for Mosqit
- Vercel account (free tier is sufficient)
- Chrome Web Store Developer account (for extension publishing)

## 🔑 Required Secrets Setup

### GitHub Repository Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

#### 1. Vercel Secrets (Required)

| Secret Name | How to Get It | Description |
|-------------|---------------|-------------|
| `VERCEL_TOKEN` | [Vercel Account Settings](https://vercel.com/account/tokens) → Create Token | Personal access token for Vercel CLI |
| `VERCEL_ORG_ID` | Run `vercel whoami` in project directory | Your Vercel organization ID |
| `VERCEL_PROJECT_ID` | Run `vercel project ls` or check `.vercel/project.json` | Specific project ID |

**Steps to get Vercel credentials:**

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (creates .vercel/project.json)
vercel link

# Get your org ID
vercel whoami

# View the generated IDs
cat .vercel/project.json
```

#### 2. Environment Variables (Required for Production)

| Secret Name | Description |
|-------------|-------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | PAT for API access |
| `SESSION_SECRET` | 32-character random string |
| `JWT_SECRET` | 32-character random string |
| `ENCRYPTION_KEY` | 32-character random string |

#### 3. Optional Secrets

| Secret Name | Description |
|-------------|-------------|
| `FIREBASE_API_KEY` | Firebase project API key |
| `CHROME_AI_ORIGIN_TRIAL_TOKEN` | Chrome AI Early Preview token |
| `SENTRY_AUTH_TOKEN` | For error tracking |

### Setting Secrets via GitHub CLI

```bash
# Install GitHub CLI
brew install gh  # macOS
# or
winget install GitHub.cli  # Windows

# Authenticate
gh auth login

# Set secrets
gh secret set VERCEL_TOKEN --body="your_token_here"
gh secret set VERCEL_ORG_ID --body="your_org_id"
gh secret set VERCEL_PROJECT_ID --body="your_project_id"

# Set from file
gh secret set GITHUB_CLIENT_SECRET < secret.txt

# List secrets
gh secret list
```

## 🚀 Vercel Project Setup

### 1. Create Vercel Project

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Initialize project (first time only)
vercel

# Follow prompts:
# - Set up and deploy: Y
# - Which scope: Select your account
# - Link to existing project: N
# - Project name: mosqit
# - Directory: ./
# - Override settings: N
```

### 2. Configure Environment Variables in Vercel

```bash
# Set production environment variables
vercel env add GITHUB_CLIENT_ID production
vercel env add GITHUB_CLIENT_SECRET production
vercel env add GITHUB_PERSONAL_ACCESS_TOKEN production
vercel env add SESSION_SECRET production
vercel env add JWT_SECRET production
vercel env add ENCRYPTION_KEY production

# Set preview environment variables (for develop branch)
vercel env add GITHUB_CLIENT_ID preview
# ... repeat for other variables

# List environment variables
vercel env ls
```

### 3. Configure Project Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `mosqit` project
3. Go to Settings → General
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Development Command**: `npm run dev`

5. Go to Settings → Domains
6. Add custom domain (optional): `mosqit.yourdomain.com`

## 📦 GitHub Actions Workflow

### Workflow File Structure

The workflow is already configured in `.github/workflows/deploy.yml` with:

1. **lint-and-test**: Runs on all branches
   - Lints code with ESLint
   - Runs tests
   - Builds both dashboard and extension
   - Checks bundle size on PRs

2. **deploy-develop**: Deploys to preview on develop branch
   - Builds and deploys to Vercel preview
   - Comments PR with preview URL

3. **deploy-production**: Deploys to production on main branch
   - Builds and deploys to Vercel production
   - Creates production build

4. **build-extension**: Packages Chrome Extension
   - Creates distributable ZIP file
   - Uploads as artifact

5. **release**: Creates GitHub releases
   - Triggered by commits with `[release]` tag
   - Attaches extension ZIP to release

## 🔄 Branch Strategy

### Git Flow

```
main (production)
  ↑
  └── develop (staging/preview)
        ↑
        └── feature/xxx (feature branches)
```

### Branch Protection Rules

Configure in GitHub → Settings → Branches:

**For `main` branch:**
- Require pull request before merging
- Require status checks (lint-and-test)
- Require branches to be up to date
- Include administrators
- Restrict who can push

**For `develop` branch:**
- Require pull request before merging
- Require status checks (lint-and-test)

## 🏷️ Release Process

### Automated Releases

1. Merge to main with `[release]` in commit message:
```bash
git commit -m "[release] v1.0.0 - Initial release"
git push origin main
```

2. GitHub Actions will:
   - Deploy to production
   - Build and package extension
   - Create GitHub release with artifacts

### Manual Release

```bash
# Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Create release via GitHub CLI
gh release create v1.0.0 \
  --title "Mosqit v1.0.0" \
  --notes "Release notes here" \
  ./dist/mosqit-extension-v1.0.0.zip
```

## 📊 Monitoring Deployments

### Vercel Dashboard

Monitor deployments at: https://vercel.com/[your-username]/mosqit

Features:
- Real-time logs
- Build outputs
- Function logs
- Analytics
- Error tracking

### GitHub Actions

Monitor workflows at: https://github.com/[your-username]/mosqit/actions

Features:
- Workflow runs
- Build logs
- Artifacts
- Deployment status

## 🐛 Troubleshooting

### Common Issues

#### Vercel Token Invalid
```bash
# Regenerate token
vercel logout
vercel login
# Update GitHub secret
```

#### Build Failing
```bash
# Check locally
npm run build
npm run lint

# Clear cache
vercel --force
```

#### Environment Variables Missing
```bash
# Check Vercel env vars
vercel env ls

# Pull to local
vercel env pull .env.local
```

### Debug Commands

```bash
# Test GitHub connection
gh api user

# Test Vercel connection
vercel whoami

# Check workflow syntax
act --list  # Using act tool

# Dry run workflow locally
act push --dry-run
```

## 📝 Environment-Specific Configurations

### Development (localhost)
- URL: http://localhost:3000
- Branch: feature/*
- Auto-deploy: No

### Preview/Staging (Vercel Preview)
- URL: https://mosqit-[branch]-[username].vercel.app
- Branch: develop
- Auto-deploy: Yes

### Production (Vercel Production)
- URL: https://mosqit.vercel.app
- Branch: main
- Auto-deploy: Yes

## 🔒 Security Best Practices

1. **Rotate Secrets Regularly**
   ```bash
   # Generate new secret
   openssl rand -hex 32
   ```

2. **Use Environment-Specific Secrets**
   - Different OAuth apps for dev/prod
   - Separate Firebase projects
   - Unique encryption keys

3. **Audit Access**
   ```bash
   # Check who has access
   gh api repos/:owner/:repo/collaborators
   ```

4. **Enable 2FA**
   - GitHub account
   - Vercel account
   - npm account

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## 🆘 Support

For CI/CD issues:
1. Check workflow logs in GitHub Actions
2. Review Vercel deployment logs
3. Open issue in repository
4. Contact team via Discord/Slack

---

*Last Updated: September 2025*
*Version: 1.0.0*