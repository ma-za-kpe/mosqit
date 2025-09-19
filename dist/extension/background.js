// Mosqit Chrome Extension Background Script
console.log('Mosqit extension loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Mosqit extension installed');
});