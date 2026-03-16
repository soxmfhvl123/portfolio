/**
 * FLUX-GEN: Kinetic Type Lab 3.0.2
 * Professional Kinetic Typography Engine
 * Based on TEXTR Benchmarking v3.0.2
 */

let font;
let fontLoaded = false;
let canvas;
let capturer;
let isRecording = false;
let recordFrames = 0;
let currentFrame = 0;
let activeGoogleFont = 'Space Grotesk';
let pane;

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

const googleFontList = [
    'Space Grotesk', 'Inter', 'Modak', 'Bungee', 'Outfit', 'Roboto', 
    'Playfair Display', 'Syne', 'Kanit', 'Noto Sans KR', 'Archivo Black', 'Syne Mono'
];

const motionModes = [
    'None', 'Sinusoid', 'Double Sinusoid', 'Noise', 'Bounce', 
    'Laser Scan', 'Topographic', 'Liquid', 'Elastic', 'Magnetic', 
    'Crumble', 'Echo', 'Kaleidoscope', 'Heartbeat', 'Flow-Field', 'Ripple-Wave'
];

const presets = {
    'Neural Ripple': {
        text: 'SYNAPTIC FLOW', fontSize: 40, rows: 45, cols: 15, spacingX: 200, spacingY: 30,
        posMode: 'Flow-Field', posAmp: 200, posFreq: 2.0, posSpeed: 0.008,
        scaleMode: 'Sinusoid', scaleStart: 1.1, scaleEnd: 0.2,
        color: '#00D1FF', bg: '#0A0B10', gFont: 'Syne'
    },
    'Galactic Flux': {
        text: 'ZERO GRAVITY', fontSize: 60, rows: 20, cols: 1, spacingY: 50,
        posMode: 'Ripple-Wave', posAmp: 300, posFreq: 0.8, posSpeed: 0.02,
        scaleMode: 'Use Position Data', scaleStart: 1.2, scaleEnd: 0.4,
        color: '#FFFFFF', bg: '#100A1A', gFont: 'Inter'
    },
    'Static Storm': {
        text: 'SIGNAL LOST', fontSize: 80, rows: 15, cols: 3, spacingX: 380, spacingY: 90,
        posMode: 'Magnetic', posAmp: 350, posFreq: 1.8, posSpeed: 0.012,
        scaleMode: 'Noise', scaleStart: 1.6, scaleEnd: 0.1,
        color: '#FF3D00', bg: '#050505', gFont: 'Space Grotesk'
    },
    'Melted Reality': {
        text: 'LIQUID FORM', fontSize: 50, rows: 30, cols: 4, spacingX: 200, spacingY: 40,
        posMode: 'Double Sinusoid', posAmp: 100, posFreq: 4.0, posSpeed: 0.015,
        scaleMode: 'Sinusoid', scaleStart: 1.3, scaleEnd: 0.3,
        color: '#FF00F5', bg: '#1A0033', gFont: 'Modak'
    },
    'Scanning Laser': {
        text: 'SCANNING', fontSize: 100, rows: 25, cols: 1, spacingY: 40,
        posMode: 'Laser Scan', posAmp: 250, posFreq: 1.2, posSpeed: 0.02,
        scaleMode: 'Use Position Data', scaleStart: 1.3, scaleEnd: 0.05,
        color: '#00FF41', bg: '#000000', gFont: 'Space Grotesk',
        posStretch: 0.5
    },
    'Topographic Fold': {
        text: 'TERRAIN', fontSize: 180, rows: 20, cols: 1, spacingY: 30,
        posMode: 'Topographic', posAmp: 400, posFreq: 0.6, posSpeed: 0.015,
        scaleMode: 'Sinusoid', scaleStart: 1.1, scaleEnd: 0.7,
        color: '#FFFFFF', bg: '#111111', gFont: 'Syne',
        posShear: 0.2
    },
    'Elastic String': {
        text: 'TENSION', fontSize: 130, rows: 15, cols: 1, spacingY: 90,
        posMode: 'Elastic', posAmp: 400, posFreq: 1.5, posSpeed: 0.03,
        posEase: 'Linear', scaleMode: 'None',
        color: '#FFFF00', bg: '#000000', gFont: 'Bungee',
        posStretch: 0.8
    },
    'Pixel Crumble': {
        text: 'FRAGMENT', fontSize: 110, rows: 90, cols: 1, spacingY: 110,
        posMode: 'Crumble', posAmp: 700, posFreq: 1.5, posSpeed: 0.03,
        scaleMode: 'None', color: '#FFFFFF', bg: '#000000', gFont: 'Archivo Black'
    },
    'Void Echo': {
        text: 'INFINITE', fontSize: 250, rows: 30, cols: 20, spacingX: 300, spacingY: 150,
        posMode: 'Echo', posAmp: 300, posFreq: 0.5, posSpeed: 0.05,
        scaleMode: 'Sinusoid', scaleStart: 1.0, scaleEnd: 0.2,
        color: '#FF00FF', bg: '#000000', gFont: 'Playfair Display',
        posStretch: 0.3
    }
};

// Parameters & State
const params = {
    preset: 'Neural Ripple',
    
    // MAIN / CONTENT
    text: 'SYNAPTIC FLOW',
    fontSize: 40,
    interval: 30, 
    color: '#00D1FF',
    bg: '#0A0B10',
    gFont: 'Syne',
    
    // GRID / LAYOUT
    rows: 45,
    cols: 15,
    spacingY: 30,
    spacingX: 200,
    stagger: 0,
    
    // MOTION - POSITION
    posMode: 'Flow-Field',
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
    posStretch: 0, // NEW
    posShear: 0,   // NEW

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
    showGrid: false,
    startTime: 0 // Track when preset was applied
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
    applyPreset('Neural Ripple'); // Force initial preset apply
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
    if (params.posMode === 'Echo') {
        push();
        fill(params.bg + '11'); // Lighter alpha for cleaner trails
        noStroke();
        rect(0, 0, width, height);
        pop();
    } else {
        background(params.bg);
    }
    
    document.getElementById('fps-val').innerText = floor(frameRate());
    if (params.showGrid) drawGuideGrid();
    
    const tBase = isRecording ? (currentFrame / params.fps) : (millis() * 0.001);
    
    // Performance Optimization: Reduce kaleidoscope symmetry if layout is dense
    let kCycles = 1;
    if (params.posMode === 'Kaleidoscope') {
        kCycles = (params.rows * params.cols > 40) ? 4 : 6;
    }

    // Heartbeat Screen Shake/Recoil
    if (params.posMode === 'Heartbeat') {
        let recoil = pow(sin(tBase * PI * 2.0), 12) * 5;
        translate(random(-recoil, recoil), random(-recoil, recoil));
    }

    for (let k = 0; k < kCycles; k++) {
        push();
        translate(width/2, height/2);
        if (params.posMode === 'Kaleidoscope') {
            rotate(k * TWO_PI / kCycles + tBase * 0.15);
        }

        for (let r = 0; r < params.rows; r++) {
            for (let c = 0; c < params.cols; c++) {
                push();
                
                let bx = (c - (params.cols - 1) / 2) * params.spacingX;
                let by = (r - (params.rows - 1) / 2) * params.spacingY;
                if (params.rows > 1 && r % 2 === 1) bx += params.stagger;
                
                const nr = params.rows > 1 ? r / (params.rows - 1) : 0.5;
                const nc = params.cols > 1 ? c / (params.cols - 1) : 0.5;
                
                const posTime = tBase * params.posSpeed * 50;
                const posOffset = (r * params.posCycles + c * params.posCyclesAdd) * 0.1;
                const posFreq = params.posFreq + (r * params.posFreqAdd * 0.1);
                
                let posVal = calculateMotionVal(params.posMode, posTime, posOffset, posFreq, nr, nc);
                const easedPos = applyEasing(params.posEase, (posVal + 1) / 2) * 2 - 1;
                
                let finalPosVal = easedPos;
                if (params.posMirror && nr > 0.5) finalPosVal *= -1;
                
                if (params.posMode === 'Crumble') {
                    // RESET LOOP for continuous crumble
                    let cycle = 8; // 8 second cycle
                    let elapsed = (tBase - params.startTime) % cycle;
                    let phase = elapsed / cycle;
                    
                    let gravity = pow(max(0, elapsed * 3 - posOffset * 0.8), 2.2) * 50;
                    if (elapsed > cycle * 0.8) {
                        // Fade out/reset lift
                        gravity *= map(elapsed, cycle * 0.8, cycle, 1, 0);
                    }
                    
                    translate(bx + (posVal * params.posAmp * 0.1), by + gravity);
                    rotate(elapsed * nr * 0.5); 
                } else if (params.posMode === 'Laser Scan') {
                    let scanLine = (sin(posTime * 0.5) * 0.5 + 0.5) * height - height/2;
                    let distToLine = abs(by - scanLine);
                    let jitter = distToLine < 50 ? random(-15, 15) : 0;
                    translate(bx + finalPosVal * params.posAmp + jitter, by);
                } else {
                    translate(bx + finalPosVal * params.posAmp, by);
                }
                
                // DEFORMATIONS - Stretch & Shear
                shearX(params.posShear * finalPosVal);
                scale(1, 1 + params.posStretch * abs(finalPosVal));

                // --- SCALE & READABILITY REFINEMENTS ---
                let finalScale;
                if (params.scaleMode === 'Use Position Data') {
                    const phaseT = posTime + params.scalePhase * PI;
                    let sVal = calculateMotionVal(params.posMode, phaseT, posOffset, posFreq, nr, nc);
                    const easedS = applyEasing(params.scaleEase, (sVal + 1) / 2);
                    finalScale = lerp(params.scaleStart, params.scaleEnd, easedS);
                } else if (params.scaleMode === 'Heartbeat') {
                    let hVal = pow(sin(tBase * PI * 2.0), 8);
                    finalScale = lerp(params.scaleStart, params.scaleEnd, hVal);
                } else {
                    const sTime = tBase * params.scaleSpeed * 50;
                    const sOffset = posOffset + params.scalePhase * PI;
                    let sVal = calculateMotionVal(params.scaleMode, sTime, sOffset, params.scaleFreq, nr, nc);
                    const easedS = applyEasing(params.scaleEase, (sVal + 1) / 2);
                    finalScale = lerp(params.scaleStart, params.scaleEnd, easedS);
                }
                
                if (params.scaleMirror && nr > 0.5) finalScale = params.scaleStart + params.scaleEnd - finalScale;
                
                if (params.posMode === 'Laser Scan') {
                    let scanLine = (sin(posTime * 0.5) * 0.5 + 0.5) * height - height/2;
                    let distToLine = abs(by - scanLine);
                    let visibility = map(distToLine, 0, 80, 1, 0, true);
                    params.opacity = visibility * 100;
                    scale(finalScale * (0.05 + visibility * 1.5)); 
                } else {
                    scale(finalScale);
                }
                
                renderTextNode();
                pop();
            }
        }
        pop();
    } 

    handleExport();
}

/**
 * Core wave calculator based on mode
 */
function calculateMotionVal(mode, time, offset, freq, nr, nc) {
    const t = time + offset * freq;
    switch(mode) {
        case 'Sinusoid': return sin(t);
        case 'Double Sinusoid': return sin(t) * cos(t * 0.5);
        case 'Noise': return noise(t * 0.5) * 2 - 1;
        case 'Bounce': return abs(sin(t)) * 2 - 1;
        case 'Laser Scan': return sin(t); 
        case 'Topographic': return noise(nr * 5, t * 0.2) * 2 - 1;
        case 'Liquid': return noise(nr * 2, nc * 2, t * 0.5) * 2 - 1;
        case 'Elastic': 
            // Better stable oscillation without decay
            return sin(t * 1.5 + nr * PI) * cos(t * 0.5);
        case 'Magnetic': 
            return noise(nr * 10, nc * 10, t * 0.1) * 2 - 1;
        case 'Crumble': 
            return (noise(nr * 20, time * 0.5) * 2 - 1);
        case 'Heartbeat':
            return (pow(sin(time * 5), 8) + pow(sin(time * 5 + 0.5), 16)) - 0.5;
        case 'Flow-Field':
            return (noise(nc * 2, nr * 2, time * 0.2) * 2 - 1);
        case 'Ripple-Wave':
            return sin(nc * PI * 2 + time);
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
    
    mPos.addInput(params, 'posAmp', { min: 0, max: 1000 });
    mPos.addInput(params, 'posFreq', { min: 0, max: 10 });
    mPos.addInput(params, 'posStretch', { min: -2, max: 2, label: 'Vertical Stretch' });
    mPos.addInput(params, 'posShear', { min: -1, max: 1, label: 'Shear' });
    
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
    params.startTime = (millis() * 0.001); // Reset effect time
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
