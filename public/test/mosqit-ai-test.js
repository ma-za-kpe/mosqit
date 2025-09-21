/**
 * Test Mosqit AI Integration
 */

async function testMosqitAI() {
  console.log('🦟 === TESTING MOSQIT AI INTEGRATION ===');

  // Check if Mosqit is loaded
  if (typeof window.mosqit === 'undefined') {
    console.error('❌ Mosqit not loaded! Check extension installation.');
    return;
  }

  // Check AI availability
  const aiAvailable = window.mosqit.aiAvailable();
  console.log(`🦟 Mosqit AI Available: ${aiAvailable ? '✅ Yes' : '❌ No'}`);

  // Generate test errors to trigger AI analysis
  console.log('\n🦟 Triggering test errors for AI analysis...\n');

  // Test 1: Null reference error
  setTimeout(() => {
    console.error('TypeError: Cannot read properties of null (reading "name")');
  }, 100);

  // Test 2: Undefined function
  setTimeout(() => {
    console.error('TypeError: user.validate is not a function');
  }, 200);

  // Test 3: Network error
  setTimeout(() => {
    console.error('Failed to fetch: Network request failed with status 404');
  }, 300);

  // Test 4: Promise rejection
  setTimeout(() => {
    Promise.reject(new Error('Async operation failed: Database connection timeout'));
  }, 400);

  // Test 5: DOM error
  setTimeout(() => {
    console.error('Cannot read property "addEventListener" of null - Element #submit-btn not found');
  }, 500);

  // Check logs after a delay
  setTimeout(() => {
    const logs = window.mosqit.getLogs();
    console.log(`\n🦟 Captured ${logs.length} logs`);

    // Check for AI analysis
    const logsWithAI = logs.filter(log => log.analysis && log.analysis.includes('🤖'));
    const logsWithPatterns = logs.filter(log => log.analysis && !log.analysis.includes('🤖'));

    console.log(`🦟 Logs with AI analysis: ${logsWithAI.length}`);
    console.log(`🦟 Logs with pattern analysis: ${logsWithPatterns.length}`);

    if (logsWithAI.length > 0) {
      console.log('\n✅ AI Analysis Examples:');
      logsWithAI.slice(0, 3).forEach(log => {
        console.log(`  ${log.level}: ${log.message.substring(0, 50)}...`);
        console.log(`  📍 ${log.file}:${log.line}`);
        console.log(`  ${log.analysis}\n`);
      });
    }

    if (logsWithPatterns.length > 0 && logsWithAI.length === 0) {
      console.log('\n⚠️ Using pattern-based analysis (AI not available)');
      console.log('Enable Chrome AI flags:');
      console.log('- chrome://flags/#prompt-api-for-gemini-nano');
      console.log('- chrome://flags/#writer-api-for-gemini-nano');
    }

    // Show error patterns
    const patterns = window.mosqit.getErrorPatterns();
    if (patterns.size > 0) {
      console.log('\n🦟 Error Patterns Detected:');
      patterns.forEach((count, location) => {
        console.log(`  ${location}: ${count} occurrences`);
      });
    }

    console.log('\n🦟 === TEST COMPLETE ===');
  }, 1000);
}

// Auto-run if called directly
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Add test button if on test page
    const button = document.createElement('button');
    button.textContent = '🦟 Test Mosqit AI';
    button.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; z-index: 10000;';
    button.onclick = testMosqitAI;
    document.body.appendChild(button);
  });
} else {
  // Add button immediately
  const button = document.createElement('button');
  button.textContent = '🦟 Test Mosqit AI';
  button.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; z-index: 10000;';
  button.onclick = testMosqitAI;
  document.body.appendChild(button);
}

// Export for use in other scripts
window.testMosqitAI = testMosqitAI;