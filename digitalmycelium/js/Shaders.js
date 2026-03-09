// ========================================
// SHADER ECOSYSTEM
// Custom GLSL for Fluid, Organic Particle Movements
// ========================================

const Shaders = {
    // Basic 3D Simplex Noise Function for GLSL
    noiseGLSL: `
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v) {
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 = v - i + dot(i, C.xxx) ;
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            float n_ = 0.142857142857;
            vec3  ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }
    `,

    vertex: `
        uniform float u_time;
        uniform float u_mouse_x;
        uniform float u_mouse_y;
        uniform float u_density;
        uniform float u_fluidity;
        uniform float u_audioFreq;
        uniform float u_mode; // 0: Flora, 1: Fauna, 2: Fungi
        uniform float u_growth;
        
        attribute float aRandom;
        attribute float aSpecies;
        
        varying vec3 vPosition;
        varying float vNoise;
        varying float vMode;
        varying float vDist;
        varying float vSpecies;
        
        // {{NOISE_INJECT}}
        
        void main() {
            vec3 pos = position;
            vMode = u_mode;
            vSpecies = aSpecies;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            vDist = length(pos); 
            
            // Scaled Noise
            float noiseScaleBase = (100.0 - u_density) * 0.02;
            float noiseScale = noiseScaleBase;
            if (u_mode == 1.0) noiseScale = noiseScaleBase * 0.6; // Bio-Reef Detail
            if (u_mode == 2.0) noiseScale = noiseScaleBase * 0.15;
            
            float speedMult = (u_mode == 2.0) ? (0.0005 + u_audioFreq * 0.0002) : (u_fluidity * 0.006); 
            float timeScaled = u_time * speedMult;
            float audioVibes = u_audioFreq * ((u_mode == 2.0) ? 0.00001 : 0.003);
            
            vec3 noisePos = vec3(pos.x * noiseScale, pos.y * noiseScale, pos.z * noiseScale + timeScaled);
            float n = snoise(noisePos);
            vNoise = n;
            
            // Mode-based behavior
            if (u_mode == 1.0) { // Fauna: Bio-Reef
                // 1. Base Rolling Wave (Global)
                pos.y += sin(pos.x * 0.02 + u_time * 1.0) * 10.0;
                
                // 2. Species-Specific Displacement
                if (vSpecies < 1.0) { // Stalks (Vertical growth)
                    float stalkNoise = snoise(vec3(pos.x * 0.01, 0.0, pos.z * 0.01 + u_time * 0.5));
                    pos.y += stalkNoise * 40.0 * (1.0 + audioVibes);
                } else if (vSpecies < 2.0) { // Mossy Ground
                    float mossNoise = snoise(noisePos * 3.0);
                    pos += mossNoise * 8.0;
                } else { // Clustered Coral/Anemones
                    vec3 clumpDir = vec3(
                        snoise(noisePos + vec3(5.0)),
                        snoise(noisePos + vec3(10.0)),
                        snoise(noisePos + vec3(15.0))
                    );
                    pos += clumpDir * 15.0 * (1.0 + audioVibes);
                }
            } else if (u_mode == 2.0) { // Fungi
                float flowForce = 20.0 + audioVibes * 10.0;
                pos.x += n * flowForce;
                pos.y += snoise(noisePos + vec3(500.0)) * flowForce;
                pos.z += snoise(noisePos + vec3(1000.0)) * flowForce;
            } else { // Flora
                pos.x += n * 10.0 * (1.0 + audioVibes);
                pos.y += snoise(noisePos + vec3(100.0)) * 10.0 * (1.0 + audioVibes);
                pos.z += snoise(noisePos + vec3(200.0)) * 10.0 * (1.0 + audioVibes);
            }
            
            // Mouse Warp
            vec2 mousePos = vec2(u_mouse_x, u_mouse_y);
            vec2 screenPos = mvPosition.xy;
            float distToMouse = distance(screenPos, mousePos * 50.0);
            
            if (distToMouse < 40.0) {
                float force = (40.0 - distToMouse) / 40.0;
                pos.x += (screenPos.x - mousePos.x * 50.0) * force * 0.8;
                pos.y += (screenPos.y - mousePos.y * 50.0) * force * 0.8;
            }
            
            vPosition = pos;
            mvPosition = modelViewMatrix * vec4(pos, 1.0);
            
            float baseSize = (u_mode == 1.0) ? 4.0 : 2.0;
            gl_PointSize = (baseSize + (audioVibes * 60.0)) * (150.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,

    fragment: `
        uniform float u_time;
        uniform float u_audioFreq;
        uniform vec3 u_colorBase;
        uniform vec3 u_colorAccent;
        uniform float u_evolution; // From 0 to 1
        
        varying vec3 vPosition;
        varying float vNoise;
        varying float vMode;
        varying float vDist;
        varying float vSpecies;
        
        void main() {
            // Fungi Growth Logic
            if (vMode == 2.0) {
                float maxRadius = 450.0;
                float currentRadius = u_evolution * maxRadius;
                if (vDist > currentRadius) discard;
                float edgeFade = smoothstep(currentRadius, currentRadius - 50.0, vDist);
                gl_FragColor = vec4(u_colorBase, (0.2 + (vNoise * 0.1)) * edgeFade); 
                return;
            }

            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            float r = dot(cxy, cxy);
            
            if (vMode == 2.0) discard;
            
            // Mode-based shape
            if (vMode == 1.0) { 
                 if (r > 0.95) discard; // Harder grains
            } else { 
                 if (r > 1.0) discard;
            }
            
            float mixFactor = (vNoise + 1.0) * 0.5;
            float audioFlash = clamp(u_audioFreq * 0.012, 0.0, 1.0); // Slightly more dampened
            
            vec3 finalColor;
            
            if (vMode == 1.0) { // Fauna: Bio-Reef Palette
                vec3 colStalk = mix(vec3(1.0, 0.2, 0.1), vec3(1.0, 0.8, 0.0), mixFactor); // Red to Yellow
                vec3 colMoss = mix(vec3(0.1, 0.5, 0.2), vec3(0.0, 0.2, 0.5), mixFactor);  // Green to Deep Blue
                vec3 colCoral = mix(vec3(0.8, 0.1, 0.6), vec3(0.2, 0.8, 1.0), mixFactor); // Purple to Cyan
                
                if (vSpecies < 1.0) finalColor = colStalk;
                else if (vSpecies < 2.0) finalColor = colMoss;
                else finalColor = colCoral;
                
                finalColor += vec3(audioFlash * 0.08); // Even more dampened (from 0.15)
            } else {
                finalColor = mix(u_colorBase, u_colorAccent, mixFactor);
                finalColor += vec3(audioFlash * 0.15); // Reduced from 0.4
            }
            
            float alpha = 1.0 - (r * 0.8);
            if (vMode == 1.0) alpha = 0.95; 
            
            gl_FragColor = vec4(finalColor, alpha * 0.8); 
        }
    `,
    
    getVertexShader: function() {
        return this.vertex.replace('// {{NOISE_INJECT}}', this.noiseGLSL);
    }
};
