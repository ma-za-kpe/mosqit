# Visual Bug Reporter Testing Guide

## Overview
The enhanced Visual Bug Reporter now includes Chrome DevTools-like features for advanced debugging.

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

## Testing the 10 New Features

### 1. Enhanced Tooltip with Accessibility Info
**Test:**
- Hover over any element
- Tooltip should show:
  - Element tag and classes
  - ARIA roles and properties
  - Color contrast ratio (for text)
  - Computed styles

**Expected:** Detailed tooltip with accessibility metrics

### 2. Persistent Tooltip Mode (Ctrl+Alt)
**Test:**
- Press `Ctrl+Alt` to toggle persistent mode
- Move mouse around
- Tooltip should stay visible for last hovered element

**Expected:** Tooltip remains visible until toggled off

### 3. Keyboard Navigation for DOM Traversal
**Test:**
- Click on an element to select it
- Use keyboard shortcuts:
  - `Arrow Up`: Navigate to parent
  - `Arrow Down`: Navigate to first child
  - `Arrow Left/Right`: Navigate between siblings
  - `Tab`: Next element in tab order
  - `Enter`: Inspect element
  - `Escape`: Exit selection

**Expected:** Blue highlight moves between elements

### 4. Multi-element Selection (Ctrl+Click)
**Test:**
- Hold `Ctrl` and click multiple elements
- Selected elements should be highlighted in orange
- Right-click for "Select all similar" option

**Expected:** Multiple elements selected simultaneously

### 5. Performance Metrics Overlay
**Test:**
- Press `P` key to toggle performance overlay
- Should show in top-right corner:
  - Memory usage
  - Paint timings
  - Layout shifts
  - FPS counter

**Expected:** Real-time performance metrics display

### 6. CSS Editor Integration
**Test:**
- Select an element
- Press `E` key to open CSS editor
- Modify styles in the editor
- Changes apply in real-time

**Expected:** Live CSS editing panel appears

### 7. Smart Context Detection
**Test various scenarios:**
- Hover over form with validation errors
- Hover over broken images
- Hover over elements with console errors

**Expected:** Context-aware information in tooltip

### 8. Enhanced Info Panel with Tabs
**Test:**
- Select an element and press `I` key
- Info panel should have tabs:
  - Styles: All CSS properties
  - Accessibility: ARIA tree
  - Performance: Render metrics
  - Context: Related errors/warnings

**Expected:** Tabbed panel with comprehensive info

### 9. Grid/Flexbox Detection
**Test:**
- Hover over grid or flexbox containers
- Should show:
  - Grid template columns/rows
  - Flex direction and properties
  - Visual overlay of grid lines

**Expected:** Layout type detection with visual guides

### 10. Breadcrumb Navigation
**Test:**
- Select a deeply nested element
- Breadcrumb bar shows DOM path
- Click breadcrumb items to navigate

**Expected:** Clickable breadcrumb trail at top of page

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

- [ ] Tooltip shows on hover
- [ ] Ctrl+Alt toggles persistent mode
- [ ] Arrow keys navigate DOM
- [ ] Ctrl+Click selects multiple
- [ ] P key shows performance overlay
- [ ] E key opens CSS editor
- [ ] Context detection works
- [ ] Info panel has 4 tabs
- [ ] Grid/Flex detection works
- [ ] Breadcrumb navigation works
- [ ] AI analysis provides detailed errors (if enabled)
- [ ] Pattern analysis works as fallback

## Keyboard Shortcuts Summary

| Key | Action |
|-----|--------|
| `Ctrl+Alt` | Toggle persistent tooltip |
| `Arrow Keys` | Navigate DOM |
| `Tab` | Next in tab order |
| `Enter` | Inspect element |
| `Escape` | Exit selection |
| `Ctrl+Click` | Multi-select |
| `P` | Performance overlay |
| `E` | CSS editor |
| `I` | Info panel |
| `C` | Copy element data |
| `S` | Screenshot element |

## Expected Console Output

When working correctly, you should see:
```
[Mosqit] Visual Bug Reporter initialized
[Mosqit] Visual capture mode activated
[Mosqit] Element selected: div.className
[Mosqit] Performance overlay enabled
[Mosqit] CSS Editor opened for element
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