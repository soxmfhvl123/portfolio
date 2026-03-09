import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

class DataFlowArt {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 10000);
        this.camera.position.set(0, 100, 500);

        this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", alpha: false });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.setClearColor(0x020205);
        this.container.appendChild(this.renderer.domElement);

        // Pointer Lock Controls (FPS Style)
        this.controls = new PointerLockControls(this.camera, document.body);
        this.instructions = document.getElementById('instructions');

        this.instructions.addEventListener('click', () => {
            this.controls.lock();
        });

        this.controls.addEventListener('lock', () => {
            this.instructions.style.display = 'none';
        });

        this.controls.addEventListener('unlock', () => {
            this.instructions.style.display = 'flex';
        });

        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2(0, 0);
        this.raycaster = new THREE.Raycaster();

        // Movement State
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        this.initPostProcessing();
        this.initParticles();
        this.initPosterGallery();
        this.initEventListeners();

        this.animate = this.animate.bind(this);
        this.animate();
    }

    initPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.width, this.height), 1.0, 0.4, 0.1);
        this.composer.addPass(this.bloomPass);
    }

    initParticles() {
        this.particleCount = 500000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const volume = 4000;

        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * volume * 2;
            positions[i * 3 + 1] = (Math.random() - 0.5) * volume;
            positions[i * 3 + 2] = (Math.random() - 0.5) * volume * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.uniforms = {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0x0066ff) }
        };

        const vertexShader = `
            uniform float uTime;
            varying vec3 vColor;
            void main() {
                vec3 pos = position;
                pos.y += sin(uTime * 0.2 + pos.x * 0.001) * 50.0;
                pos.x += cos(uTime * 0.1 + pos.z * 0.001) * 50.0;
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = (150.0 / -mvPosition.z);
                vColor = mix(vec3(0.0, 0.2, 0.5), vec3(0.1, 0.8, 1.0), (pos.y + 2000.0) / 4000.0);
            }
        `;

        const fragmentShader = `
            varying vec3 vColor;
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if(dist > 0.5) discard;
                gl_FragColor = vec4(vColor, smoothstep(0.5, 0.2, dist) * 0.6);
            }
        `;

        this.particles = new THREE.Points(geometry, new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: this.uniforms,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        }));
        this.scene.add(this.particles);
    }

    initPosterGallery() {
        this.posterGroup = new THREE.Group();
        this.scene.add(this.posterGroup);
        this.posters = [];

        const posterFiles = [
            '2025-10-02 14.56.10.jpg', '2025-10-02 14.56.27.jpg', '2025-10-02 14.56.29.jpg', '2025-10-02 14.56.32.jpg', '2025-10-02 14.56.35.jpg', '2025-10-02 14.56.37.jpg', '2025-10-02 14.56.50.jpg', '2025-10-02 14.56.52.jpg', '2025-10-02 14.56.56.jpg', '2025-10-02 14.56.58.jpg', '2025-10-02 14.57.01.jpg', '2025-10-02 14.57.03.jpg', '2025-10-02 14.57.05.jpg', '2025-10-02 14.57.08.jpg', '2025-10-02 14.57.12.jpg', '2025-10-02 14.57.15.jpg', '2025-10-02 14.57.19.jpg', '2025-10-02 14.57.21.jpg', '2025-10-02 14.57.25.jpg', '2025-10-02 14.57.27.jpg', '2025-10-02 14.57.30.jpg', '2025-10-02 14.57.32.jpg', '2025-10-02 14.57.35.jpg', '2025-10-02 14.57.41.jpg', '2025-10-02 14.57.43.jpg', '2025-10-02 14.57.46.jpg', '2025-10-02 14.57.49.jpg', '2025-10-02 14.57.52.jpg', '2025-10-02 14.57.55.jpg', '2025-10-02 14.57.57.jpg', '2025-10-02 14.58.00.jpg', '2025-10-02 14.58.08.jpg', '2025-10-02 14.58.11.jpg', '2025-10-02 14.58.14.jpg', '2025-10-02 14.58.17.jpg', '2025-10-02 14.58.20.jpg', '2025-10-02 14.58.23.jpg', '2025-10-02 15.14.03.jpg', '2025-10-02 15.14.13.jpg', '2025-10-02 15.14.18.jpg', '2025-10-02 15.14.21.jpg', '2025-10-02 15.14.25.jpg', '2025-10-02 15.14.27.jpg', '2025-10-02 15.14.34.jpg', '2025-10-02 15.14.38.jpg', '2025-10-02 15.14.41.jpg', '2025-10-02 15.14.46.jpg', '2025-10-02 15.14.48.jpg', '2025-10-02 15.14.51.jpg', '2025-10-02 15.14.54.jpg', '2025-10-02 15.14.56.jpg', '2025-10-02 15.14.59.jpg', '2025-10-02 15.15.02.jpg', '2025-10-02 15.15.05.jpg', '2025-10-02 15.15.07.jpg', '2025-10-02 15.15.10.jpg', '2025-10-02 15.15.13.jpg', '2025-10-02 15.15.25.jpg', '2025-10-02 15.15.30.jpg', '2025-10-02 15.15.34.jpg', '2025-10-02 15.15.40.jpg', '2025-10-02 15.15.46.jpg', '2025-10-02 15.16.16.jpg', '2025-10-02 15.16.20.jpg', '2025-10-02 15.16.24.jpg', '2025-10-02 15.16.37.jpg', '2025-10-02 15.16.40.jpg', '2025-10-02 15.16.43.jpg', '2025-10-02 15.16.49.jpg', '2025-10-02 15.16.51.jpg', '2025-10-02 15.16.54.jpg', '2025-10-02 15.16.56.jpg', '2025-10-02 15.16.59.jpg', '2025-10-02 15.17.02.jpg', '2025-10-02 15.17.20.jpg', '2025-10-02 15.17.25.jpg', '2025-10-02 15.17.30.jpg', '2025-10-02 15.17.33.jpg', '2025-10-02 15.17.36.jpg', '2025-10-02 15.17.39.jpg', '2025-10-02 15.17.41.jpg', '2025-10-02 15.17.44.jpg', '2025-10-02 15.17.46.jpg', '2025-10-02 15.17.49.jpg', '2025-10-02 15.17.52.jpg', '2025-10-02 15.17.58.jpg', '2025-10-02 15.18.01.jpg', '2025-10-02 15.18.03.jpg', '2025-10-02 15.18.24.jpg', '2025-10-02 15.18.33.jpg', '2025-10-02 15.18.37.jpg', '2025-10-02 15.18.39.jpg', '2025-10-02 15.18.42.jpg', '2025-10-02 15.18.45.jpg', '2025-10-02 15.18.48.jpg', '2025-10-02 15.18.51.jpg', '2025-10-02 15.19.00.jpg', '2025-10-02 15.19.03.jpg', '2025-10-02 15.19.11.jpg', '2025-10-02 15.19.36.jpg', '2025-10-02 15.19.38.jpg', '2025-10-02 15.19.41.jpg', '2025-10-02 15.19.43.jpg', '2025-10-02 15.19.46.jpg', '2025-10-02 15.19.49.jpg', '2025-10-02 15.19.52.jpg', '2025-10-02 15.20.01.jpg', '2025-10-02 15.20.05.jpg', '2025-10-02 15.20.12.jpg', '2025-10-02 15.20.16.jpg', '2025-10-02 15.20.18.jpg', '2025-10-02 15.20.21.jpg', '2025-10-02 15.20.27.jpg', '2025-10-02 15.20.29.jpg', '2025-10-02 15.20.32.jpg', '2025-10-02 15.20.36.jpg', '2025-10-02 15.20.41.jpg', '2025-10-02 15.20.47.jpg', '2025-10-02 15.20.49.jpg', '2025-10-02 15.20.51.jpg', '2025-10-02 15.20.54.jpg', '2025-10-02 15.20.56.jpg', '2025-10-02 15.20.59.jpg', '2025-10-02 15.21.01.jpg', '2025-10-02 15.21.03.jpg', '2025-10-02 15.21.07.jpg', '2025-10-02 15.21.15.jpg', '2025-10-02 15.21.32.jpg', '2025-10-02 15.21.40.jpg', '2025-10-02 15.21.48.jpg', '2025-10-02 15.21.57.jpg', '2025-10-02 15.22.01.jpg', '2025-10-02 15.22.05.jpg', '2025-10-02 15.22.11.jpg', '2025-10-02 15.22.18.jpg', '2025-10-02 15.22.27.jpg', '2025-10-02 15.22.30.jpg', '2025-10-02 15.22.45.jpg', '2025-10-02 15.22.48.jpg', '2025-10-02 15.22.51.jpg', '2025-10-02 15.23.02.jpg', '2025-10-02 15.23.04.jpg', '2025-10-02 15.23.06.jpg', '2025-10-02 15.23.09.jpg', '2025-10-02 15.23.12.jpg', '2025-10-02 15.23.15.jpg', '2025-10-02 15.23.19.jpg', '2025-10-02 15.23.21.jpg', '2025-10-02 15.23.29.jpg', '2025-10-02 15.23.32.jpg', '2025-10-02 15.23.35.jpg', '2025-10-02 15.23.38.jpg', '2025-10-02 15.23.43.jpg', '2025-10-02 15.23.45.jpg', '2025-10-02 15.23.47.jpg', '2025-10-02 15.23.50.jpg', '2025-10-02 15.23.55.jpg', '2025-10-02 15.24.06.jpg', '2025-10-02 15.24.10.jpg', '2025-10-02 15.24.18.jpg', '2025-10-02 15.24.24.jpg', '2025-10-02 15.24.38.jpg', '2025-10-02 15.24.46.jpg', '2025-10-02 15.24.50.jpg', '2025-10-02 15.24.53.jpg', '2025-10-02 15.24.57.jpg', '2025-10-02 15.25.04.jpg', '2025-10-02 15.25.12.jpg', '2025-10-02 15.25.24.jpg', '2025-10-02 15.25.47.jpg', '2025-10-02 15.25.51.jpg', '2025-10-02 15.25.54.jpg', '2025-10-02 15.25.57.jpg', '2025-10-02 15.26.01.jpg', '2025-10-02 15.26.09.jpg', '2025-10-02 15.26.12.jpg', '2025-10-02 15.26.15.jpg', '2025-10-02 15.26.18.jpg', '2025-10-02 15.26.22.jpg', '2025-10-02 15.26.25.jpg', '2025-10-02 15.26.40.jpg', '2025-10-02 15.26.42.jpg', '2025-10-02 15.26.46.jpg', '2025-10-02 15.26.50.jpg', '2025-10-02 15.26.53.jpg', '2025-10-02 15.26.56.jpg', '2025-10-02 15.27.04.jpg', '2025-10-02 15.27.07.jpg', '2025-10-02 15.27.10.jpg', '2025-10-02 15.27.12.jpg', '2025-10-02 15.27.14.jpg', '2025-10-02 15.27.17.jpg', '2025-10-02 15.27.20.jpg', '2025-10-02 15.27.22.jpg', '2025-10-02 15.28.56.jpg', '2025-10-02 15.28.59.jpg', '2025-10-03 02.40.45.jpg', '2025-10-03 02.40.47.jpg', '2025-10-03 02.40.51.jpg', '2025-10-03 02.40.53.jpg', '2025-10-03 02.41.09.jpg', '2025-10-03 02.41.15.jpg', '2025-10-03 02.41.21.jpg', '2025-10-03 02.41.38.jpg', '2025-10-03 02.41.57.jpg', '2025-10-03 02.42.18.jpg', '2025-10-03 02.42.24.jpg', '2025-10-03 02.42.49.jpg', '2025-10-03 02.42.52.jpg', '2025-10-03 02.42.55.jpg', '2025-10-03 02.42.58.jpg', '2025-10-03 02.43.01.jpg', '2025-10-03 02.43.07.jpg', '2025-10-03 02.43.09.jpg', '2025-10-03 02.43.13.jpg', '2025-10-03 02.48.07.jpg', '2025-10-03 02.48.18.jpg', '2025-10-03 02.48.33.jpg', '2025-10-03 02.48.38.jpg', '2025-10-03 02.48.41.jpg', '2025-10-03 02.51.16.jpg', '2025-10-03 02.51.20.jpg', '2025-10-03 02.51.37.jpg', '2025-10-03 02.51.39.jpg', '2025-10-03 02.51.55.jpg', '2025-10-03 02.52.33.jpg', '2025-10-03 02.52.35.jpg', '2025-10-03 02.52.37.jpg', '2025-10-03 02.52.39.jpg', '2025-10-03 02.52.42.jpg', '2025-10-03 02.52.48.jpg', '2025-10-03 02.53.12.jpg', '2025-10-03 02.53.36.jpg', '2025-10-03 02.53.39.jpg', '2025-10-03 02.53.43.jpg', '2025-10-03 02.53.46.jpg', '2025-10-03 02.53.49.jpg', '2025-10-03 02.54.43.jpg', '2025-10-03 02.55.00.jpg', '2025-10-03 02.55.03.jpg', '2025-10-03 02.55.08.jpg', '2025-10-03 02.55.19.jpg', '2025-10-03 02.55.32.jpg', '2025-10-03 02.55.58.jpg', '2025-10-03 02.56.00.jpg', '2025-10-03 02.56.03.jpg', '2025-10-03 02.56.05.jpg', '2025-10-03 02.56.08.jpg', '2025-10-03 02.56.12.jpg', '2025-10-03 02.56.15.jpg', '2025-10-03 02.56.27.jpg', '2025-10-03 02.56.29.jpg', '2025-10-03 02.56.34.jpg', '2025-10-03 02.56.36.jpg', '2025-10-03 02.56.39.jpg', '2025-10-03 02.56.53.jpg', '2025-10-03 02.56.55.jpg', '2025-10-03 02.56.57.jpg', '2025-10-03 02.56.59.jpg', '2025-10-03 02.57.01.jpg', '2025-10-03 02.57.03.jpg', '2025-10-03 02.57.06.jpg', '2025-10-03 02.57.08.jpg', '2025-10-03 02.58.14.jpg', '2025-10-03 02.58.18.jpg', '2025-10-03 02.58.42.jpg', '2025-10-03 02.58.44.jpg', '2025-10-03 02.58.47.jpg', '2025-10-03 02.58.49.jpg', '2025-10-03 02.58.52.jpg', '2025-10-03 02.58.54.jpg', '2025-10-03 02.59.52.jpg', '2025-10-03 03.00.11.jpg', '2025-10-03 03.00.15.jpg', '2025-10-03 03.00.19.jpg', '2025-10-03 03.00.24.jpg', '2025-10-03 03.00.27.jpg', '2025-10-03 03.00.30.jpg', '2025-10-03 03.00.33.jpg', '2025-10-03 03.01.50.jpg', '2025-10-03 03.01.57.jpg', '2025-10-03 03.02.01.jpg', '2025-10-03 03.02.04.jpg', '2025-10-03 03.02.11.jpg', '2025-10-03 03.02.14.jpg', '2025-10-03 03.02.19.jpg', '2025-10-03 03.02.32.jpg', '2025-10-03 03.03.07.jpg', '2025-10-03 03.03.27.jpg', '2025-10-03 03.03.31.jpg', '2025-10-03 03.03.34.jpg', '2025-10-03 09.57.28.jpg', '2025-10-03 09.57.32.jpg', '2025-10-03 09.57.34.jpg', '2025-10-03 09.57.37.jpg'
        ];

        this.loader = new THREE.TextureLoader();
        this.geometry = new THREE.PlaneGeometry(60, 84);

        // Constants for optimization
        this.LOAD_DISTANCE = 1500;
        this.HIDE_DISTANCE = 4000;

        posterFiles.forEach((file) => {
            // Start with THUMBNAIL for all posters
            const thumbUrl = `./poster/THUMBS/${file}`;
            const texture = this.loader.load(thumbUrl);

            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });

            const mesh = new THREE.Mesh(this.geometry, material);

            mesh.position.set(
                (Math.random() - 0.5) * 8000,
                (Math.random() - 0.5) * 4000,
                (Math.random() - 0.5) * 8000
            );

            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            mesh.userData = {
                file,
                originalPos: mesh.position.clone(),
                phase: Math.random() * Math.PI * 2,
                highResLoaded: false
            };

            this.posterGroup.add(mesh);
            this.posters.push(mesh);
        });

        this.hoveredPoster = null;
        this.previewContainer = document.getElementById('poster-preview-container');
        this.previewImg = document.getElementById('poster-preview-img');
    }

    updatePostersVisibility() {
        const camPos = this.camera.position;

        this.posters.forEach(mesh => {
            const dist = mesh.position.distanceTo(camPos);

            // 1. Visibility Culling
            if (dist > this.HIDE_DISTANCE) {
                mesh.visible = false;
                return;
            }
            mesh.visible = true;

            // 2. Lazy High-Res Loading
            if (dist < this.LOAD_DISTANCE && !mesh.userData.highResLoaded) {
                mesh.userData.highResLoaded = true;
                const fullUrl = `./poster/POSTERS/${mesh.userData.file}`;
                this.loader.load(fullUrl, (tex) => {
                    mesh.material.map = tex;
                    mesh.material.needsUpdate = true;
                });
            }
        });
    }

    checkPosterHover() {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        // Raycast against visible posters only
        const visiblePosters = this.posters.filter(p => p.visible);
        const intersects = this.raycaster.intersectObjects(visiblePosters);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (this.hoveredPoster !== object) {
                if (this.hoveredPoster) this.hoveredPoster.material.opacity = 0.7;
                this.hoveredPoster = object;
                this.hoveredPoster.material.opacity = 1.0;

                // High-Res for preview always
                this.previewImg.src = `./poster/POSTERS/${object.userData.file}`;
                this.previewContainer.classList.add('active');
            }
        } else if (this.hoveredPoster) {
            this.hoveredPoster.material.opacity = 0.7;
            this.hoveredPoster = null;
            this.previewContainer.classList.remove('active');
        }
    }

    initEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));

        const onKeyDown = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW': this.moveForward = true; break;
                case 'ArrowLeft':
                case 'KeyA': this.moveLeft = true; break;
                case 'ArrowDown':
                case 'KeyS': this.moveBackward = true; break;
                case 'ArrowRight':
                case 'KeyD': this.moveRight = true; break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW': this.moveForward = false; break;
                case 'ArrowLeft':
                case 'KeyA': this.moveLeft = false; break;
                case 'ArrowDown':
                case 'KeyS': this.moveBackward = false; break;
                case 'ArrowRight':
                case 'KeyD': this.moveRight = false; break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    }

    onWindowResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
        if (this.composer) this.composer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(this.animate);
        const delta = Math.min(this.clock.getDelta(), 0.1);
        const elapsedTime = this.clock.getElapsedTime();

        if (this.controls.isLocked) {
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();

            if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 4000.0 * delta;
            if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 4000.0 * delta;

            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);

            this.checkPosterHover();
        }

        // Distance checks every ~0.5s for performance
        if (Math.floor(elapsedTime * 2) !== Math.floor((elapsedTime - delta) * 2)) {
            this.updatePostersVisibility();
        }

        if (this.uniforms) {
            this.uniforms.uTime.value = elapsedTime;
        }

        this.posters.forEach(p => {
            if (p.visible) {
                p.position.y = p.userData.originalPos.y + Math.sin(elapsedTime * 0.5 + p.userData.phase) * 20;
                p.rotation.y += 0.005;
            }
        });

        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

window.onload = () => { new DataFlowArt(); };
