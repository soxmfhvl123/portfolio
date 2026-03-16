/**
 * FLUX-GEN: Kinetic Type Lab 3.0
 * Professional Kinetic Typography Engine
 * Based on TEXTR Benchmarking v3
 */

let font;
let fontLoaded = false;
let canvas;
let capturer;
let isRecording = false;
let recordFrames = 0;
let currentFrame = 0;
let activeGoogleFont = 'Space Grotesk';

// --- CONSTANTS ---
const easingFunctions = {
    'Linear': (t) => t,
    'Quad In': (t) => t * t,
    'Quad Out': (t) => t * (2 - t),
    'Quad In-Out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    'Elastic Out': (t) => {
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    },
    'Back In': (t) => {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
    },
    'Back Out': (t) => {
        const s = 1.70158;
        return --t * t * ((s + 1) * t + s) + 1;
    },
    'Bounce Out': (t) => {
        if (t < (1 / 2.75)) return 7.5625 * t * t;
        else if (t < (2 / 2.75)) return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
        else if (t < (2.5 / 2.75)) return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
        else return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
    }
};

const motionModes = ['None', 'Sinusoid', 'Double Sinusoid', 'Noise', 'Bounce'];

const googleFontList = [
    'Space Grotesk', 'Inter', 'Modak', 'Bungee', 'Outfit', 'Roboto', 
    'Playfair Display', 'Syne', 'Kanit', 'Noto Sans KR', 'Archivo Black'
];

const presets = {
    'Default Engine': {
        text: 'KINETIC', fontSize: 120, rows: 12, cols: 1, spacingY: 100, 
        posMode: 'Double Sinusoid', posAmp: 75, posFreq: 0.8, posEase: 'Linear',
        scaleMode: 'Noise', scaleStart: 1.0, scaleEnd: 0.5, gFont: 'Space Grotesk'
    },
    'Round The Clock': {
        text: 'ROUND THE CLOCK', fontSize: 45, rows: 15, cols: 1, spacingY: 60,
        color: '#601cf2', posMode: 'Double Sinusoid', posAmp: 120, posFreq: 1.2,
        posEase: 'Elastic Out', posMirror: true, scaleMode: 'Use Position Data',
        scaleStart: 1.2, scaleEnd: 0.1, scalePhase: 0.25, gFont: 'Modak'
    },
    'Fluid Noise': {
        text: 'FLUID', fontSize: 180, rows: 5, cols: 1, spacingY: 150,
        posMode: 'Noise', posAmp: 200, posFreq: 0.4, posSpeed: 0.01,
        scaleMode: 'Noise', scaleStart: 1.5, scaleEnd: 0.3, gFont: 'Syne'
    },
    'Bounce Grid': {
        text: 'BOUNCE', fontSize: 80, rows: 8, cols: 3, spacingX: 180, spacingY: 100,
        posMode: 'Bounce', posAmp: 100, posFreq: 1.0, posEase: 'Bounce Out',
        scaleMode: 'None', scaleStart: 1.0, gFont: 'Bungee'
    },
    'Minimal Wave': {
        text: 'MINIMAL', fontSize: 60, rows: 20, cols: 1, spacingY: 40,
        color: '#ffffff', bg: '#000000', posMode: 'Sinusoid', posAmp: 50, 
        posFreq: 0.5, posEase: 'Quad In-Out', scaleMode: 'None', gFont: 'Inter'
    },
    'Staggered Pulse': {
        text: 'PULSE', fontSize: 100, rows: 10, cols: 1, spacingY: 110,
        posMode: 'None', scaleMode: 'Sinusoid', scaleStart: 2.0, scaleEnd: 0.2,
        scaleFreq: 1.5, scaleSpeed: 0.05, gFont: 'Archivo Black'
    }
};

// Parameters & State
const params = {
    preset: 'Default Engine',
    
    // MAIN / CONTENT
    text: 'KINETIC',
    fontSize: 120,
    interval: 100, // logic links to spacingY if vertical
    color: '#FF6600',
    bg: '#0a0a0a',
    gFont: 'Space Grotesk',
    
    // GRID / LAYOUT
    rows: 12,
    cols: 1,
    spacingY: 100,
    spacingX: 0,
    stagger: 0,
    
    // MOTION - POSITION
    posMode: 'Double Sinusoid',
    posEase: 'Linear',
    posAmpMod: 'None',
    posAmp: 75,
    posFreq: 0.8,
    posCycles: 1,
    posFreqAdd: 0,
    posCyclesAdd: 0,
    posMirror: true,
    posOffset: 0,
    posSpeed: 0.02,

    // MOTION - SCALE
    scaleMode: 'Noise',
    scaleEase: 'Linear',
    scaleStart: 1.0,
    scaleEnd: 0.5,
    scaleFreq: 0.5,
    scaleMirror: false,
    scalePhase: 0,
    scaleSpeed: 0.01,

    // VISUALS / RENDER
    opacity: 100,
    strokeOnly: false,
    strokeWeight: 1,
    
    // EXPORT & OPTIONS
    format: 'webm',
    exportDuration: 5,
    fps: 30,
    ratio: '16:9',
    showGrid: false
};

// --- CORE ---

function setup() {
    const container = document.getElementById('canvas-container');
    const w = container.offsetWidth || windowWidth;
    const h = container.offsetHeight || windowHeight;
    canvas = createCanvas(w, h);
    canvas.parent('p5-canvas');
    
    resizeCanvasToRatio();
    loadGoogleFont(params.gFont);
    
    initTweakpane();
    windowResized();
}

function loadGoogleFont(fontName) {
    document.getElementById('status-val').innerText = 'LOADING FONT...';
    WebFont.load({
        google: { families: [fontName] },
        active: () => {
            activeGoogleFont = fontName;
            fontLoaded = true;
            document.getElementById('status-val').innerText = 'READY';
            console.log('Font loaded:', fontName);
        },
        inactive: () => {
            console.error('Failed to load font:', fontName);
            document.getElementById('status-val').innerText = 'FONT ERROR';
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
            
            // 1. Calculate Grid Base Position
            let bx = (c - (params.cols - 1) / 2) * params.spacingX;
            let by = (r - (params.rows - 1) / 2) * params.spacingY;
            if (params.rows > 1 && r % 2 === 1) bx += params.stagger;
            
            // 2. Normalized row/column factor [0, 1]
            const nr = params.rows > 1 ? r / (params.rows - 1) : 0.5;
            const nc = params.cols > 1 ? c / (params.cols - 1) : 0.5;
            
            // Distance from center factor (for Amp Modulation)
            const distFromCenter = dist(nr, nc, 0.5, 0.5) * 2; // [0, 1.414...]
            let ampFactor = 1;
            if (params.posAmpMod === 'Center Easing') {
                ampFactor = 1 - Math.min(distFromCenter, 1);
            }
            
            // 3. Position Motion
            const posTime = tBase * params.posSpeed * 50;
            const posOffset = (r * params.posCycles + c * params.posCyclesAdd) * 0.1;
            const posFreq = params.posFreq + (r * params.posFreqAdd * 0.1);
            
            let posVal = calculateMotionVal(params.posMode, posTime, posOffset, posFreq);
            
            // Apply Easing to calculated wave
            const easedPos = applyEasing(params.posEase, (posVal + 1) / 2) * 2 - 1;
            
            // Apply Mirroring
            let finalPosVal = easedPos;
            if (params.posMirror && nr > 0.5) finalPosVal *= -1;
            
            translate(bx + finalPosVal * params.posAmp * ampFactor, by);
            
            // 4. Scale Motion
            let finalScale;
            if (params.scaleMode === 'Use Position Data') {
                // Link scale to position, possibly with phase offset
                const phaseT = posTime + params.scalePhase * PI;
                let sVal = calculateMotionVal(params.posMode, phaseT, posOffset, posFreq);
                const easedS = applyEasing(params.scaleEase, (sVal + 1) / 2);
                finalScale = lerp(params.scaleStart, params.scaleEnd, easedS);
            } else {
                const sTime = tBase * params.scaleSpeed * 50;
                const sOffset = posOffset + params.scalePhase * PI;
                let sVal = calculateMotionVal(params.scaleMode, sTime, sOffset, params.scaleFreq);
                const easedS = applyEasing(params.scaleEase, (sVal + 1) / 2);
                finalScale = lerp(params.scaleStart, params.scaleEnd, easedS);
            }
            
            if (params.scaleMirror && nr > 0.5) finalScale = params.scaleStart + params.scaleEnd - finalScale;
            
            scale(finalScale);
            
            // 5. Rendering
            renderTextNode();
            pop();
        }
    }
    pop();

    handleExport();
}

/**
 * Core wave calculator based on mode
 */
function calculateMotionVal(mode, time, offset, freq) {
    const t = time + offset * freq;
    switch(mode) {
        case 'Sinusoid': return sin(t);
        case 'Double Sinusoid': return sin(t) * cos(t * 0.5);
        case 'Noise': return noise(t * 0.5) * 2 - 1;
        case 'Bounce': return abs(sin(t)) * 2 - 1;
        default: return 0;
    }
}

function applyEasing(name, t) {
    const fn = easingFunctions[name] || easingFunctions['Linear'];
    return fn(Math.max(0, Math.min(1, t)));
}

function renderTextNode() {
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
    textFont(activeGoogleFont);
    textSize(params.fontSize);
    text(params.text, 0, 0);
    pop();
}

function drawGuideGrid() {
    stroke(44);
    strokeWeight(1);
    for (let x = 0; x <= width; x += 50) line(x, 0, x, height);
    for (let y = 0; y <= height; y += 50) line(0, y, width, y);
}

// --- UI / TWEAKPANE ---

function initTweakpane() {
    if (pane) pane.dispose();
    pane = new Tweakpane.Pane({
        container: document.getElementById('tweakpane-container'),
        title: 'TEXTR ENGINE 3.0'
    });

    pane.addInput(params, 'preset', {
        options: Object.keys(presets).reduce((a, v) => ({ ...a, [v]: v }), {})
    }).on('change', (ev) => {
        applyPreset(ev.value);
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
    const fTypo = main.addFolder({ title: 'TYPOGRAPHY' });
    fTypo.addInput(params, 'gFont', { options: googleFontList.reduce((a,v) => ({...a, [v]:v}), {}) })
        .on('change', (ev) => loadGoogleFont(ev.value));
    
    fTypo.addButton({ title: 'DRAG CUSTOM FONT' }).on('click', () => document.getElementById('font-input').click());
    
    fTypo.addInput(params, 'text');
    fTypo.addInput(params, 'fontSize', { min: 5, max: 400 });
    fTypo.addInput(params, 'color');
    fTypo.addInput(params, 'interval', { min: 0, max: 500, label: 'Spacing' }).on('change', v => params.spacingY = v.value);

    const fLayout = main.addFolder({ title: 'LAYOUT (GRID)' });
    fLayout.addInput(params, 'rows', { min: 1, max: 100, step: 1 });
    fLayout.addInput(params, 'cols', { min: 1, max: 50, step: 1 });
    fLayout.addInput(params, 'spacingX', { min: 0, max: 1000 });
    fLayout.addInput(params, 'stagger', { min: 0, max: 500 });
    fLayout.addInput(params, 'bg');

    // --- MOTION TAB ---
    const motion = tabs.pages[1];
    const mTabs = motion.addTab({
        pages: [{title: 'POSITION'}, {title: 'SCALE'}]
    });

    const mPos = mTabs.pages[0];
    mPos.addInput(params, 'posMode', { options: motionModes.reduce((a,v) => ({...a, [v]:v}), {}) });
    mPos.addInput(params, 'posEase', { options: Object.keys(easingFunctions).reduce((a,v) => ({...a,[v]:v}), {}) });
    mPos.addInput(params, 'posAmpMod', { options: { 'None': 'None', 'Center Easing': 'Center Easing' } });
    
    mPos.addInput(params, 'posAmp', { min: 0, max: 1000 });
    mPos.addInput(params, 'posFreq', { min: 0, max: 10 });
    mPos.addInput(params, 'posCycles', { min: -10, max: 10, step: 1 });
    mPos.addInput(params, 'posFreqAdd', { min: -5, max: 5 });
    mPos.addInput(params, 'posCyclesAdd', { min: -10, max: 10 });
    mPos.addInput(params, 'posMirror', { label: 'Mirror on Center' });
    mPos.addInput(params, 'posSpeed', { min: 0, max: 0.5 });

    const mScale = mTabs.pages[1];
    const scaleModes = [...motionModes, 'Use Position Data'];
    mScale.addInput(params, 'scaleMode', { options: scaleModes.reduce((a,v) => ({...a, [v]:v}), {}) });
    mScale.addInput(params, 'scaleEase', { options: Object.keys(easingFunctions).reduce((a,v) => ({...a,[v]:v}), {}) });
    mScale.addInput(params, 'scaleStart', { min: 0, max: 5 });
    mScale.addInput(params, 'scaleEnd', { min: 0, max: 5 });
    mScale.addInput(params, 'scaleMirror', { label: 'Mirror on Center' });
    mScale.addInput(params, 'scalePhase', { min: -2, max: 2, label: 'Phase Offset' });
    mScale.addInput(params, 'scaleSpeed', { min: 0, max: 0.5 });

    // --- EXPORT TAB ---
    const exp = tabs.pages[2];
    exp.addInput(params, 'format', { options: { 'WebM': 'webm', 'PNG Sequence': 'png', 'GIF': 'gif' } });
    exp.addInput(params, 'exportDuration', { min: 1, max: 60, title: 'Length (sec)' });
    exp.addInput(params, 'fps', { min: 1, max: 60, step: 1 });
    exp.addButton({ title: 'GENERATE OUTPUT' }).on('click', () => startExport());

    // --- OPTIONS TAB ---
    const opt = tabs.pages[3];
    opt.addInput(params, 'ratio', { options: { '16:9': '16:9', '4:5': '4:5', '1:1': '1:1', '9:16': '9:16' } }).on('change', () => resizeCanvasToRatio());
    opt.addInput(params, 'opacity', { min: 0, max: 100 });
    opt.addInput(params, 'strokeOnly');
    opt.addInput(params, 'showGrid');
    opt.addButton({ title: 'ENTER FULLSCREEN' }).on('click', () => toggleFullScreen());
}

function applyPreset(name) {
    const p = presets[name];
    if (!p) return;
    Object.assign(params, p);
    params.interval = params.spacingY; // sync
    if (p.gFont) {
        params.gFont = p.gFont;
        loadGoogleFont(p.gFont);
    }
    pane.refresh();
}

// --- FONT LOGIC ---
document.getElementById('font-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const fontData = event.target.result;
            // Native p5 font loading
            loadFontFromData(fontData, file.name.split('.')[0]);
        };
        reader.readAsArrayBuffer(file);
    }
});

function loadFontFromData(data, name) {
    const url = URL.createObjectURL(new Blob([data]));
    loadFont(url, (f) => {
        textFont(f);
        activeGoogleFont = f;
        fontLoaded = true;
        document.getElementById('status-val').innerText = 'CUSTOM: ' + name;
        params.gFont = '(Custom)';
        pane.refresh();
    });
}

// --- EXPORT LOGIC ---
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

function windowResized() { resizeCanvasToRatio(); }

function toggleFullScreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
}

document.getElementById('fluxus-btn').addEventListener('click', () => {
    params.posAmp = random(50, 400);
    params.posFreq = random(0.2, 3);
    params.posCycles = floor(random(-5, 5));
    params.posEase = random(Object.keys(easingFunctions));
    params.scaleEnd = random(0.1, 2);
    params.scalePhase = random(-1, 1);
    params.color = '#' + floor(random(16777215)).toString(16).padStart(6, '0');
    
    // Randomize Font too
    const nextFont = random(googleFontList);
    params.gFont = nextFont;
    loadGoogleFont(nextFont);
    
    pane.refresh();
});
