import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class CLABGenerator {
    constructor() {
        this.canvas = document.querySelector('#canvas-3d');
        this.setupScene();
        this.setupLights();
        this.setupControls();
        this.setupEventListeners();
        
        this.nodes = [];
        this.lines = [];
        this.intersectionNodes = [];
        this.annotations = [];
        
        this.params = {
            nodeCount: 10,
            connectivity: 0.5,
            starType: '4pt',
            starDepth: 0.5,
            gridSize: 10
        };

        this.generate();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xF2F2F2);
        
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
        this.camera.position.set(250, 200, 350);
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Container for HTML annotations
        this.annotationContainer = document.createElement('div');
        this.annotationContainer.id = 'annotations-root';
        this.annotationContainer.style.position = 'fixed';
        this.annotationContainer.style.top = '0';
        this.annotationContainer.style.left = '0';
        this.annotationContainer.style.pointerEvents = 'none';
        this.annotationContainer.style.zIndex = '5';
        document.body.appendChild(this.annotationContainer);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
        mainLight.position.set(200, 400, 200);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        this.scene.add(mainLight);
    }

    setupControls() {
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.05;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Toggle Buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.params.starType = btn.dataset.type;
                this.generate();
            });
        });

        // Sliders
        const setupSlider = (id, param) => {
            const el = document.querySelector(`#${id}`);
            el.addEventListener('input', (e) => {
                this.params[param] = parseFloat(e.target.value);
                document.querySelector(`#${id}-val`).textContent = e.target.value;
                this.generate();
            });
        };

        setupSlider('star-depth', 'starDepth');
        setupSlider('node-count', 'nodeCount');
        setupSlider('connectivity', 'connectivity');

        document.querySelector('#export-svg').addEventListener('click', () => {
            this.exportToSVG();
        });
    }

    createStarGeometry(type, size, depth) {
        const geometry = new THREE.BufferGeometry();
        let vertices = [];

        if (type === '4pt') {
            // Rhombus Star (8 triangles)
            // Center is 0,0,0
            // Vertical axis (Y), Horizontal (X/Z)
            const pts = [
                [0, size, 0], [0, -size, 0], // Top, Bottom
                [size * 0.3, 0, 0], [-size * 0.3, 0, 0], // Left, Right
                [0, 0, size * 0.3], [0, 0, -size * 0.3] // Front, Back
            ];
            
            // Construct diamond-like faces
            const addTri = (a, b, c) => vertices.push(...a, ...b, ...c);
            // Octahedron simplified for star look
            const top = pts[0], bot = pts[1], l = pts[2], r = pts[3], f = pts[4], bk = pts[5];
            addTri(top, f, l); addTri(top, l, bk); addTri(top, bk, r); addTri(top, r, f);
            addTri(bot, f, l); addTri(bot, l, bk); addTri(bot, bk, r); addTri(bot, r, f);
        } else {
            // 6PT Crystalline Star (Hexagonal-ish)
            const ring = 6;
            const top = [0, size, 0];
            const bot = [0, -size, 0];
            const midPoints = [];
            for (let i = 0; i < ring; i++) {
                const angle = (i / ring) * Math.PI * 2;
                midPoints.push([
                    Math.cos(angle) * size * 0.4,
                    0,
                    Math.sin(angle) * size * 0.4
                ]);
            }
            for (let i = 0; i < ring; i++) {
                const p1 = midPoints[i];
                const p2 = midPoints[(i + 1) % ring];
                vertices.push(...top, ...p1, ...p2);
                vertices.push(...bot, ...p1, ...p2);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();
        return geometry;
    }

    generate() {
        // Clear previous
        this.nodes.forEach(n => this.scene.remove(n));
        this.lines.forEach(l => this.scene.remove(l));
        this.intersectionNodes.forEach(n => this.scene.remove(n));
        this.annotationContainer.innerHTML = '';
        this.nodes = [];
        this.lines = [];
        this.intersectionNodes = [];
        this.annotations = [];

        const size = this.params.gridSize;
        const range = 200;
        const starMat = new THREE.MeshStandardMaterial({ 
            color: 0x050505, 
            roughness: 0.9, 
            metalness: 0.1 
        });

        // 1. Principal Node Generation
        for(let i = 0; i < this.params.nodeCount; i++) {
            const x = Math.round((Math.random() - 0.5) * range / size) * size;
            const y = Math.round((Math.random() - 0.5) * range / size) * size;
            const z = Math.round((Math.random() - 0.5) * range / size) * size;

            const geo = this.createStarGeometry(this.params.starType, size, this.params.starDepth);
            const node = new THREE.Mesh(geo, starMat);
            node.position.set(x, y, z);
            node.castShadow = true;
            this.scene.add(node);
            this.nodes.push(node);
        }

        // 2. Line Connection & Annotation
        const lineMat = new THREE.LineBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.4 });
        for(let i = 0; i < this.nodes.length; i++) {
            for(let j = i + 1; j < this.nodes.length; j++) {
                const p1 = this.nodes[i].position;
                const p2 = this.nodes[j].position;
                const dist = p1.distanceTo(p2);
                
                if(dist < (range * this.params.connectivity)) {
                    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
                    const line = new THREE.Line(geo, lineMat);
                    this.scene.add(line);
                    this.lines.push(line);

                    // Add Drafting Annotation
                    const mid = new THREE.Vector3().lerpVectors(p1, p2, 0.5);
                    this.annotations.push({
                        pos: mid,
                        text: `${Math.round(dist)}px`
                    });
                }
            }
        }

        // 3. Simple Intersection Logic (Mid-point nodes for connectivity feel)
        this.lines.forEach((l, idx) => {
            if (idx % 3 === 0) { // Limit intersections for performance/visual clarity
                const pos = l.geometry.getAttribute('position');
                const v1 = new THREE.Vector3().fromBufferAttribute(pos, 0);
                const v2 = new THREE.Vector3().fromBufferAttribute(pos, 1);
                const mid = new THREE.Vector3().lerpVectors(v1, v2, 0.5);
                
                const geo = this.createStarGeometry(this.params.starType, size * 0.5, this.params.starDepth);
                const node = new THREE.Mesh(geo, starMat);
                node.position.copy(mid);
                this.scene.add(node);
                this.intersectionNodes.push(node);
            }
        });

        // Render Initial Annotations
        this.annotations.forEach(a => {
            const el = document.createElement('div');
            el.className = 'annotation-label';
            el.textContent = a.text;
            this.annotationContainer.appendChild(el);
            a.el = el;
        });
    }

    updateAnnotations() {
        const widthHalf = window.innerWidth / 2;
        const heightHalf = window.innerHeight / 2;

        this.annotations.forEach(a => {
            const vec = a.pos.clone().project(this.camera);
            if (vec.z > 1) { // Behind camera
                a.el.style.display = 'none';
            } else {
                a.el.style.display = 'block';
                const x = (vec.x * widthHalf) + widthHalf;
                const y = -(vec.y * heightHalf) + heightHalf;
                a.el.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
            }
        });
    }

    exportToSVG() {
        // Modern hatching-style export logic would go here
        // For now, continuing with the precise line export
        const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" width="${window.innerWidth}" height="${window.innerHeight}" viewBox="0 0 ${window.innerWidth} ${window.innerHeight}">`;
        let svgContent = `<rect width="100%" height="100%" fill="#F2F2F2"/>`;
        
        const widthHalf = window.innerWidth / 2;
        const heightHalf = window.innerHeight / 2;
        const project = (pos) => {
            const p = pos.clone().project(this.camera);
            return { x: (p.x * widthHalf) + widthHalf, y: -(p.y * heightHalf) + heightHalf };
        };

        this.lines.forEach(l => {
            const attr = l.geometry.getAttribute('position');
            const pt1 = project(new THREE.Vector3().fromBufferAttribute(attr, 0));
            const pt2 = project(new THREE.Vector3().fromBufferAttribute(attr, 1));
            svgContent += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="#050505" stroke-width="0.5" opacity="0.4"/>`;
        });

        [...this.nodes, ...this.intersectionNodes].forEach(n => {
            const pt = project(n.position);
            svgContent += `<path d="M${pt.x-5},${pt.y} L${pt.x},${pt.y-5} L${pt.x+5},${pt.y} L${pt.x},${pt.y+5} Z" fill="#050505"/>`;
        });

        const svgFooter = `</svg>`;
        const blob = new Blob([svgHeader + svgContent + svgFooter], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clab-geometric-intelligence.svg';
        a.click();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.orbitControls.update();
        this.updateAnnotations();
        this.renderer.render(this.scene, this.camera);
    }
}

new CLABGenerator();
