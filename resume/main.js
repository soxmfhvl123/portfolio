/**
 * DONG JIN CHOI ??Portfolio 2026
 * Particle System 쨌 Particle-Dodge Letters 쨌 Hero Mouse Trail
 * Future of GD Section 쨌 Analog Clock 쨌 Rainbow Trail
 * EN/KR Toggle 쨌 Experience Hover Slideshow
 */

document.addEventListener('DOMContentLoaded', () => {

    // Images load as smaller webp copies made by tools/build_resume_thumbs.py
    // (<name>.w320.webp for the hero grid, <name>.w960.webp everywhere else);
    // if a copy is missing the original file loads instead.
    const sized = (src, w) => (/\.(png|jpe?g|webp)$/i.test(src) && !/\.w\d+\.webp$/i.test(src))
        ? src.replace(/\.[^./]+$/, '.w' + w + '.webp') : src;
    const setSized = (img, src, w) => {
        img.onerror = () => { img.onerror = null; img.src = src; };
        img.src = sized(src, w);
    };

    // ===== Pointer position (hero grid drift, Future-of-GD letters) =====
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;


    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length) { mx = e.touches[0].clientX; my = e.touches[0].clientY; }
    }, { passive: true });
    document.addEventListener('touchend', () => { mx = window.innerWidth/2; my = window.innerHeight/2; }, { passive: true });


    // ===== Hero Image Grid (all 243 images via window.HERO_IMAGES) =====
    const heroImageGrid = document.getElementById('heroImageGrid');
    const heroPopup = document.getElementById('heroPopup');
    const heroPopupImg = document.getElementById('heroPopupImg');
    const allHeroImages = window.HERO_IMAGES || [];
    const GRID_COLS = 16;
    const GRID_ROWS = 16;
    const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

    if (heroImageGrid && allHeroImages.length) {
        heroImageGrid.style.setProperty('--grid-cols', GRID_COLS);
        heroImageGrid.style.setProperty('--grid-rows', GRID_ROWS);
        const shuffled = [...allHeroImages].sort(() => Math.random() - 0.5);
        const gridCells = [];
        for (let i = 0; i < TOTAL_CELLS; i++) {
            const cell = document.createElement('div');
            cell.className = 'hero-grid-cell';
            const imgEl = document.createElement('img');
            imgEl.alt = '';
            imgEl.decoding = 'async';
            imgEl.loading = i < 32 ? 'eager' : 'lazy';
            setSized(imgEl, shuffled[i % shuffled.length], 320);
            cell.appendChild(imgEl);
            heroImageGrid.appendChild(cell);
            gridCells.push({ el: cell, src: shuffled[i % shuffled.length] });
        }
        
        // Popup on hover logic
        let popupHideTimer = null;

        const showPopup = (src) => {
            // Clear any pending hide timer
            if (popupHideTimer) {
                clearTimeout(popupHideTimer);
                popupHideTimer = null;
            }
            
            // Only update src if it's different to avoid redundant loads
            if (heroPopupImg.dataset.src !== src) {
                heroPopupImg.dataset.src = src;
                setSized(heroPopupImg, src, 960);
            }
            
            heroPopup.classList.add('active');
        };

        const hidePopup = () => {
            // Delay the hiding to allow moving between cells without flickering
            if (popupHideTimer) clearTimeout(popupHideTimer);
            popupHideTimer = setTimeout(() => {
                heroPopup.classList.remove('active');
                popupHideTimer = null;
            }, 120); // User specifically asked for 120ms
        };

        gridCells.forEach(({ el, src }) => {
            el.addEventListener('mouseenter', () => showPopup(src));
            el.addEventListener('mouseleave', hidePopup);
        });

        // Ensure popup is hidden if mouse leaves the whole hero section
        const heroSect = document.getElementById('hero');
        if (heroSect) {
            heroSect.addEventListener('mouseleave', () => {
                if (popupHideTimer) clearTimeout(popupHideTimer);
                heroPopup.classList.remove('active');
            });
        }
        let gTX = 0, gTY = 0, gCX = 0, gCY = 0;
        function animateHeroGrid() {
            gTX = (mx / window.innerWidth - 0.5) * 14;
            gTY = (my / window.innerHeight - 0.5) * 14;
            gCX += (gTX - gCX) * 0.05;
            gCY += (gTY - gCY) * 0.05;
            heroImageGrid.style.transform = `scale(1.05) translate(${gCX.toFixed(2)}px,${gCY.toFixed(2)}px)`;
            requestAnimationFrame(animateHeroGrid);
        }
        animateHeroGrid();
    }



    // ===== EN / KR Language Toggle =====
    let currentLang = 'en';
    const langToggle = document.getElementById('langToggle');
    const langLabels = langToggle.querySelectorAll('.lang-label');
    
    function updateLanguage() {
        if (!langToggle || !langLabels.length) return;
        langLabels.forEach(l => l.classList.remove('lang-active'));
        const activeIdx = currentLang === 'kr' ? 0 : 1;
        if (langLabels[activeIdx]) langLabels[activeIdx].classList.add('lang-active');
        
        document.documentElement.lang = currentLang === 'kr' ? 'ko' : 'en';
        document.querySelectorAll('[data-kr][data-en]').forEach(el => {
            el.textContent = currentLang === 'kr' ? el.dataset.kr : el.dataset.en;
        });
    }

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'kr' ? 'en' : 'kr';
        updateLanguage();
    });

    // Initialize with default language
    updateLanguage();


    // ===== Kinetic Typography ??Particle-Dodge Letters =====
    const kineticChars = document.querySelectorAll('[data-kinetic]');
    const heroSection = document.getElementById('hero');
    const DODGE_RADIUS = 200;
    const DODGE_FORCE = 50;
    const charStates = [];
    kineticChars.forEach(() => {
        charStates.push({ x: 0, y: 0, targetX: 0, targetY: 0, rot: 0, targetRot: 0, baseX: 0, baseY: 0 });
    });

    // ===== Future of GD ??Particle-Dodge Letters =====
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


    // ===== Future of GD ??Image Trail =====
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
        setTimeout(() => { setSized(new Image(), src, 960); }, i * 50);
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
                setSized(img, futureImages[futureTrailIndex % futureImages.length], 960);
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
    });
    fullscreenMenu.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active'); fullscreenMenu.classList.remove('active');
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
        'vibecoding-gallery': 'OTHER PROJECTS',
        'research-section': 'THOUGHTS',
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
            expPreviewVideo.loop = false; // don't loop video ??let it play once then advance
            expPreviewVideo.play().catch(() => { });
        } else {
            expPreviewVideo.style.display = 'none';
            expPreviewVideo.pause();
            expPreviewImg.style.display = 'block';
            setSized(expPreviewImg, src, 960);
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
        // Preload cache ??track which source arrays have been preloaded
        const preloadedSets = new WeakSet();
        const loadedImages = new Map(); // src ??Image (fully loaded)

        function staggeredPreload(srcs) {
            srcs.forEach((src, i) => {
                if (src.startsWith('video:') || loadedImages.has(src)) return;
                setTimeout(() => {
                    const img = new Image();
                    img.onload = () => loadedImages.set(src, img);
                    setSized(img, src, 960);
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



});
