class AudioVisualizer {
    constructor() {
        this.audio = document.getElementById('main-audio');
        this.trackItems = document.querySelectorAll('.track-item');
        this.playPauseBtn = document.getElementById('btn-play-pause');
        this.currentTrackName = document.getElementById('current-track-name');
        this.playingIndicator = document.querySelector('.playing-indicator');
        this.playlistTitle = document.getElementById('playlist-title-text');
        
        // Language State
        this.currentLang = 'kr';
        this.langBtns = {
            'kr': document.getElementById('lang-kr'),
            'en': document.getElementById('lang-en')
        };

        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;

        this.isPlaying = false;
        
        this.initLangToggle();
        this.initEvents();
        this.updateLangUI(); // Apply default language
    }
    
    initLangToggle() {
        if (!this.langBtns.kr || !this.langBtns.en) return;
        
        this.langBtns.kr.addEventListener('click', () => this.switchLang('kr'));
        this.langBtns.en.addEventListener('click', () => this.switchLang('en'));
    }
    
    switchLang(lang) {
        if (this.currentLang === lang) return;
        
        // Update active class
        this.langBtns[this.currentLang].classList.remove('active');
        this.langBtns[lang].classList.add('active');
        
        this.currentLang = lang;
        this.updateLangUI();
    }
    
    updateLangUI() {
        // Update playlist title
        if (this.playlistTitle) {
            this.playlistTitle.textContent = this.currentLang === 'kr' ? '추천 플레이리스트' : 'CURATED TRACKLIST';
        }

        // Update all track items in the list
        this.trackItems.forEach(item => {
            const title = item.getAttribute(`data-title-${this.currentLang}`);
            if (title) {
                item.textContent = title;
            }
        });
        
        // Update Now Playing text
        if (this.currentTrackName) {
            // Is a track currently playing?
            const activeTrack = document.querySelector('.track-item.active');
            if (activeTrack) {
                this.currentTrackName.textContent = activeTrack.getAttribute(`data-title-${this.currentLang}`);
            } else {
                // Not playing, use default text
                this.currentTrackName.textContent = this.currentTrackName.getAttribute(`data-default-${this.currentLang}`);
            }
        }
    }

    initAudioContext() {
        if (!this.audioContext) {
            // Safari prefix required for older iOS
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048; // High resolution
            this.analyser.smoothingTimeConstant = 0.8;

            const source = this.audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
        }
    }

    initEvents() {
        // iOS Safari Audio Unlock Helper
        const unlockAudio = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            // Remove listener once unlocked
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('click', unlockAudio);
        };
        document.addEventListener('touchstart', unlockAudio, { once: true });
        document.addEventListener('click', unlockAudio, { once: true });

        // Track Selection
        this.trackItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Initialize audio context synchronously on strict iOS Safari
                this.initAudioContext();
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

                this.trackItems.forEach(i => i.classList.remove('active'));
                
                // We must use currentTarget to ensure we get the LI, not a span inside it
                const targetNode = e.currentTarget;
                targetNode.classList.add('active');
                
                const src = targetNode.getAttribute('data-src');
                this.currentTrackName.textContent = targetNode.getAttribute(`data-title-${this.currentLang}`);

                // Direct synchronous assignment and play to satisfy iOS Safari
                this.audio.src = src;
                this.audio.load();
                
                const playPromise = this.audio.play();

                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this.isPlaying = true;
                        this.playPauseBtn.disabled = false;
                        this.playPauseBtn.innerText = "PAUSE";
                        this.playingIndicator.classList.add('active');
                    }).catch(error => {
                        console.log("iOS Autoplay prevented or file missing:", error);
                        // Fallback UI if Safari still blocks
                        this.isPlaying = false;
                        this.playPauseBtn.disabled = false;
                        this.playPauseBtn.innerText = "PLAY";
                        this.playingIndicator.classList.remove('active');
                    });
                } else {
                    // Older browsers
                    this.isPlaying = true;
                    this.playPauseBtn.innerText = "PAUSE";
                    this.playingIndicator.classList.add('active');
                }
            });
        });

        // Play/Pause Button
        this.playPauseBtn.addEventListener('click', () => {
            this.initAudioContext(); // Ensure context exists on fallback path
            
            if (this.isPlaying) {
                this.audio.pause();
                this.isPlaying = false;
                this.playPauseBtn.innerText = "PLAY";
                this.playingIndicator.classList.remove('active');
            } else {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                const playPromise = this.audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this.isPlaying = true;
                        this.playPauseBtn.innerText = "PAUSE";
                        this.playingIndicator.classList.add('active');
                    }).catch(e => console.error("Play prevented", e));
                }
            }
        });

        // Auto-Play Next Track when current track ends
        this.audio.addEventListener('ended', () => {
            this.playNextTrack();
        });

        // Loop the update logic
        this.updateData();
    }

    playNextTrack() {
        let currentIndex = -1;
        // Find currently active track index
        this.trackItems.forEach((item, index) => {
            if (item.classList.contains('active')) {
                currentIndex = index;
            }
        });

        if (currentIndex !== -1) {
            // Calculate next index, loop back to 0 if at the end
            const nextIndex = (currentIndex + 1) % this.trackItems.length;

            // Programmatically click the next track to trigger all the UI/Audio logic
            this.trackItems[nextIndex].click();
        }
    }

    getAudioData() {
        if (!this.analyser || !this.isPlaying) return { bass: 0, treble: 0, overall: 0 };

        this.analyser.getByteFrequencyData(this.dataArray);

        let bassSum = 0;
        // CLASSICAL TUNING: Expand "bass" to cover up to ~800Hz (Cellos, lower strings, piano left hand)
        // 40 bins * ~21Hz = ~840Hz.
        const bassBins = 40;
        for (let i = 0; i < bassBins; i++) {
            bassSum += this.dataArray[i];
        }
        
        // Focus on violins, flutes, piano right hand (approx 2kHz - 10kHz)
        let trebleSum = 0;
        const trebleStart = 100;
        const trebleEnd = 200;
        for (let i = trebleStart; i < trebleEnd; i++) {
            trebleSum += this.dataArray[i];
        }

        // NON-LINEAR SCALING (CLASSICAL CONTRAST)
        // Classical music is dynamic but rarely has hard kicks.
        // We tame the Math.pow exponent from 2.5 down to 1.5.
        // This makes it respond to swells and crescendos gracefully without needing a sharp hit.
        
        let rawBass = (bassSum / (bassBins * 255));
        let rawTreble = (trebleSum / ((trebleEnd - trebleStart) * 255));

        // Lower the threshold to pick up quiet string intro parts
        let bass = rawBass < 0.05 ? 0 : Math.pow(rawBass, 1.5) * 1.8;
        let treble = rawTreble < 0.05 ? 0 : Math.pow(rawTreble, 1.5) * 1.8;
        let overall = (bass + treble) / 2;

        // Cap at 1.0
        bass = Math.min(bass, 1.0);
        treble = Math.min(treble, 1.0);
        overall = Math.min(overall, 1.0);

        return { bass, treble, overall };
    }

    updateData() {
        requestAnimationFrame(this.updateData.bind(this));

        if (window.monoApp) {
            if (this.analyser && this.isPlaying) {
                const { bass, treble } = this.getAudioData();

                // Send normalized data to our global app instance using LERP for smooth buttery transitions!
                // Ultra smooth morph (0.015 instead of 0.05)
                window.monoApp.audioData.bass += (bass - window.monoApp.audioData.bass) * 0.015;
                // Ultra slow easing for treble (0.01 instead of 0.03)
                window.monoApp.audioData.treble += (treble - window.monoApp.audioData.treble) * 0.01;
            } else {
                // If paused, slowly fade out the values
                window.monoApp.audioData.bass += (0 - window.monoApp.audioData.bass) * 0.01;
                window.monoApp.audioData.treble += (0 - window.monoApp.audioData.treble) * 0.01;
            }
        }
    }
}

// Instantiate the analyzer
new AudioVisualizer();
