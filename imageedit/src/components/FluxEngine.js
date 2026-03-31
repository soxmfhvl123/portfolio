'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uIntensity;
  uniform int uMode;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec4 color = texture2D(uTexture, uv);
    
    // --- MODE 1: LUMINISCENT NEURAL (Edge Detection style) ---
    if (uMode == 1) {
      float e = 0.002;
      vec4 c1 = texture2D(uTexture, uv + vec2(e, 0.0));
      vec4 c2 = texture2D(uTexture, uv + vec2(0.0, e));
      float edge = length(color - c1) + length(color - c2);
      color = vec4(vec3(edge) * vec3(0.87, 1.0, 0.0) * uIntensity * 10.0, 1.0);
    }
    
    // --- MODE 2: KINETIC SMEAR (Smear effect) ---
    if (uMode == 2) {
      uv.x += sin(uv.y * 10.0 + uTime) * 0.05 * uIntensity;
      color = texture2D(uTexture, uv);
    }
    
    // --- MODE 3: BINARY HORIZON ---
    if (uMode == 3) {
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      color = gray > (0.5 + 0.2 * sin(uTime)) ? vec4(0.87, 1.0, 0.0, 1.0) : vec4(0.0, 0.0, 0.0, 1.0);
    }

    // --- MODE 4: TEMPORAL GLITCH ---
    if (uMode == 4) {
      float shift = sin(uTime * 10.0) * 0.02 * uIntensity;
      vec4 r = texture2D(uTexture, uv + vec2(shift, 0.0));
      vec4 g = texture2D(uTexture, uv);
      vec4 b = texture2D(uTexture, uv - vec2(shift, 0.0));
      color = vec4(r.r, g.g, b.b, 1.0);
    }

    // --- MODE 5: GRAIN MIST ---
    if (uMode == 5) {
      float noise = fract(sin(dot(uv + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
      color.rgb += (noise - 0.5) * uIntensity;
    }

    // --- MODE 6: ZERO-G POINTS (Dots) ---
    if (uMode == 6) {
      vec2 grid = fract(uv * 50.0);
      float dist = length(grid - 0.5);
      float mask = smoothstep(0.4 * uIntensity, 0.3 * uIntensity, dist);
      color.rgb *= mask;
      color.rgb += vec3(mask) * vec3(0.87, 1.0, 0.0);
    }

    // --- MODE 7: GRID FLOAT (Halftone) ---
    if (uMode == 7) {
      float size = 30.0;
      vec2 p = floor(uv * size) / size;
      vec4 c = texture2D(uTexture, p);
      float r = length(c.rgb) * 0.5 * uIntensity;
      float d = length(fract(uv * size) - 0.5);
      color = smoothstep(r, r - 0.05, d) * vec4(1.0);
    }

    // --- MODE 8: ENTROPY FIELD (Noise Flow) ---
    if (uMode == 8) {
      float n = fract(sin(dot(uv * 10.0 + uTime, vec2(12.9898, 78.233))) * 43758.5453);
      uv += (n - 0.5) * 0.1 * uIntensity;
      color = texture2D(uTexture, uv);
    }

    // --- MODE 9: CELLULAR VOID ---
    if (uMode == 9) {
      vec2 g = fract(uv * 20.0);
      float d = length(g - 0.5);
      float m = smoothstep(0.5, 0.0, d * (1.0 + uIntensity * 2.0));
      color.rgb *= m;
      color.rgb += vec3(1.0 - m) * vec3(0.0, 0.0, 0.0);
    }

    // --- MODE 10: DATA RAINFALL ---
    if (uMode == 10) {
      float t = uTime * 2.0;
      float row = floor(uv.y * 50.0);
      float col = floor(uv.x * 20.0);
      float speed = fract(sin(col) * 43758.5453) * 0.5 + 0.5;
      float drop = fract(uv.y + t * speed);
      float mask = (drop < 0.1) ? 1.0 : 0.0;
      color = mix(color, vec4(0.87, 1.0, 0.0, 1.0), mask * uIntensity);
    }
  }
`;

export default function FluxEngine({ image, mode, intensity }) {
  const meshRef = useRef();
  const { viewport } = useThree();
  
  const texture = useMemo(() => {
    if (!image) return null;
    const loader = new THREE.TextureLoader();
    return loader.load(image);
  }, [image]);

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uTime: { value: 0 },
    uIntensity: { value: intensity },
    uMode: { value: mode }
  }), [texture, mode]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
      meshRef.current.material.uniforms.uIntensity.value = intensity;
      meshRef.current.material.uniforms.uMode.value = mode;
      
      if (meshRef.current.material.uniforms.uTexture.value !== texture) {
        meshRef.current.material.uniforms.uTexture.value = texture;
      }
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} scale={[viewport.width * 0.8, viewport.height * 0.8, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
