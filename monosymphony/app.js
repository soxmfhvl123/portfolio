import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class MonoOrchestra {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Core Parameters
        this.particleCount = 80000;
        this.particleBaseSize = 0.5;

        // Audio and Animation State
        this.audioData = { bass: 0, treble: 0, overall: 0 };
        this.flowTime = 0; // Cumulative flow to prevent uTime * uBass shaking issue

        this.initScene();
        this.initParticles();
        this.initEvents();

        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.FogExp2(0x000000, 0.015);

        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 0, 40);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;
        this.controls.enableZoom = false;

        this.mouse = new THREE.Vector2(-9999, -9999);
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.targetMouse3D = new THREE.Vector3(0, 0, 0);
        this.currentMouse3D = new THREE.Vector3(0, 0, 0);
    }

    initParticles() {
        const geometry = new THREE.PlaneGeometry(this.particleBaseSize, this.particleBaseSize);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uFlow: { value: 0 }, // New uniform for smooth accumulation
                uMouse: { value: new THREE.Vector3() },
                uHoverState: { value: 0 },
                uBass: { value: 0 },
                uTreble: { value: 0 }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uFlow;
                uniform vec3 uMouse;
                uniform float uBass;
                uniform float uTreble;
                
                attribute vec3 aRandom;
                attribute float aScale;
                
                varying vec2 vUv;
                varying float vAlpha;
                
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
                    float n_ = 0.142857142857;
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

                void main() {
                    vUv = uv;
                    vec3 iPos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
                    
                    // FIXED: Use a pre-calculated cumulative uFlow instead of (uTime * reactive_factor)
                    float flow = uFlow;
                    vec3 noisePos = iPos * 0.05 + aRandom * 10.0;
                    
                    float nx = snoise(noisePos + vec3(flow, 0.0, 0.0));
                    float ny = snoise(noisePos + vec3(0.0, flow, 0.0));
                    float nz = snoise(noisePos + vec3(0.0, 0.0, flow));
                    // SUBTLE REACTIVITY: 30% of extreme version
                    vec3 fluidOffset = vec3(nx, ny, nz) * (1.5 + uTreble * 7.5 + uBass * 4.5);
                    vec3 finalPos = iPos + fluidOffset;
                    
                    vAlpha = 1.0 - (abs(finalPos.z) / 40.0);

                    // Dynamic Pumping: Reduced scale hit to 30%
                    float dynamicScale = aScale * (1.0 + uBass * 2.4 + uTreble * 0.6);

                    vec4 mvPosition = viewMatrix * vec4(finalPos, 1.0);
                    mvPosition.xyz += position * dynamicScale; 
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                varying float vAlpha;
                void main() {
                    vec2 cxy = 2.0 * vUv - 1.0;
                    float distance = length(cxy);
                    if (distance > 1.0) discard;
                    
                    float intensity = exp(-distance * 3.0); 
                    // Tamed Bloom: Reduced final alpha by 50% to prevent blow-out from additive blending
                    float alpha = intensity * vAlpha * 0.5;
                    
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.instancedMesh = new THREE.InstancedMesh(geometry, this.material, this.particleCount);

        const dummy = new THREE.Object3D();
        const randoms = new Float32Array(this.particleCount * 3);
        const scales = new Float32Array(this.particleCount);

        for (let i = 0; i < this.particleCount; i++) {
            const radius = Math.pow(Math.random(), 3) * 60;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta) * 0.35;
            const z = radius * Math.cos(phi);

            dummy.position.set(x, y, z);
            dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, dummy.matrix);

            randoms[i * 3] = Math.random();
            randoms[i * 3 + 1] = Math.random();
            randoms[i * 3 + 2] = Math.random();

            const isBigStar = Math.random() > 0.985;
            scales[i] = isBigStar ? (Math.random() * 2.5 + 1.0) : (Math.random() * 0.4 + 0.05);
        }

        this.instancedMesh.geometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(randoms, 3));
        this.instancedMesh.geometry.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 1));
        this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.instancedMesh);
    }

    initEvents() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height);
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / this.width) * 2 - 1;
            this.mouse.y = -(e.clientY / this.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            this.raycaster.ray.intersectPlane(this.plane, this.targetMouse3D);
        });

        window.addEventListener('mouseout', () => {
            this.targetMouse3D.set(-9999, -9999, 0);
        });
    }

    resetFlow() {
        this.flowTime = 0;
        if (this.material) {
            this.material.uniforms.uFlow.value = 0;
        }
    }

    animate() {
        requestAnimationFrame(this.animate);
        const deltaTime = this.clock.getDelta();
        
        // SUBTLE REACTIVITY: 30% warp speed
        this.flowTime += deltaTime * (0.1 + this.audioData.bass * 0.75);

        this.currentMouse3D.lerp(this.targetMouse3D, 0.1);

        if (this.material) {
            this.material.uniforms.uTime.value = this.clock.getElapsedTime();
            this.material.uniforms.uFlow.value = this.flowTime;
            this.material.uniforms.uMouse.value.copy(this.currentMouse3D);
            this.material.uniforms.uBass.value = this.audioData.bass;
            this.material.uniforms.uTreble.value = this.audioData.treble;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Instantiate
const app = new MonoOrchestra();
window.monoApp = app; // Expose to global for Audio Link
