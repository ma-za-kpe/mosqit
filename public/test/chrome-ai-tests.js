/* eslint-disable @typescript-eslint/no-unused-vars */
// Chrome AI APIs Comprehensive Test Functions
// Functions in this file are called from HTML onclick handlers

// Check all APIs at once
async function checkAllAPIs() {
    output.textContent = ''; // Clear output
    log('=== CHROME AI APIS STATUS CHECK ===\n');

    const apis = [
        { name: 'Writer API', check: () => typeof Writer !== 'undefined', availability: async () => await Writer.availability({ outputLanguage: 'en' }) },
        { name: 'Rewriter API', check: () => typeof Rewriter !== 'undefined', availability: async () => await Rewriter.availability({ outputLanguage: 'en' }) },
        { name: 'Summarizer API', check: () => typeof self.ai?.summarizer !== 'undefined', availability: async () => self.ai?.summarizer ? await self.ai.summarizer.capabilities() : null },
        { name: 'Prompt API', check: () => typeof self.ai?.languageModel !== 'undefined', availability: async () => self.ai?.languageModel ? await self.ai.languageModel.capabilities() : null },
        { name: 'Translator API', check: () => typeof self.translation !== 'undefined', availability: async () => self.translation ? 'checking...' : null },
        { name: 'Language Detector', check: () => typeof self.translation?.canDetect !== 'undefined', availability: async () => self.translation?.canDetect ? await self.translation.canDetect() : null }
    ];

    for (const api of apis) {
        const exists = api.check();
        log(`${api.name}: ${exists ? '✅' : '❌'}`);

        if (exists) {
            try {
                const status = await api.availability();
                if (status) {
                    log(`  Status: ${typeof status === 'object' ? status.available || JSON.stringify(status) : status}`);
                }
            } catch (e) {
                log(`  Error: ${e.message}`);
            }
        }
        log('');
    }

    log('\n📝 Summary:');
    log('• Gemini Nano APIs (Writer/Rewriter/Summarizer/Prompt) use the same 2GB model');
    log('• Translator/Language Detector use separate models');
    log('• Once Gemini Nano downloads, all 4 APIs work');
}

// Test Prompt API
async function testPromptAPI() {
    output.textContent = ''; // Clear output
    log('=== TESTING PROMPT API ===\n');

    if (!self.ai?.languageModel) {
        log('❌ Prompt API not available');
        log('Enable flag: chrome://flags/#prompt-api-for-gemini-nano');
        return;
    }

    try {
        const capabilities = await self.ai.languageModel.capabilities();
        log(`Status: ${capabilities.available}\n`);

        if (capabilities.available !== 'readily') {
            log('⏳ Model not ready. Download it first.');
            return;
        }

        const session = await self.ai.languageModel.create({
            systemPrompt: 'You are a helpful assistant. Be concise.'
        });

        const prompt = 'What causes a null pointer exception?';
        log(`Prompt: "${prompt}"\n`);

        const response = await session.prompt(prompt);
        log('✅ Prompt API Response:');
        log('---');
        log(response);
        log('---');

        session.destroy();
    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
}

// Test Summarizer API
async function testSummarizerAPI() {
    output.textContent = ''; // Clear output
    log('=== TESTING SUMMARIZER API ===\n');

    if (!self.ai?.summarizer) {
        log('❌ Summarizer API not available');
        log('Enable flag: chrome://flags/#summarization-api-for-gemini-nano');
        return;
    }

    try {
        const capabilities = await self.ai.summarizer.capabilities();
        log(`Status: ${capabilities.available}\n`);

        if (capabilities.available !== 'readily') {
            log('⏳ Model not ready. Download Gemini Nano first.');
            return;
        }

        const session = await self.ai.summarizer.create({
            type: 'tl;dr',
            format: 'plain-text',
            length: 'short'
        });

        const longText = `
        A null pointer exception occurs when a program attempts to use a reference that points to no location in memory (null)
        as though it's pointing to an object. This commonly happens in languages like Java when trying to access methods or
        properties of an object that hasn't been initialized. In JavaScript, this manifests as "Cannot read property of null"
        or "Cannot read property of undefined" errors. The root cause is usually forgetting to initialize an object,
        asynchronous code completing in unexpected order, or API responses not containing expected data.
        `;

        log('Summarizing error explanation...\n');

        const summary = await session.summarize(longText);
        log('✅ Summarizer API Result:');
        log('---');
        log(summary);
        log('---');

        session.destroy();
    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
}

// Test Translator API
async function testTranslatorAPI() {
    output.textContent = ''; // Clear output
    log('=== TESTING TRANSLATOR API ===\n');

    if (!self.translation) {
        log('❌ Translation API not available');
        log('Enable flag: chrome://flags/#translation-api');
        return;
    }

    try {
        // Check if translation is available
        const canTranslate = await self.translation.canTranslate({
            sourceLanguage: 'en',
            targetLanguage: 'es'
        });

        log(`Can translate EN→ES: ${canTranslate}\n`);

        if (canTranslate === 'no') {
            log('❌ Translation not available for this language pair');
            return;
        }

        if (canTranslate === 'after-download') {
            log('📥 Translator model needs download');
            log('Creating translator to trigger download...');
        }

        const translator = await self.translation.createTranslator({
            sourceLanguage: 'en',
            targetLanguage: 'es'
        });

        const text = 'Error: Cannot read property of null';
        log(`Original: "${text}"\n`);

        const translated = await translator.translate(text);
        log('✅ Translator API Result:');
        log(`Spanish: "${translated}"`);

        translator.destroy();
    } catch (error) {
        log(`❌ Error: ${error.message}`);
        if (error.message.includes('not supported')) {
            log('Note: Translator may require separate model download');
        }
    }
}

// Test Language Detector
async function testLanguageDetector() {
    output.textContent = ''; // Clear output
    log('=== TESTING LANGUAGE DETECTOR ===\n');

    if (!self.translation?.canDetect) {
        log('❌ Language Detection API not available');
        log('Enable flag: chrome://flags/#language-detection-api');
        return;
    }

    try {
        const canDetect = await self.translation.canDetect();
        log(`Can detect languages: ${canDetect}\n`);

        if (canDetect === 'no') {
            log('❌ Language detection not available');
            return;
        }

        if (canDetect === 'after-download') {
            log('📥 Detector model needs download');
        }

        const detector = await self.translation.createDetector();

        const samples = [
            'This is an error message',
            'Esto es un mensaje de error',
            'C\'est un message d\'erreur',
            'これはエラーメッセージです'
        ];

        for (const text of samples) {
            const results = await detector.detect(text);
            const topResult = results[0];
            log(`"${text}"`);
            log(`  → ${topResult.detectedLanguage} (${Math.round(topResult.confidence * 100)}% confidence)\n`);
        }

        detector.destroy();
    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
}

// Test streaming capabilities
async function testStreamingAPIs() {
    output.textContent = ''; // Clear output
    log('=== TESTING STREAMING OUTPUT ===\n');

    if (typeof Writer === 'undefined') {
        log('❌ Writer API not available for streaming test');
        return;
    }

    try {
        const writer = await Writer.create({
            outputLanguage: 'en',
            tone: 'neutral',
            format: 'plain-text'
        });

        log('📝 Testing streaming write...\n');
        log('Output: ');

        const stream = writer.writeStreaming(
            'Write a brief explanation of async/await errors',
            { context: 'For junior developers' }
        );

        let fullText = '';
        for await (const chunk of stream) {
            fullText += chunk;
            // Show chunks as they arrive
            log(chunk, false); // Don't add newline
        }

        log('\n\n✅ Streaming complete!');
        log(`Total length: ${fullText.length} characters`);

        writer.destroy();
    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
}

// Test API performance
async function testAPIPerformance() {
    output.textContent = ''; // Clear output
    log('=== TESTING API PERFORMANCE ===\n');

    const apis = [];

    // Add available APIs
    if (typeof Writer !== 'undefined') apis.push({ name: 'Writer', create: () => Writer.create({ outputLanguage: 'en' }), test: (api) => api.write('Test') });
    if (typeof Rewriter !== 'undefined') apis.push({ name: 'Rewriter', create: () => Rewriter.create({ outputLanguage: 'en' }), test: (api) => api.rewrite('Test') });
    if (self.ai?.languageModel) apis.push({ name: 'Prompt', create: () => self.ai.languageModel.create(), test: (api) => api.prompt('Test') });
    if (self.ai?.summarizer) apis.push({ name: 'Summarizer', create: () => self.ai.summarizer.create(), test: (api) => api.summarize('Test text') });

    if (apis.length === 0) {
        log('❌ No AI APIs available for testing');
        return;
    }

    for (const api of apis) {
        try {
            log(`Testing ${api.name} API...`);

            const startCreate = performance.now();
            const instance = await api.create();
            const createTime = performance.now() - startCreate;

            const startTest = performance.now();
            await api.test(instance);
            const testTime = performance.now() - startTest;

            log(`  ✅ Create: ${createTime.toFixed(2)}ms`);
            log(`  ✅ Execute: ${testTime.toFixed(2)}ms`);
            log(`  Total: ${(createTime + testTime).toFixed(2)}ms\n`);

            if (instance.destroy) instance.destroy();
        } catch (error) {
            log(`  ❌ Error: ${error.message}\n`);
        }
    }

    log('📊 Performance Summary:');
    log('• First API call includes model loading overhead');
    log('• Subsequent calls are much faster');
    log('• All APIs using Gemini Nano share the same model in memory');
}

// Test multiple APIs together
async function testMultipleAPIs() {
    output.textContent = ''; // Clear output
    log('=== TESTING MULTIPLE APIS TOGETHER ===\n');

    const errorText = "TypeError: Cannot read properties of null (reading 'user')";
    log(`Testing with error: "${errorText}"\n`);

    // Test Writer API
    if (typeof Writer !== 'undefined') {
        try {
            log('1️⃣ Writer API - Creating bug report...');
            const writer = await Writer.create({ outputLanguage: 'en' });
            const report = await writer.write(`Create a bug report for: ${errorText}`);
            log(`Result: ${report.substring(0, 100)}...\n`);
            writer.destroy();
        } catch (e) {
            log(`Writer failed: ${e.message}\n`);
        }
    }

    // Test Rewriter API
    if (typeof Rewriter !== 'undefined') {
        try {
            log('2️⃣ Rewriter API - Making it formal...');
            const rewriter = await Rewriter.create({ outputLanguage: 'en', tone: 'more-formal' });
            const formal = await rewriter.rewrite(errorText);
            log(`Result: ${formal}\n`);
            rewriter.destroy();
        } catch (e) {
            log(`Rewriter failed: ${e.message}\n`);
        }
    }

    // Test Summarizer API
    if (self.ai?.summarizer) {
        try {
            log('3️⃣ Summarizer API - Summarizing error...');
            const summarizer = await self.ai.summarizer.create();
            const summary = await summarizer.summarize(errorText + ' This occurs when attempting to access user data before it has been loaded from the API.');
            log(`Result: ${summary}\n`);
            summarizer.destroy();
        } catch (e) {
            log(`Summarizer failed: ${e.message}\n`);
        }
    }

    // Test Prompt API
    if (self.ai?.languageModel) {
        try {
            log('4️⃣ Prompt API - Analyzing error...');
            const session = await self.ai.languageModel.create();
            const analysis = await session.prompt(`What causes this error: ${errorText}`);
            log(`Result: ${analysis.substring(0, 100)}...\n`);
            session.destroy();
        } catch (e) {
            log(`Prompt failed: ${e.message}\n`);
        }
    }

    log('✅ Multi-API test complete!');
}

// Download all available models
async function downloadAllModels() {
    output.textContent = ''; // Clear output
    log('=== DOWNLOADING ALL AI MODELS ===\n');

    log('📥 Attempting to download all available models...\n');

    // Gemini Nano (shared by Writer, Rewriter, Summarizer, Prompt)
    if (typeof Writer !== 'undefined') {
        try {
            log('1️⃣ Downloading Gemini Nano (2GB)...');
            const writer = await Writer.create({
                outputLanguage: 'en',
                monitor(m) {
                    m.addEventListener('downloadprogress', e => {
                        log(`  Progress: ${Math.round(e.loaded * 100)}%`);
                    });
                }
            });
            await writer.write('test');
            writer.destroy();
            log('  ✅ Gemini Nano ready!\n');
        } catch (e) {
            log(`  ⏳ Download in progress or error: ${e.message}\n`);
        }
    }

    // Translator model
    if (self.translation) {
        try {
            log('2️⃣ Checking Translator model...');
            const canTranslate = await self.translation.canTranslate({
                sourceLanguage: 'en',
                targetLanguage: 'es'
            });

            if (canTranslate === 'after-download') {
                log('  Downloading translator model...');
                const translator = await self.translation.createTranslator({
                    sourceLanguage: 'en',
                    targetLanguage: 'es'
                });
                translator.destroy();
                log('  ✅ Translator model ready!\n');
            } else {
                log(`  Status: ${canTranslate}\n`);
            }
        } catch (e) {
            log(`  Error: ${e.message}\n`);
        }
    }

    // Language Detector model
    if (self.translation?.canDetect) {
        try {
            log('3️⃣ Checking Language Detector model...');
            const canDetect = await self.translation.canDetect();

            if (canDetect === 'after-download') {
                log('  Downloading detector model...');
                const detector = await self.translation.createDetector();
                detector.destroy();
                log('  ✅ Detector model ready!\n');
            } else {
                log(`  Status: ${canDetect}\n`);
            }
        } catch (e) {
            log(`  Error: ${e.message}\n`);
        }
    }

    log('📊 Summary:');
    log('• Gemini Nano (~2GB): Powers Writer, Rewriter, Summarizer, Prompt APIs');
    log('• Translator models: Separate per language pair');
    log('• Language Detector: Separate small model');
    log('\nModels download in background. Check status in a few minutes.');
}

// Test Mosqit integration with Chrome AI
async function testMosqitIntegration() {
    output.textContent = ''; // Clear output
    log('=== TESTING MOSQIT + CHROME AI INTEGRATION ===\n');

    log('🦟 Simulating Mosqit error capture and analysis...\n');

    // Simulate captured errors
    const errors = [
        {
            message: "TypeError: Cannot read properties of null (reading 'name')",
            file: 'src/components/UserProfile.js',
            line: 42,
            component: 'UserProfile'
        },
        {
            message: "ReferenceError: fetchUserData is not defined",
            file: 'src/api/users.js',
            line: 15,
            component: 'API Layer'
        },
        {
            message: "Unhandled Promise Rejection: Network request failed",
            file: 'src/utils/fetch.js',
            line: 89,
            component: 'Network Utils'
        }
    ];

    // Test with Writer API (best for structured output)
    if (typeof Writer !== 'undefined') {
        try {
            const writer = await Writer.create({
                outputLanguage: 'en',
                tone: 'neutral',
                format: 'plain-text',
                length: 'short',
                sharedContext: 'You are Mosqit, an AI debugging assistant. Analyze JavaScript errors concisely.'
            });

            log('🤖 Using Writer API for Logcat-style analysis:\n');

            for (const error of errors) {
                log(`\n━━━ Error Captured ━━━`);
                log(`📍 ${error.file}:${error.line}`);
                log(`❌ ${error.message}\n`);

                const prompt = `Analyze: ${error.message} at ${error.file}:${error.line}. Provide: 1) Error type 2) Root cause 3) Fix`;

                const analysis = await writer.write(prompt, {
                    context: `Component: ${error.component}, Production React app`
                });

                log('🔍 Mosqit AI Analysis:');
                log(analysis);
                log('━━━━━━━━━━━━━━━━━━━\n');
            }

            writer.destroy();

            log('✅ Mosqit + Chrome AI Integration Success!');
            log('\n📊 Benefits for Mosqit:');
            log('• Real-time error analysis (<100ms)');
            log('• Logcat-inspired structured output');
            log('• Context-aware debugging suggestions');
            log('• Pattern detection across errors');
            log('• Works offline with local AI');

        } catch (error) {
            log(`❌ Error: ${error.message}`);
            log('\n⚠️ Falling back to pattern-based analysis...');
            log('Mosqit still works without AI using smart patterns!');
        }
    } else {
        log('❌ Writer API not available');
        log('Mosqit would use fallback Logcat-inspired analysis');
    }
}

// Check model storage location
async function checkModelStorage() {
    output.textContent = ''; // Clear output
    log('=== CHROME AI MODEL STORAGE LOCATION ===\n');

    // Get Chrome profile path
    log('📁 Chrome stores AI models in your profile directory:\n');

    // Windows paths
    log('🪟 WINDOWS:');
    log('Primary location:');
    log('C:\\Users\\[USERNAME]\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\');
    log('└── OptimizationGuidePredictionModels\\');
    log('    └── [model_version_folders]\\');
    log('        └── model.tflite (the actual model file)\n');

    log('Your likely path:');
    log(`C:\\Users\\nampa\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\OptimizationGuidePredictionModels\\\n`);

    log('🍎 MAC:');
    log('~/Library/Application Support/Google/Chrome/Default/OptimizationGuidePredictionModels/\n');

    log('🐧 LINUX:');
    log('~/.config/google-chrome/Default/OptimizationGuidePredictionModels/\n');

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    log('📊 HOW TO CHECK MODEL FILES:\n');

    log('1️⃣ Via File Explorer:');
    log('   • Press Win+R, paste: %LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default');
    log('   • Look for "OptimizationGuidePredictionModels" folder');
    log('   • Check folder size (should be ~2GB when downloaded)\n');

    log('2️⃣ Via Command Line:');
    log('   Open CMD/PowerShell and run:');
    log('   dir "%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\OptimizationGuidePredictionModels"\n');

    log('3️⃣ Via Chrome Internal Pages:');
    log('   • chrome://version/ → Shows profile path');
    log('   • chrome://on-device-internals/ → Shows model status');
    log('   • chrome://components/ → Look for "Optimization Guide On Device Model"\n');

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    log('🔍 CURRENT STATUS CHECK:\n');

    // Check if models are loaded
    if (typeof Writer !== 'undefined') {
        try {
            const availability = await Writer.availability({ outputLanguage: 'en' });
            log(`✅ Gemini Nano Status: ${availability}`);

            if (availability === 'available') {
                log('   Model is downloaded and ready!');
                log('   Size: ~2GB in OptimizationGuidePredictionModels folder');
            } else if (availability === 'downloadable') {
                log('   Model not downloaded yet');
            } else if (availability === 'downloading') {
                log('   Model currently downloading...');
            }
        } catch (e) {
            log(`❌ Error checking: ${e.message}`);
        }
    }

    log('\n📝 STORAGE NOTES:');
    log('• Models persist across Chrome restarts');
    log('• Deleted if free space drops below 10GB');
    log('• Shared between all Gemini Nano APIs');
    log('• One download for Writer, Rewriter, Summarizer, Prompt');
    log('• Chrome Canary uses separate profile folder\n');

    log('💡 TIP: To see exact size, check folder properties in File Explorer');
}

// Check chrome://on-device-internals status
async function checkOnDeviceInternals() {
    output.textContent = ''; // Clear output
    log('=== CHROME ON-DEVICE INTERNALS STATUS ===\n');

    log('📍 To check detailed model status:\n');

    log('1️⃣ Open new tab: chrome://on-device-internals\n');

    log('2️⃣ Check these tabs:');
    log('   • Model Status - Shows if model is installed');
    log('   • Event Logs - Shows download progress/errors');
    log('   • Performance - Shows model performance metrics\n');

    log('3️⃣ What to look for:');
    log('   ✅ "Model ready" - Fully downloaded');
    log('   ⏳ "Downloading" - In progress');
    log('   ❌ "Error" - Check event logs for details\n');

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    log('🔧 TROUBLESHOOTING:\n');

    log('If model not downloading:');
    log('• Check disk space: Need 22GB+ free');
    log('• Check network: Unmetered connection required');
    log('• Check GPU: Need >4GB VRAM\n');

    log('To force re-download:');
    log('1. Delete OptimizationGuidePredictionModels folder');
    log('2. Restart Chrome');
    log('3. Trigger download with Writer.create()\n');

    log('💡 Click to open: chrome://on-device-internals');
}

// Helper function for logging
function log(message, newline = true) {
    const output = document.getElementById('output');
    if (output) {
        output.textContent += message + (newline ? '\n' : '');
    }
    console.log(message);
}