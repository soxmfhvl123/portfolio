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

    let layerDarkCanvas = document.createElement('canvas');
    let layerLightCanvas = document.createElement('canvas');
    let layerDarkCtx = layerDarkCanvas.getContext('2d');
    let layerLightCtx = layerLightCanvas.getContext('2d');
    let smoothBass = 0;
    let smoothTreble = 0;
    let imgObj = new Image();
    let animationId;
    let mousePos = { x: -1, y: -1 };

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mousePos.x = (e.clientX - rect.left) / rect.width;
        mousePos.y = (e.clientY - rect.top) / rect.height;
    });

    // Ensure AudioContext starts on interaction
    document.body.addEventListener('click', () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }, { once: true });

    // Analyze image brightness and split into exact black & white structural layers
    function initLumaLayers() {
        const w = imgObj.width;
        const h = imgObj.height;
        
        layerDarkCanvas.width = w;
        layerDarkCanvas.height = h;
        layerLightCanvas.width = w;
        layerLightCanvas.height = h;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tctx = tempCanvas.getContext('2d');
        tctx.drawImage(imgObj, 0, 0);
        
        const imgData = tctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        
        const darkData = layerDarkCtx.createImageData(w, h);
        const lightData = layerLightCtx.createImageData(w, h);
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
            const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            if (luma < 0.5) {
                // Dark pixel (Shadows, background)
                darkData.data[i] = r; darkData.data[i+1] = g; darkData.data[i+2] = b; darkData.data[i+3] = a;
            } else {
                // Light pixel (Text, highlights)
                lightData.data[i] = r; lightData.data[i+1] = g; lightData.data[i+2] = b; lightData.data[i+3] = a;
            }
        }
        
        layerDarkCtx.putImageData(darkData, 0, 0);
        layerLightCtx.putImageData(lightData, 0, 0);
    }

    function animate() {
        analyser.getByteFrequencyData(dataArray);

        let low = 0; 
        for (let i = 0; i < 8; i++) low += dataArray[i];
        low /= 8;

        let high = 0; 
        for (let i = 20; i < 60; i++) high += dataArray[i];
        high /= 40;

        // Smooth Interpolation for "Visually Appealing" non-chaotic movement
        const targetBass = low / 255;
        const targetTreble = high / 255;
        smoothBass += (targetBass - smoothBass) * 0.15;
        smoothTreble += (targetTreble - smoothTreble) * 0.2;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        // Dark Layer (Bass driven) - Slow, heavy heartbeat expansion
        const darkScale = 1 + (smoothBass * 0.04);
        const darkY = smoothBass * 10;
        
        ctx.save();
        ctx.translate(cx, cy + darkY);
        ctx.scale(darkScale, darkScale);
        ctx.drawImage(layerDarkCanvas, -cx, -cy, w, h);
        ctx.restore();

        // Light Layer (Treble driven) - Quick, sharp float/flutter upwards
        const lightScale = 1 + (smoothTreble * 0.05);
        const lightY = -smoothTreble * 15;
        
        ctx.save();
        // Add subtle mouse parallax for depth
        let parallaxX = 0, parallaxY = 0;
        if (mousePos.x !== -1) {
            parallaxX = (mousePos.x - 0.5) * 15;
            parallaxY = (mousePos.y - 0.5) * 15;
        }
        
        ctx.translate(cx + parallaxX, cy + lightY + parallaxY);
        ctx.scale(lightScale, lightScale);
        
        // Dynamic glow on high energy
        if (smoothTreble > 0.3) {
            ctx.shadowColor = 'rgba(255,255,255,0.4)';
            ctx.shadowBlur = smoothTreble * 20;
        }
        
        ctx.drawImage(layerLightCanvas, -cx, -cy, w, h);
        ctx.restore();

        // Global composite flash for heavy drops
        if (smoothBass > 0.6) {
            ctx.globalAlpha = (smoothBass - 0.6) * 0.6;
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
