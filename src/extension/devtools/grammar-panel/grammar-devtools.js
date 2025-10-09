/**
 * Grammar DevTools Registration
 * Registers the Grammar panel as a tab in Chrome DevTools
 */

// Create the Grammar panel
chrome.devtools.panels.create(
  'Writing',           // Panel title
  '',                  // Icon path (empty for now)
  'grammar-panel/grammar-panel.html',  // Panel HTML
  function(panel) {
    console.log('[Grammar DevTools] Panel created');

    // Panel shown event
    panel.onShown.addListener(function(window) {
      console.log('[Grammar DevTools] Panel shown');
    });

    // Panel hidden event
    panel.onHidden.addListener(function() {
      console.log('[Grammar DevTools] Panel hidden');
    });
  }
);

console.log('[Grammar DevTools] Grammar panel registered');
