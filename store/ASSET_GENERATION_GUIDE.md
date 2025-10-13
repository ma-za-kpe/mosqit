# Chrome Web Store Asset Generation Guide

## Quick Start

All required Chrome Web Store assets can be generated using the existing comprehensive generator:

```bash
# 1. Start your development server
npm run dev

# 2. Open in your browser
http://localhost:3000/generate-assets.html
```

---

## Required Assets for Chrome Web Store

### 1. Store Icon (128x128) - REQUIRED
- **Source**: `public/generate-assets.html` → "Icon 128x128 (Chrome Extension)"
- **Action**: Click "Download" button
- **Save as**: `icon-128.png`
- **Upload to**: Chrome Web Store → Store icon field

### 2. Small Promotional Tile (440x280) - REQUIRED
- **Source**: `public/generate-assets.html` → "Chrome Web Store - Small Promo Tile 440x280"
- **Action**: Click "Download" button
- **Save as**: `promo-small.png`
- **Upload to**: Chrome Web Store → Promotional images → Small tile

### 3. Marquee Promotional Tile (1400x560) - RECOMMENDED
- **Source**: `public/generate-assets.html` → "Chrome Web Store - Marquee Promo Tile 1400x560"
- **Action**: Click "Download" button
- **Save as**: `promo-marquee.png`
- **Upload to**: Chrome Web Store → Promotional images → Marquee tile

---

## Alternative Generator (Hackathon Submissions)

For hackathon/social media images:

```bash
http://localhost:3000/generate-hackathon-image.html
```

This generator creates:
- Social media banners (1200x630, 1920x1080)
- Square social images (800x800)
- Wide banners (1600x900)

With 3 styles:
- **Banner Style**: Purple gradient with logo and tagline
- **Features Style**: Feature cards layout
- **Technical Style**: Dark theme with code snippets

---

## What's Already Generated

### Extension Package ✅
- **File**: `dist/mosqit-extension-v1.0.0.zip`
- **Size**: 65 KB
- **Status**: Ready to upload
- **Location**: Already in `dist/` folder

### Documentation ✅
- **Store Listing**: `store/CHROME_WEB_STORE_SUBMISSION.md`
- **Screenshots Guide**: `store/SCREENSHOTS_GUIDE.md`
- **Pre-Launch Checklist**: `store/PRE_LAUNCH_CHECKLIST.md`

---

## Remaining Tasks

### 1. Generate PNG Assets (10 minutes)
- [ ] Open `http://localhost:3000/generate-assets.html`
- [ ] Download icon-128.png
- [ ] Download promo-small.png (440x280)
- [ ] Download promo-marquee.png (1400x560)

### 2. Create Screenshots (30 minutes)
See `store/SCREENSHOTS_GUIDE.md` for detailed instructions.

Required: 5 screenshots at 1280x800 pixels
- Screenshot 1: AI Console Analysis (PRIMARY)
- Screenshot 2: Privacy Comparison
- Screenshot 3: Framework-Aware Analysis
- Screenshot 4: Visual Bug Reporter
- Screenshot 5: Pattern Detection

**How to capture screenshots:**
1. Load extension in Chrome (unpacked from `dist/extension/`)
2. Open DevTools → Mosqit tab
3. Create test errors to demonstrate features
4. Use screenshot tool to capture at 1280x800
5. Add annotations using Figma/Canva (optional)

### 3. Test Extension (20 minutes)
- [ ] Load unpacked extension from `dist/extension/`
- [ ] Test on a React/Vue/Angular app
- [ ] Verify AI detection works
- [ ] Verify fallback pattern matching works
- [ ] Test visual bug reporter
- [ ] Check for console errors

### 4. Upload to Chrome Web Store (15 minutes)
1. Go to: https://chrome.google.com/webstore/devconsole
2. Click "New Item"
3. Upload `dist/mosqit-extension-v1.0.0.zip`
4. Upload all 3 PNG assets (icon, small promo, marquee)
5. Upload 5 screenshots
6. Fill in store listing details from `CHROME_WEB_STORE_SUBMISSION.md`
7. Submit for review

---

## Asset Specifications Summary

| Asset | Dimensions | Format | Required? |
|-------|-----------|--------|-----------|
| Store Icon | 128x128 | PNG | ✅ Required |
| Small Promo Tile | 440x280 | PNG | ✅ Required |
| Marquee Promo Tile | 1400x560 | PNG | 🟡 Recommended |
| Screenshots | 1280x800 | PNG/JPEG | ✅ 1-5 required |
| Extension Package | N/A | ZIP | ✅ Required |

---

## Brand Guidelines

All assets use consistent Mosqit branding:

### Colors
- **Primary Gradient**: #667eea → #764ba2 (purple)
- **Text**: White on purple background
- **Accent**: rgba(255, 255, 255, 0.1) for overlays

### Logo
- **Icon**: 🦟 (mosquito emoji)
- **Typography**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto

### Tagline
- **Main**: "AI Console, Instant & Private"
- **Alternative**: "AI-Powered Debugging Assistant"

### Key Features (for promotional materials)
- ⚡ <100ms AI analysis
- 🔒 100% private (on-device)
- 🌍 Works offline
- 🤖 Gemini Nano powered

---

## Troubleshooting

### Generator not displaying correctly?
- Clear browser cache
- Try in Chrome (best emoji support)
- Ensure JavaScript is enabled

### Download button not working?
- Check browser download settings
- Try right-click → "Save Image As..."
- Verify popup blockers aren't interfering

### Need different image sizes?
- The generator uses Canvas API
- Edit the HTML files to adjust dimensions
- Regenerate with new sizes

---

## Files Reference

### Generators
- `public/generate-assets.html` - Main generator (all Chrome Web Store assets)
- `public/generate-hackathon-image.html` - Hackathon/social media images
- `generate-icon-128.html` - Standalone 128x128 generator (root level)

### Chrome Web Store Generators (redundant, use generate-assets.html instead)
- `public/chrome-store-icon-128.html`
- `public/chrome-store-promo-440x280.html`
- `public/chrome-store-marquee-1400x560.html`
- `public/chrome-store-assets.html`

### Documentation
- `store/CHROME_WEB_STORE_SUBMISSION.md` - Complete listing details
- `store/SCREENSHOTS_GUIDE.md` - Screenshot creation guide
- `store/PRE_LAUNCH_CHECKLIST.md` - Comprehensive checklist

---

## Timeline Estimate

- **Asset Generation**: 10 minutes
- **Screenshot Creation**: 30 minutes
- **Extension Testing**: 20 minutes
- **Chrome Web Store Upload**: 15 minutes
- **Total**: ~75 minutes to submission

---

**Status**: Ready to generate assets and submit
**Next Action**: Open `http://localhost:3000/generate-assets.html` and download PNGs
