# Contributing to Mosqit 🦟

First off, thank you for considering contributing to Mosqit! It's people like you that make Mosqit such a great tool for the developer community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Chrome Extension Best Practices](#chrome-extension-best-practices)
- [AI Integration Guidelines](#ai-integration-guidelines)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Chrome 138+ (for AI features)
- Node.js 18+
- npm 9+
- Git
- TypeScript knowledge
- Understanding of Chrome Extensions (Manifest V3)

### First Time Setup

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/mosqit.git
   cd mosqit
   git remote add upstream https://github.com/ORIGINAL_OWNER/mosqit.git
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `dist/extension` folder

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear descriptive title**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Chrome version**
- **Console errors** (if any)
- **Screenshots** (if applicable)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use case** - Why is this needed?
- **Proposed solution** - How should it work?
- **Alternative solutions** - What else did you consider?
- **Additional context** - Any mockups, diagrams, etc.

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Simple fixes for beginners
- `help wanted` - More involved issues needing help
- `documentation` - Documentation improvements

## 💻 Development Setup

### Project Structure

```
mosqit/
├── dist/                    # Built extension
│   └── extension/
│       ├── manifest.json   # Chrome extension manifest
│       ├── main-world.js   # MAIN world script
│       ├── content.js      # Content script
│       └── background.js   # Service worker
├── src/                    # Source code
│   └── extension/
│       ├── content/       # Content script sources
│       ├── background/    # Background script sources
│       └── devtools/      # DevTools panel sources
├── test/                  # Test files
│   └── test-logger.html  # Manual test page
└── docs/                 # Documentation
```

### Development Commands

```bash
# Build for development
npm run build

# Build for production
npm run build:prod

# Watch mode (auto-rebuild)
npm run watch

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Package extension
npm run package
```

## 🎯 Chrome Extension Best Practices

### Manifest V3 Requirements

1. **Service Workers Instead of Background Pages**
   ```javascript
   // ✅ Good - Service worker
   chrome.runtime.onInstalled.addListener(() => {
     // Initialization code
   });

   // ❌ Bad - Persistent background page
   // Not supported in Manifest V3
   ```

2. **MAIN World Content Scripts**
   ```javascript
   // manifest.json
   {
     "content_scripts": [{
       "world": "MAIN",  // Access page context
       "js": ["main-world.js"]
     }]
   }
   ```

3. **No Remote Code Execution**
   ```javascript
   // ✅ Good - Local code only
   import { analyzeError } from './analyzer.js';

   // ❌ Bad - Remote code
   // eval(fetchedCode);
   // script.src = 'https://cdn.example.com/script.js';
   ```

### Communication Patterns

1. **CustomEvent for MAIN → ISOLATED**
   ```javascript
   // MAIN world
   window.dispatchEvent(new CustomEvent('mosqit-log', {
     detail: { message: 'Error occurred' }
   }));

   // Content script (ISOLATED)
   window.addEventListener('mosqit-log', (event) => {
     processLog(event.detail);
   });
   ```

2. **Chrome Runtime for Extension Communication**
   ```javascript
   // Content script → Background
   chrome.runtime.sendMessage({ type: 'LOG', data });

   // Background listener
   chrome.runtime.onMessage.addListener((message, sender) => {
     if (message.type === 'LOG') processLog(message.data);
   });
   ```

## 🤖 AI Integration Guidelines

### Feature Detection

Always check for API availability:

```javascript
// ✅ Good - Feature detection
if ('ai' in self && self.ai?.languageModel) {
  const capabilities = await ai.languageModel.capabilities();
  if (capabilities.available !== 'no') {
    // Use AI
  }
}

// ❌ Bad - Assuming availability
const session = await ai.languageModel.create(); // May throw
```

### Graceful Degradation

Always provide fallbacks:

```javascript
async function analyzeError(error) {
  try {
    // Try Chrome AI first
    if ('ai' in self) {
      return await analyzeWithAI(error);
    }
  } catch (e) {
    console.warn('AI unavailable:', e);
  }

  // Fallback to local analysis
  return localAnalysis(error);
}
```

### Resource Management

```javascript
// ✅ Good - Clean up sessions
const session = await ai.languageModel.create();
try {
  const result = await session.prompt(prompt);
  return result;
} finally {
  session.destroy();
}

// ❌ Bad - Session leak
const session = await ai.languageModel.create();
return await session.prompt(prompt);
// Session never destroyed!
```

## 🎨 Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Strict mode enabled
- No `any` types without justification
- Interfaces over type aliases for objects

```typescript
// ✅ Good
interface LogMetadata {
  message: string;
  level: LogLevel;
  timestamp: number;
}

// ❌ Avoid
type LogMetadata = {
  message: any;
  level: string;
  timestamp: number;
}
```

### Code Style

- 2 spaces indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters
- Use async/await over promises

```javascript
// ✅ Good
async function processLog(log) {
  const analysis = await analyzeLog(log);
  return formatAnalysis(analysis);
}

// ❌ Avoid
function processLog(log) {
  return analyzeLog(log).then(analysis => {
    return formatAnalysis(analysis);
  });
}
```

## 📝 Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `chore`: Build/tooling changes

### Examples

```bash
# ✅ Good
git commit -m "feat(logger): add pattern detection for recurring errors"
git commit -m "fix(content): handle CSP restrictions in MAIN world"
git commit -m "docs(readme): add Chrome AI integration examples"

# ❌ Bad
git commit -m "fixed stuff"
git commit -m "Update"
git commit -m "wip"
```

## 🔄 Pull Requests

### Before Submitting

1. **Update from upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**
   ```bash
   npm test
   npm run lint
   ```

3. **Test manually**
   - Load extension in Chrome
   - Test your changes
   - Check DevTools console for errors

### PR Guidelines

1. **One feature per PR** - Keep PRs focused
2. **Clear description** - Explain what and why
3. **Link issues** - Reference related issues
4. **Screenshots** - Include for UI changes
5. **Tests** - Add tests for new features

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Lint passes

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Fixes #123
```

## 🌐 Community

### Getting Help

- **Discord**: [Join our server](https://discord.gg/mosqit)
- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs via GitHub Issues

### Roadmap Participation

Check our [roadmap](https://github.com/yourusername/mosqit/projects) and participate in planning:

- Vote on features
- Suggest improvements
- Join design discussions

## 🏆 Recognition

Contributors are recognized in:

- README.md contributors section
- Release notes
- Project website

## 📚 Additional Resources

### Chrome Extension Development

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/develop/migrate)
- [Chrome AI APIs](https://developer.chrome.com/docs/ai)

### Project-Specific

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Testing Guide](docs/TESTING.md)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Mosqit! 🦟 Together, we're making debugging better for everyone.