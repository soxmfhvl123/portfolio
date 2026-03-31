'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Center } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

function FragmentedLogo({ mouse }) {
  const meshRef = useRef();
  const [fragments, setFragments] = useState([]);

  useEffect(() => {
    // Generate fragments for the logo
    const count = 40;
    const initialFragments = Array.from({ length: count }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ],
      id: i,
    }));
    setFragments(initialFragments);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smooth magnetic effect
    const factor = 1 - Math.min(1, mouse.length() * 0.5); // Proximity-based attraction
    
    meshRef.current.children.forEach((child, i) => {
      // Attraction to center (0,0,0) as mouse gets close
      child.position.lerp(new THREE.Vector3(0, 0, 0), factor * 0.1);
      child.rotation.x += 0.01 * (1 - factor);
      child.rotation.y += 0.01 * (1 - factor);
    });
  });

  return (
    <group ref={meshRef}>
      {fragments.map((frag) => (
        <mesh key={frag.id} position={frag.position} rotation={frag.rotation}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="#E0FF00" transparent opacity={0.6} />
        </mesh>
      ))}
      <Center top>
        <Text
          fontSize={1}
          color="#E0FF00"
          anchorX="center"
          anchorY="middle"
        >
          FLUX IMGEN
        </Text>
      </Center>
    </group>
  );
}

export default function SingularityIntro({ onDrop }) {
  const mouse = useRef(new THREE.Vector2(100, 100)); // Start far away

  const handleMouseMove = (e) => {
    mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  const handleDropEvent = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onDrop(file);
    }
  };

  return (
    <div 
      className="relative h-full w-full flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropEvent}
    >
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 35 }}>
          <color attach="background" args={['#0A0A0A']} />
          <Suspense fallback={null}>
            <FragmentedLogo mouse={mouse.current} />
          </Suspense>
        </Canvas>
      </div>

      <div className="z-10 flex flex-col items-center gap-10 pointer-events-none">
        <label className="magnetic-zone p-24 border border-dashed border-[#E0FF0055] rounded-full flex flex-col items-center justify-center transition-all duration-700 hover:border-[#E0FF00] hover:bg-[#E0FF0011] pointer-events-auto cursor-crosshair">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => e.target.files[0] && onDrop(e.target.files[0])} 
          />
          <p className="flux-hud-text text-center opacity-80 mb-2">Release your data here</p>
          <p className="flux-hud-text text-[9px] opacity-40">or click to browse</p>
        </label>
        <div className="flex flex-col items-center gap-2">
          <p className="flux-hud-text opacity-60 tracking-[0.3em]">Zero-Gravity Lab</p>
          <div className="w-12 h-[1px] bg-[#E0FF0044]"></div>
        </div>
      </div>

      <style jsx>{`
        .magnetic-zone {
          background: radial-gradient(circle, rgba(224, 255, 0, 0.05) 0%, transparent 70%);
          animation: pulse 4s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
