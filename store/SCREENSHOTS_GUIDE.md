# Chrome Web Store Screenshots Guide

## Overview
Create 5 high-quality screenshots showing Mosqit's key features for the Chrome Web Store listing.

---

## Screenshot Requirements

### Technical Specifications
- **Format**: PNG or JPEG
- **Dimensions**: 1280x800 pixels (16:10 aspect ratio) **REQUIRED**
- **Alternative**: 640x400 pixels (not recommended, lower quality)
- **File Size**: Max 5MB each
- **Color Profile**: sRGB
- **Count**: Minimum 1, Maximum 5 (recommended: 5)

### Design Guidelines
- Clean, professional appearance
- High contrast for readability
- No offensive or inappropriate content
- Representative of actual product
- Include UI elements (not just marketing)

---

## Screenshot 1: AI Console Analysis (PRIMARY)

### Priority
**🔴 HIGHEST** - This is the first thing users see

### Content to Show
1. Chrome DevTools open with Mosqit tab active
2. Console showing an error (e.g., "TypeError: Cannot read property 'name' of null")
3. Mosqit panel displaying:
   - Error details (file, line, timestamp)
   - **AI Analysis** with 🤖 icon
   - Root cause explanation
   - Fix suggestion with code snippet
   - "What to check next" section
4. **Highlight the <100ms response time** (show timestamp)

### Annotations to Add
- Arrow pointing to AI analysis: "<100ms instant analysis"
- Badge: "On-Device Gemini Nano"
- Highlight: "No data sent to cloud"

### Caption
```
"Instant AI-powered error analysis in <100ms with on-device Gemini Nano"
```

---

## Screenshot 2: Privacy Comparison

### Priority
**🟠 HIGH** - Key differentiator vs Console Insights

### Content to Show
Split-screen or side-by-side comparison:

**Left side: Chrome DevTools Console Insights**
- Screenshot of Console Insights lightbulb icon
- "After a few seconds..." loading indicator
- Text overlay: "Sends data to Google cloud"
- Text overlay: "US only, 18+, requires login"

**Right side: Mosqit**
- Mosqit panel with instant analysis
- Text overlay: "<100ms on-device"
- Text overlay: "100% private, works offline"
- Text overlay: "Global, no login"

### Annotations to Add
- Comparison table overlay showing key differences
- Green checkmarks for Mosqit advantages
- Red X marks for Console Insights limitations

### Caption
```
"100% private on-device processing vs cloud-based alternatives"
```

---

## Screenshot 3: Framework-Aware Analysis

### Priority
**🟡 MEDIUM** - Shows intelligent context awareness

### Content to Show
1. React application with an error in DevTools
2. Mosqit detecting "React 18.3.1" automatically
3. AI analysis showing React-specific advice:
   - "This is a React component lifecycle issue"
   - "Check useEffect dependencies"
   - "Add proper cleanup in useEffect return"
   - React-specific code example

### Annotations to Add
- Highlight the framework detection: "Auto-detected: React 18.3.1"
- Badge icons for supported frameworks: React, Vue, Angular, Next.js
- Arrow: "Framework-specific insights"

### Caption
```
"Framework-aware insights for React, Vue, Angular, and Next.js"
```

---

## Screenshot 4: Visual Bug Reporter (Bonus Feature)

### Priority
**🟡 MEDIUM** - Shows additional value beyond console

### Content to Show
1. Mosqit DevTools panel with "Visual Bug Reporter" tab active
2. Screenshot capture of a website with element highlighted
3. Element inspector showing:
   - CSS selector
   - Element dimensions
   - XPath
   - Detected issues (if any)
4. "Create GitHub Issue" button visible
5. GitHub integration dialog (optional)

### Annotations to Add
- "Bonus Feature" badge
- Arrow: "Click any element to capture"
- Highlight: "GitHub integration built-in"

### Caption
```
"Bonus: Visual element inspector with GitHub integration"
```

---

## Screenshot 5: Pattern Detection

### Priority
**🟢 NICE TO HAVE** - Shows advanced capability

### Content to Show
1. Mosqit panel showing multiple errors
2. Visual indicator of recurring errors:
   - Same error appearing 3+ times
   - Pattern detection alert: "🔄 Recurring error detected"
   - Suggested systemic fix
3. Error frequency graph or heatmap (if implemented)

### Annotations to Add
- Highlight recurring errors with border/badge
- Text: "Automatic pattern detection"
- Arrow: "Identifies systemic issues"

### Caption
```
"Automatic pattern detection for recurring errors"
```

---

## Promotional Tiles

### Small Tile (128x128) - REQUIRED
**Content**: Mosqit logo/icon only
- Clean, recognizable icon
- Transparent background or solid color
- High resolution (no pixelation)
- Matches extension icon

**File**: `icon-128.png`

### Promotional Tile (440x280) - REQUIRED
**Content**: Mosqit branding + tagline
- Mosqit logo (centered or left)
- Tagline: "AI Console, Instant & Private"
- Key benefit icons: ⚡ <100ms, 🔒 Private, 🌍 Offline
- Brand colors (purple gradient: #667eea to #764ba2)

**File**: `promo-440x280.png`

### Marquee Tile (1400x560) - OPTIONAL (Recommended)
**Content**: Hero image with benefits
- Large Mosqit logo/wordmark
- Main headline: "Developer Console with On-Device AI"
- 3-4 key benefits with icons:
  - ⚡ <100ms analysis
  - 🔒 100% private
  - 🌍 Works offline
  - 🌐 Global availability
- Screenshot preview (small, in background)
- Call to action: "Install Free"

**File**: `promo-marquee-1400x560.png`

---

## Screenshot Creation Workflow

### Method 1: Actual Extension Screenshots
1. Install Mosqit extension in Chrome
2. Open a test website (e.g., React app with intentional error)
3. Open DevTools (F12) → Mosqit tab
4. Trigger console errors to capture
5. Use Chrome's screenshot tool or external capture tool
6. Crop to exactly 1280x800 pixels
7. Add annotations in image editor (Figma, Photoshop, Canva)
8. Export as PNG (high quality)

### Method 2: Mockups (If Extension Not Ready)
1. Use Figma or similar design tool
2. Import Chrome DevTools mockup template
3. Design Mosqit panel UI
4. Add realistic error messages and AI responses
5. Add annotations and highlights
6. Export at 1280x800 pixels as PNG

### Tools Recommended
- **Screenshot Capture**: ShareX, Greenshot, or native Chrome DevTools
- **Image Editing**: Figma (free), Photoshop, GIMP, Canva
- **Annotations**: Figma, Canva, or Snagit
- **Optimization**: TinyPNG (compress without quality loss)

---

## Design Best Practices

### DO ✅
- Use high-resolution, crisp images
- Show real UI (not just mockups if possible)
- Include helpful annotations
- Use consistent branding colors
- Make text readable (min 14px font for annotations)
- Show actual value/functionality
- Include device chrome (browser frame) for context

### DON'T ❌
- Use low-resolution or blurry images
- Include personal information or real user data
- Show competitor branding prominently
- Use misleading or exaggerated claims
- Include offensive content
- Overload with text (keep annotations minimal)
- Use copyrighted images without permission

---

## Branding Guidelines

### Colors
- **Primary**: #667eea (purple)
- **Secondary**: #764ba2 (deep purple)
- **Gradient**: Linear gradient from #667eea to #764ba2
- **Accent**: #2196f3 (blue) for AI highlights
- **Success**: #10b981 (green) for benefits
- **Text**: #333 (dark gray) on white backgrounds

### Typography
- **Headings**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto (system fonts)
- **Body**: Same as headings for consistency
- **Monospace**: Monaco, Menlo, Consolas (for code)

### Icons
- 🤖 for AI features
- ⚡ for speed/performance
- 🔒 for privacy
- 🌍 for offline/global
- ✅ for benefits/checkmarks

---

## Quality Checklist

Before submitting, verify each screenshot:

- [ ] Exactly 1280x800 pixels
- [ ] PNG format (high quality, not compressed)
- [ ] File size under 5MB
- [ ] Clear, readable text (all UI elements)
- [ ] No personal data visible
- [ ] Annotations added (if needed)
- [ ] Consistent with branding
- [ ] Shows real functionality
- [ ] Represents current version
- [ ] No spelling errors in captions

---

## File Naming Convention

```
screenshot-1-ai-console-analysis.png
screenshot-2-privacy-comparison.png
screenshot-3-framework-aware.png
screenshot-4-visual-bug-reporter.png
screenshot-5-pattern-detection.png
promo-tile-440x280.png
promo-marquee-1400x560.png
icon-small-128x128.png
```

---

## Example Captions (Copy-Paste Ready)

```
1. Instant AI-powered error analysis in <100ms with on-device Gemini Nano
2. 100% private on-device processing vs cloud-based alternatives
3. Framework-aware insights for React, Vue, Angular, and Next.js
4. Bonus: Visual element inspector with GitHub integration
5. Automatic pattern detection for recurring errors
```

---

## Testing Screenshots

Before final submission:
1. View screenshots on different displays (retina, standard)
2. Check readability at thumbnail size (200x125px)
3. Verify they tell a clear story in sequence
4. Get feedback from 2-3 people not familiar with Mosqit
5. Ensure they align with store listing description

---

*Note: Screenshots are the first impression users get. Invest time to make them professional and compelling.*
