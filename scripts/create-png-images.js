const fs = require('fs');
const path = require('path');

console.log('🖼️ Creating PNG versions of hackathon images...\n');

// Since we can't use external libraries without installing them,
// we'll create a simple HTML file that auto-converts on load

const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Auto PNG Converter</title>
</head>
<body>
    <h1>Generating PNG files...</h1>
    <canvas id="canvas"></canvas>

    <script>
        const images = [
            { src: '/mosqit-hackathon-submission.svg', width: 1200, height: 630, name: 'mosqit-hackathon-submission.png' },
            { src: '/mosqit-features-showcase.svg', width: 1920, height: 1080, name: 'mosqit-features-showcase.png' }
        ];

        async function convertAll() {
            for (const imageData of images) {
                await convertImage(imageData);
            }
            document.body.innerHTML += '<p>✅ All images converted! Check your downloads folder.</p>';
        }

        function convertImage(imageData) {
            return new Promise((resolve) => {
                const canvas = document.getElementById('canvas');
                canvas.width = imageData.width;
                canvas.height = imageData.height;
                const ctx = canvas.getContext('2d');

                const img = new Image();
                img.onload = function() {
                    ctx.clearRect(0, 0, imageData.width, imageData.height);
                    ctx.drawImage(img, 0, 0, imageData.width, imageData.height);

                    canvas.toBlob(function(blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = imageData.name;
                        a.click();
                        URL.revokeObjectURL(url);
                        resolve();
                    }, 'image/png');
                };
                img.src = imageData.src;
            });
        }

        // Auto-start conversion
        convertAll();
    </script>
</body>
</html>`;

// Save the auto-converter HTML
const converterPath = path.join(__dirname, '..', 'public', 'auto-png-converter.html');
fs.writeFileSync(converterPath, htmlContent);

console.log('✅ Created auto-converter at: public/auto-png-converter.html');
console.log('\n📝 Instructions to generate PNG files:');
console.log('1. Open http://localhost:3000/auto-png-converter.html in Chrome');
console.log('2. The PNG files will automatically download');
console.log('\nAlternatively, use the manual converter:');
console.log('   http://localhost:3000/convert-svg-to-png.html');
console.log('\n🎨 Image details:');
console.log('   - mosqit-hackathon-submission.png (1200x630) - 3:2 ratio for social media');
console.log('   - mosqit-features-showcase.png (1920x1080) - 16:9 ratio for presentations');