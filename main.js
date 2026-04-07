/**
 * DONG JIN CHOI — Portfolio 2026
 * Particle System · Particle-Dodge Letters · Hero Mouse Trail
 * Future of GD Section · Analog Clock · Rainbow Trail
 * EN/KR Toggle · Experience Hover Slideshow
 */

document.addEventListener('DOMContentLoaded', () => {

    // ===== Full-Page Particle System =====
    const pCanvas = document.getElementById('particleCanvas');
    const pCtx = pCanvas.getContext('2d');
    const rCanvas = document.getElementById('rainbowTrailCanvas');
    const rCtx = rCanvas.getContext('2d');
    let particles = [];
    let mx = -9999, my = -9999;

    function resizeCanvas() {
        pCanvas.width = window.innerWidth;
        pCanvas.height = window.innerHeight;
        rCanvas.width = window.innerWidth;
        rCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length) { mx = e.touches[0].clientX; my = e.touches[0].clientY; }
    }, { passive: true });
    document.addEventListener('touchend', () => { mx = -9999; my = -9999; }, { passive: true });

    let baseTextColliders = [];
    function cacheTextColliders() {
        const chars = document.querySelectorAll('[data-kinetic], [data-kinetic-future]');
        const sX = window.scrollX || 0;
        const sY = window.scrollY || 0;
        baseTextColliders = Array.from(chars).map(ch => {
            const oldT = ch.style.transform;
            ch.style.transform = '';
            const r = ch.getBoundingClientRect();
            ch.style.transform = oldT;
            return { baseX: r.left + sX, baseY: r.top + sY, w: r.width, h: r.height };
        });
    }
    setTimeout(cacheTextColliders, 300);
    window.addEventListener('resize', cacheTextColliders);
    let frameCount = 0;

    class Particle {
        constructor() { this.spawn(); }
        spawn() {
            this.x = Math.random() * pCanvas.width;
            this.y = Math.random() * pCanvas.height;
            this.size = Math.random() * 2 + 0.6;
            this.vx = (Math.random() - 0.5) * 1.2;
            this.vy = (Math.random() - 0.5) * 1.2;
            this.opacity = Math.random() * 0.3 + 0.06;
            this.p1 = Math.random() * Math.PI * 2;
            this.p2 = Math.random() * Math.PI * 2;
            this.s1 = Math.random() * 0.015 + 0.008;
            this.s2 = Math.random() * 0.025 + 0.01;
            this.amp1 = Math.random() * 0.5 + 0.2;
            this.amp2 = Math.random() * 0.3 + 0.1;
        }
        update() {
            this.p1 += this.s1;
            this.p2 += this.s2;
            this.x += this.vx + Math.sin(this.p1) * this.amp1 + Math.cos(this.p2) * this.amp2;
            this.y += this.vy + Math.cos(this.p1 * 0.8) * this.amp1 * 0.7 + Math.sin(this.p2 * 1.2) * this.amp2;
            const dx = mx - this.x, dy = my - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120 && dist > 0) {
                const force = (120 - dist) / 120;
                this.x -= (dx / dist) * force * 5;
                this.y -= (dy / dist) * force * 5;
            }
            const sX = window.scrollX || document.documentElement.scrollLeft || 0;
            const sY = window.scrollY || document.documentElement.scrollTop || 0;

            for (let i = 0; i < baseTextColliders.length; i++) {
                const b = baseTextColliders[i];
                const cx_left = b.baseX - sX;
                const cy_top = b.baseY - sY;
                
                if (this.x > cx_left - 2 && this.x < cx_left + b.w + 2 && this.y > cy_top - 2 && this.y < cy_top + b.h + 2) {
                    const cx = cx_left + b.w / 2, cy = cy_top + b.h / 2;
                    const pdx = this.x - cx, pdy = this.y - cy;
                    const pd = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
                    this.x += (pdx / pd) * 2.5; this.y += (pdy / pd) * 2.5;
                    this.vx += (pdx / pd) * 0.15; this.vy += (pdy / pd) * 0.15;
                    this.opacity = Math.min(this.opacity + 0.08, 0.5);
                    break;
                }
            }
            this.vx *= 0.999; this.vy *= 0.999;
            if (this.opacity > 0.3) this.opacity -= 0.002;
            if (this.x < -40) this.x = pCanvas.width + 40;
            if (this.x > pCanvas.width + 40) this.x = -40;
            if (this.y < -40) this.y = pCanvas.height + 40;
            if (this.y > pCanvas.height + 40) this.y = -40;
        }
        draw() {
            pCtx.beginPath();
            pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            pCtx.fillStyle = `rgba(254, 229, 0, ${this.opacity})`;
            pCtx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(100, Math.floor(pCanvas.width * pCanvas.height / 9000));
        particles = [];
        for (let i = 0; i < count; i++) particles.push(new Particle());
    }
    function drawLines() {
        const len = particles.length;
        const maxDist = 80;
        const maxDistSq = 6400;
        
        for (let i = 0; i < len; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < len; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                if (dx > maxDist || dx < -maxDist) continue;
                const dy = p1.y - p2.y;
                if (dy > maxDist || dy < -maxDist) continue;
                
                const distSq = dx * dx + dy * dy;
                if (distSq < maxDistSq) {
                    pCtx.beginPath();
                    pCtx.moveTo(p1.x, p1.y);
                    pCtx.lineTo(p2.x, p2.y);
                    pCtx.strokeStyle = `rgba(254, 229, 0, ${(1 - Math.sqrt(distSq) / 80) * 0.07})`;
                    pCtx.lineWidth = 0.4;
                    pCtx.stroke();
                }
            }
        }
    }
    function animateParticles() {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        frameCount++;
        
        particles.forEach(p => { p.update(); p.draw(); });
        drawLines();
        requestAnimationFrame(animateParticles);
    }
    initParticles();
    animateParticles();


    // ===== Custom Cursor =====
    const cursor = document.getElementById('cursor');
    const cursorDot = cursor.querySelector('.cursor-dot');
    const cursorRing = cursor.querySelector('.cursor-ring');
    let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0;
    let lastCursorDotX = 0, lastCursorDotY = 0;
    
    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX; cursorY = e.clientY;
        if (Math.abs(cursorX - lastCursorDotX) > 0.5 || Math.abs(cursorY - lastCursorDotY) > 0.5) {
            cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            lastCursorDotX = cursorX;
            lastCursorDotY = cursorY;
        }
    });

    function animateCursor() {
        ringX += (cursorX - ringX) * 0.12; ringY += (cursorY - ringY) * 0.12;
        if (Math.abs(cursorX - ringX) > 0.1 || Math.abs(cursorY - ringY) > 0.1) {
            cursorRing.style.transform = `translate(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px)`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    document.querySelectorAll('a, button, .resume-block, .char-wrap, .tag, .project-line').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });


    // ===== EN / KR Language Toggle =====
    let currentLang = 'kr';
    const langToggle = document.getElementById('langToggle');
    const langLabels = langToggle.querySelectorAll('.lang-label');
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'kr' ? 'en' : 'kr';
        langLabels.forEach(l => l.classList.remove('lang-active'));
        langLabels[currentLang === 'kr' ? 0 : 1].classList.add('lang-active');
        document.documentElement.lang = currentLang === 'kr' ? 'ko' : 'en';
        document.querySelectorAll('[data-kr][data-en]').forEach(el => {
            el.textContent = currentLang === 'kr' ? el.dataset.kr : el.dataset.en;
        });
    });


    // ===== Kinetic Typography — Particle-Dodge Letters =====
    const kineticChars = document.querySelectorAll('[data-kinetic]');
    const heroSection = document.getElementById('hero');
    const DODGE_RADIUS = 200;
    const DODGE_FORCE = 50;
    const charStates = [];
    kineticChars.forEach(() => {
        charStates.push({ x: 0, y: 0, targetX: 0, targetY: 0, rot: 0, targetRot: 0, baseX: 0, baseY: 0 });
    });

    // ===== Future of GD — Particle-Dodge Letters =====
    const futureKineticChars = document.querySelectorAll('[data-kinetic-future]');
    const futureCharStates = [];
    futureKineticChars.forEach(() => {
        futureCharStates.push({ x: 0, y: 0, targetX: 0, targetY: 0, rot: 0, targetRot: 0, baseX: 0, baseY: 0 });
    });

    // Unified cache function to avoid layout thrashing
    function cacheBaseCenters() {
        const sX = window.scrollX || document.documentElement.scrollLeft || 0;
        const sY = window.scrollY || document.documentElement.scrollTop || 0;
        
        const cacheFor = (chars, states) => {
            chars.forEach((char, i) => {
                const oldT = char.style.transform;
                char.style.transform = ''; // reset
                const r = char.getBoundingClientRect();
                states[i].baseX = r.left + sX + r.width / 2;
                states[i].baseY = r.top + sY + r.height / 2;
                char.style.transform = oldT; // restore
            });
        };
        cacheFor(kineticChars, charStates);
        cacheFor(futureKineticChars, futureCharStates);
    }
    // Initialize cache and update on resize
    setTimeout(cacheBaseCenters, 300); // give it a moment to render
    window.addEventListener('resize', cacheBaseCenters);

    function DODGE_UPDATE() {
        const sX = window.scrollX || document.documentElement.scrollLeft || 0;
        const sY = window.scrollY || document.documentElement.scrollTop || 0;

        const applyDodge = (chars, states) => {
            chars.forEach((char, i) => {
                const state = states[i];
                if (!state.baseX) return; // not cached yet

                const cx = state.baseX - sX;
                const cy = state.baseY - sY;
                const dx = mx - cx, dy = my - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < DODGE_RADIUS && dist > 0) {
                    const force = (1 - dist / DODGE_RADIUS) * DODGE_FORCE;
                    state.targetX = -(dx / dist) * force;
                    state.targetY = -(dy / dist) * force;
                    state.targetRot = (dx / dist) * force * 0.15;
                } else {
                    state.targetX = 0; state.targetY = 0; state.targetRot = 0;
                }
                
                state.x += (state.targetX - state.x) * 0.1;
                state.y += (state.targetY - state.y) * 0.1;
                state.rot += (state.targetRot - state.rot) * 0.1;
                
                // Only update DOM if the movement is significant to stop constant thrashing
                if (Math.abs(state.x) > 0.05 || Math.abs(state.y) > 0.05 || Math.abs(state.rot) > 0.05 || Math.abs(state.targetX) > 0.05) {
                    char.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) rotate(${state.rot.toFixed(2)}deg)`;
                } else if (char.style.transform !== '') {
                    state.x = 0; state.y = 0; state.rot = 0;
                    char.style.transform = '';
                }
            });
        };
        
        applyDodge(kineticChars, charStates);
        applyDodge(futureKineticChars, futureCharStates);
        requestAnimationFrame(DODGE_UPDATE);
    }
    DODGE_UPDATE();


    // ===== Hero Mouse Trail — Ghost Images =====
    const heroTrail = document.getElementById('heroTrail');
    const heroImages = [
        'img/HERO/djinc_A_calm_portrait_of_a_person_with_soft_lilac_hair_and_pale_01d9fe5e-3bdb-4cca-b854-85b68844e50d.png',
        'img/HERO/djinc_A_calm_portrait_of_a_person_with_soft_lilac_hair_and_pale_71f80256-c9e6-45d2-940b-d7d13ef29270.png',
        'img/HERO/djinc_A_cinematic_portrait_of_a_girl_framed_by_storm-colored_cl_abf0145e-fe75-4cd9-86b5-c4fb6efa7f21.png',
        'img/HERO/djinc_A_cinematic_portrait_of_a_woman_lying_among_garden_foliag_3607426e-3709-4735-817b-37276869a6a9.png',
        'img/HERO/djinc_A_clean_polished_portrait_of_a_woman_dressed_in_muted_gre_7aa8b43b-382a-4d7e-b4dc-5314a5c10671.png',
        'img/HERO/djinc_A_close-up_of_eyes_framed_by_pastel_star_and_moon_pigment_dddbde3c-046a-4478-96ff-57650ebf2b09.png',
        'img/HERO/djinc_A_close-up_portrait_where_bands_of_warm_sunlight_carve_ac_007defd3-89b7-425e-8e28-90ba83010494.png',
        'img/HERO/djinc_A_close_contemplative_portrait_of_an_Andean_model_her_fea_89aa022c-89d0-446f-9c2d-80de007afacb.png',
        'img/HERO/djinc_A_close_portrait_of_a_young_woman_in_a_gray_sweater_and_s_dea9a48a-efe6-41fc-bc9f-4f66795e38e1.png',
        'img/HERO/djinc_A_close_studio_portrait_of_a_woman_with_a_vintage_80s_hai_790bb870-49c2-40d9-b452-cc176635dcec.png',
        'img/HERO/djinc_A_crisp_studio_headshot_of_a_woman_against_a_gradient_blu_82adf8f9-b258-4d65-a571-6308e27bfb1e.png',
        'img/HERO/djinc_A_cyber-inspired_close-up_of_a_woman_with_neon-green_hair_243c33eb-b2c6-42fa-bb65-141f2aca3981.png',
        'img/HERO/djinc_A_dark-winged_figure_stands_beneath_an_open_sky_her_hair__d39a5dda-4073-4d27-a227-8f10c4f7095e.png',
        'img/HERO/djinc_A_delicate_yet_unsettling_portrait_of_a_woman_with_tear-s_1585c3f9-9d95-4c3b-ad3e-90ba001cfca5.png',
        'img/HERO/djinc_A_doll-like_portrait_of_a_young_woman_with_inky_lashes_an_005a75b6-81bc-4d52-af83-15b20780a880.png',
        'img/HERO/djinc_A_graceful_woman_draped_in_a_beige_coat_sits_against_a_pa_7bd7ad10-687e-4d70-a972-af798b2ee711.png',
        'img/HERO/djinc_A_minimalist_portrait_of_a_woman_draped_in_luxurious_fabr_e9b42c2d-4605-4436-bad3-92585a5d5994.png',
        'img/HERO/djinc_A_monochrome_portrait_echoing_high_fashion_editorial_mini_c0c7b9e7-e20b-4ddc-9f58-e3963970a264.png',
        'img/HERO/djinc_A_pale_woman_with_white_hair_and_silver_chains_gazes_into_22641a4f-4594-471e-8530-85d509b594cd.png',
        'img/HERO/djinc_A_playful_portrait_of_a_girl_with_curly_red_hair_and_retr_b2b62b9c-44b8-4b43-9b9f-e9bf05b91b8e.png',
        'img/HERO/djinc_A_portrait_centered_on_a_person_with_split-tone_pastel_ha_38409f66-5909-4ee4-9bc6-5667315dec52.png',
        'img/HERO/djinc_A_portrait_emphasizing_a_woman_adorned_with_delicate_flow_8a8a16c7-c9b2-4c30-b0b4-2ada336c00e0.png',
        'img/HERO/djinc_A_regal_woman_with_silver-washed_hair_poses_under_a_deep__6f0ac2b1-50c4-4b43-9347-e2de7b138b6f.png',
        'img/HERO/djinc_A_regal_woman_with_silver-washed_hair_poses_under_a_deep__8c67e8d5-51b9-4680-9fa8-c4681d1831fc.png',
        'img/HERO/djinc_A_serene_portrait_of_a_woman_with_shimmering_blonde_hair__87a69282-3ea0-4a4f-a9dd-20e3799d3e81.png',
        'img/HERO/djinc_A_serene_studio_portrait_blending_a_womans_face_with_the__6b385b3d-1123-4ee9-8db7-914f4d3c3b72.png',
        'img/HERO/djinc_A_soft_pastel-soaked_portrait_of_a_woman_with_cropped_pin_84e95729-1f49-4b8f-8532-577816f0cb9f.png',
        'img/HERO/djinc_A_striking_fashion_image_of_a_woman_adorned_with_large_ci_dc9b5d63-94e9-4f38-ba6d-ad0b1e8848c9.png',
        'img/HERO/djinc_A_studio_portrait_highlighting_a_woman_dressed_in_dark_at_b04139f2-5e05-4f6a-b95f-a7f31f9294ef.png',
        'img/HERO/djinc_A_surreal_vintage-tinted_portrait_of_a_girl_with_a_bob_cu_adc98a5a-b765-411a-96ec-5ff6445cdbad.png',
        'img/HERO/djinc_A_tightly_framed_portrait_of_a_woman_in_a_red-lit_studio__4b2efdee-0e0f-4453-9b47-a47250bd9209.png',
        'img/HERO/djinc_A_vibrant_portrait_of_a_woman_with_orange-and-blue_hair_h_63ee0034-30b4-4f52-bb98-a220797d6a5a.png',
        'img/HERO/djinc_A_vibrant_punk-inspired_portrait_of_a_girl_with_bright_pi_05e32473-bdd4-4a87-81ee-83a5ccb5dafe.png',
        'img/HERO/djinc_A_whimsical_portrait_of_a_girl_with_curled_green_hair_her_037dff09-7062-41b6-8ac6-d8e976fe2b4e.png',
        'img/HERO/djinc_A_woman_appears_as_if_drifting_through_the_dark_tiny_star_7cbbb06d-3ea6-42ae-8173-662521f6caae.png',
        'img/HERO/djinc_A_woman_floats_in_a_cosmic_void_her_figure_surrounded_by__c1aa5cd5-3487-43f6-a643-a5fa50671b5a.png',
        'img/HERO/djinc_A_woman_in_a_colorful_geometric_sweater_rests_her_chin_li_6005dde3-0c49-4ad0-aa70-b9a694e70d07.png',
        'img/HERO/djinc_A_woman_rests_in_a_sun-drenched_garden_gentle_golden_ligh_00398855-0348-4ef6-96ad-e452920f9ec3.png',
        'img/HERO/djinc_A_woman_wearing_oversized_geometric_earrings_stands_benea_f10c6191-fc14-4193-a178-e0dc178e698f.png',
        'img/HERO/djinc_A_young_woman_stands_by_a_windswept_mountain_slope_her_ca_b99e0e32-dc33-4582-bb81-d180fec8e6a1.png',
        'img/HERO/djinc_A_young_woman_with_elongated_emerald_hair_stands_beneath__04c1961b-def5-4f82-ab9f-0874f89847e2.png',
        'img/HERO/djinc_A_young_woman_with_tinted_glasses_is_framed_against_a_ric_cc1b4ed1-e58a-4a95-9a56-4f990700fadc.png',
        'img/HERO/djinc_Close-up_portrait_of_a_young_woman_tilting_her_face_towar_c01d7b12-be73-4f60-8863-13d1ee38d216.png',
        'img/HERO/djinc_Portrait_of_a_person_with_pastel-pink_hair_and_crystallin_64036677-5578-4aca-915d-5274be6c4b65.png'
    ];

    // Preload hero trail images
    heroImages.forEach((src, i) => {
        setTimeout(() => { const img = new Image(); img.src = src; }, i * 50);
    });

    let heroTrailIndex = 0;
    let lastTrailTime = 0;
    let lastTrailX = 0, lastTrailY = 0;

    if (heroTrail) {
        heroSection.addEventListener('mousemove', (e) => {
            const now = Date.now();
            const dx = e.clientX - lastTrailX, dy = e.clientY - lastTrailY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (now - lastTrailTime > 120 && dist > 60) {
                lastTrailTime = now;
                lastTrailX = e.clientX; lastTrailY = e.clientY;
                const rect = heroSection.getBoundingClientRect();
                const x = e.clientX - rect.left, y = e.clientY - rect.top;
                const img = document.createElement('img');
                img.className = 'hero-trail-img';
                img.src = heroImages[heroTrailIndex % heroImages.length];
                heroTrailIndex++;
                img.style.left = (x - 90 + (Math.random() - 0.5) * 40) + 'px';
                img.style.top = (y - 120 + (Math.random() - 0.5) * 40) + 'px';
                heroTrail.appendChild(img);
                const trailImgs = heroTrail.querySelectorAll('.hero-trail-img');
                if (trailImgs.length > 8) trailImgs[0].remove();
                img.addEventListener('animationend', () => img.remove());
            }
        });
    }


    // ===== Future of GD — Image Trail =====
    const futureofgdSection = document.getElementById('futureofgd');
    const futureofgdTrail = document.getElementById('futureofgdTrail');
    const futureImages = [
        'img/FUTUREOFGD/djinc_3D_render_of_a_rubbery_toy_desert_reef_world_under_shallo_04bc309f-aea2-477e-878a-ed349c30d01c.png',
        'img/FUTUREOFGD/djinc_3D_render_of_a_rubbery_toy_desert_reef_world_under_shallo_6606d40f-aeef-410f-9e58-4fd1e19cb126.png',
        'img/FUTUREOFGD/djinc_A_hyper-realistic_photograph_of_a_beautiful_pink_and_whit_468f54bb-2050-40bb-b419-d6bba6e544cd.png',
        'img/FUTUREOFGD/djinc_A_pencil_drawing_in_the_style_of_henri_rousseau_of_a_venu_a84b0040-e82e-47c0-8db6-1678c13317d7.png',
        'img/FUTUREOFGD/djinc_A_studio_photo_of_an_ice_cream_jello_with_whipped_dynamic_632160ae-6d76-4869-9ae0-dde33a18cf6a.png',
        'img/FUTUREOFGD/djinc_A_top-down_macro_shot_of_dark_blue_water_with_smooth_conc_69a665e4-7791-4b6e-aa49-0bf3cbb385d3.png',
        'img/FUTUREOFGD/djinc_Bas_Princen_photograph_of_a_circular_mirrored_installatio_a4068573-c27e-4ec5-b075-50c4da7960b0.png',
        'img/FUTUREOFGD/djinc_Fashion_magazine_photograph_of_a_single_alien_flower_full_fef26459-44a9-4ef0-9933-775c3d608c4c.png',
        'img/FUTUREOFGD/djinc_GTA_V_reimagined_by_ralph_bakshi_exaggerated_silhouettes__11cc418b-3616-4778-a61d-f34fa521e43d.png',
        'img/FUTUREOFGD/djinc_Hyperrealistic_3D_tree_with_roots_symbol_made_from_smooth_71d347d9-88b2-472e-b657-1b563da3da9a.png',
        'img/FUTUREOFGD/djinc_Hyperrealistic_white_3D_compass_star_Octane_render_sharp__ff5283be-be42-4e09-97d2-2899c851e9f5.png',
        'img/FUTUREOFGD/djinc_Photography_of_a_chrysanthemum_and_pansy_flower_arrangeme_d3483c93-1ff4-4a49-94f0-1920f0dc500e.png',
        'img/FUTUREOFGD/djinc_Photorealistic_3D_diamond_jewel_flawless_crystal_refracti_62446903-32c6-4fc1-8a23-fc83022cc9f9.png',
        'img/FUTUREOFGD/djinc_Photorealistic_3D_staircase_transforming_into_an_arrow_gl_08e858f6-9c02-4cb3-83cf-412fa09768ec.png',
        'img/FUTUREOFGD/djinc_TEXTURE-ONLY_OVERLAY_PLATE_FLAT_ILLUMINATION_SEAMLESS_oxi_96aa09c9-b715-44ff-b7c1-499ac6bd73be.png',
        'img/FUTUREOFGD/djinc_TEXTURE-ONLY_OVERLAY_PLATE_FLAT_ILLUMINATION_SEAMLESS_oxi_9cc4f454-bc6f-4262-ae5f-1dc44d728f19.png',
        'img/FUTUREOFGD/djinc_a_2d_character_portrait_stoic_male_face_with_elegant_dist_7e6e4b62-47ab-40af-b78d-986b64942f31.png',
        'img/FUTUREOFGD/djinc_a_close-up_grainy_VHS_screen_grab_from_the_forgotten_1987_406e96fe-cfb2-4dfc-8b6a-3d14c72538af.png',
        'img/FUTUREOFGD/djinc_a_close-up_grainy_VHS_screen_grab_from_the_forgotten_1987_e34dc6ad-35d2-4e6c-8939-7b53d79d7d3b.png',
        'img/FUTUREOFGD/djinc_a_close-up_photorealistic_installation_of_silver_tension__f5638301-bf65-476f-81d9-bd53abc7b74b.png',
        'img/FUTUREOFGD/djinc_a_collage_of_polaroid_portraits_forming_one_seamless_pano_4e603942-914d-4258-b033-5c706014f69c.png',
        'img/FUTUREOFGD/djinc_a_delicate_modern_silver_locket_shaped_like_a_crescent_ke_3d387bf8-1b75-4296-b550-cca15d6dff72.png',
        'img/FUTUREOFGD/djinc_a_full_orchid_fused_with_delicate_crab_legs_instead_of_ma_415df376-afef-4260-b080-36e3e98666fe.png',
        'img/FUTUREOFGD/djinc_a_futuristic_organ-inspired_packaging_design_perforated_b_9ea52f4d-c7c1-4f60-b101-a6b3d3b5a8b4.png',
        'img/FUTUREOFGD/djinc_a_futuristic_organ-inspired_packaging_design_perforated_b_a4554fcc-dc2b-4639-afda-a28fab9d1d3b.png',
        'img/FUTUREOFGD/djinc_a_glittering_city_hanging_upside_down_from_the_night_sky__acdc40ed-a92f-421e-9764-09f5417965e9.png',
        'img/FUTUREOFGD/djinc_a_hand-drawn_sketch_of_an_ancient_roman_senator_bust_ink__d0bea720-068b-44b8-ae84-e8296b4b8da9.png',
        'img/FUTUREOFGD/djinc_a_high-contrast_grainy_black-and-white_photogram_an_indis_e6f0b5f4-f15f-45ca-b1ea-3aa6901c77ab.png',
        'img/FUTUREOFGD/djinc_a_highly_decorative_biomorphic_cocktail_goblet_filled_wit_01108107-1b69-452d-99cb-96c596fcdc26.png',
        'img/FUTUREOFGD/djinc_a_hyper-realistic_photograph_of_a_deep_crimson_peony_with_28ba393f-93e2-41c6-8e9d-312169632b10.png',
        'img/FUTUREOFGD/djinc_a_large_group_of_people_wearing_mismatched_graphic_knit_v_2d4708e1-0dc6-4b92-9237-6b01c51993ed.png',
        'img/FUTUREOFGD/djinc_a_large_group_of_people_wearing_mismatched_graphic_knit_v_b1798982-b867-403d-a591-64c8b2b5bab0.png',
        'img/FUTUREOFGD/djinc_a_large_group_of_people_wearing_mismatched_graphic_knit_v_e04583e9-e6bc-47dd-92e2-e10611b873f3.png',
        'img/FUTUREOFGD/djinc_a_lump_of_translucent_resin_putty_slowly_collapsing_revea_ec322ac0-dfb2-49de-a905-bf02a6a14108.png',
        'img/FUTUREOFGD/djinc_a_minimalist_editorial_still-life_of_layered_translucent__5e3840a1-ce44-4246-b8c8-70f634a7744f.png',
        'img/FUTUREOFGD/djinc_a_minimalist_editorial_still-life_of_layered_translucent__b035ac3f-521b-4bc7-938d-4e7849cb5ef6.png',
        'img/FUTUREOFGD/djinc_a_monolithic_ingot_of_gold_jewelry_fused_into_one_brutali_c74f5b12-2970-4bc0-9b64-97cdea1fcdc9.png',
        'img/FUTUREOFGD/djinc_a_moonlit_botanical_greenhouse_after_rain_a_boy_in_a_mint_18638036-6600-403e-b2e6-ee52032e16da.png',
        'img/FUTUREOFGD/djinc_a_person_in_a_crisp_white_suit_lying_in_tall_clover_hand__14a2ec51-c941-4929-9104-2084dd97259c.png',
        'img/FUTUREOFGD/djinc_ultra-detailed_cyberpunk_portrait_of_a_young_person_with__7101210c-9bd7-44d2-818f-542f2c38c051.png',
        'img/FUTUREOFGD/djinc_ultra-realistic_high-resolution_fashion_photograph_of_a_b_a31088ff-7fb9-40c2-bb05-1921108df548.png',
        'img/FUTUREOFGD/djinc_wall-to-wall_mosaic_of_anonymous_faces_in_a_rainbow_of_re_418f44a9-b551-4aa8-acac-6ed2820b4cd8.png'
    ];

    // Preload future images
    futureImages.forEach((src, i) => {
        setTimeout(() => { const img = new Image(); img.src = src; }, i * 50);
    });

    let futureTrailIndex = 0;
    let lastFutureTrailTime = 0;
    let lastFutureTrailX = 0, lastFutureTrailY = 0;

    if (futureofgdSection && futureofgdTrail) {
        // Trail responds to mouse on entire section
        futureofgdSection.addEventListener('mousemove', (e) => {
            const now = Date.now();
            const dx = e.clientX - lastFutureTrailX, dy = e.clientY - lastFutureTrailY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (now - lastFutureTrailTime > 150 && dist > 50) {
                lastFutureTrailTime = now;
                lastFutureTrailX = e.clientX; lastFutureTrailY = e.clientY;
                const rect = futureofgdSection.getBoundingClientRect();
                const x = e.clientX - rect.left, y = e.clientY - rect.top;
                const img = document.createElement('img');
                img.className = 'futureofgd-trail-img';
                img.src = futureImages[futureTrailIndex % futureImages.length];
                futureTrailIndex++;
                img.style.left = (x - 100 + (Math.random() - 0.5) * 50) + 'px';
                img.style.top = (y - 130 + (Math.random() - 0.5) * 50) + 'px';
                futureofgdTrail.appendChild(img);
                const trailImgs = futureofgdTrail.querySelectorAll('.futureofgd-trail-img');
                if (trailImgs.length > 10) trailImgs[0].remove();
                img.addEventListener('animationend', () => img.remove());
            }
        });
    }


    // ===== Analog Clock (KST) =====
    const clockHour = document.getElementById('clockHour');
    const clockMinute = document.getElementById('clockMinute');
    const clockSecond = document.getElementById('clockSecond');

    function updateClock() {
        // KST = UTC+9
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const kst = new Date(utc + 9 * 3600000);
        const h = kst.getHours() % 12;
        const m = kst.getMinutes();
        const s = kst.getSeconds();
        const ms = kst.getMilliseconds();

        const secAngle = (s + ms / 1000) * 6;
        const minAngle = m * 6 + s * 0.1;
        const hourAngle = h * 30 + m * 0.5;

        if (clockHour) clockHour.setAttribute('transform', `rotate(${hourAngle} 100 100)`);
        if (clockMinute) clockMinute.setAttribute('transform', `rotate(${minAngle} 100 100)`);
        if (clockSecond) clockSecond.setAttribute('transform', `rotate(${secAngle} 100 100)`);

        requestAnimationFrame(updateClock);
    }
    updateClock();


    // ===== Rainbow Line Trail (Below Hero, not in futureofgd) =====
    const trailPoints = [];
    const TRAIL_LIFETIME = 2000; // 2 seconds
    let heroBottom = 0;
    let noRainbowSections = [];

    function updateSectionBounds() {
        const rect = heroSection.getBoundingClientRect();
        heroBottom = rect.bottom + window.scrollY;

        noRainbowSections = [];
        document.querySelectorAll('[data-no-rainbow]').forEach(sec => {
            const r = sec.getBoundingClientRect();
            noRainbowSections.push({
                top: r.top + window.scrollY,
                bottom: r.bottom + window.scrollY
            });
        });
    }
    updateSectionBounds();
    window.addEventListener('resize', updateSectionBounds);

    function isInNoRainbowZone(absY) {
        for (let i = 0; i < noRainbowSections.length; i++) {
            if (absY >= noRainbowSections[i].top && absY <= noRainbowSections[i].bottom) return true;
        }
        return false;
    }

    document.addEventListener('mousemove', (e) => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const absY = e.clientY + scrollTop;
        if (absY > heroBottom && !isInNoRainbowZone(absY)) {
            trailPoints.push({ x: e.clientX, y: e.clientY, time: Date.now() });
        }
    });

    let isRainbowClear = true;
    function animateRainbowTrail() {
        const now = Date.now();

        while (trailPoints.length > 0 && now - trailPoints[0].time > TRAIL_LIFETIME) {
            trailPoints.shift();
        }

        if (trailPoints.length > 2) {
            rCtx.clearRect(0, 0, rCanvas.width, rCanvas.height);
            isRainbowClear = false;
            rCtx.lineWidth = 3;
            rCtx.lineCap = 'round';
            rCtx.lineJoin = 'round';

            // Smooth quadratic curve through points
            for (let i = 1; i < trailPoints.length - 1; i++) {
                const p0 = trailPoints[i - 1];
                const p1 = trailPoints[i];
                const p2 = trailPoints[i + 1];
                const age = now - p1.time;
                const life = 1 - age / TRAIL_LIFETIME;
                const hue = (i * 4) % 360;
                const alpha = life * 0.8;
                if (alpha <= 0) continue;

                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;

                rCtx.beginPath();
                if (i === 1) {
                    rCtx.moveTo(p0.x, p0.y);
                } else {
                    const prevMidX = (p0.x + p1.x) / 2;
                    const prevMidY = (p0.y + p1.y) / 2;
                    rCtx.moveTo(prevMidX, prevMidY);
                }
                rCtx.quadraticCurveTo(p1.x, p1.y, midX, midY);
                rCtx.strokeStyle = `hsla(${hue}, 90%, 60%, ${alpha})`;
                rCtx.stroke();
            }
        } else if (!isRainbowClear) {
            rCtx.clearRect(0, 0, rCanvas.width, rCanvas.height);
            isRainbowClear = true;
        }

        requestAnimationFrame(animateRainbowTrail);
    }
    animateRainbowTrail();


    // ===== Scroll Reveal =====
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal-up, .reveal-text').forEach(el => revealObserver.observe(el));


    // ===== Nav / Menu =====
    const menuBtn = document.getElementById('menuBtn');
    const fullscreenMenu = document.getElementById('fullscreenMenu');
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        fullscreenMenu.classList.toggle('active');
        document.body.style.overflow = fullscreenMenu.classList.contains('active') ? 'hidden' : '';
    });
    fullscreenMenu.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active'); fullscreenMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const t = document.querySelector(a.getAttribute('href'));
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });


    // ===== Scroll Progress =====
    const scrollProgress = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
        const pct = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100, 100);
        if (scrollProgress) scrollProgress.style.height = pct + '%';
    }, { passive: true });


    // ===== Nav Status =====
    const navStatus = document.getElementById('navStatus');
    const sectionNames = { 
        hero: 'PORTFOLIO 2026', 
        about: 'ABOUT', 
        experience: 'EXPERIENCE', 
        mastermind: 'MASTERMIND',
        'vibecoding-gallery': 'VIBE CODING',
        'research-section': 'RESEARCH',
        futureofgd: 'FUTURE OF GD', 
        contact: 'CONTACT' 
    };
    const sectionObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && navStatus && sectionNames[entry.target.id])
                navStatus.textContent = sectionNames[entry.target.id];
        });
    }, { threshold: 0.3 });
    document.querySelectorAll('.section, .hero').forEach(s => sectionObs.observe(s));


    // ===== Counter Animation =====
    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target, target = parseInt(el.dataset.count);
                let cur = 0; const step = target / 40;
                const timer = setInterval(() => {
                    cur += step;
                    if (cur >= target) { cur = target; clearInterval(timer); }
                    el.textContent = Math.floor(cur);
                }, 30);
                counterObs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(c => counterObs.observe(c));


    // ===== Experience + Project Hover Preview =====
    const expPreview = document.getElementById('expPreview');
    const expPreviewImg = document.getElementById('expPreviewImg');
    const expPreviewVideo = document.getElementById('expPreviewVideo');
    let slideshowTimer = null;
    let slideIndex = 0;
    let currentSrcs = [];
    let videoEndHandler = null;

    function advanceSlide() {
        if (!currentSrcs.length) return;
        slideIndex = (slideIndex + 1) % currentSrcs.length;
        setMediaSource(currentSrcs[slideIndex]);
    }

    function startSlideshow(mediaSrcs, e) {
        if (!mediaSrcs.length) return;
        currentSrcs = mediaSrcs;
        slideIndex = 0;
        setMediaSource(currentSrcs[0]);
        expPreview.classList.add('visible');
        positionPreview(e);
        if (currentSrcs.length > 1) {
            scheduleNext(currentSrcs[0]);
        }
    }

    function scheduleNext(currentSrc) {
        // Clear any existing timer
        if (slideshowTimer) { clearInterval(slideshowTimer); slideshowTimer = null; }
        if (videoEndHandler) {
            expPreviewVideo.removeEventListener('ended', videoEndHandler);
            videoEndHandler = null;
        }

        if (currentSrc.startsWith('video:')) {
            // Wait for video to finish, then advance
            videoEndHandler = () => {
                advanceSlide();
                scheduleNext(currentSrcs[slideIndex]);
            };
            expPreviewVideo.addEventListener('ended', videoEndHandler, { once: true });
        } else {
            // Image: advance after 500ms
            slideshowTimer = setTimeout(() => {
                advanceSlide();
                scheduleNext(currentSrcs[slideIndex]);
            }, 500);
        }
    }

    function setMediaSource(src) {
        if (src.startsWith('video:')) {
            const videoSrc = src.replace('video:', '');
            expPreviewImg.style.display = 'none';
            expPreviewVideo.style.display = 'block';
            expPreviewVideo.src = videoSrc;
            expPreviewVideo.muted = true;
            expPreviewVideo.loop = false; // don't loop video — let it play once then advance
            expPreviewVideo.play().catch(() => { });
        } else {
            expPreviewVideo.style.display = 'none';
            expPreviewVideo.pause();
            expPreviewImg.style.display = 'block';
            expPreviewImg.src = src;
        }
    }

    function hidePreview() {
        expPreview.classList.remove('visible');
        if (slideshowTimer) { clearTimeout(slideshowTimer); slideshowTimer = null; }
        if (videoEndHandler) {
            expPreviewVideo.removeEventListener('ended', videoEndHandler);
            videoEndHandler = null;
        }
        currentSrcs = [];
        expPreviewVideo.pause();
        expPreviewVideo.removeAttribute('src');
        expPreviewVideo.load();
    }

    function positionPreview(e) {
        expPreview.style.left = (e.clientX + 24) + 'px';
        expPreview.style.top = (e.clientY - 160) + 'px';
    }

    if (expPreview && window.innerWidth > 768) {
        // Preload cache — track which source arrays have been preloaded
        const preloadedSets = new WeakSet();
        const loadedImages = new Map(); // src → Image (fully loaded)

        function staggeredPreload(srcs) {
            srcs.forEach((src, i) => {
                if (src.startsWith('video:') || loadedImages.has(src)) return;
                setTimeout(() => {
                    const img = new Image();
                    img.onload = () => loadedImages.set(src, img);
                    img.src = src;
                }, i * 150);
            });
        }

        // Lazy preload: start loading when element is near viewport
        const preloadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const srcs = JSON.parse(el.dataset.media || el.dataset.images || '[]');
                    staggeredPreload(srcs);
                    preloadObserver.unobserve(el);
                }
            });
        }, { rootMargin: '300px 0px' }); // start preloading 300px before visible

        // Setup for resume blocks
        document.querySelectorAll('.resume-block[data-images], .resume-block[data-media]').forEach(block => {
            preloadObserver.observe(block);
            block.addEventListener('mouseenter', (e) => {
                const srcs = JSON.parse(block.dataset.media || block.dataset.images || '[]');
                staggeredPreload(srcs); // ensure preloading starts on hover too
                startSlideshow(srcs, e);
            });
            block.addEventListener('mouseleave', hidePreview);
            block.addEventListener('mousemove', positionPreview);
        });

        // Setup for project lines
        document.querySelectorAll('.project-line[data-media]').forEach(line => {
            preloadObserver.observe(line);
            line.addEventListener('mouseenter', (e) => {
                const srcs = JSON.parse(line.dataset.media || '[]');
                staggeredPreload(srcs);
                startSlideshow(srcs, e);
            });
            line.addEventListener('mouseleave', hidePreview);
            line.addEventListener('mousemove', positionPreview);
        });
    }


    // ===== Magnetic Elements =====
    document.querySelectorAll('[data-magnetic]').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

});
