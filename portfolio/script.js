class Marquee {
    constructor(el, speed = 1) {
        this.el = el;
        this.speed = speed;
        this.x = 0;
        this.isDragging = false;
        this.startX = 0;
        this.scrollLeft = 0;
        this.lastTime = 0;

        this.init();
    }

    init() {
        this.el.addEventListener('mousedown', (e) => this.dragStart(e));
        window.addEventListener('mousemove', (e) => this.dragMove(e));
        window.addEventListener('mouseup', () => this.dragEnd());
        
        this.el.addEventListener('touchstart', (e) => this.dragStart(e.touches[0]));
        window.addEventListener('touchmove', (e) => this.dragMove(e.touches[0]));
        window.addEventListener('touchend', () => this.dragEnd());

        requestAnimationFrame((t) => this.animate(t));
    }

    dragStart(e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
            e.preventDefault();
        }
        this.isDragging = true;
        this.startX = e.pageX;
        this.scrollLeft = this.x;
    }

    dragMove(e) {
        if (!this.isDragging) return;
        const walk = (e.pageX - this.startX) * 1.5;
        this.x = this.scrollLeft + walk;
    }

    dragEnd() {
        this.isDragging = false;
    }

    animate(time) {
        const delta = time - this.lastTime;
        this.lastTime = time;

        if (!this.isDragging) {
            this.x -= this.speed * (delta / 16);
        }

        // Loop logic: track is duplicated, so width/2 is the loop point
        const trackWidth = this.el.offsetWidth / 2;
        if (this.x <= -trackWidth) {
            this.x += trackWidth;
            if (this.isDragging) this.startX += trackWidth; // Adjust startX to prevent jumping while dragging
        } else if (this.x > 0) {
            this.x -= trackWidth;
            if (this.isDragging) this.startX -= trackWidth;
        }

        this.el.style.transform = `translateX(${this.x}px)`;
        requestAnimationFrame((t) => this.animate(t));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cursor Logic
    const cursor = document.getElementById('cursor');
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    window.addEventListener('mousemove', (e) => {
        dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });

    // 2. Text Scramble Logic
    const scrambleElements = document.querySelectorAll('.scramble-text');
    scrambleElements.forEach(el => {
        const fx = new TextScramble(el);
        const originalText = el.getAttribute('data-text');
        el.innerText = '';

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fx.setText(originalText);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(el);
    });

    // 3. Marquee Initialization
    const tracks = document.querySelectorAll('.marquee-track');
    tracks.forEach(track => {
        // Disable native drag on images/videos
        track.querySelectorAll('img, video').forEach(el => {
            el.setAttribute('draggable', false);
        });
        const speed = track.classList.contains('marquee-cuz') ? 0.8 : 1.2;
        new Marquee(track, speed);
    });

    // 4. Link Hover
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.style.transform += ' scale(2.5)';
            ring.style.opacity = '1';
        });
        el.addEventListener('mouseleave', () => {
            ring.style.transform = ring.style.transform.replace(' scale(2.5)', '');
            ring.style.opacity = '0.3';
        });
    });

    // 5. Back To Top
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.slide-container').scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 6. Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const updateCursorColor = (isDark) => {
        if (dot) dot.style.background = isDark ? '#FFF' : '#000';
        if (ring) ring.style.borderColor = isDark ? '#FFF' : '#000';
    };

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) {
            themeToggle.setAttribute('data-text', 'VIEW IN LIGHT');
            themeToggle.innerText = 'VIEW IN LIGHT';
        }
        updateCursorColor(true);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            const newText = isDark ? 'VIEW IN LIGHT' : 'VIEW IN DARK';
            themeToggle.setAttribute('data-text', newText);
            const fx = new TextScramble(themeToggle);
            fx.setText(newText);
            updateCursorColor(isDark);
        });
    }
});
