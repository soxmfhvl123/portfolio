// ========================================
// CORE APPLICATION CONTROLLER (REFINED)
// Optimized for "Biophilia" Minimalist UX
// ========================================

class AppController {
    constructor() {
        console.log("AppController: Booting...");
        
        if (typeof THREE === 'undefined') {
            console.error("Three.js missing!");
            return;
        }

        try {
            this.engine = new MyceliumEngine('webgl-canvas');
            this.audio = new AudioSystem('audio-canvas');
            
            // UI Transition Elements
            this.introOverlay = document.getElementById('intro-overlay');
            this.btnEnter = document.getElementById('btn-enter');
            this.hud = document.getElementById('hud');
            this.cursor = document.getElementById('custom-cursor');
            
            // Drawer & Navigation
            this.btnMenu = document.getElementById('btn-menu');
            this.btnCloseMenu = document.getElementById('btn-close-menu');
            this.drawer = document.getElementById('menu-drawer');
            
            // Status Bars
            this.aiBar = document.getElementById('ai-bar');
            this.natureBar = document.getElementById('nature-bar');
            
            // Interaction State
            this.interactionLevel = 0;

            this.descriptions = {
                'flora': '부드럽고 가벼운 입자들이 공중에 떠다니는 씨앗처럼 부유합니다.',
                'fauna': '다양한 동물적 종(Species)들이 군집을 이루어 역동적으로 물결치는 화려한 바이오 리프 생태계입니다.',
                'fungi': '중심부에서 서서히 뻗어 나가는 유기적 연결망과 균사체의 성장을 시각화합니다.'
            };
            
            this.init();
        } catch (e) {
            console.error("BOOT FAILURE:", e);
        }
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('mousemove', (e) => {
            if (this.cursor) {
                this.cursor.style.left = e.clientX + 'px';
                this.cursor.style.top = e.clientY + 'px';
            }
            this.pulseInteraction();
        });

        const interactibles = document.querySelectorAll('button, input, a');
        interactibles.forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor && this.cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => this.cursor && this.cursor.classList.remove('active'));
        });

        if (this.btnMenu) {
            this.btnMenu.addEventListener('click', () => {
                this.drawer && this.drawer.classList.add('open');
                this.btnMenu.classList.add('hidden');
            });
        }
        if (this.btnCloseMenu) {
            this.btnCloseMenu.addEventListener('click', () => {
                this.drawer && this.drawer.classList.remove('open');
                this.btnMenu && this.btnMenu.classList.remove('hidden');
            });
        }

        if (this.btnEnter) {
            this.btnEnter.addEventListener('click', () => {
                this.btnEnter.textContent = "CONNECTING...";
                this.btnEnter.disabled = true;

                if (this.introOverlay) this.introOverlay.classList.remove('active');
                
                setTimeout(() => {
                    if (this.hud) this.hud.classList.remove('hidden');
                }, 600);

                this.audio.init().then(success => {
                    this.updateLoop();
                });
            });
        }

        // Mode Toggles (Sliders removed from HTML)
        document.querySelectorAll('.btn-mode').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateMode(btn.dataset.mode);
                this.pulseInteraction();
            });
        });
    }

    updateMode(mode) {
        let base, accent, density, fluidity, modeIdx;

        // Update Description text
        const descEl = document.getElementById('mode-description');
        if (descEl) descEl.innerText = this.descriptions[mode];
        
        // FIXED VALUES & UNIQUE PARTICLE MODES
        if (mode === 'flora') {
            base = 0xBCFF00;   // Neon Green
            accent = 0x00FFBB; // Aqua
            density = 15;      
            fluidity = 45;     // Reduced from 95 for calmer flow
            modeIdx = 0.0;     
        } else if (mode === 'fauna') {
            base = 0xFF3300;   // Vibrant Red-Orange
            accent = 0xD100FF; // Electric Purple
            density = 120;     
            fluidity = 75;     
            modeIdx = 1.0;     
// Fauna: Pulses
        } else if (mode === 'fungi') {
            base = 0xFFD700;   // Gold
            accent = 0xBCFF00; // Green
            density = 50;      
            fluidity = 5;      // Drastically reduced for a static structure feel
            modeIdx = 2.0;     
        }
        
        // Push state to engine
        this.engine.updateSettings('mode', modeIdx);
        this.engine.updateSettings('baseColor', new THREE.Color(base));
        this.engine.updateSettings('accentColor', new THREE.Color(accent));
        this.engine.updateSettings('density', density);
        this.engine.updateSettings('fluidity', fluidity);
    }

    pulseInteraction() {
        this.interactionLevel = 100;
    }

    updateLoop() {
        requestAnimationFrame(this.updateLoop.bind(this));
        
        const time = performance.now() * 0.001;

        // AI Logic
        const aiVal = 70 + Math.sin(time * 0.5) * 20;
        if (this.aiBar) this.aiBar.style.width = aiVal + '%';

        // NATURE Logic
        let audioEnergy = 0;
        if (this.audio && this.audio.isInitialized) {
            this.engine.updateSettings('audioFreq', this.audio.averageFrequency);
            audioEnergy = (this.audio.averageFrequency / 60) * 100;
        }
        
        if (this.interactionLevel > 0) this.interactionLevel -= 1.2;
        
        const totalPresence = Math.min(100, (audioEnergy * 0.7) + (this.interactionLevel * 0.3));
        if (this.natureBar) this.natureBar.style.width = totalPresence + '%';
    }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    window.appInstance = new AppController();
});
window.onload = () => {
    if (!window.appInstance) window.appInstance = new AppController();
};
