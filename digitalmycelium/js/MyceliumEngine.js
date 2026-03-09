// ========================================
// MYCELIUM ENGINE (Three.js Wrapper)
// Handles Scene, Camera, Renderer, and Particles
// ========================================

class MyceliumEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.clock = new THREE.Clock();
        this.settings = {
            density: 50.0,
            fluidity: 60.0,
            baseColor: new THREE.Color(0xBCFF00),
            accentColor: new THREE.Color(0xD100FF),
            mouse: new THREE.Vector2(0, 0),
            audioFreq: 0.0,
            mode: 0.0 // 0: Flora, 1: Fauna, 2: Fungi
        };

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.init();
        
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.position.z = 120;

        this.createParticles();
        this.createFungiLines();
        this.animate();
    }

    createParticles() {
        const particleCount = 120000; // Increased for thick clumping
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const randoms = new Float32Array(particleCount);
        const species = new Float32Array(particleCount);
        
        for(let i = 0; i < particleCount; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 450;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 450;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 450;
            randoms[i] = Math.random();
            species[i] = Math.floor(Math.random() * 3.0); // 0, 1, or 2
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
        geometry.setAttribute('aSpecies', new THREE.BufferAttribute(species, 1));

        this.material = new THREE.ShaderMaterial({
            vertexShader: Shaders.getVertexShader(),
            fragmentShader: Shaders.fragment,
            uniforms: {
                u_time: { value: 0.0 },
                u_mouse_x: { value: 0.0 },
                u_mouse_y: { value: 0.0 },
                u_density: { value: 50.0 },
                u_fluidity: { value: 60.0 },
                u_audioFreq: { value: 0.0 },
                u_mode: { value: 0.0 },
                u_colorBase: { value: this.settings.baseColor },
                u_colorAccent: { value: this.settings.accentColor },
                u_evolution: { value: 0.0 }
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, this.material);
        this.scene.add(this.particles);
    }

    // Specialized Fungi Lines
    createFungiLines() {
        const lineCount = 8000; // Reduced to prevent flickering (aliasing)
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(lineCount * 2 * 3); // Pair of points
        
        for(let i = 0; i < lineCount; i++) {
            // Line Start
            const x = (Math.random() - 0.5) * 450;
            const y = (Math.random() - 0.5) * 450;
            const z = (Math.random() - 0.5) * 450;
            positions[i * 6] = x;
            positions[i * 6 + 1] = y;
            positions[i * 6 + 2] = z;
            // Line End (Slightly longer for a more connected feel)
            positions[i * 6 + 3] = x + (Math.random() - 0.5) * 80;
            positions[i * 6 + 4] = y + (Math.random() - 0.5) * 80;
            positions[i * 6 + 5] = z + (Math.random() - 0.5) * 80;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.lineMaterial = new THREE.ShaderMaterial({
            vertexShader: Shaders.getVertexShader(),
            fragmentShader: `
                varying float vNoise;
                uniform vec3 u_colorBase;
                void main() {
                    gl_FragColor = vec4(u_colorBase, 0.2 + (vNoise * 0.1));
                }
            `,
            uniforms: {
                u_time: { value: 0.0 },
                u_mouse_x: { value: 0.0 },
                u_mouse_y: { value: 0.0 },
                u_density: { value: 50.0 },
                u_fluidity: { value: 60.0 },
                u_audioFreq: { value: 0.0 },
                u_mode: { value: 2.0 },
                u_colorBase: { value: this.settings.baseColor },
                u_evolution: { value: 0.0 }
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.lineNetwork = new THREE.LineSegments(geometry, this.lineMaterial);
        this.lineNetwork.visible = false; 
        this.scene.add(this.lineNetwork);
        
        // Growth State
        this.evolution = 0.0;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        if (!this.settings || !this.settings.mouse) return;
        this.settings.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.settings.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    updateSettings(key, value) {
        if (this.settings.hasOwnProperty(key)) {
            this.settings[key] = value;
            if (this.material && this.material.uniforms[`u_${key}`]) {
                this.material.uniforms[`u_${key}`].value = value;
            }
            if (this.lineMaterial && this.lineMaterial.uniforms[`u_${key}`]) {
                this.lineMaterial.uniforms[`u_${key}`].value = value;
            }
            
            // Handle Mode Toggling
            if (key === 'mode') {
                this.lineNetwork.visible = (value === 2.0);
                if (value === 2.0) this.evolution = 0.0; // Reset growth
            }
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const elapsedTime = this.clock.getElapsedTime();
        const time = elapsedTime;

        if (this.material && this.settings && this.settings.mouse) {
            this.material.uniforms.u_time.value = time;
            this.material.uniforms.u_mouse_x.value += (this.settings.mouse.x - this.material.uniforms.u_mouse_x.value) * 0.1;
            this.material.uniforms.u_mouse_y.value += (this.settings.mouse.y - this.material.uniforms.u_mouse_y.value) * 0.1;
            this.material.uniforms.u_audioFreq.value = this.settings.audioFreq;
        }

        if (this.lineNetwork && this.lineNetwork.visible) {
            // Fungi Growth Animation: Slowly reveals lines from center
            this.evolution = Math.min(1.0, this.evolution + 0.002);
            
            this.lineMaterial.uniforms.u_time.value = time;
            this.lineMaterial.uniforms.u_evolution.value = this.evolution;
            this.material.uniforms.u_evolution.value = this.evolution; // Also update points
            this.lineMaterial.uniforms.u_mouse_x.value = this.material.uniforms.u_mouse_x.value;
            this.lineMaterial.uniforms.u_mouse_y.value = this.material.uniforms.u_mouse_y.value;
            this.lineMaterial.uniforms.u_audioFreq.value = this.settings.audioFreq;
        }

        if(this.particles) {
            let rotSpeed = 0.02; // Default slower
            if (this.settings.mode === 1.0) rotSpeed = 0.015; // Fauna: Slow Wave Flow
            if (this.settings.mode === 2.0) rotSpeed = 0.002; // Fungi: Ultimate Stillness
            this.particles.rotation.y = time * rotSpeed;
        }
        if(this.lineNetwork && this.lineNetwork.visible) {
            this.lineNetwork.rotation.y = time * 0.005; // Fungi: Ultra Slow
        }

        this.renderer.render(this.scene, this.camera);
    }
}
