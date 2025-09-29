/* eslint-disable @typescript-eslint/no-unused-vars */
// Chrome AI Download Monitor
// Functions in this file are called from HTML onclick handlers
let monitorInterval;
let startTime;
let lastStatus = '';

async function startDownloadMonitor() {
    output.textContent = ''; // Clear output
    log('=== CHROME AI DOWNLOAD MONITOR ===\n');
    log('📊 Starting real-time download monitoring...\n');
    log('Press "Stop Monitor" to end monitoring\n');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    startTime = Date.now();
    lastStatus = '';

    // Clear any existing interval
    if (monitorInterval) {
        clearInterval(monitorInterval);
    }

    // Check immediately
    await checkDownloadStatus();

    // Then check every 5 seconds
    monitorInterval = setInterval(async () => {
        await checkDownloadStatus();
    }, 5000);
}

async function checkDownloadStatus() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const timestamp = new Date().toLocaleTimeString();

    log(`[${timestamp}] Checking... (${elapsed}s elapsed)`);

    const statusObj = {};

    // Check Writer API
    if (typeof Writer !== 'undefined') {
        try {
            const status = await Writer.availability({ outputLanguage: 'en' });
            statusObj.writer = status;

            if (status !== lastStatus) {
                log(`\n🔔 STATUS CHANGE: ${lastStatus || 'initial'} → ${status}`);
                lastStatus = status;

                if (status === 'available') {
                    log('🎉 MODEL READY! Download complete!');
                    log('You can now use all Chrome AI APIs!');
                    stopDownloadMonitor();
                    celebrateDownload();
                    return;
                } else if (status === 'downloading') {
                    log('⬇️ Download in progress...');
                    log('Check folder size: %LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\OptimizationGuidePredictionModels');
                } else if (status === 'downloadable') {
                    log('💤 Model not downloading yet. Click "Download Writer Model" to start.');
                }
            }
        } catch (e) {
            log(`  Writer API error: ${e.message}`);
        }
    } else {
        log('  ❌ Writer API not available');
    }

    // Also check other APIs
    if (typeof Rewriter !== 'undefined') {
        try {
            const status = await Rewriter.availability({ outputLanguage: 'en' });
            statusObj.rewriter = status;
        } catch (e) {}
    }

    if (self.ai?.languageModel) {
        try {
            const caps = await self.ai.languageModel.capabilities();
            statusObj.prompt = caps.available;
        } catch (e) {}
    }

    if (self.ai?.summarizer) {
        try {
            const caps = await self.ai.summarizer.capabilities();
            statusObj.summarizer = caps.available;
        } catch (e) {}
    }

    // Show all statuses
    const statuses = Object.entries(statusObj).map(([api, status]) => `${api}: ${status}`).join(', ');
    if (statuses) {
        log(`  Status: ${statuses}`);
    }

    log(''); // Empty line for readability
}

function stopDownloadMonitor() {
    if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
        log('\n⏹️ Monitor stopped\n');
    }
}

function celebrateDownload() {
    log('\n🎊🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊');
    log('  GEMINI NANO DOWNLOADED!');
    log('🎊🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊\n');
    log('You can now:');
    log('• Use Writer API for content generation');
    log('• Use Rewriter API for text revision');
    log('• Use Summarizer API for condensing text');
    log('• Use Prompt API for general AI tasks');
    log('• Test Mosqit AI Integration!');
}

// Quick status check (one-time)
async function quickStatusCheck() {
    output.textContent = ''; // Clear output
    log('=== QUICK DOWNLOAD STATUS CHECK ===\n');

    const apis = [
        { name: 'Writer', check: async () => typeof Writer !== 'undefined' ? await Writer.availability({ outputLanguage: 'en' }) : 'not available' },
        { name: 'Rewriter', check: async () => typeof Rewriter !== 'undefined' ? await Rewriter.availability({ outputLanguage: 'en' }) : 'not available' },
        { name: 'Prompt', check: async () => self.ai?.languageModel ? (await self.ai.languageModel.capabilities()).available : 'not available' },
        { name: 'Summarizer', check: async () => self.ai?.summarizer ? (await self.ai.summarizer.capabilities()).available : 'not available' }
    ];

    log('Checking all APIs...\n');

    let anyAvailable = false;
    for (const api of apis) {
        try {
            const status = await api.check();
            const emoji = status === 'available' ? '✅' : status === 'downloading' ? '⬇️' : status === 'downloadable' ? '💤' : '❌';
            log(`${emoji} ${api.name}: ${status}`);

            if (status === 'available') anyAvailable = true;
        } catch (e) {
            log(`❌ ${api.name}: error - ${e.message}`);
        }
    }

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (anyAvailable) {
        log('✅ Gemini Nano is READY! All APIs using this model will work.');
    } else {
        log('📝 Model not ready yet. Status meanings:');
        log('• downloadable = Ready to download, not started');
        log('• downloading = Currently downloading (3-5 mins)');
        log('• available = Ready to use!');
        log('\nTo start download: Click "📥 Download Writer Model"');
    }
}

// Check folder size (instructions only, can't access filesystem directly)
function checkFolderSize() {
    output.textContent = ''; // Clear output
    log('=== CHECK MODEL FOLDER SIZE ===\n');

    log('📁 To manually check download progress:\n');

    log('1️⃣ Open File Explorer');
    log('2️⃣ Press Win+R and paste:');
    log('   %LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\OptimizationGuidePredictionModels\n');

    log('3️⃣ Right-click the folder → Properties');
    log('4️⃣ Check "Size on disk":\n');

    log('📊 Size indicators:');
    log('• 0 KB = Not downloaded');
    log('• 1-100 MB = Starting download');
    log('• 500 MB - 1.5 GB = Downloading...');
    log('• ~2 GB = Download complete!\n');

    log('💡 TIP: The folder updates every few seconds during download');
    log('💡 TIP: You might see temp files in a "downloads" subfolder');
}

// Progress estimation based on time
async function estimateProgress() {
    output.textContent = ''; // Clear output
    log('=== DOWNLOAD PROGRESS ESTIMATION ===\n');

    if (typeof Writer === 'undefined') {
        log('❌ Writer API not available');
        return;
    }

    const status = await Writer.availability({ outputLanguage: 'en' });
    log(`Current status: ${status}\n`);

    if (status === 'downloading') {
        log('⬇️ Download in progress!\n');
        log('Typical download times:');
        log('• Fast connection (100+ Mbps): 2-3 minutes');
        log('• Medium connection (50 Mbps): 3-5 minutes');
        log('• Slow connection (10 Mbps): 10-15 minutes\n');

        log('📁 Check actual progress:');
        log('1. Open: %LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\OptimizationGuidePredictionModels');
        log('2. Check folder size (should grow to ~2GB)');
        log('3. Refresh folder view (F5) to see size updates\n');

        log('🔄 The download happens in background');
        log('You can continue using Chrome normally');
    } else if (status === 'available') {
        log('✅ Download complete! Model is ready!');
        log('Size should be ~2GB in the model folder');
    } else if (status === 'downloadable') {
        log('💤 Not downloading yet');
        log('Click "📥 Download Writer Model" to start');
    }
}

// Open chrome://on-device-internals in new tab
function openOnDeviceInternals() {
    log('Opening chrome://on-device-internals in new tab...');
    log('(You may need to manually copy and paste the URL)');

    // Try to copy to clipboard
    const url = 'chrome://on-device-internals';
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            log('✅ URL copied to clipboard! Paste in new tab.');
        }).catch(() => {
            log('📋 Copy this: chrome://on-device-internals');
        });
    } else {
        log('📋 Copy this: chrome://on-device-internals');
    }
}