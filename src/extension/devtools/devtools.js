// Create Mosqit panel in Chrome DevTools
chrome.devtools.panels.create(
  "Mosqit",
  "icons/icon16.png",
  "panel.html",
  () => {
    console.log("Mosqit panel created");
  }
);