# Visual Bug Reporter Testing Guide

> **Last Updated**: December 2024
> **Implementation Status**: Core features working, some advanced features pending

## Overview
The Visual Bug Reporter provides intelligent element selection, screenshot capture, and AI-powered GitHub issue generation. This guide covers the **actually implemented features** and notes which features are still in development.

## Implementation Status Summary

### ✅ Fully Working Features
- Smart element selection with scoring algorithm
- Screenshot capture with clean UI hiding
- GitHub issue generation with AI
- Basic keyboard navigation (arrows, Tab, Enter, Escape)
- Box model visualization (padding/margin overlays)
- Framework detection (React, Vue, Angular)
- Accessibility analysis (contrast checking)

### ⚠️ Partially Working
- Multi-element selection (Ctrl+Click) - infrastructure exists
- Performance metrics collection - data collected but no overlay

### ❌ Not Yet Implemented
- Annotation tools (drawing on screenshots)
- CSS live editor
- Color picker mode
- Measurement tool
- Advanced keyboard shortcuts (P, E, I, C, S keys)
- Persistent tooltip mode toggle

## Setup
1. Build the extension: `npm run build:extension`
2. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `dist/extension` folder
3. Open any website for testing

## How to Activate Visual Bug Reporter

### Method 1: From DevTools Panel
1. Open Chrome DevTools (F12)
2. Navigate to "Mosqit" panel
3. Click the "Visual Capture" button (camera icon)
4. The page will show "Capture mode active"

### Method 2: From Extension Popup
1. Click Mosqit extension icon in toolbar
2. Click "Open Dashboard" or use from popup

## Testing WORKING Features

### 1. Smart Element Selection ✅
**Test:**
- Hover over any element on the page
- The Visual Bug Reporter intelligently selects meaningful components
- Notice how it prefers buttons, links, and semantic elements over generic divs

**Expected:**
- Red border highlights the best element based on scoring algorithm
- Info panel shows element details (selector, size, position, colors)

### 2. Box Model Visualization ✅
**Test:**
- Hover over elements with padding/margin
- Look for colored overlays:
  - Red: Element border
  - Green: Padding area
  - Orange: Margin area

**Expected:** Chrome DevTools-like box model visualization

### 3. Screenshot Capture ✅
**Test:**
- Click on an element to capture it
- UI elements automatically hide before capture
- Screenshot is taken cleanly without overlays

**Expected:** Clean screenshot capture with success toast message

### 4. Basic Keyboard Navigation ✅
**Test:**
- Click on an element to select it
- Use working keyboard shortcuts:
  - `Arrow Keys`: Navigate between siblings and parent/child
  - `Tab`: Navigate to next focusable element
  - `Enter`: Select the hovered element
  - `Escape`: Exit Visual Bug Reporter

**Expected:** Element selection moves with keyboard navigation

### 5. GitHub Issue Generation with AI ✅
**Test:**
- Capture an element
- Fill in the bug description form
- Click "Generate Issue"
- If Chrome AI is enabled: AI generates title and enhanced description
- If not: Smart fallback generates appropriate title

**Expected:** Professional GitHub issue with all context

### 6. Framework Detection ✅
**Test:**
- Use on React, Vue, or Angular sites
- Check captured element data
- Framework-specific data is captured (React props, Vue data, etc.)

**Expected:** Console shows detected framework and relevant data

### 7. Accessibility Analysis ✅
**Test:**
- Select text elements
- Check the info panel for:
  - Color contrast ratios
  - ARIA properties
  - Role information

**Expected:** WCAG compliance information displayed

## Features NOT YET Working (Documented but TODO)

### ❌ Persistent Tooltip Mode (Ctrl+Alt)
**Status:** Code infrastructure exists but not activated
**Current:** Tooltip disappears on mouse move

### ❌ Advanced Keyboard Shortcuts
**Status:** NOT IMPLEMENTED
- `P` for performance overlay
- `E` for CSS editor
- `I` for info panel tabs
- `C` for copy element data
- `S` for screenshot element

### ❌ Annotation Tools
**Status:** TODO placeholders in code
- No drawing tools
- No arrow/circle/text annotations
- No color picker
- No measurement tool

### ❌ CSS Live Editor
**Status:** Infrastructure partially exists, not functional

### ❌ Performance Overlay Display
**Status:** Metrics are collected but not displayed visually

## Testing AI Analysis

### Enable Chrome AI
1. Go to `chrome://flags`
2. Enable these flags:
   - `#prompt-api-for-gemini-nano`
   - `#summarization-api-for-gemini-nano`
   - `#optimization-guide-on-device-model`
3. Restart Chrome
4. Go to `chrome://components`
5. Find "Optimization Guide On Device Model" and click "Check for update"
6. Wait for download (~1.5GB)

### Test AI Analysis
1. Open test page: `http://localhost:3000/test/test-logger.html`
2. Click buttons to trigger errors
3. Check console for analysis:
   - With AI: Detailed, context-aware suggestions
   - Without AI: Pattern-based analysis with location info

## Common Issues & Solutions

### Visual Bug Reporter Not Starting
- **Issue:** "Failed to start capture"
- **Solution:**
  1. Refresh the page
  2. Close and reopen DevTools
  3. Reload extension

### Tooltip Not Showing
- **Issue:** No tooltip on hover
- **Solution:**
  1. Check if capture mode is active
  2. Try clicking "Visual Capture" button again

### Keyboard Navigation Not Working
- **Issue:** Arrow keys don't move selection
- **Solution:**
  1. Click on an element first to focus
  2. Ensure no input field is focused

### Performance Overlay Missing
- **Issue:** Press P but no overlay
- **Solution:**
  1. Visual Bug Reporter must be active
  2. Try toggling with P key again

## Test Scenarios

### Scenario 1: Debug a Form
1. Navigate to a form page
2. Activate Visual Bug Reporter
3. Use multi-select to select all inputs
4. Check accessibility info for labels
5. Test tab navigation

### Scenario 2: Analyze Layout Issues
1. Find a complex layout (grid/flex)
2. Hover to see layout detection
3. Use breadcrumb to navigate structure
4. Check performance metrics

### Scenario 3: Find Performance Bottlenecks
1. Enable performance overlay
2. Interact with heavy elements
3. Watch for layout shifts
4. Check memory usage

### Scenario 4: Debug Broken Elements
1. Find error in console
2. Use Visual Bug Reporter to inspect
3. Check context detection
4. View related errors in info panel

## Validation Checklist

### Working Features ✅
- [x] Element info shows on hover
- [x] Smart element selection with scoring
- [x] Box model visualization (padding/margin)
- [x] Arrow keys navigate DOM (basic navigation)
- [x] Escape key exits selection
- [x] Screenshot capture works
- [x] GitHub issue generation works
- [x] AI analysis provides detailed errors (if enabled)
- [x] Pattern analysis works as fallback
- [x] Framework detection works
- [x] Accessibility info displayed

### Not Yet Implemented ❌
- [ ] Ctrl+Alt toggles persistent mode
- [ ] Ctrl+Click selects multiple (partial)
- [ ] P key shows performance overlay
- [ ] E key opens CSS editor
- [ ] I key opens tabbed info panel
- [ ] C key copies element data
- [ ] S key screenshots element
- [ ] Annotation tools
- [ ] Color picker
- [ ] Measurement tool
- [ ] Grid/Flex detection overlay
- [ ] Breadcrumb navigation bar

## Keyboard Shortcuts Summary

### Currently Working ✅
| Key | Action | Status |
|-----|--------|--------|
| `Arrow Keys` | Navigate DOM (parent/siblings/children) | ✅ Working |
| `Tab` | Next focusable element | ✅ Working |
| `Enter` | Select hovered element | ✅ Working |
| `Escape` | Exit Visual Bug Reporter | ✅ Working |

### Planned but Not Implemented ❌
| Key | Action | Status |
|-----|--------|--------|
| `Ctrl+Alt` | Toggle persistent tooltip | ❌ TODO |
| `Ctrl+Click` | Multi-select elements | ⚠️ Partial |
| `P` | Performance overlay | ❌ TODO |
| `E` | CSS editor | ❌ TODO |
| `I` | Info panel tabs | ❌ TODO |
| `C` | Copy element data | ❌ TODO |
| `S` | Screenshot element | ❌ TODO |

## Expected Console Output

When working correctly, you should see:
```
[Visual Bug Reporter] Starting visual bug reporting mode
[Visual Bug Reporter] Element at click point: <element>
[Visual Bug Reporter] Starting element capture...
[Visual Bug Reporter] Element data collected: {element details}
[Visual Bug Reporter] Debug context collected: {debug info}
[Visual Bug Reporter] Screenshot received
[Visual Bug Reporter] Sending bug capture to bridge...
[Visual Bug Reporter] Bug capture message posted
```

For features NOT yet implemented, you would see:
```
// These TODO functions exist but don't do anything yet:
startAnnotation() - TODO: Implement annotation mode
startColorPicker() - TODO: Implement color picker
startMeasure() - TODO: Implement measurement tool
```

## Reporting Issues

If features don't work as expected:
1. Check browser console for errors
2. Verify extension is latest build
3. Test in incognito mode
4. Check if site has restrictive CSP

## Advanced Testing

### Memory Leak Detection
1. Enable performance overlay
2. Interact with page for 5 minutes
3. Watch memory usage trend

### Accessibility Audit
1. Select all interactive elements
2. Check ARIA properties
3. Verify contrast ratios
4. Test keyboard navigation

### Cross-Browser Testing
- Test in Chrome 128+
- Test with/without AI flags
- Test on different screen sizes
- Test with DevTools open/closed