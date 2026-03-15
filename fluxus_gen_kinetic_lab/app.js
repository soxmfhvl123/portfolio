/**
 * FLUX-GEN: Kinetic Type Lab
 * Core Engine v1.0.0
 * p5.js + Tweakpane + opentype.js
 */

let font;
let points = [];
let fontLoaded = false;
let canvas;

// Parameters
const params = {
    // MAIN TAB
    text: 'NOISE',
    fontSize: 80,
    pointDensity: 0.1,
    
    // GRID SETTINGS
    gridRows: 8,
    gridCols: 10,
    gridSpacingX: 120,
    gridSpacingY: 60,
    stagger: true,
    
    // NOISE FIELD
    noiseStrength: 20,
    noiseScale: 0.005,
    noiseSpeed: 0.01,
    
    // VISUALS
    showLines: true,
    connectDistance: 45,
    strokeWeight: 1.0,
    color: '#FF6600',
    bg: '#0a0a0a',
    transparent: false,
    
    // VIEWPORT
    ratio: '16:9',
    margins: 0.39,
    
    // EXPORT (Placeholder logic)
    exportSize: 4.0,
    exportLength: 15,
};

let pane;
let mainFolder, exportFolder, optionsFolder;

function setup() {
    updateCanvasSize();
    canvas = createCanvas(width, height); // Initial size from updateCanvasSize
    canvas.parent('p5-canvas');
    resizeCanvasToRatio();
    
    const fontUrl = 'font.ttf';
    opentype.load(fontUrl, (err, f) => {
        if (err) {
            console.error('Font load error:', err);
            document.getElementById('status-val').innerText = 'PARSE ERROR';
        } else {
            font = f;
            fontLoaded = true;
            generatePoints();
            document.getElementById('status-val').innerText = 'READY';
        }
    });

    initTweakpane();
}

/**
 * Resizes the p5 canvas to fit the container while maintaining aspect ratio
 */
function resizeCanvasToRatio() {
    const container = document.getElementById('canvas-container');
    const containerW = container.offsetWidth - 40; // margin
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
    updateCanvasSize();
}

function generatePoints() {
    if (!fontLoaded) return;
    const path = font.getPath(params.text, 0, 0, params.fontSize);
    points = getPointsFromPath(path, params.pointDensity);
    
    const bbox = path.getBoundingBox();
    const offsetX = (bbox.x1 + bbox.x2) / 2;
    const offsetY = (bbox.y1 + bbox.y2) / 2;
    
    // Center points relative to origin
    points.forEach(p => {
        p.origX = p.x - offsetX;
        p.origY = p.y - offsetY;
    });
}

function draw() {
    if (params.transparent) clear();
    else background(params.bg);
    
    if (!fontLoaded) return;
    document.getElementById('fps-val').innerText = floor(frameRate());
    
    translate(width/2, height/2);
    
    // Grid Rendering (Step & Repeat)
    for (let r = 0; r < params.gridRows; r++) {
        for (let c = 0; c < params.gridCols; c++) {
            push();
            let x = (c - (params.gridCols - 1) / 2) * params.gridSpacingX;
            let y = (r - (params.gridRows - 1) / 2) * params.gridSpacingY;
            
            if (params.stagger && r % 2 === 1) x += params.gridSpacingX / 2;
            
            translate(x, y);
            drawKineticText(r, c);
            pop();
        }
    }
}

function drawKineticText(row, col) {
    stroke(params.color);
    strokeWeight(params.strokeWeight);
    noFill();

    // Secondary noise for individual text instances
    const instanceNoise = noise(row * 0.1, col * 0.1, frameCount * 0.005);
    
    // Calculate displaced positions for this instance
    const displacedPoints = points.map(p => {
        const n = noise(
            (p.origX + row * 100) * params.noiseScale, 
            (p.origY + col * 100) * params.noiseScale, 
            frameCount * params.noiseSpeed
        );
        const angle = n * TWO_PI * 2;
        return {
            x: p.origX + cos(angle) * params.noiseStrength * instanceNoise,
            y: p.origY + sin(angle) * params.noiseStrength * instanceNoise
        };
    });

    if (params.showLines) {
        if (params.connectDistance > 1) {
            // Optimization: Only connect a subset of points if density is high
            const step = points.length > 500 ? 5 : 2;
            for (let i = 0; i < displacedPoints.length; i += step) {
                const p1 = displacedPoints[i];
                for (let j = i + 1; j < displacedPoints.length; j += step * 3) {
                    const p2 = displacedPoints[j];
                    const d = dist(p1.x, p1.y, p2.x, p2.y);
                    if (d < params.connectDistance) {
                        line(p1.x, p1.y, p2.x, p2.y);
                    }
                }
            }
        } else {
            beginShape(POINTS);
            displacedPoints.forEach(p => vertex(p.x, p.y));
            endShape();
        }
    }
}

function initTweakpane() {
    pane = new Tweakpane.Pane({
        container: document.getElementById('tweakpane-container'),
        title: 'TEXTR ENGINE'
    });

    const tabs = pane.addTab({
        pages: [
            {title: 'MAIN'},
            {title: 'EXPORT'},
            {title: 'OPTIONS'},
        ],
    });

    // MAIN PAGE
    const main = tabs.pages[0];
    main.addInput(params, 'text').on('change', () => generatePoints());
    main.addInput(params, 'fontSize', { min: 10, max: 200 }).on('change', () => generatePoints());
    
    const fGrid = main.addFolder({ title: 'STEP & REPEAT' });
    fGrid.addInput(params, 'gridRows', { min: 1, max: 30, step: 1 });
    fGrid.addInput(params, 'gridCols', { min: 1, max: 30, step: 1 });
    fGrid.addInput(params, 'gridSpacingX', { min: 10, max: 400 });
    fGrid.addInput(params, 'gridSpacingY', { min: 10, max: 400 });
    fGrid.addInput(params, 'stagger');

    const fMotion = main.addFolder({ title: 'MOTION / NOISE' });
    fMotion.addInput(params, 'noiseStrength', { min: 0, max: 200 });
    fMotion.addInput(params, 'noiseScale', { min: 0.0001, max: 0.02 });
    fMotion.addInput(params, 'noiseSpeed', { min: 0, max: 0.1 });

    const fVisual = main.addFolder({ title: 'VISUALS' });
    fVisual.addInput(params, 'connectDistance', { min: 0, max: 100 });
    fVisual.addInput(params, 'strokeWeight', { min: 0.1, max: 4 });
    fVisual.addInput(params, 'color');
    fVisual.addInput(params, 'bg');
    fVisual.addInput(params, 'transparent').on('change', (v) => {
        const canvasEl = document.getElementById('p5-canvas');
        if (v.value) canvasEl.classList.add('canvas-grid-bg');
        else canvasEl.classList.remove('canvas-grid-bg');
    });

    // EXPORT PAGE
    const exp = tabs.pages[1];
    exp.addInput(params, 'exportSize', { min: 1, max: 8 });
    exp.addInput(params, 'exportLength', { min: 1, max: 60 });
    exp.addButton({ title: 'EXPORT GRAPHICS' });

    // OPTIONS PAGE
    const opt = tabs.pages[2];
    opt.addInput(params, 'ratio', { options: { '16:9': '16:9', '4:5': '4:5', '1:1': '1:1' } }).on('change', () => resizeCanvasToRatio());
    opt.addInput(params, 'margins', { min: 0, max: 1 });
    opt.addButton({ title: 'FULLSCREEN MODE' });
}

function getPointsFromPath(path, density) {
    const pts = [];
    const commands = path.commands;
    let curX = 0, curY = 0;
    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        if (cmd.type === 'M' || cmd.type === 'L') {
            pts.push({ x: cmd.x, y: cmd.y });
            curX = cmd.x; curY = cmd.y;
        } else if (cmd.type === 'Q') {
            for (let t = 0.1; t <= 1; t += 1 / (density * 50)) {
                const x = (1-t)**2 * curX + 2*(1-t)*t * cmd.x1 + t**2 * cmd.x;
                const y = (1-t)**2 * curY + 2*(1-t)*t * cmd.y1 + t**2 * cmd.y;
                pts.push({ x, y });
            }
            curX = cmd.x; curY = cmd.y;
        } else if (cmd.type === 'C') {
            for (let t = 0.1; t <= 1; t += 1 / (density * 50)) {
                const x = (1-t)**3 * curX + 3*(1-t)**2*t * cmd.x1 + 3*(1-t)*t**2 * cmd.x2 + t**3 * cmd.x;
                const y = (1-t)**3 * curY + 3*(1-t)**2*t * cmd.y1 + 3*(1-t)*t**2 * cmd.y2 + t**3 * cmd.y;
                pts.push({ x, y });
            }
            curX = cmd.x; curY = cmd.y;
        }
    }
    return pts;
}

document.getElementById('fluxus-btn').addEventListener('click', () => {
    params.noiseStrength = random(5, 60);
    params.noiseScale = random(0.001, 0.015);
    params.gridRows = floor(random(3, 15));
    params.gridCols = floor(random(3, 15));
    if (pane) pane.refresh();
});

function windowResized() {
    resizeCanvasToRatio();
}
