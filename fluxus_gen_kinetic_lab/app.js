/**
 * FLUX-GEN: Kinetic Type Lab 2.0
 * Professional Kinetic Typography Engine
 * Based on TEXTR Benchmarking
 */

let font;
let fontLoaded = false;
let canvas;
let capturer;
let isRecording = false;
let recordFrames = 0;
let currentFrame = 0;

// Parameters & State
const params = {
    // MAIN / CONTENT
    text: 'KINETIC',
    fontSize: 120,
    lineHeight: 1.2,
    
    // GRID / LAYOUT
    rows: 12,
    cols: 1,
    spacingY: 100,
    spacingX: 0,
    stagger: 0,
    align: 'center',

    // MOTION - POSITION
    posMode: 'Double Sinusoid',
    posFreq: 2.0,
    posAmp: 50,
    posPhase: 0,
    posSpeed: 0.02,

    // MOTION - SCALE
    scaleMode: 'Noise',
    scaleStart: 1.0,
    scaleEnd: 0.5,
    scaleFreq: 0.5,
    scaleSpeed: 0.01,

    // VISUALS
    color: '#FF6600',
    bg: '#0a0a0a',
    strokeOnly: false,
    strokeWeight: 1,
    opacity: 100,
    
    // EXPORT
    format: 'webm',
    exportSize: 1, // multiplier
    exportDuration: 5, // seconds
    fps: 30,
    
    // OPTIONS
    ratio: '16:9',
    margins: 0,
    showGrid: false
};

const motionModes = ['None', 'Sinusoid', 'Double Sinusoid', 'Noise', 'Bounce'];
const exportFormats = ['webm', 'png', 'gif'];

let pane;

function setup() {
    const container = document.getElementById('canvas-container');
    const w = container.offsetWidth || windowWidth;
    const h = container.offsetHeight || windowHeight;
    canvas = createCanvas(w, h);
    canvas.parent('p5-canvas');
    
    // Maintain ratio immediately
    resizeCanvasToRatio();
    
    // Initial Font Load
    loadFont('font.ttf');
    
    initTweakpane();
    windowResized();
}

function loadFont(url) {
    document.getElementById('status-val').innerText = 'LOADING...';
    opentype.load(url, (err, f) => {
        if (err) {
            console.error('Font load error:', err);
            document.getElementById('status-val').innerText = 'FONT ERROR';
        } else {
            font = f;
            fontLoaded = true;
            document.getElementById('status-val').innerText = 'READY';
        }
    });
}

function draw() {
    background(params.bg);
    
    document.getElementById('fps-val').innerText = floor(frameRate());
    
    if (params.showGrid) drawGuideGrid();
    
    push();
    translate(width/2, height/2);
    
    const tBase = isRecording ? (currentFrame / params.fps) : (millis() * 0.001);
    
    for (let r = 0; r < params.rows; r++) {
        for (let c = 0; c < params.cols; c++) {
            push();
            
            // Base Position
            let bx = (c - (params.cols - 1) / 2) * params.spacingX;
            let by = (r - (params.rows - 1) / 2) * params.spacingY;
            
            if (params.rows > 1 && r % 2 === 1) bx += params.stagger;
            
            // Motion Calculations
            const offset = (r * 0.2 + c * 0.1);
            const posM = calculateMotion(params.posMode, tBase * params.posSpeed * 10, offset, params.posFreq);
            const scaleM = calculateMotion(params.scaleMode, tBase * params.scaleSpeed * 10, offset, params.scaleFreq);
            
            translate(bx + posM * params.posAmp, by);
            
            const s = lerp(params.scaleStart, params.scaleEnd, (scaleM + 1) / 2);
            scale(s);
            
            renderText();
            pop();
        }
    }
    pop();

    handleExport();
}

function calculateMotion(mode, time, offset, freq) {
    const t = time * 0.1 + offset * freq;
    switch(mode) {
        case 'Sinusoid': return sin(t);
        case 'Double Sinusoid': return sin(t) * cos(t * 0.5);
        case 'Noise': return noise(t) * 2 - 1;
        case 'Bounce': return abs(sin(t));
        default: return 0;
    }
}

function renderText() {
    push();
    const p5Color = color(params.color);
    p5Color.setAlpha(map(params.opacity, 0, 100, 0, 255));
    
    if (params.strokeOnly) {
        noFill();
        stroke(p5Color);
        strokeWeight(params.strokeWeight);
    } else {
        fill(p5Color);
        noStroke();
    }
    
    textAlign(CENTER, CENTER);
    textSize(params.fontSize);
    
    // Always use p5 text as primary for 'Solid' feel and reliability
    // We already have font loaded via opentype if needed for other things, 
    // but p5 text() with the default or loaded font name is more standard.
    text(params.text, 0, 0);
    pop();
}

function drawGuideGrid() {
    stroke(40);
    strokeWeight(1);
    for (let x = 0; x <= width; x += 50) line(x, 0, x, height);
    for (let y = 0; y <= height; y += 50) line(0, y, width, y);
}

function initTweakpane() {
    pane = new Tweakpane.Pane({
        container: document.getElementById('tweakpane-container'),
        title: 'TEXTR ENGINE 2.0'
    });

    const tabs = pane.addTab({
        pages: [
            {title: 'MAIN'},
            {title: 'MOTION'},
            {title: 'EXPORT'},
            {title: 'OPTIONS'},
        ],
    });

    // --- MAIN TAB ---
    const main = tabs.pages[0];
    main.addInput(params, 'text');
    main.addInput(params, 'fontSize', { min: 10, max: 300 });

    const fGrid = main.addFolder({ title: 'GRID / LAYOUT' });
    fGrid.addInput(params, 'rows', { min: 1, max: 50, step: 1 });
    fGrid.addInput(params, 'cols', { min: 1, max: 50, step: 1 });
    fGrid.addInput(params, 'spacingY', { min: 0, max: 500 });
    fGrid.addInput(params, 'spacingX', { min: 0, max: 500 });
    fGrid.addInput(params, 'stagger', { min: 0, max: 200 });

    const fVisuals = main.addFolder({ title: 'VISUALS' });
    fVisuals.addInput(params, 'color');
    fVisuals.addInput(params, 'bg');
    fVisuals.addInput(params, 'opacity', { min: 0, max: 100 });
    fVisuals.addInput(params, 'strokeOnly');
    fVisuals.addInput(params, 'strokeWeight', { min: 0.1, max: 10 });

    // --- MOTION TAB ---
    const motion = tabs.pages[1];
    const fPos = motion.addFolder({ title: 'POSITION' });
    fPos.addInput(params, 'posMode', { options: motionModes.reduce((a,v) => ({...a, [v]:v}), {}) });
    fPos.addInput(params, 'posFreq', { min: 0, max: 10 });
    fPos.addInput(params, 'posAmp', { min: 0, max: 500 });
    fPos.addInput(params, 'posSpeed', { min: 0, max: 0.2 });

    const fScale = motion.addFolder({ title: 'SCALE' });
    fScale.addInput(params, 'scaleMode', { options: motionModes.reduce((a,v) => ({...a, [v]:v}), {}) });
    fScale.addInput(params, 'scaleStart', { min: 0, max: 3 });
    fScale.addInput(params, 'scaleEnd', { min: 0, max: 3 });
    fScale.addInput(params, 'scaleFreq', { min: 0, max: 10 });
    fScale.addInput(params, 'scaleSpeed', { min: 0, max: 0.2 });

    // --- EXPORT TAB ---
    const exp = tabs.pages[2];
    exp.addInput(params, 'format', { options: { 'WebM': 'webm', 'PNG Sequence': 'png', 'GIF': 'gif' } });
    exp.addInput(params, 'exportDuration', { min: 1, max: 60, title: 'Length (sec)' });
    exp.addInput(params, 'fps', { min: 1, max: 60, step: 1 });
    
    exp.addButton({ title: 'LOAD CUSTOM FONT' }).on('click', () => {
        document.getElementById('font-input').click();
    });

    // --- OPTIONS TAB ---
    const opt = tabs.pages[3];
    opt.addInput(params, 'ratio', { options: { '16:9': '16:9', '4:5': '4:5', '1:1': '1:1', '9:16': '9:16' } }).on('change', () => resizeCanvasToRatio());
    opt.addInput(params, 'showGrid');
    opt.addButton({ title: 'ENTER FULLSCREEN' }).on('click', () => toggleFullScreen());
}

// --- FONT LOADING ---
document.getElementById('font-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const fontData = event.target.result;
            font = opentype.parse(fontData);
            fontLoaded = true;
            document.getElementById('status-val').innerText = 'CUSTOM FONT';
        };
        reader.readAsArrayBuffer(file);
    }
});

// --- EXPORT LOGIC ---
document.getElementById('generate-output-btn').addEventListener('click', () => {
    startExport();
});

function startExport() {
    isRecording = true;
    currentFrame = 0;
    recordFrames = params.exportDuration * params.fps;
    
    capturer = new CCapture({
        format: params.format,
        framerate: params.fps,
        verbose: true,
        display: true
    });
    
    document.getElementById('export-progress-container').style.display = 'block';
    capturer.start();
}

function handleExport() {
    if (!isRecording) return;
    
    capturer.capture(canvas.elt);
    currentFrame++;
    
    const percent = floor((currentFrame / recordFrames) * 100);
    document.getElementById('export-percent').innerText = percent;
    document.getElementById('progress-fill').style.width = `${percent}%`;
    
    if (currentFrame >= recordFrames) {
        isRecording = false;
        capturer.stop();
        capturer.save();
        document.getElementById('export-progress-container').style.display = 'none';
    }
}

// --- UTILS ---
function resizeCanvasToRatio() {
    const container = document.getElementById('canvas-container');
    const containerW = container.offsetWidth - 40;
    const containerH = container.offsetHeight - 40;
    
    let targetW, targetH;
    const [rw, rh] = params.ratio.split(':').map(Number);
    const targetRatio = rw / rh;
    
    if (containerW / containerH > targetRatio) {
        targetH = containerH;
        targetW = containerH * targetRatio;
    } else {
        targetW = containerW;
        targetH = containerW / targetRatio;
    }
    
    resizeCanvas(targetW, targetH);
    document.getElementById('res-val').innerText = `${floor(targetW)}x${floor(targetH)}`;
}

function windowResized() {
    resizeCanvasToRatio();
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

document.getElementById('fluxus-btn').addEventListener('click', () => {
    params.posAmp = random(0, 300);
    params.posFreq = random(0, 5);
    params.scaleEnd = random(0.2, 1.5);
    params.spacingY = random(50, 200);
    params.color = '#' + floor(random(16777215)).toString(16).padStart(6, '0');
    pane.refresh();
});
