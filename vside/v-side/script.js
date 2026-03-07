// V-SIDE Track Data mapped to local MP3s
const tracks = [
    { filename: "-30 for 30--SZA and Kendrick Lamar.png", ytId: "OSYMcQNxfSI", audio: "-30 for 30--SZA and Kendrick Lamar.mp3" },
    { filename: "-A Bar Song (Tipsy)--Shaboozey.png", ytId: "t7bQwwqW-Hc", audio: "-A Bar Song (Tipsy)--Shaboozey.mp3" },
    { filename: "-APT.--Rosé and Bruno Mars.png", ytId: "ekr2nIex040", audio: "-APT.--Rosé and Bruno Mars.mp3" },
    { filename: "-BMF--SZA.png", ytId: "8zV8aBRb8V8", audio: "-BMF--SZA.mp3" },
    { filename: "-Bed Chem--Sabrina Carpenter.png", ytId: "x8VkB8ap_FQ", audio: "-Bed Chem--Sabrina Carpenter.mp3" },
    { filename: "-Birds of a Feather--Billie Eilish.png", ytId: "d5gf9dXbPi0", audio: "-Birds of a Feather--Billie Eilish.mp3" },
    { filename: "-DTMF--Bad Bunny.png", ytId: "PGe4PUAaFBY", audio: "-DTMF--Bad Bunny.mp3" },
    { filename: "-Denial Is a River--Doechii.png", ytId: "EQ4HuIl_w94", audio: "-Denial Is a River--Doechii.mp3" },
    { filename: "-Die with a Smile--Lady Gaga and Bruno Mars.png", ytId: "kPa7bsKwL-c", audio: "-Die with a Smile--Lady Gaga and Bruno Mars.mp3" },
    { filename: "-Eoo--Bad Bunny.png", ytId: "rltG2qA_RnA", audio: "-Eoo--Bad Bunny.mp3" },
    { filename: "-Espresso--Sabrina Carpenter.png", ytId: "eVli-tstM5E", audio: "-Espresso--Sabrina Carpenter.mp3" },
    { filename: "-Golden--Huntrix- Ejae, Audrey Nuna and Rei Ami.png", ytId: "yebNIHKAC4A", audio: "-Golden--Huntrix- Ejae, Audrey Nuna and Rei Ami.mp3" },
    { filename: "-Hard Fought Hallelujah--Brandon Lake and Jelly Roll.png", ytId: "KcIMnHf3HyM", audio: "-Hard Fought Hallelujah--Brandon Lake and Jelly Roll.mp3" },
    { 
        filename: "-I had some help--Post Malone featuring Morgan Wallen.png", 
        ytId: "11T6kF66dKY", 
        audio: "-I had some help--Post Malone featuring Morgan Wallen.png.mp3", 
        title: "I Had Some Help", 
        artist: "Post Malone featuring Morgan Wallen" 
    },
    { filename: "-I'm Gonna Love You--Cody Johnson and Carrie Underwood.png", ytId: "KZcfLVkaWiM", audio: "-I'm Gonna Love You--Cody Johnson and Carrie Underwood.mp3" },
    { filename: "-Lose Control--Teddy Swims.png", ytId: "GZ3zL7kT6_c", audio: "-Lose Control--Teddy Swims.mp3" },
    { filename: "-Luther--Kendrick Lamar and SZA .png", ytId: "l0wJqJT3gh8", audio: "-Luther--Kendrick Lamar and SZA .mp3" },
    { filename: "-Manchild--Sabrina Carpenter.png", ytId: "GTLdJ-CM7TQ", audio: "-Manchild--Sabrina Carpenter.mp3" },
    { filename: "-Mutt--Leon Thomas.png", ytId: "f8X8v8F4qPI", audio: "-Mutt--Leon Thomas.mp3" },
    { filename: "-Nokia--Drake.png", ytId: "YAaIgrWtRYk", audio: "-Nokia--Drake.mp3" },
    { filename: "-Not Like Us--Kendrick Lamar.png", ytId: "T6eK-2OQtew", audio: "-Not Like Us--Kendrick Lamar.mp3" },
    { filename: "-Ordinary--Alex Warren.png", ytId: "pceyEOt3zC0", audio: "-Ordinary--Alex Warren.mp3" },
    { filename: "-Please Please Please--Sabrina Carpenter.png", ytId: "Pz4L3HML6l8", audio: "-Please Please Please--Sabrina Carpenter.mp3" },
    { 
        filename: "-Saja boys --Soda Pop.mp3.png", 
        ytId: "hAyPTJFgFEs", 
        audio: "-Saja boys--Soda Pop.mp3", 
        artist: "Saja Boys", 
        title: "Soda Pop" 
    },
    { filename: "-Somebody Loves Me--PartyNextDoor.png", ytId: "ZYouVfCThXU", audio: "-Somebody Loves Me--PartyNextDoor.mp3" },
    { filename: "-Sports Car--Tate McRae.png", ytId: "s8kf-2_hSGk", audio: "-Sports Car--Tate McRae.mp3" },
    { filename: "-Squabble Up--Kendrick Lamar.png", ytId: "4_-ZYEnYKgo", audio: "-Squabble Up--Kendrick Lamar.mp3" },
    { filename: "-Stargazing--Myles Smith.png", ytId: "slKG0VL9Bis", audio: "-Stargazing--Myles Smith.mp3" },
    { filename: "-TV Off--Kendrick Lamar featuring Lefty Gunplay.png", ytId: "8_e4lHJaBvg", audio: "-TV Off--Kendrick Lamar featuring Lefty Gunplay.mp3" },
    { filename: "-Timeless--The Weeknd and Playboi Carti.png", ytId: "16jA-6hiSUo", audio: "-Timeless--The Weeknd and Playboi Carti.mp3" },
    { filename: "-What It Sounds Like--Huntrix- Ejae, Audrey Nuna and Rei Ami.png", ytId: "LK0jCxxgcno", audio: "-What It Sounds Like--Huntrix- Ejae, Audrey Nuna and Rei Ami.mp3" },
    { filename: "-Wildflower--Billie Eilish.png", ytId: "l08Zw-RY__Q", audio: "-Wildflower--Billie Eilish.mp3" }
];

// Parse metadata from filename
function parseTrack(item, index) {
    let raw = item.filename.replace('.png', '').replace('.mp3', '');
    let title = item.title;
    let artist = item.artist;

    if (!title || !artist) {
        if (raw.startsWith('-')) raw = raw.substring(1);
        const parts = raw.split('--');
        if (parts.length > 1) {
            title = title || parts[0].trim();
            artist = artist || parts[1].trim();
        } else {
            title = title || raw;
        }
    }
    
    title = title || "Unknown Title";
    artist = artist || "Unknown Artist";

    const imageFile = item.filename.toLowerCase().endsWith('.png') 
        ? item.filename 
        : item.filename.replace('.mp3', '.png');

    return {
        id: index + 1,
        title: title,
        artist: artist,
        image: `./assets/images/${encodeURIComponent(imageFile)}`,
        audio: `./assets/audio/${encodeURIComponent(item.audio)}`,
        youtubeId: item.ytId || "dQw4w9WgXcQ",
        lyrics: `"${title}" — A visual interpretation of the soundscape.`
    };
}

const parsedTracks = tracks.map(parseTrack);

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('posterGrid');
    const modal = document.getElementById('playerModal');
    const closeBtn = document.getElementById('closeModal');

    // Canvas & Audio Setup
    const canvas = document.createElement('canvas');
    canvas.id = 'posterCanvas';
    const visualLeft = document.querySelector('.modal-left');
    const mPoster = document.getElementById('modalPoster');

    mPoster.style.display = 'none';
    visualLeft.appendChild(canvas);

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const audioEl = new Audio();
    // REMOVED crossOrigin = "anonymous" to avoid CORS issues on local files
    const source = audioCtx.createMediaElementSource(audioEl);
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0; 

    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5; // Faster reaction
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const NUM_LAYERS = 5;
    let layers = [];
    let smoothBands = new Array(NUM_LAYERS).fill(0);
    let imgObj = new Image();
    let animationId;
    let mousePos = { x: 0.5, y: 0.5 }; // Initialize to center to prevent top-left jumping
    let currentMode = 0; // Distinct animation profile per track

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0) return; // Prevent NaN when modal is hidden
        mousePos.x = (e.clientX - rect.left) / rect.width;
        mousePos.y = (e.clientY - rect.top) / rect.height;
    });

    // Ensure AudioContext starts on interaction
    document.body.addEventListener('click', () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }, { once: true });

    // Analyze image brightness and split into 5 layered segments by Luma
    function initLumaLayers() {
        const w = imgObj.width;
        const h = imgObj.height;
        
        layers = [];
        for (let i = 0; i < NUM_LAYERS; i++) {
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            layers.push({
                canvas: c,
                ctx: c.getContext('2d'),
                imgData: c.getContext('2d').createImageData(w, h)
            });
        }
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tctx = tempCanvas.getContext('2d');
        tctx.drawImage(imgObj, 0, 0);
        
        const imgData = tctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
            if (a === 0) continue;
            
            const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            let idx = Math.floor(luma * NUM_LAYERS);
            if (idx >= NUM_LAYERS) idx = NUM_LAYERS - 1;
            
            const lData = layers[idx].imgData.data;
            lData[i] = r; lData[i+1] = g; lData[i+2] = b; lData[i+3] = a;
        }
        
        layers.forEach(l => l.ctx.putImageData(l.imgData, 0, 0));
    }

    function animate() {
        analyser.getByteFrequencyData(dataArray);

        // Calculate 5 frequency bands corresponding to layers
        // Array size = 128 (fftSize = 256)
        const bands = [0, 0, 0, 0, 0];
        const ranges = [[0,4], [4,12], [12,24], [24,45], [45,80]]; 
        
        for(let j=0; j<NUM_LAYERS; j++) {
            let sum = 0;
            const [start, end] = ranges[j];
            for (let i = start; i < end; i++) sum += dataArray[i];
            bands[j] = (sum / (end - start)) / 255;
            
            smoothBands[j] += (bands[j] - smoothBands[j]) * 0.15;
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        let px = (mousePos.x - 0.5) * 30;
        let py = (mousePos.y - 0.5) * 30;
        const time = Date.now() * 0.001;

        // Draw layers from Darkest (0) to Lightest (4)
        layers.forEach((layer, i) => {
            ctx.save();
            
            const depth = i / (NUM_LAYERS - 1); // 0.0 to 1.0 (Dark to Light)
            const energy = smoothBands[i];
            
            // Base Parallax shift
            let moveX = px * (0.2 + depth * 0.8);
            let moveY = py * (0.2 + depth * 0.8);
            
            let scale = 1.0 + (energy * 0.08) + (depth * 0.02 * energy);
            let rotDir = i % 2 === 0 ? 1 : -1;
            let rot = 0;

            // DIVERSE MOTION PROFILES:
            if (currentMode === 0) {
                // PROFILE 0: "The Sway" (Original Deep Refinement)
                if (i < 2) {
                    moveX += Math.cos(time * (1.5 + i)) * (energy * 25);
                    moveY += Math.sin(time * (1.2 - i)) * (energy * 30);
                    if (energy > 0.4) scale += (energy - 0.4) * 0.2 * rotDir;
                    rot = Math.sin(time * 0.8 + i) * rotDir * (energy * 0.1);
                } else {
                    moveY -= (energy * depth * 35); 
                    rot = Math.sin(time * (2.0 + i*0.5) + i) * rotDir * (energy * 0.06);
                }
            } else if (currentMode === 1) {
                // PROFILE 1: "The Pulse & Tremor" (Aggressive scale, shaking)
                scale = 1.0 + (energy * 0.15) + (depth * 0.05 * energy); // Heavier scale
                if (i < 2) {
                    moveY += (energy * 20); // Heavy drop down
                    rot = 0; // Stiff
                } else {
                    // Tremor on high energy
                    if (energy > 0.3) {
                        moveX += (Math.random() - 0.5) * energy * 40;
                        moveY += (Math.random() - 0.5) * energy * 40;
                    }
                    rot = (Math.random() - 0.5) * energy * 0.1;
                }
            } else if (currentMode === 2) {
                // PROFILE 2: "The Vortex" (Heavy continuous rotation)
                if (i < 2) {
                    rot = (time * 0.5) * rotDir + (energy * 0.3 * rotDir);
                    scale = 1.0 + (energy * 0.1);
                } else {
                    rot = -(time * 0.8) * rotDir - (energy * 0.5 * rotDir);
                    moveX += Math.cos(time * 2 + i) * (energy * 40);
                    moveY += Math.sin(time * 2 + i) * (energy * 40);
                }
            } else {
                // PROFILE 3: "The Shear Slide" (Horizontal/Vertical aggressive sliding)
                rot = 0; // No rotation, pure sliding
                if (i % 2 === 0) {
                    moveX += (energy * depth * 80) * rotDir; // Aggressive X
                } else {
                    moveY += (energy * depth * 80) * rotDir; // Aggressive Y
                }
                scale = 1.0 + (energy * 0.05);
            }
            
            ctx.translate(cx + moveX, cy + moveY);
            ctx.scale(scale, scale);
            ctx.rotate(rot);

            
            // Glow effect for highlights on peaks
            if (i >= NUM_LAYERS - 2 && energy > 0.4) {
                ctx.shadowColor = 'rgba(255,255,255,0.6)';
                ctx.shadowBlur = energy * 30;
            }
            
            ctx.drawImage(layer.canvas, -cx, -cy, w, h);
            ctx.restore();
        });

        // Global composite flash for very heavy bass drops
        if (smoothBands[0] > 0.7) {
            ctx.globalAlpha = Math.min((smoothBands[0] - 0.7) * 0.8, 1.0);
            ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(canvas, -2, -2, w+4, h+4);
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
        }

        animationId = requestAnimationFrame(animate);
    }

    // Modal Elements
    const mRank = document.getElementById('modalRank');
    const mTitle = document.getElementById('modalTitle');
    const mArtist = document.getElementById('modalArtist');
    const mLyrics = document.getElementById('modalLyrics');
    const mIframe = document.getElementById('youtubeIframe');

    parsedTracks.forEach(track => {
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.innerHTML = `
            <img src="${track.image}" class="poster-img" alt="${track.title}" loading="lazy">
            <span class="item-rank">#${String(track.id).padStart(2, '0')}</span>
            <div class="item-overlay">
                <h3 class="item-title">${track.title}</h3>
                <p class="item-artist">${track.artist}</p>
            </div>
        `;
        item.addEventListener('click', () => openModal(track));
        grid.appendChild(item);
    });

    function openModal(track) {
        currentMode = track.id % 4; // Assign 1 of 4 distinct profiles

        mRank.textContent = `#${String(track.id).padStart(2, '0')}`;
        mTitle.textContent = track.title;
        mArtist.textContent = track.artist;
        mLyrics.textContent = track.lyrics;


        imgObj.onload = () => {
            console.log("Image Loaded: " + track.image);
            canvas.width = imgObj.width;
            canvas.height = imgObj.height;
            initLumaLayers();
            
            if (track.audio) {
                console.log("Playing local audio for analysis: " + track.audio);
                audioEl.src = track.audio;
                audioEl.load(); // Refresh state
                audioEl.muted = false;
                if (audioCtx.state === 'suspended') audioCtx.resume();
                audioEl.play().catch(e => console.error("Audio Playback Error: ", e));
            }
            
            cancelAnimationFrame(animationId);
            animate();
        };
        imgObj.onerror = () => console.error("Failed to load image: " + track.image);
        imgObj.src = track.image;

        // Unmute YouTube (mute=0) as requested
        mIframe.src = `https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&mute=0&controls=0&modestbranding=1`;

        modal.showModal();
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.close();
        audioEl.pause();
        mIframe.src = '';
        cancelAnimationFrame(animationId);
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
});
