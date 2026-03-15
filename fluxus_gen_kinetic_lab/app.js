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
    text: 'FLUX',
    fontSize: 280,
    noiseScale: 0.005,
    noiseSpeed: 0.01,
    noiseStrength: 80,
    pointDensity: 0.15,
    strokeWeight: 1.5,
    color: '#ffffff',
    bg: '#0a0a0a',
    showPoints: false,
    showLines: true,
    connectDistance: 30,
    autoRotate: 0,
    noiseMode: 'perlin',
    snapToGrid: false,
    gridSize: 10
};

let pane;

function setup() {
    canvas = createCanvas(windowWidth - 340, windowHeight - 60);
    canvas.parent('p5-canvas');
    
    // Load font using opentype.js - Using local font for maximum reliability
    const fontUrl = 'font.ttf';
    
    opentype.load(fontUrl, (err, f) => {
        if (err) {
            console.error('Font load error:', err);
            document.getElementById('status-val').innerText = 'PARSE ERROR';
            // Final fallback to a very simple system text if opentype fails
            // (p5 text will handle this in draw if fontLoaded is false but we can set a flag)
        } else {
            font = f;
            fontLoaded = true;
            generatePoints();
            document.getElementById('status-val').innerText = 'READY';
        }
    });

    initTweakpane();
    document.getElementById('res-val').innerText = `${width}x${height}`;
}

// ... generatePoints, draw, etc stay same ...
function generatePoints() {
    if (!fontLoaded) return;
    
    const path = font.getPath(params.text, 0, 0, params.fontSize);
    points = [];
    
    // Custom sampling logic for opentype.js path
    const fontPoints = getPointsFromPath(path, params.pointDensity);
    
    const bbox = path.getBoundingBox();
    const offsetX = (bbox.x1 + bbox.x2) / 2;
    const offsetY = (bbox.y1 + bbox.y2) / 2;
    
    fontPoints.forEach(p => {
        points.push({
            origX: p.x - offsetX,
            origY: p.y - offsetY,
            x: p.x - offsetX,
            y: p.y - offsetY
        });
    });
}

/**
 * Samples an opentype.js path to get points at a certain density
 */
function getPointsFromPath(path, density) {
    const pts = [];
    const commands = path.commands;
    let curX = 0;
    let curY = 0;
    
    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        if (cmd.type === 'M' || cmd.type === 'L') {
            pts.push({ x: cmd.x, y: cmd.y });
            curX = cmd.x;
            curY = cmd.y;
        } else if (cmd.type === 'Q') {
            // Sample quadratic curve
            for (let t = 0.1; t <= 1; t += 1 / (density * 100)) {
                const x = (1 - t) * (1 - t) * curX + 2 * (1 - t) * t * cmd.x1 + t * t * cmd.x;
                const y = (1 - t) * (1 - t) * curY + 2 * (1 - t) * t * cmd.y1 + t * t * cmd.y;
                pts.push({ x, y });
            }
            curX = cmd.x;
            curY = cmd.y;
        } else if (cmd.type === 'C') {
            // Sample cubic curve
            for (let t = 0.1; t <= 1; t += 1 / (density * 100)) {
                const x = Math.pow(1 - t, 3) * curX + 3 * Math.pow(1 - t, 2) * t * cmd.x1 + 3 * (1 - t) * Math.pow(t, 2) * cmd.x2 + Math.pow(t, 3) * cmd.x;
                const y = Math.pow(1 - t, 3) * curY + 3 * Math.pow(1 - t, 2) * t * cmd.y1 + 3 * (1 - t) * Math.pow(t, 2) * cmd.y2 + Math.pow(t, 3) * cmd.y;
                pts.push({ x, y });
            }
            curX = cmd.x;
            curY = cmd.y;
        }
    }
    return pts;
}

function draw() {
    background(params.bg);
    if (!fontLoaded) return;
    document.getElementById('fps-val').innerText = floor(frameRate());
    translate(width/2, height/2);
    rotate(params.autoRotate * frameCount * 0.01);
    stroke(params.color);
    strokeWeight(params.strokeWeight);
    noFill();

    points.forEach(p => {
        const n = noise(
            p.origX * params.noiseScale, 
            p.origY * params.noiseScale, 
            frameCount * params.noiseSpeed
        );
        const angle = n * TWO_PI * 2;
        p.x = p.origX + cos(angle) * params.noiseStrength;
        p.y = p.origY + sin(angle) * params.noiseStrength;
        if (params.snapToGrid) {
            p.x = round(p.x / params.gridSize) * params.gridSize;
            p.y = round(p.y / params.gridSize) * params.gridSize;
        }
    });

    if (params.showLines) {
        beginShape(POINTS);
        points.forEach(p => vertex(p.x, p.y));
        endShape();
        if (params.connectDistance > 0) {
            stroke(params.color + '44');
            for (let i = 0; i < points.length; i += 5) {
                for (let j = i + 1; j < points.length; j += 15) {
                    const d = dist(points[i].x, points[i].y, points[j].x, points[j].y);
                    if (d < params.connectDistance) {
                        line(points[i].x, points[i].y, points[j].x, points[j].y);
                    }
                }
            }
        }
    }
    if (params.showPoints) {
        strokeWeight(params.strokeWeight * 3);
        points.forEach(p => point(p.x, p.y));
    }
}

function windowResized() {
    resizeCanvas(windowWidth - 340, windowHeight - 60);
    document.getElementById('res-val').innerText = `${width}x${height}`;
}

function initTweakpane() {
    pane = new Tweakpane.Pane({
        container: document.getElementById('tweakpane-container')
    });

    const f1 = pane.addFolder({ title: 'TYPE SETTINGS' });
    f1.addInput(params, 'text').on('change', () => generatePoints());
    f1.addInput(params, 'fontSize', { min: 50, max: 600 }).on('change', () => generatePoints());
    f1.addInput(params, 'pointDensity', { min: 0.05, max: 0.5 }).on('change', () => generatePoints());
    
    const f2 = pane.addFolder({ title: 'NOISE FIELD' });
    f2.addInput(params, 'noiseStrength', { min: 0, max: 300 });
    f2.addInput(params, 'noiseScale', { min: 0.001, max: 0.05 });
    f2.addInput(params, 'noiseSpeed', { min: 0, max: 0.05 });
    
    const f3 = pane.addFolder({ title: 'VISUALS' });
    f3.addInput(params, 'showLines');
    f3.addInput(params, 'connectDistance', { min: 0, max: 100 });
    f3.addInput(params, 'showPoints');
    f3.addInput(params, 'strokeWeight', { min: 0.5, max: 5 });
    f3.addInput(params, 'snapToGrid');
    f3.addInput(params, 'gridSize', { min: 2, max: 50, step: 1 });
    f3.addInput(params, 'autoRotate', { min: -1, max: 1 });

    const f4 = pane.addFolder({ title: 'COLORS' });
    f4.addInput(params, 'color');
    f4.addInput(params, 'bg');
}

// Randomizer
document.getElementById('fluxus-btn').addEventListener('click', () => {
    params.noiseStrength = random(20, 200);
    params.noiseScale = random(0.002, 0.02);
    params.noiseSpeed = random(0.005, 0.03);
    params.connectDistance = random(10, 60);
    params.fontSize = random(100, 400);
    
    generatePoints();
    if (pane) pane.refresh();
});
