(() => {
  // Virtual clock for frame-exact capture (injected before any page script runs).
  // Timers and rAF are owned by this table from the moment the page starts: until
  // __freeze() each one also has a real timer driving it; __freeze cancels those and
  // from then on __step(ms) fires everything - timers, rAF, Date, performance.now and
  // Web Animations - exactly ms later. Anything left on the real clock would run
  // several times too fast between captures.
  let now = 0, seq = 1e6, frozen = false;
  const R = { st: setTimeout.bind(window), si: setInterval.bind(window), ct: clearTimeout.bind(window),
              ci: clearInterval.bind(window), raf: requestAnimationFrame.bind(window),
              caf: cancelAnimationFrame.bind(window), now: performance.now.bind(performance) };
  const timers = new Map(), rafs = new Map(), anims = new Map(), pending = new Map();
  const call = t => { try { typeof t.fn === 'function' ? t.fn(...t.a) : (0, eval)(String(t.fn)); } catch (e) {} };
  function add(fn, ms, a, repeat) {
    const id = ++seq, d = Math.max(+ms || 0, repeat ? 1 : 0);
    const t = { fn, a, every: repeat ? d : 0, at: (frozen ? now : R.now()) + d, real: null };
    timers.set(id, t);
    if (!frozen) {
      if (repeat) t.real = R.si(() => { t.at = R.now() + d; call(t); }, d);
      else t.real = R.st(() => { timers.delete(id); call(t); }, d);
    }
    return id;
  }
  function clear(id) {
    const t = timers.get(id);
    if (!t) return;
    if (t.real != null) { t.every ? R.ci(t.real) : R.ct(t.real); }
    timers.delete(id);
  }
  window.setTimeout = (fn, ms, ...a) => add(fn, ms, a, false);
  window.setInterval = (fn, ms, ...a) => add(fn, ms, a, true);
  window.clearTimeout = id => clear(id);
  window.clearInterval = id => clear(id);
  // rAF too: libraries (e.g. Matter.js Runner) keep the function they found at load time.
  window.requestAnimationFrame = cb => {
    const id = ++seq;
    if (frozen) rafs.set(id, cb);
    else pending.set(id, { cb, real: R.raf(ts => { pending.delete(id); cb(ts); }) });
    return id;
  };
  window.cancelAnimationFrame = id => {
    const p = pending.get(id); if (p) { R.caf(p.real); pending.delete(id); }
    rafs.delete(id);
  };
  window.__freeze = () => {
    if (frozen) return; frozen = true; now = R.now();
    for (const t of timers.values()) {
      if (t.real != null) { t.every ? R.ci(t.real) : R.ct(t.real); t.real = null; }
      if (t.at < now) t.at = now;
    }
    performance.now = () => now;
    const RealDate = Date, d0 = RealDate.now(), p0 = now;
    const vnow = () => d0 + (now - p0);
    window.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(vnow()); } static now() { return vnow(); } };
    for (const [id, p] of pending) { R.caf(p.real); rafs.set(id, p.cb); }
    pending.clear();
  };
  window.__step = (ms) => {
    const end = now + ms;
    for (let guard = 0; guard < 10000; guard++) { let n = null;
      for (const [id, t] of timers) if (t.at <= end && (!n || t.at < n[1].at)) n = [id, t];
      if (!n) break; const [id, t] = n; now = Math.max(now, t.at);
      if (t.every) t.at += t.every; else timers.delete(id);
      call(t); }
    now = end;
    const cbs = [...rafs.values()]; rafs.clear(); for (const cb of cbs) { try { cb(now); } catch (e) {} }
    for (const a of document.getAnimations()) {
      if (!anims.has(a)) { a.pause(); anims.set(a, { base: a.currentTime || 0, born: now }); }
      const s = anims.get(a); a.currentTime = s.base + (now - s.born);
    }
  };
  // <video> elements: paused and stepped 1/60 s per frame so page videos play at true speed
  window.__stepVideos = async (ms) => {
    const vs = [...document.querySelectorAll('video')].filter(v => v.readyState >= 1);
    await Promise.all(vs.map(v => new Promise(res => {
      if (!v.__stepped) { v.__stepped = true; v.pause(); }
      const d = v.duration || 0; let t = v.currentTime + ms / 1000; if (d && t >= d - 0.02) t = 0;
      const done = () => { v.removeEventListener('seeked', done); res(); };
      v.addEventListener('seeked', done); v.currentTime = t; R.st(res, 400);
    })));
    return vs.length;
  };
})();
