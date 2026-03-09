// ========================================
// AUDIO REACTIVE MODULE
// Captures mic data & visualizes the waveform
// ========================================

class AudioSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isInitialized = false;
        this.averageFrequency = 0;
    }

    async init() {
        if (this.isInitialized) return true;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            
            const source = this.audioCtx.createMediaStreamSource(stream);
            source.connect(this.analyser);
            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            this.isInitialized = true;
            this.update();
            return true;
        } catch (err) {
            console.error('Audio capture failed:', err);
            return false;
        }
    }

    update() {
        if (!this.isInitialized) return;
        
        requestAnimationFrame(this.update.bind(this));
        
        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Calculate average for shader uniform
        let sum = 0;
        for(let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        this.averageFrequency = sum / this.dataArray.length;
        
        this.drawWaveform();
    }

    drawWaveform() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.ctx.clearRect(0, 0, width, height);
        
        // Draw centered audio spectrum
        const barWidth = (width / this.dataArray.length) * 2.5;
        let x = 0;
        
        for(let i = 0; i < this.dataArray.length; i++) {
            const barHeight = (this.dataArray[i] / 255) * height;
            
            // Color based on height (green to yellow)
            const r = 226 + (barHeight * 0.5);
            const g = 255;
            const b = 74;
            
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
            
            // Center the bars vertically
            const y = (height - barHeight) / 2;
            this.ctx.fillRect(x, y, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
}
