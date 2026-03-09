import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

class DataSwiftArt {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Configuration / GUI Parameters (Defaulted from user snippet)
        this.params = {
            particleCount: 150000,
            shapeMode: 0, // 0: Rectangle, 1: Cube, 2: Sphere, 3: Tetrahedron, 4: Torus
            scale: 0.08,
            speed: 0.1,
            turbulence: 3.0,
            flowComplexity: 3.0,
            repulsionRadius: 0.5,
            repulsionStrength: 1.0,
            colorMode: 0, // 0: Neon Cyber, 1: Molten Gold, 2: Deep Aqua, 3: Crimson Night, 4: Vaporwave
            bloomStrength: 0.0,
            bloomRadius: 0.0,
            bloomThreshold: 0.0
        };

        this.initScene();
        this.initGUI();
        this.initParticles();
        this.initPostProcessing();
        this.initEventListeners();

        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.02); // Pure Black Fog

        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 0, 100);

        this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", alpha: false });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.setClearColor(0x000000); // Pure Black Background
        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;

        // Interaction coordinates
        this.mouse = new THREE.Vector2(-9999, -9999);
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.intersectionPoint = new THREE.Vector3(-9999, -9999, 0);
    }

    initGUI() {
        this.gui = new GUI({ title: 'FLOW CONTROLS', width: 340 });

        const flowFolder = this.gui.addFolder('Dynamics');
        flowFolder.add(this.params, 'speed', 0.1, 2.0, 0.01).name('Time Speed');
        flowFolder.add(this.params, 'turbulence', 0.1, 5.0, 0.1).name('Turbulence');
        flowFolder.add(this.params, 'flowComplexity', 0.1, 5.0, 0.1).name('Complexity');

        const interactiveFolder = this.gui.addFolder('Interaction');
        interactiveFolder.add(this.params, 'repulsionRadius', 0.1, 10.0, 0.1).name('Cursor Radius');
        interactiveFolder.add(this.params, 'repulsionStrength', 1.0, 20.0, 0.1).name('Repel Force');

        const styleFolder = this.gui.addFolder('Aesthetics');
        styleFolder.add(this.params, 'shapeMode', { 'Rectangle Pixel': 0, 'Data Cube': 1, 'Quantum Sphere': 2, 'Tetrahedron': 3, 'Torus Ring': 4 }).name('Base Geometry').onChange((v) => {
            this.updateGeometry(v);
        });

        styleFolder.add(this.params, 'colorMode', {
            'Neon Cyber': 0,
            'Molten Gold': 1,
            'Deep Aqua': 2,
            'Crimson Night': 3,
            'Vaporwave': 4,
            'Matrix Green': 5
        }).name('Color Theme').onChange(() => {
            if (this.material) this.material.uniforms.uColorMode.value = this.params.colorMode;
        });

        const bloomFolder = styleFolder.addFolder('Glow / Bloom');
        bloomFolder.add(this.params, 'bloomStrength', 0.0, 3.0, 0.1).onChange((v) => this.bloomPass.strength = v);
        bloomFolder.add(this.params, 'bloomRadius', 0.0, 1.0, 0.01).onChange((v) => this.bloomPass.radius = v);
        bloomFolder.add(this.params, 'bloomThreshold', 0.0, 1.0, 0.01).onChange((v) => this.bloomPass.threshold = v);

        // Fold GUI by default
        this.gui.close();
    }

    initPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.width, this.height),
            this.params.bloomStrength,
            this.params.bloomRadius,
            this.params.bloomThreshold
        );
        this.composer.addPass(this.bloomPass);
    }

    getGeometryByMode(mode, scale) {
        switch (parseInt(mode)) {
            case 1: return new THREE.BoxGeometry(scale * 1.5, scale * 1.5, scale * 1.5); // Cube
            case 2: return new THREE.SphereGeometry(scale * 1.2, 5, 5); // Low-poly Dot/Sphere
            case 3: return new THREE.TetrahedronGeometry(scale * 1.5, 0); // Triangle Pyramid
            case 4: return new THREE.TorusGeometry(scale * 1.2, scale * 0.4, 3, 12); // Tiny Torus Ring
            case 0:
            default:
                return new THREE.BoxGeometry(scale, scale, scale * 10); // Standard Rectangular Pixel
        }
    }

    updateGeometry(mode) {
        if (!this.instancedMesh) return;

        const oldGeometry = this.instancedMesh.geometry;
        const newGeometry = this.getGeometryByMode(mode, this.params.scale);

        // Preserve the base position layout buffer
        if (oldGeometry.attributes.aBasePosition) {
            newGeometry.setAttribute('aBasePosition', oldGeometry.attributes.aBasePosition);
        }

        this.instancedMesh.geometry = newGeometry;
        oldGeometry.dispose();
    }

    initParticles() {
        const geometry = this.getGeometryByMode(this.params.shapeMode, this.params.scale);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uSpeed: { value: this.params.speed },
                uTurbulence: { value: this.params.turbulence },
                uComplexity: { value: this.params.flowComplexity },
                uMousePos: { value: new THREE.Vector3() },
                uRepulsionRadius: { value: this.params.repulsionRadius },
                uRepulsionStrength: { value: this.params.repulsionStrength },
                uColorMode: { value: this.params.colorMode }
            },
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.instancedMesh = new THREE.InstancedMesh(geometry, this.material, this.params.particleCount);

        const dummy = new THREE.Object3D();
        const basePositions = new Float32Array(this.params.particleCount * 3);

        for (let i = 0; i < this.params.particleCount; i++) {
            const x = (Math.random() - 0.5) * 50;
            const y = (Math.random() - 0.5) * 30;
            const z = (Math.random() - 0.5) * 30;

            dummy.position.set(x, y, z);

            dummy.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, dummy.matrix);

            basePositions[i * 3] = x;
            basePositions[i * 3 + 1] = y;
            basePositions[i * 3 + 2] = z;
        }

        geometry.setAttribute('aBasePosition', new THREE.InstancedBufferAttribute(basePositions, 3));

        this.scene.add(this.instancedMesh);
    }

    getVertexShader() {
        return `
            uniform float uTime;
            uniform float uSpeed;
            uniform float uTurbulence;
            uniform float uComplexity;
            uniform vec3 uMousePos;
            uniform float uRepulsionRadius;
            uniform float uRepulsionStrength;
            
            attribute vec3 aBasePosition;
            
            varying vec3 vPosition;
            varying float vNoise;
            
            // --- GLSL SIMPLEX NOISE 3D ---
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

            float snoise(vec3 v) {
                const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

                vec3 i  = floor(v + dot(v, C.yyy) );
                vec3 x0 = v - i + dot(i, C.xxx) ;

                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min( g.xyz, l.zxy );
                vec3 i2 = max( g.xyz, l.zxy );

                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;

                i = mod289(i);
                vec4 p = permute( permute( permute(
                            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

                float n_ = 0.142857142857; // 1.0/7.0
                vec3  ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_ );

                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4( x.xy, y.xy );
                vec4 b1 = vec4( x.zw, y.zw );

                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

                vec3 p0 = vec3(a0.xy,h.x);
                vec3 p1 = vec3(a0.zw,h.y);
                vec3 p2 = vec3(a1.xy,h.z);
                vec3 p3 = vec3(a1.zw,h.w);

                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;

                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
            }

            // --- PSEUDO CURL NOISE ---
            vec3 snoiseVec3( vec3 x ){
                float s  = snoise(vec3( x ));
                float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
                float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
                return vec3( s , s1 , s2 );
            }

            vec3 curlNoise( vec3 p ){
                const float e = 0.1;
                vec3 dx = vec3( e   , 0.0 , 0.0 );
                vec3 dy = vec3( 0.0 , e   , 0.0 );
                vec3 dz = vec3( 0.0 , 0.0 , e   );

                vec3 p_x0 = snoiseVec3( p - dx );
                vec3 p_x1 = snoiseVec3( p + dx );
                vec3 p_y0 = snoiseVec3( p - dy );
                vec3 p_y1 = snoiseVec3( p + dy );
                vec3 p_z0 = snoiseVec3( p - dz );
                vec3 p_z1 = snoiseVec3( p + dz );

                float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
                float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
                float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

                const float divisor = 1.0 / ( 2.0 * e );
                return normalize( vec3( x , y , z ) * divisor );
            }

            void main() {
                vec3 pos = aBasePosition;
                
                // --- 1. Compute Organic Fluid Flow ---
                float t = uTime * uSpeed;
                vec3 noiseCoord = pos * (uComplexity * 0.02) + vec3(0.0, 0.0, t);
                vec3 flow = curlNoise(noiseCoord) * uTurbulence * 3.0;
                pos += flow;
                
                // --- 2. Enhanced Mouse Vortex Physics ---
                float distToMouse = distance(pos, uMousePos);
                
                // Create a smooth influence falloff region
                float repulsionStrength = smoothstep(uRepulsionRadius * 5.0, 0.0, distToMouse) * uRepulsionStrength;
                
                // Pure push-away vector
                vec3 repulseDir = normalize(pos - uMousePos);
                
                // Swirl vector (cross product of direction with arbitrary Z vector gives a vortex)
                vec3 swirlDir = cross(repulseDir, vec3(0.0, 0.0, 1.0));
                
                // Combine forces: repulse + twist (multiplied for exaggeration)
                vec3 forceMap = (repulseDir + swirlDir * 3.0) * repulsionStrength;
                pos += forceMap;
                
                vPosition = pos;
                vNoise = length(flow); 
                
                // --- 3. Matrix Transformations ---
                vec4 mvPosition = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
                mvPosition.xyz += (viewMatrix * modelMatrix * vec4(pos, 0.0)).xyz;
                
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    getFragmentShader() {
        return `
            uniform float uColorMode;
            uniform float uTime;
            
            varying vec3 vPosition;
            varying float vNoise;
            
            vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
                return a + b*cos( 6.28318*(c*t+d) );
            }
            
            void main() {
                vec3 color = vec3(0.0);
                
                float t = (vPosition.y * 0.04) + (vNoise * 0.15) + (uTime * 0.05) + 0.5;
                
                if (uColorMode < 0.5) {
                    // Neon Cyber (Refik Anadol classic)
                    color = palette(t, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(1.0,1.0,1.0), vec3(0.263,0.416,0.557));
                    color.r *= 0.6; color.g *= 0.8; color.b *= 1.8;
                    
                } else if (uColorMode < 1.5) {
                    // Molten Gold
                    color = palette(t, vec3(0.8,0.5,0.4), vec3(0.2,0.4,0.2), vec3(2.0,1.0,1.0), vec3(0.0,0.25,0.25));
                    
                } else if (uColorMode < 2.5) {
                    // Deep Aqua Simulation
                    color = palette(t, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(1.0,1.0,1.0), vec3(0.0,0.33,0.67));
                    color.g *= 1.5;

                } else if (uColorMode < 3.5) {
                    // Crimson Night
                    color = palette(t, vec3(0.5,0.2,0.2), vec3(0.5,0.2,0.1), vec3(1.0,1.0,1.0), vec3(0.0,0.1,0.2));
                    color.r *= 2.0; color.g *= 0.5; color.b *= 0.2;
                    
                } else if (uColorMode < 4.5) {
                    // Vaporwave
                    color = palette(t + (uTime*0.1), vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(1.0,1.0,1.0), vec3(0.3,0.2,0.2));
                    color.r *= 1.5; color.b *= 1.4; color.g *= 0.6;

                } else {
                    // Matrix Green
                    color = palette(t, vec3(0.2,0.5,0.2), vec3(0.1,0.5,0.1), vec3(1.0,1.0,1.0), vec3(0.3,0.0,0.3));
                    color.r *= 0.3; color.g *= 2.0; color.b *= 0.3;
                }
                
                float alpha = smoothstep(0.0, 0.5, vNoise);
                
                gl_FragColor = vec4(color, max(0.4, alpha));
            }
        `;
    }

    initEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        });
    }

    onWindowResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
        this.composer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(this.animate);
        const elapsedTime = this.clock.getElapsedTime();

        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.raycaster.ray.intersectPlane(this.plane, this.intersectionPoint);

        if (this.material) {
            this.material.uniforms.uTime.value = elapsedTime;
            this.material.uniforms.uSpeed.value = this.params.speed;
            this.material.uniforms.uTurbulence.value = this.params.turbulence;
            this.material.uniforms.uComplexity.value = this.params.flowComplexity;
            this.material.uniforms.uRepulsionRadius.value = this.params.repulsionRadius;
            this.material.uniforms.uRepulsionStrength.value = this.params.repulsionStrength;

            if (this.intersectionPoint) {
                if (Math.abs(this.mouse.x) < 0.99 && Math.abs(this.mouse.y) < 0.99) {
                    this.material.uniforms.uMousePos.value.copy(this.intersectionPoint);
                } else {
                    this.material.uniforms.uMousePos.value.set(-9999, -9999, -9999);
                }
            }
        }

        this.controls.update();
        this.composer.render();
    }
}

// Bootstrap
window.onload = () => { new DataSwiftArt(); };
