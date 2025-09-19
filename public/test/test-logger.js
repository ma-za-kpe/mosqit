/* eslint-disable @typescript-eslint/no-unused-vars */
// Functions in this file are called from HTML onclick handlers

// Load React for dependency detection test
window.React = { version: '18.3.1' };

const output = document.getElementById('output');

function log(message) {
    output.textContent += message + '\n\n';
    console.log('UI Update:', message);
}

// Test basic logging
function testBasicLog() {
    console.log('Basic log message', { data: 'test object' });
    log('✓ Basic log sent - check DevTools');
}

function testWarning() {
    console.warn('Warning: Deprecated API usage');
    log('⚠ Warning sent - AI should analyze this');
}

function testError() {
    console.error('Error: Component render failed');
    log('❌ Error sent - AI should provide fix suggestion');
}

// Test null reference (common React error)
function testNullReference() {
    try {
        const user = null;
        console.log(user.name); // TypeError
    } catch (e) {
        console.error('Null reference error:', e.message, e);
        // Also log to Mosqit for analysis
        if (window.mosqit && window.mosqit.log) {
            window.mosqit.log('error', `Null reference error: ${e.message}`, e);
        }
        log('❌ Null reference error triggered\nExpected AI analysis: "Null reference error at test-logger.html:XX. Check parent component props or add null checks."');
    }
}

// Test undefined variable
function testUndefinedVariable() {
    try {
        console.log(undefinedVariable); // ReferenceError
    } catch (e) {
        console.error('Undefined variable error:', e.message, e);
        if (window.mosqit && window.mosqit.log) {
            window.mosqit.log('error', `Undefined variable error: ${e.message}`, e);
        }
        log('❌ Undefined variable error triggered\nExpected AI analysis: "Undefined variable at test-logger.html:XX. Verify imports and variable declarations."');
    }
}

// Test DOM-related error
function testDOMError() {
    try {
        const button = document.querySelector('.non-existent-button');
        button.addEventListener('click', () => {}); // TypeError
    } catch (e) {
        console.error('DOM manipulation error:', e.message, e);
        if (window.mosqit && window.mosqit.log) {
            window.mosqit.log('error', `DOM manipulation error: ${e.message}`, e);
        }
        log('❌ DOM error triggered\nExpected AI analysis: "UI-related error. DOM element may have event handler issues."');
    }
}

// Test async error
async function testAsyncError() {
    Promise.reject(new Error('Network request failed'));
    log('❌ Async rejection triggered\nCheck for "Unhandled Promise Rejection" in logs');
}

// Test submit handler error
function handleSubmit() {
    try {
        const formData = undefined;
        formData.validate(); // TypeError
    } catch (e) {
        console.error('Form submission failed:', e);
        if (window.mosqit && window.mosqit.log) {
            window.mosqit.log('error', `Form submission failed: ${e.message}`, e);
        }
        log('❌ Submit handler error\nAI should link this to the submit button');
    }
}

// Test recurring error detection
let errorCount = 0;
function testRecurringError() {
    errorCount++;
    try {
        // Same error type and message to trigger pattern detection
        throw new TypeError('Cannot read property of null');
    } catch (e) {
        console.error('TypeError: Cannot read property of null', e);
        if (window.mosqit && window.mosqit.log) {
            window.mosqit.log('error', 'TypeError: Cannot read property of null', e);
        }
        if (errorCount >= 3) {
            log(`❌ Recurring error triggered ${errorCount} times\nExpected: Pattern detection should identify this as recurring at the same location`);
            setTimeout(() => {
                log('Check logs now to see the recurring pattern detection');
                errorCount = 0;
            }, 100);
        } else {
            log(`❌ Error ${errorCount}/3 triggered - same TypeError each time`);
        }
    }
}

// Test framework detection
function testFrameworkDetection() {
    console.log('Testing dependency detection...');
    if (window.mosqit && window.mosqit.log) {
        window.mosqit.log('info', 'Testing dependency detection...');
    }
    log('📦 Dependencies should include: react@18.3.1');
}

// Setup Mosqit communication bridge
let mosqitReady = false;
window.mosqit = null;

// Listen for Mosqit messages
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'MOSQIT_READY') {
        mosqitReady = true;
        // Create mosqit API using postMessage
        window.mosqit = {
            log: (level, message, error) => {
                // Send log request to content script
                window.postMessage({
                    type: 'MOSQIT_REQUEST',
                    action: 'LOG',
                    level: level,
                    message: message,
                    error: error ? {
                        message: error.message,
                        stack: error.stack
                    } : null
                }, '*');
            },
            getLogs: () => {
                return new Promise((resolve) => {
                    const listener = (e) => {
                        if (e.data && e.data.type === 'MOSQIT_RESPONSE' && e.data.action === 'GET_LOGS') {
                            window.removeEventListener('message', listener);
                            resolve(e.data.data || []);
                        }
                    };
                    window.addEventListener('message', listener);
                    window.postMessage({ type: 'MOSQIT_REQUEST', action: 'GET_LOGS' }, '*');
                });
            },
            clearLogs: () => {
                window.postMessage({ type: 'MOSQIT_REQUEST', action: 'CLEAR_LOGS' }, '*');
            },
            getErrorPatterns: () => {
                return new Promise((resolve) => {
                    const listener = (e) => {
                        if (e.data && e.data.type === 'MOSQIT_RESPONSE' && e.data.action === 'GET_ERROR_PATTERNS') {
                            window.removeEventListener('message', listener);
                            resolve(new Map(e.data.data || []));
                        }
                    };
                    window.addEventListener('message', listener);
                    window.postMessage({ type: 'MOSQIT_REQUEST', action: 'GET_ERROR_PATTERNS' }, '*');
                });
            },
            aiAvailable: false
        };
        console.log('✅ Mosqit bridge established');
    }
});

// Diagnostic function to check Mosqit status
async function checkMosqitStatus() {
    output.textContent = ''; // Clear output

    log('=== MOSQIT STATUS CHECK ===');
    log(`Mosqit loaded? ${mosqitReady ? '✅ YES' : '❌ NO'}`);

    if (mosqitReady && window.mosqit) {
        const logs = await window.mosqit.getLogs();
        log(`Total logs captured: ${logs.length}`);

        // Check error patterns
        const patterns = await window.mosqit.getErrorPatterns();
        log(`Error patterns tracked: ${patterns.size}`);

        // Check if AI is available
        log(`AI Available: ${window.mosqit.aiAvailable ? '✅' : '❌'}`);

        // Test that mosqit is actively logging
        console.log('Test log from diagnostic');
        if (window.mosqit.log) {
            window.mosqit.log('log', 'Test log from diagnostic');
        }
        setTimeout(async () => {
            const newLogs = await window.mosqit.getLogs();
            log(`After test log: ${newLogs.length} logs`);
        }, 100);
    } else {
        log('❌ Mosqit is NOT loaded on this page');
        log('Possible issues:');
        log('1. Extension not installed/enabled');
        log('2. Content script not injected');
        log('3. "Allow access to file URLs" not enabled');
        log('');
        log('Try refreshing the page after checking extension settings.');
    }
}

// Function to view captured logs with analysis
async function viewCapturedLogs() {
    output.textContent = ''; // Clear output

    if (!mosqitReady || !window.mosqit) {
        log('❌ Mosqit not loaded - cannot view logs');
        return;
    }

    const logs = await window.mosqit.getLogs();
    log(`=== CAPTURED LOGS (${logs.length} total) ===`);

    if (logs.length === 0) {
        log('No logs captured yet. Try triggering some errors first.');
        return;
    }

    // Show last 5 logs
    log('\n📋 LAST 5 LOGS:');
    logs.slice(-5).forEach((logEntry, index) => {
        const num = logs.length - 5 + index + 1;
        log(`\n--- Log #${num} ---`);
        log(`📝 Message: ${logEntry.message}`);
        log(`📊 Level: ${logEntry.level}`);
        log(`📁 File: ${logEntry.file || 'unknown'}`);
        log(`📍 Line: ${logEntry.line || 'unknown'}`);

        if (logEntry.analysis) {
            log(`🤖 AI Analysis: ${logEntry.analysis}`);
        } else if (logEntry.level === 'error') {
            log(`⚠️ No AI analysis (fallback should have run)`);
        }

        if (logEntry.dependencies && logEntry.dependencies.length > 0) {
            log(`📦 Dependencies: ${logEntry.dependencies.join(', ')}`);
        }

        if (logEntry.domNode) {
            log(`🎯 DOM Node: <${logEntry.domNode.tag}${logEntry.domNode.id ? ` id="${logEntry.domNode.id}"` : ''}>`);
        }

        if (logEntry.patterns && logEntry.patterns.length > 0) {
            log(`🔄 Patterns: ${logEntry.patterns.join(', ')}`);
        }
    });

    // Show error summary
    const errors = logs.filter(l => l.level === 'error');
    if (errors.length > 0) {
        log(`\n=== ERROR SUMMARY (${errors.length} errors) ===`);
        const lastError = errors[errors.length - 1];
        log('Last error:');
        log(`  Message: ${lastError.message}`);
        log(`  Analysis: ${lastError.analysis || 'No analysis available'}`);
    }
}

// Test window error event
function triggerWindowError() {
    setTimeout(() => {
        throw new Error('Uncaught window error');
    }, 100);
}

// Chrome AI Functions
async function checkChromeAI() {
    output.textContent = ''; // Clear output
    log('=== CHROME AI STATUS CHECK ===\n');

    // Check Chrome version first
    const userAgent = navigator.userAgent;
    const chromeVersion = userAgent.match(/Chrome\/(\d+)/)?.[1];
    log(`📌 Your Chrome version: ${chromeVersion || 'Unknown'}`);

    if (chromeVersion && parseInt(chromeVersion) < 128) {
        log('⚠️ Chrome 128+ required for AI features');
        log('Your version is too old. Please update Chrome or install Canary.\n');
    }

    // Check if AI namespace exists
    if (!('ai' in self) && !('model' in self) && !('translation' in self)) {
        log('❌ AI APIs not detected in window/self object\n');

        log('🔧 TROUBLESHOOTING STEPS:');
        log('1. Did you restart Chrome COMPLETELY? (not just close tabs)');
        log('   - On Windows: Check system tray, exit Chrome completely');
        log('   - On Mac: Cmd+Q to fully quit Chrome');
        log('   - Then reopen Chrome\n');

        log('2. Verify ALL required flags are enabled:');
        log('   📍 Go to: chrome://flags');
        log('   ✅ "optimization-guide-on-device-model" → "Enabled BypassPerfRequirement"');
        log('   ✅ "prompt-api-for-gemini-nano" → "Enabled"');
        log('   ✅ "prompt-api-for-gemini-nano-multimodal-input" → "Enabled"\n');

        log('3. Alternative: Install Chrome Canary (works out of the box):');
        log('   🔗 https://www.google.com/chrome/canary/\n');

        log('4. Check chrome://version to verify you have Chrome 128+');
        log('5. Check chrome://on-device-internals for model status');

        // Check for alternative API locations
        log('\n🔍 Checking alternative API locations...');
        log(`window.ai exists: ${'ai' in window}`);
        log(`self.ai exists: ${'ai' in self}`);
        log(`globalThis.ai exists: ${'ai' in globalThis}`);

        return;
    }

    log('✅ AI namespace exists\n');

    // Check each API
    log('📊 API Availability:');
    log(`  Language Model: ${self.ai?.languageModel ? '✅' : '❌'}`);
    log(`  Summarizer: ${self.ai?.summarizer ? '✅' : '❌'}`);
    log(`  Writer: ${self.ai?.writer ? '✅' : '❌'}`);
    log(`  Rewriter: ${self.ai?.rewriter ? '✅' : '❌'}`);

    // Check model capabilities
    if (self.ai?.languageModel) {
        try {
            const capabilities = await self.ai.languageModel.capabilities();
            log('\n🔍 Model Status:');
            log(`  Available: ${capabilities.available}`);

            if (capabilities.available === 'readily') {
                log('  ✅ Model is ready to use!');
                log('  You can now test AI analysis');
            } else if (capabilities.available === 'after-download') {
                log('  ⏳ Model needs to download (2GB)');
                log('  Click "Force AI Model Download" to start');
            } else {
                log('  ❌ Model not available on this device');
                log('  Fallback analysis will be used');
            }

            // Show additional capabilities
            if (capabilities.defaultTemperature !== undefined) {
                log(`\n⚙️ Model Configuration:`);
                log(`  Default Temperature: ${capabilities.defaultTemperature}`);
                log(`  Default Top K: ${capabilities.defaultTopK}`);
                log(`  Max Top K: ${capabilities.maxTopK}`);
            }
        } catch (error) {
            log(`\n❌ Error checking capabilities: ${error.message}`);
        }
    }
}

async function testChromeAI() {
    output.textContent = ''; // Clear output
    log('=== TESTING CHROME AI ANALYSIS ===\n');

    // Check for Writer API (EPP feature)
    if (typeof Writer !== 'undefined') {
        log('✅ Writer API detected (EPP feature)\n');

        try {
            const availability = await Writer.availability();
            log(`Writer availability: ${availability}`);

            if (availability === 'downloadable') {
                log('📥 Triggering model download...');
                log('This will take 3-5 minutes for 2GB download\n');

                const writer = await Writer.create({
                    outputLanguage: 'en',
                    tone: 'neutral',
                    format: 'plain-text'
                });

                log('✅ Model download initiated!');
                log('Testing Writer API...\n');

                const result = await writer.write(
                    "Analyze this error: TypeError Cannot read null at line 42",
                    { context: "This is a React component error in production" }
                );

                log('Writer API Response:');
                log(result);

                writer.destroy();
                log('\n🎉 Writer API is working! Perfect for error analysis.');

            } else if (availability === 'available') {
                log('✅ Model is ready!\n');

                const writer = await Writer.create({
                    outputLanguage: 'en',
                    tone: 'neutral',
                    format: 'plain-text'
                });

                const result = await writer.write(
                    "Analyze this error: TypeError Cannot read null at line 42",
                    { context: "This is a React component error" }
                );

                log('Writer API Response:');
                log(result);
                writer.destroy();
            }
        } catch (error) {
            log(`❌ Writer API Error: ${error.message}`);
        }

        return;
    }

    // Fallback to Prompt API
    if (!self.ai?.languageModel) {
        log('❌ Chrome AI not available');
        log('Enable AI first using the setup guide');
        return;
    }

    try {
        const capabilities = await self.ai.languageModel.capabilities();
        if (capabilities.available !== 'readily') {
            log('⏳ AI model not ready yet');
            log(`Current status: ${capabilities.available}`);
            return;
        }

        log('🤖 Creating AI session...');
        const session = await self.ai.languageModel.create({
            systemPrompt: 'You are a debugging assistant. Analyze errors concisely.',
            temperature: 0.2,
            topK: 5
        });

        // Test with a sample error
        const testError = `Analyze this error:
TypeError: Cannot read properties of null (reading 'name')
at UserProfile.js:42
in React component render method`;

        log('📝 Sending test error to AI...');
        const response = await session.prompt(testError);

        log('\n✅ AI Response:');
        log(response);

        session.destroy();
        log('\n✨ AI is working! Mosqit will now use AI for error analysis.');

    } catch (error) {
        log(`❌ AI Error: ${error.message}`);
        if (error.message.includes('session rate limit')) {
            log('⚠️ Rate limited. Wait a moment and try again.');
        }
    }
}

async function forceAIDownload() {
    output.textContent = ''; // Clear output
    log('=== FORCING AI MODEL DOWNLOAD ===\n');

    if (!self.ai?.languageModel) {
        log('❌ AI API not available');
        log('Enable Chrome AI flags first');
        return;
    }

    try {
        log('📥 Attempting to trigger model download...');
        log('This will download ~2GB Gemini Nano model\n');
        log('📍 Monitor progress at: chrome://on-device-internals\n');

        const session = await self.ai.languageModel.create({
            monitor(m) {
                m.addEventListener('downloadprogress', e => {
                    const percent = Math.round(e.loaded * 100);
                    log(`⬇️ Download Progress: ${percent}%`);
                });
            }
        });

        log('\n✅ Download triggered successfully!');
        log('The model is downloading in the background.');
        log('This may take 5-10 minutes depending on your connection.\n');

        // Try to use it
        try {
            const result = await session.prompt('Test');
            log('\n🎉 Model is already ready! Test successful.');
            log('Result: ' + result);
        } catch (e) {
            log('\n⏳ Model still downloading...');
            log('Error: ' + e.message);
        }

        session.destroy();

    } catch (error) {
        if (error.message.includes('not ready')) {
            log('⏳ Model is downloading...');
            log('Check chrome://on-device-internals for status');
        } else {
            log(`❌ Error: ${error.message}`);
        }
    }
}

function showAISetupGuide() {
    output.textContent = ''; // Clear output
    log('=== CHROME AI SETUP GUIDE ===\n');

    log('📋 QUICK SETUP (Recommended):\n');
    log('1️⃣ Install Chrome Canary (has AI features by default):');
    log('   https://www.google.com/chrome/canary/\n');

    log('2️⃣ Or, in your current Chrome (v128+):');
    log('   a. Open: chrome://flags');
    log('   b. Enable ALL these flags:');
    log('\n   🔴 REQUIRED FLAGS:');
    log('      • "optimization-guide-on-device-model" → "Enabled BypassPerfRequirement"');
    log('      • "prompt-api-for-gemini-nano" → "Enabled"');
    log('      • "prompt-api-for-gemini-nano-multimodal-input" → "Enabled"');
    log('\n   🟡 OPTIONAL FLAGS (Enable if available):');
    log('      • "summarization-api-for-gemini-nano" → "Enabled with Adaptation"');
    log('      • "writer-api-for-gemini-nano" → "Enabled"');
    log('      • "rewriter-api-for-gemini-nano" → "Enabled"');
    log('      • "proofreader-api-for-gemini-nano" → "Enabled"');
    log('   c. Click "Relaunch" button\n');

    log('3️⃣ After restart:');
    log('   a. Click "🤖 Check Chrome AI Status" to verify');
    log('   b. Click "⬇️ Force AI Model Download" to trigger download');
    log('   c. Monitor at: chrome://on-device-internals');
    log('   d. Wait 3-5 minutes for 2GB Gemini Nano download');
    log('   e. Click "🧪 Test AI Analysis" to confirm\n');

    log('📝 NOTES:');
    log('• Requires Chrome 128+ (check: chrome://version)');
    log('• Works on Windows 10+, macOS 13+, Linux 64-bit');
    log('• Needs 4GB free disk space for model');
    log('• Internet required for initial download\n');

    log('⚡ IMPORTANT:');
    log('• Mosqit works WITHOUT AI using fallback analysis');
    log('• AI enhances analysis but is not required');
    log('• Your debugging still works while AI downloads\n');

    log('🔗 Useful Links:');
    log('• Chrome AI Docs: https://developer.chrome.com/docs/ai');
    log('• Chrome Canary: https://www.google.com/chrome/canary/');
    log('• Chrome Flags: chrome://flags');
}

// Check on-device model status
async function checkOnDeviceStatus() {
    output.textContent = ''; // Clear output
    log('=== ON-DEVICE MODEL STATUS ===\n');

    log('📍 To check detailed model status:');
    log('1. Open new tab: chrome://on-device-internals');
    log('2. Check "Model Status" tab for errors');
    log('3. Check "Event Logs" tab for download progress\n');

    log('⚠️ IMPORTANT: Gemini Nano model info:');
    log('• Size: ~2GB (exact size varies)');
    log('• Downloads on first API use, NOT when flags enabled');
    log('• Stored in Chrome profile directory');
    log('• Auto-removed if <10GB free space\n');

    log('🔍 If model not downloading:');
    log('• Ensure 22GB+ free space');
    log('• Check GPU has >4GB VRAM');
    log('• Use unmetered connection');
    log('• Try Chrome Canary instead\n');

    // Try to check availability without triggering download
    if (self.ai?.languageModel) {
        try {
            const caps = await self.ai.languageModel.capabilities();
            log('✅ API Check Results:');
            log(`• Availability: ${caps.available}`);
            log(`• Language: ${caps.defaultLanguage || 'en'}`);

            if (caps.available === 'readily') {
                log('\n🎉 Model is ready to use!');
            } else if (caps.available === 'after-download') {
                log('\n📥 Model needs download. Click "Force AI Model Download"');
            } else {
                log('\n❌ Model not available on this device');
            }
        } catch (e) {
            log(`❌ Error checking: ${e.message}`);
        }
    } else {
        log('❌ AI APIs not enabled. Check flags and restart Chrome.');
    }
}

// EPP Writer API Functions
async function checkWriterAPI() {
    output.textContent = ''; // Clear output
    log('=== WRITER API STATUS CHECK ===\n');

    if (typeof Writer === 'undefined') {
        log('❌ Writer API not available');
        log('\n📝 To enable Writer API:');
        log('1. You need Chrome Canary 129+ (EPP feature)');
        log('2. Enable flag: chrome://flags/#writer-api-for-gemini-nano');
        log('3. Restart Chrome completely\n');
        log('Note: Writer API is for Early Preview Program members');
        return;
    }

    log('✅ Writer API is available!\n');

    try {
        const availability = await Writer.availability({ outputLanguage: 'en' });
        log(`📊 Writer Model Status: ${availability}\n`);

        if (availability === 'downloadable') {
            log('📥 Model needs to be downloaded (2GB)');
            log('Click "📥 Download Writer Model" to start');
        } else if (availability === 'downloading') {
            log('⏳ Model is currently downloading...');
            log('This takes 3-5 minutes. Please wait.');
        } else if (availability === 'available') {
            log('🎉 Model is ready to use!');
            log('You can now test Writer and Rewriter APIs');
        } else {
            log('❓ Unknown status. Try downloading anyway.');
        }

        // Check Rewriter too
        if (typeof Rewriter !== 'undefined') {
            const rewriterAvail = await Rewriter.availability({ outputLanguage: 'en' });
            log(`\n📊 Rewriter Model Status: ${rewriterAvail}`);
        }
    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
}

async function triggerWriterDownload() {
    output.textContent = ''; // Clear output
    log('=== TRIGGERING WRITER MODEL DOWNLOAD ===\n');

    if (typeof Writer === 'undefined') {
        log('❌ Writer API not available. Enable it first.');
        return;
    }

    try {
        log('📥 Starting model download (2GB)...');
        log('This will take 3-5 minutes\n');

        const writer = await Writer.create({
            outputLanguage: 'en',
            tone: 'neutral',
            format: 'plain-text',
            monitor(m) {
                m.addEventListener('downloadprogress', e => {
                    const percent = Math.round(e.loaded * 100);
                    log(`⬇️ Download Progress: ${percent}%`);
                });
            }
        });

        log('\n✅ Download triggered successfully!');
        log('Testing with a simple write...\n');

        try {
            const result = await writer.write("Hello world");
            log('🎉 Model is ready! Test result:');
            log(result);
        } catch (e) {
            log('⏳ Model still downloading or processing...');
            log('Wait a few minutes and check status again');
        }

        writer.destroy();
    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
}

async function testWriterAPI() {
    output.textContent = ''; // Clear output
    log('=== TESTING WRITER API ===\n');

    if (typeof Writer === 'undefined') {
        log('❌ Writer API not available');
        return;
    }

    try {
        const writer = await Writer.create({
            outputLanguage: 'en',
            tone: 'formal',
            format: 'markdown',
            length: 'medium'
        });

        log('📝 Testing Writer API with debugging scenario...\n');

        const prompt = "Write a bug report for a TypeError where a React component tries to access user.name but user is null";
        log(`Prompt: ${prompt}\n`);

        const result = await writer.write(prompt, {
            context: "This is for a production bug tracking system"
        });

        log('✅ Writer API Result:');
        log('---');
        log(result);
        log('---');

        writer.destroy();
        log('\n🎉 Writer API test successful!');
    } catch (error) {
        log(`❌ Error: ${error.message}`);
        if (error.message.includes('not ready')) {
            log('Model may still be downloading. Check status first.');
        }
    }
}

async function testRewriterAPI() {
    output.textContent = ''; // Clear output
    log('=== TESTING REWRITER API ===\n');

    if (typeof Rewriter === 'undefined') {
        log('❌ Rewriter API not available');
        log('Enable flag: chrome://flags/#rewriter-api-for-gemini-nano');
        return;
    }

    try {
        const rewriter = await Rewriter.create({
            outputLanguage: 'en',
            tone: 'more-formal',
            format: 'plain-text',
            length: 'as-is'
        });

        const originalText = "app crashed. user is null. fix asap!!!";
        log(`Original: "${originalText}"\n`);

        const result = await rewriter.rewrite(originalText, {
            context: "Professional bug report"
        });

        log('✅ Rewriter API Result:');
        log('---');
        log(result);
        log('---');

        rewriter.destroy();
        log('\n🎉 Rewriter API test successful!');
    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
}

async function testWriterForErrors() {
    output.textContent = ''; // Clear output
    log('=== TESTING WRITER API FOR ERROR ANALYSIS ===\n');

    if (typeof Writer === 'undefined') {
        log('❌ Writer API not available');
        return;
    }

    try {
        const writer = await Writer.create({
            outputLanguage: 'en',
            tone: 'neutral',
            format: 'plain-text',
            length: 'short',
            sharedContext: 'You are analyzing JavaScript errors. Be concise and specific.'
        });

        // Test multiple error scenarios
        const errors = [
            "TypeError: Cannot read properties of null (reading 'name') at UserProfile.js:42",
            "ReferenceError: fetchData is not defined at api.js:15",
            "Unhandled Promise Rejection: Network request failed at fetch.js:89"
        ];

        for (const error of errors) {
            log(`\n🐛 Analyzing: ${error}\n`);

            const prompt = `Analyze this error and provide: 1) Root cause, 2) Fix suggestion. Error: ${error}`;

            const result = await writer.write(prompt, {
                context: "Frontend React application in production"
            });

            log('Analysis:');
            log(result);
            log('---');
        }

        writer.destroy();
        log('\n🎉 Error analysis with Writer API successful!');
        log('This is perfect for Mosqit\'s AI-powered debugging!');
    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Log initial message
    console.log('Mosqit Logger Test Page Loaded');
    console.log('Chrome AI Available:', 'ai' in self ? 'Yes' : 'No');

    // Show AI availability
    const output = document.getElementById('output');
    if ('ai' in self && self.ai?.languageModel) {
        output.textContent = '✅ Chrome AI APIs detected - Enhanced analysis available\n\n';
        output.textContent += 'Click "🤖 Check Chrome AI Status" for details\n\n';
    } else {
        output.textContent = '⚠️ Chrome AI not detected - Using Logcat-inspired fallback\n\n';
        output.textContent += 'Click "📚 Show AI Setup Guide" to enable AI (optional)\n\n';
    }
});