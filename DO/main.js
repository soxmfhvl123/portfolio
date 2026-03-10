/* ============================================================
   DO TO REFINE — main.js
   Handles: bilingual toggle, scroll reveals, parallax,
            chip animations, video play/pause on scroll.
   ============================================================ */

/* ─── BILINGUAL SYSTEM ───────────────────────────────────────
   All translatable elements have class "t" and
   data-kr / data-en attributes containing HTML strings.
   setLang() switches the displayedc content.
   ─────────────────────────────────────────────────────────── */
function renderLang(lang) {
  document.querySelectorAll('.t').forEach(el => {
    const val = el.dataset[lang];
    if (val !== undefined) el.innerHTML = val;
  });
}

function setLang(lang) {
  document.documentElement.className = 'lang-' + lang;
  document.getElementById('btn-kr').classList.toggle('active', lang === 'kr');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  renderLang(lang);
  localStorage.setItem('do-lang', lang);
}

document.addEventListener('DOMContentLoaded', () => {

  // Render initial language (default: kr)
  const savedLang = localStorage.getItem('do-lang') || 'kr';
  setLang(savedLang);

  // ─── SCROLL REVEAL ───────────────────────────────────────────
  const revealItems = document.querySelectorAll('.reveal-item, .zlat-item, .flow-step');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealItems.forEach(el => revealObserver.observe(el));

  // ─── VIDEO HELPER ─────────────────────────────────────────────
  function videoObserve(videoId, slideId, opts = {}) {
    const vid = document.getElementById(videoId);
    const slide = document.getElementById(slideId);
    if (!vid || !slide) return;

    // Optional: loop only first N seconds
    if (opts.maxSeconds) {
      vid.addEventListener('timeupdate', () => {
        if (vid.currentTime >= opts.maxSeconds) {
          vid.currentTime = 0;
          vid.play();
        }
      });
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          vid.currentTime = 0;
          vid.play();
        } else {
          vid.pause();
        }
      });
    }, { threshold: 0.25 });

    obs.observe(slide);
  }

  videoObserve('slide3video', 'slide-3');
  videoObserve('slide4video', 'slide-4');
  videoObserve('slide5video', 'slide-5', { maxSeconds: 4 }); // loop only first 4s
  videoObserve('slide6video', 'slide-6');
  videoObserve('slide8video', 'slide-8');

  // ─── HERO MOUSE PARALLAX ────────────────────────────────────
  const heroSlide = document.getElementById('slide-1');
  const heroWord  = document.getElementById('heroWord');

  if (heroSlide && heroWord) {
    heroSlide.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      const dx = (e.clientX / innerWidth  - 0.5) * 10;
      const dy = (e.clientY / innerHeight - 0.5) * 5;
      heroWord.style.marginLeft = `${dx}px`;
      heroWord.style.marginTop  = `${dy}px`;
    });
    heroSlide.addEventListener('mouseleave', () => {
      heroWord.style.marginLeft = '';
      heroWord.style.marginTop  = '';
    });
  }

  // ─── KEYWORD / TOOL CHIP STAGGER ───────────────────────────
  const chipGroups = document.querySelectorAll('.narrative-keyword-row, .tool-tags');
  const chipObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        Array.from(entry.target.children).forEach((child, i) => {
          setTimeout(() => {
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
          }, i * 80);
        });
        chipObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  chipGroups.forEach(group => {
    Array.from(group.children).forEach(chip => {
      chip.style.opacity = '0';
      chip.style.transform = 'translateY(10px)';
      chip.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });
    chipObserver.observe(group);
  });

});
