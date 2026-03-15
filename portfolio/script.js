class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
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
    const observers = [];

    scrambleElements.forEach(el => {
        const fx = new TextScramble(el);
        const originalText = el.getAttribute('data-text');
        el.innerText = ''; // Start empty

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fx.setText(originalText);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(el);
    });

    // 3. Link Hover
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('mouseenter', () => {
            ring.style.transform += ' scale(2.5)';
            ring.style.opacity = '1';
        });
        link.addEventListener('mouseleave', () => {
            ring.style.transform = ring.style.transform.replace(' scale(2.5)', '');
            ring.style.opacity = '0.3';
        });
    });

    // 4. Back To Top
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

    // 5. Theme Toggle
    const themeToggle = document.getElementById('themeToggle');

    const updateCursorColor = (isDark) => {
        if (dot) dot.style.background = isDark ? '#FFF' : '#000';
        if (ring) ring.style.borderColor = isDark ? '#FFF' : '#000';
    };

    // Load saved theme
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
            
            // Trigger scramble on toggle
            const fx = new TextScramble(themeToggle);
            fx.setText(newText);
            
            updateCursorColor(isDark);
        });
    }
});
