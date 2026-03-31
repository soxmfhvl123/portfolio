'use client';

import { useEffect, useState } from 'react';

export default function HUD() {
  const [fps, setFps] = useState(60);
  const [res, setRes] = useState('0x0');

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateFPS = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(updateFPS);
    };

    const handleResize = () => {
      setRes(`${window.innerWidth}x${window.innerHeight}`);
    };

    updateFPS();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="flux-hud-text">Phase: Laboratory Beta_01</span>
          <span className="flux-hud-text">Vector: 0.9.3_F</span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="flux-hud-text">FPS: {fps}</span>
          <span className="flux-hud-text">RES: {res}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <span className="flux-hud-text">DESIGN BY DONG JIN CHOI</span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="flux-hud-text">© 2026 FLUX IMGEN</span>
          <span className="flux-hud-text">STATUS: ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
