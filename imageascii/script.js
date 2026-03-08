const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const asciiOutput = document.getElementById('asciiOutput');
const hiddenCanvas = document.getElementById('hiddenCanvas');
const ctx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
const copyBtn = document.getElementById('copyBtn');
const resolutionSlider = document.getElementById('resolutionSlider');
const resValue = document.getElementById('resValue');

// Standard ASCII chars from dark to light
// (Since we are on a dark background, the "dark" pixels should get sparse chars like ' ' or '.'
//  and bright pixels should get dense chars like '@' or '#')
const asciiChars = " .:-=+*#%@".split('');

let currentImage = null;

// --- Event Listeners ---

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

resolutionSlider.addEventListener('input', (e) => {
    resValue.textContent = e.target.value;
    if (currentImage) {
        generateASCII(currentImage, parseInt(e.target.value));
    }
});

copyBtn.addEventListener('click', () => {
    // Copy the raw text without HTML spans
    const text = asciiOutput.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'COPIED';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
});


// --- Core Logic ---

function handleFile(file) {
    if (!file.type.match('image.*')) {
        alert("Please upload an image file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            // Show preview
            imagePreview.src = event.target.result;
            imagePreview.classList.remove('hidden');
            dropzone.classList.add('has-image');

            // Show buttons
            copyBtn.classList.remove('hidden');

            // Generate colored ASCII
            generateASCII(img, parseInt(resolutionSlider.value));
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function generateASCII(img, resolution) {
    const width = resolution;
    // Magic number for common Monospace fonts line-height/letter-spacing aspect ratio
    // This value fixes the vertical stretching issue on most systems
    const charAspectRatio = 1.0;

    const imgAspectRatio = img.width / img.height;
    // To fix stretching: if char is taller than wide, image needs fewer rows.
    const height = Math.floor(width / (imgAspectRatio * charAspectRatio));

    hiddenCanvas.width = width;
    hiddenCanvas.height = height;

    // Scale image to canvas
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let asciiHTML = '';

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;

            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            const brightness = (0.299 * r + 0.587 * g + 0.114 * b);

            // Clamp and map brightness
            const charIndex = Math.max(0, Math.min(asciiChars.length - 1, Math.floor((brightness / 255) * asciiChars.length)));
            const character = asciiChars[charIndex];

            // Output colored ASCII. We boost the brightness slightly so dark colors don't vanish completely on the black bg.
            const boostedR = Math.min(255, r + 20);
            const boostedG = Math.min(255, g + 20);
            const boostedB = Math.min(255, b + 20);

            asciiHTML += `<span style="color:rgb(${boostedR},${boostedG},${boostedB})">${character === ' ' ? '&nbsp;' : character}</span>`;
        }
        asciiHTML += '<br>';
    }

    asciiOutput.innerHTML = asciiHTML;

    adjustFontSize(width, height);
}

function adjustFontSize(columns, rows) {
    const outputCont = document.querySelector('.output-container');
    if (!outputCont) return;

    // We want the text to fit both width-wise and height-wise
    const containerWidth = outputCont.clientWidth - 80; // Add padding buffer
    const containerHeight = outputCont.clientHeight - 80;

    // Approx width of a monospace char
    const maxCharWidth = containerWidth / columns;
    const maxCharHeight = containerHeight / rows;

    // We take the smaller restriction so it fits perfectly
    let newSize = Math.floor(Math.min(maxCharWidth / 0.6, maxCharHeight / 0.6));

    newSize = Math.max(4, Math.min(newSize, 30));

    asciiOutput.style.fontSize = `${newSize}px`;
}

window.addEventListener('resize', () => {
    if (currentImage) {
        // Redraw to adjust size
        generateASCII(currentImage, parseInt(resolutionSlider.value));
    }
});


// --- WAVY GRID BACKGROUND ---
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');

let time = 0;

function resizeBg() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeBg);
resizeBg();

function drawBackground() {
    bgCtx.fillStyle = '#161616'; // Dark gray/black base
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // The image has distorted rows of blue squares Document
    const squareSize = 12;
    const spacing = 18;
    const cols = Math.ceil(bgCanvas.width / spacing) + 40;
    const rows = Math.ceil(bgCanvas.height / spacing) + 40;

    bgCtx.fillStyle = '#0066ff'; // Electric blue

    for (let r = -20; r < rows; r++) {
        for (let c = -20; c < cols; c++) {

            // Base positions
            let x = c * spacing;
            let y = r * spacing;

            // Sine wave distortions creating the specific wave pattern
            const waveX = Math.sin(r * 0.1 + time * 0.5) * 40;
            const waveY = Math.cos(c * 0.05 + time * 0.3) * 20;

            // Perspective / skew shift based on x
            const shift = Math.sin(x * 0.005) * 50;

            const finalX = x + waveX;
            const finalY = y + waveY + shift;

            // Also rotate the squares slightly based on the wave
            const rotation = Math.sin(r * 0.1 + c * 0.05 + time * 0.4) * 0.2;

            bgCtx.save();
            bgCtx.translate(finalX, finalY);
            bgCtx.rotate(rotation);
            bgCtx.fillRect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
            bgCtx.restore();
        }
    }

    time += 0.02;
    requestAnimationFrame(drawBackground);
}

// Start animation
drawBackground();
